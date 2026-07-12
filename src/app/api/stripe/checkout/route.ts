import { NextResponse } from "next/server";
import { z } from "zod";
import { isDemoMode } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";
import { priceInfo } from "@/lib/stripe/plans";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { getClosehoundAdminSchema } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ price: z.string().min(1) });

export async function POST(req: Request) {
  // Billing is hard-disabled in demo — no checkout session may ever be created
  // for the synthetic user, regardless of what the client sends.
  if (isDemoMode()) return NextResponse.json({ error: "demo" }, { status: 403 });

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Pick a plan to continue." }, { status: 400 });
  }

  // Only allow price IDs we recognize — never trust a client-supplied price blindly.
  const info = priceInfo(parsed.data.price);
  if (!info) {
    return NextResponse.json({ error: "Unknown plan." }, { status: 400 });
  }

  const db = getClosehoundAdminSchema();
  const { data: profile } = await db
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const stripe = getStripeClient();
  const origin = new URL(req.url).origin;
  const isCredits = info.kind === "credits";

  const session = await stripe.checkout.sessions.create({
    mode: isCredits ? "payment" : "subscription",
    line_items: [{ price: parsed.data.price, quantity: 1 }],
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
    client_reference_id: user.id,
    // metadata.credits drives one-time pack fulfillment in the webhook.
    metadata: isCredits
      ? { user_id: user.id, credits: String(info.screens) }
      : { user_id: user.id, plan: info.plan },
    ...(isCredits
      ? { payment_intent_data: { metadata: { user_id: user.id, credits: String(info.screens) } } }
      : { subscription_data: { metadata: { user_id: user.id, plan: info.plan } } }),
    allow_promotion_codes: true,
    success_url: `${origin}/account?${isCredits ? "credits" : "upgraded"}=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
