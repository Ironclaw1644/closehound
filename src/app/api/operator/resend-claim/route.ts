import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  findPreviewSiteById,
  mintAndPersistOnboardingToken,
} from "@/lib/onboarding/storage";
import { renderClaimEmail } from "@/lib/email/templates/claim";
import { getSiteOrigin } from "@/lib/preview/seo";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";

// Operator-side endpoint. Mints a fresh onboarding JWT for a preview site
// and (by default) emails the buyer with the claim link. Used by the
// /customers view's "Resend claim email" + "Open editor as buyer" actions.
//
// Body:
//   { previewSiteId: string, returnTokenOnly?: boolean }
// If returnTokenOnly is true, no email is sent — the caller just opens the
// URL in a new tab (useful for support).
//
// Output:
//   { ok: true, claimUrl: string, sentTo?: string }

export async function POST(request: Request) {
  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json(
      { error: "Supabase admin env not configured." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    previewSiteId?: string;
    returnTokenOnly?: boolean;
  };
  if (!body.previewSiteId) {
    return NextResponse.json({ error: "previewSiteId is required." }, { status: 400 });
  }

  const site = await findPreviewSiteById(body.previewSiteId);
  if (!site) {
    return NextResponse.json({ error: "preview_site not found." }, { status: 404 });
  }
  if (!site.buyer_email) {
    return NextResponse.json(
      { error: "This preview_site has no buyer email." },
      { status: 400 }
    );
  }

  // Mint a fresh token. Each call invalidates older outstanding tokens
  // implicitly (older tokens still verify, but a buyer who's lost theirs
  // will use the most recent link).
  const token = await mintAndPersistOnboardingToken({
    previewSiteId: site.id,
    leadId: site.lead_id,
    email: site.buyer_email,
    ttlDays: 30,
  });
  const claimUrl = `${getSiteOrigin()}/claim/${token}`;

  // Token-only path: skip email, just return the URL for the operator UI to
  // open in a new tab.
  if (body.returnTokenOnly) {
    return NextResponse.json({ ok: true, claimUrl });
  }

  // Resolve a business name for the email subject. Same pattern as
  // publishAction — split the slug, drop the random suffix, title-case.
  let businessName = site.slug.replace(/-/g, " ");
  // The slug ends with "<lastSix>" of the lead UUID — drop that.
  const parts = site.slug.split("-");
  if (parts.length >= 2 && /^[a-f0-9]{6}$/.test(parts[parts.length - 1])) {
    businessName = parts
      .slice(0, -1)
      .join(" ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  // Or: try to read company_name from the related lead for cleaner copy.
  if (site.lead_id) {
    const closehound = getSupabaseAdminClient().schema("closehound");
    const { data } = await closehound
      .from("leads")
      .select("company_name")
      .eq("id", site.lead_id)
      .maybeSingle();
    if (data?.company_name) {
      businessName = data.company_name;
    }
  }

  // Send the email via Resend. Failures here surface to the operator; the
  // claim URL is still valid even if the send fails so the operator can
  // hand it off manually.
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "RESEND_API_KEY not configured. claim URL minted but not sent.",
        claimUrl,
      },
      { status: 503 }
    );
  }

  try {
    const { subject, html, text } = renderClaimEmail({
      buyerName: site.buyer_name,
      buyerEmail: site.buyer_email,
      businessName,
      claimUrl,
      expiresInDays: 30,
    });
    const from =
      process.env.RESEND_FROM?.trim() ?? "WalkPerro <hello@walkperro.com>";
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: [site.buyer_email],
      subject,
      html,
      text,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Resend send failed.",
        claimUrl,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, claimUrl, sentTo: site.buyer_email });
}
