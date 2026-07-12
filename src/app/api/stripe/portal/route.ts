import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { getClosehoundAdminSchema } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Billing is hard-disabled in demo — the synthetic user has no Stripe customer.
  if (isDemoMode()) return NextResponse.json({ error: "demo" }, { status: 403 });

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const db = getClosehoundAdminSchema();
  const { data: profile } = await db
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account yet." }, { status: 400 });
  }

  const stripe = getStripeClient();
  const origin = new URL(req.url).origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/account`,
  });
  return NextResponse.json({ url: session.url });
}
