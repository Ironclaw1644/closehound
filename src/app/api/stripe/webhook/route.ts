import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe/client";
import { getClosehoundAdminSchema } from "@/lib/supabase";
import { planIdForPrice } from "@/lib/stripe/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getClosehoundAdminSchema>;

/** Resolve our user id from session/subscription metadata or the Stripe customer. */
async function resolveUserId(
  db: Db,
  explicit: string | null | undefined,
  customerId: string | null | undefined
): Promise<string | null> {
  if (explicit) return explicit;
  if (!customerId) return null;
  const { data } = await db
    .from("profiles")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.user_id ?? null;
}

export async function POST(req: Request) {
  const stripe = getStripeClient();
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", getStripeWebhookSecret());
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getClosehoundAdminSchema();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const userId = await resolveUserId(db, s.client_reference_id || s.metadata?.user_id, s.customer as string);
        if (!userId) break;

        if (s.mode === "payment") {
          // One-time Scout credit pack. Idempotent: claim the event id first so a
          // webhook retry can't double-grant. If processing fails, release the claim.
          const credits = Number(s.metadata?.credits ?? 0);
          if (credits > 0) {
            const { error: claimErr } = await db
              .from("processed_events")
              .insert({ event_id: event.id });
            if (claimErr) break; // already processed
            try {
              await db
                .from("profiles")
                .upsert({ user_id: userId, stripe_customer_id: (s.customer as string) ?? null }, {
                  onConflict: "user_id",
                  ignoreDuplicates: false,
                });
              const { error: grantErr } = await db.rpc("grant_credits", {
                p_user: userId,
                p_count: credits,
              });
              if (grantErr) throw new Error(grantErr.message);
            } catch (e) {
              await db.from("processed_events").delete().eq("event_id", event.id);
              throw e;
            }
          }
          break;
        }

        // Subscription checkout → activate the tier from metadata.plan.
        const plan = s.metadata?.plan ?? "hunter";
        await db.from("profiles").upsert({
          user_id: userId,
          plan,
          status: "active",
          stripe_customer_id: (s.customer as string) ?? null,
          stripe_subscription_id: (s.subscription as string) ?? null,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await resolveUserId(db, sub.metadata?.user_id, sub.customer as string);
        if (!userId) break;

        const active = sub.status === "active" || sub.status === "trialing";
        // Prefer the live price → plan mapping; fall back to subscription metadata.
        const priceId = sub.items.data[0]?.price?.id ?? null;
        const planFromPrice = planIdForPrice(priceId);
        const plan = active ? planFromPrice ?? sub.metadata?.plan ?? "hunter" : "free";

        await db
          .from("profiles")
          .update({
            plan,
            status: active ? "active" : sub.status,
            stripe_subscription_id: sub.id,
            stripe_customer_id: (sub.customer as string) ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);
        break;
      }
    }
  } catch {
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
