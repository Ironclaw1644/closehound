import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe/client";
import { getClosehoundAdminSchema } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
        const userId = s.client_reference_id || (s.metadata?.user_id ?? null);
        if (userId) {
          await db.from("profiles").upsert({
            user_id: userId,
            plan: "pro",
            status: "active",
            stripe_customer_id: (s.customer as string) ?? null,
            stripe_subscription_id: (s.subscription as string) ?? null,
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        let userId: string | null = sub.metadata?.user_id ?? null;
        if (!userId && customerId) {
          const { data } = await db
            .from("profiles")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .maybeSingle();
          userId = data?.user_id ?? null;
        }
        if (userId) {
          const active = sub.status === "active" || sub.status === "trialing";
          await db
            .from("profiles")
            .update({
              plan: active ? "pro" : "free",
              status: active ? "active" : sub.status,
              stripe_subscription_id: sub.id,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }
    }
  } catch {
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
