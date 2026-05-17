import { NextResponse } from "next/server";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe/client";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import type Stripe from "stripe";
import { Resend } from "resend";
import {
  upsertPreviewSiteFromCheckout,
  mintAndPersistOnboardingToken,
} from "@/lib/onboarding/storage";
import { renderClaimEmail } from "@/lib/email/templates/claim";
import { buildPreviewSlug } from "@/lib/preview";
import { getSiteOrigin } from "@/lib/preview/seo";
import { pingGoogleForUrl } from "@/lib/seo/gsc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function sendClaimEmail(opts: {
  buyerEmail: string;
  buyerName: string | null;
  businessName: string;
  token: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    // Resend not configured — log and skip rather than block the webhook.
    console.warn("[stripe-webhook] RESEND_API_KEY missing; claim email skipped.");
    return;
  }
  const resend = new Resend(apiKey);
  const claimUrl = `${getSiteOrigin()}/claim/${encodeURIComponent(opts.token)}`;
  const { subject, html, text } = renderClaimEmail({
    buyerName: opts.buyerName,
    buyerEmail: opts.buyerEmail,
    businessName: opts.businessName,
    claimUrl,
    expiresInDays: 30,
  });

  const from =
    process.env.RESEND_FROM?.trim() ?? "WalkPerro <hello@walkperro.com>";
  await resend.emails.send({
    from,
    to: [opts.buyerEmail],
    subject,
    html,
    text,
  });
}

async function recordPurchaseAndStartOnboarding(session: Stripe.Checkout.Session) {
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
  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? null;
  const customerName = session.customer_details?.name ?? null;

  // 1. Look up the lead for slug + business name (so we can build the preview URL + email).
  const { data: lead, error: leadError } = await closehound
    .from("leads")
    .select("id, company_name, city")
    .eq("id", leadId)
    .maybeSingle();
  if (leadError || !lead) {
    throw new Error(`Lead ${leadId} not found.`);
  }

  // 2. Record the purchase.
  const { data: purchase, error: insertError } = await closehound
    .from("purchases")
    .upsert(
      {
        lead_id: leadId,
        stripe_session_id: session.id,
        stripe_customer_id:
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null,
        amount_cents: session.amount_total ?? 0,
        currency: (session.currency ?? "usd").toLowerCase(),
        customer_email: customerEmail,
        customer_name: customerName,
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

  // 3. Mark the lead as sold.
  await closehound.from("leads").update({ status: "sold" }).eq("id", leadId);

  // 4. Spin up the walkperro.preview_sites row + mint claim token + email.
  if (customerEmail) {
    const slug = buildPreviewSlug({
      companyName: lead.company_name as string,
      city: (lead.city as string) ?? null,
      leadId: lead.id as string,
    });
    const previewUrl = `${getSiteOrigin()}/preview/${slug}`;
    const previewSite = await upsertPreviewSiteFromCheckout({
      slug,
      leadId: lead.id as string,
      buyerEmail: customerEmail,
      buyerName: customerName,
      stripeSessionId: session.id,
      previewUrl,
    });
    const token = await mintAndPersistOnboardingToken({
      previewSiteId: previewSite.id,
      leadId: lead.id as string,
      email: customerEmail,
    });
    try {
      await sendClaimEmail({
        buyerEmail: customerEmail,
        buyerName: customerName,
        businessName: lead.company_name as string,
        token,
      });
    } catch (err) {
      // Email failure shouldn't block the webhook — log and continue.
      console.error(
        "[stripe-webhook] sendClaimEmail failed:",
        err instanceof Error ? err.message : err
      );
    }

    // Fire-and-forget: ping Google Search Console with the new slug URL
    // (baseline indexing). Sitemap resubmit happens here too. If GSC isn't
    // configured the function returns ok: false and logs.
    void pingGoogleForUrl({ url: previewUrl }).catch((err) =>
      console.warn(
        "[stripe-webhook] gsc ping failed:",
        err instanceof Error ? err.message : err
      )
    );
  }

  // 5. Queue legacy promote_site job for the operator worker (kept for backward compat).
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
      await recordPurchaseAndStartOnboarding(event.data.object as Stripe.Checkout.Session);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
