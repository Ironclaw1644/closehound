import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { PLANS } from "@/lib/stripe/plans";
import { getUser } from "@/lib/supabase/server";
import { getClosehoundAdminSchema } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const priceId = PLANS.pro.priceId;
  if (!priceId) {
    return NextResponse.json({ error: "Pro plan not configured (set STRIPE_PRICE_PRO)." }, { status: 400 });
  }

  const db = getClosehoundAdminSchema();
  const { data: profile } = await db
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const stripe = getStripeClient();
  const origin = new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : (user.email ?? undefined),
    client_reference_id: user.id,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
    allow_promotion_codes: true,
    success_url: `${origin}/account?upgraded=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
