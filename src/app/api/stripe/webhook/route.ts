import { NextResponse } from "next/server";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe/client";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function recordPurchaseAndQueuePromote(session: Stripe.Checkout.Session) {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required to record purchases.");
  }
  const leadId = session.client_reference_id ?? session.metadata?.lead_id ?? null;
  if (!leadId) {
    throw new Error("Stripe session missing client_reference_id / lead metadata.");
  }
  if (session.payment_status !== "paid") {
    return;
  }

  const closehound = getSupabaseAdminClient().schema("closehound");
  const now = new Date().toISOString();

  const { data: purchase, error: insertError } = await closehound
    .from("purchases")
    .upsert(
      {
        lead_id: leadId,
        stripe_session_id: session.id,
        stripe_customer_id:
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
        amount_cents: session.amount_total ?? 0,
        currency: (session.currency ?? "usd").toLowerCase(),
        customer_email: session.customer_details?.email ?? session.customer_email ?? null,
        customer_name: session.customer_details?.name ?? null,
        status: "paid",
        paid_at: now,
        updated_at: now,
      },
      { onConflict: "stripe_session_id" }
    )
    .select("id")
    .single();

  if (insertError || !purchase) {
    throw new Error(insertError?.message ?? "Failed to record purchase.");
  }

  await closehound
    .from("leads")
    .update({ status: "closed" })
    .eq("id", leadId);

  await closehound.from("jobs").insert({
    job_type: "promote_site",
    status: "pending",
    payload: { purchaseId: purchase.id },
    requested_by: "stripe-webhook",
    lead_id: leadId,
    updated_at: now,
  });
}

export async function POST(request: Request) {
  let stripe;
  let secret: string;
  try {
    stripe = getStripeClient();
    secret = getStripeWebhookSecret();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Stripe not configured." },
      { status: 503 }
    );
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bad signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await recordPurchaseAndQueuePromote(event.data.object as Stripe.Checkout.Session);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
