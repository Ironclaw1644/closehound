import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { V1_CURRENCY, V1_PRICE_CENTS, getStripeBuyLink } from "@/lib/stripe/pricing";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import type { Lead } from "@/types/lead";

const APP_NAME = "WalkPerro Local Site";

export async function GET(
  _request: Request,
  context: { params: Promise<{ leadId: string }> }
) {
  const { leadId } = await context.params;

  // Fast path: if a Stripe Payment Link is configured, redirect with metadata.
  const buyLinkBase = getStripeBuyLink();
  if (buyLinkBase) {
    const url = new URL(buyLinkBase);
    url.searchParams.set("client_reference_id", leadId);
    return NextResponse.redirect(url.toString(), { status: 302 });
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "Buy flow is not configured (no STRIPE_BUY_LINK_BASE and no service-role key)." },
      { status: 503 }
    );
  }

  // Otherwise, create a one-off Checkout session on the fly.
  const closehound = getSupabaseAdminClient().schema("closehound");
  const { data, error } = await closehound
    .from("leads")
    .select("id, company_name, contact_email")
    .eq("id", leadId)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }
  const lead = data as Pick<Lead, "id" | "company_name" | "contact_email">;

  let stripe;
  try {
    stripe = getStripeClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe is not configured." },
      { status: 503 }
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE?.trim() ||
    process.env.PREVIEW_SITE?.trim() ||
    "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: V1_CURRENCY,
          unit_amount: V1_PRICE_CENTS,
          product_data: {
            name: `${APP_NAME} for ${lead.company_name}`,
            description: "One-time site build, hosted for 30 days. Then $19/mo to keep it live.",
          },
        },
      },
    ],
    customer_email: lead.contact_email ?? undefined,
    client_reference_id: lead.id,
    metadata: { lead_id: lead.id, company_name: lead.company_name },
    success_url: `${origin}/preview/${lead.id}?purchase=success`,
    cancel_url: `${origin}/preview/${lead.id}?purchase=cancelled`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a session URL." }, { status: 500 });
  }

  return NextResponse.redirect(session.url, { status: 302 });
}
