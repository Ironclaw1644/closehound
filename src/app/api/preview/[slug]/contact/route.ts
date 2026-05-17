import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  findPreviewSiteBySlug,
} from "@/lib/onboarding/storage";

// Public POST endpoint behind the customer-facing preview's contact form.
// Validates input, resolves the buyer's email from the preview_sites row,
// and sends the lead message via Resend. Falls back to hello@walkperro.com
// if the buyer hasn't set an explicit email yet.

const MAX_LEN = {
  name: 120,
  email: 200,
  phone: 30,
  message: 4000,
};

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Body;

  // Validate
  const name = String(body.name ?? "").trim().slice(0, MAX_LEN.name);
  const email = String(body.email ?? "").trim().slice(0, MAX_LEN.email);
  const phone = String(body.phone ?? "").trim().slice(0, MAX_LEN.phone);
  const message = String(body.message ?? "").trim().slice(0, MAX_LEN.message);

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!email || !isEmail(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  // Resolve recipient. Prefer the buyer's explicit business email (set in
  // the editor's Basics tab) → buyer_email at checkout → walkperro fallback.
  // The preview_payload.basics.email override is rendered as
  // model.business.email — we can't easily reach that here without loading
  // the merged model, so we fall back to buyer_email which is always
  // populated by the Stripe webhook.
  const site = await findPreviewSiteBySlug(slug);
  if (!site) {
    return NextResponse.json({ error: "Site not found." }, { status: 404 });
  }
  const recipient = site.buyer_email ?? "hello@walkperro.com";

  // Send via Resend. If Resend isn't configured locally, return ok=false
  // so the client can fall back gracefully (the form shows an inline error
  // and tells the visitor to call instead).
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Email is temporarily unavailable. Try the phone number instead." },
      { status: 503 }
    );
  }
  const from =
    process.env.RESEND_FROM?.trim() ?? "WalkPerro <hello@walkperro.com>";

  const subject = `New lead from your site — ${name}`;
  const text = [
    `You got a new inquiry from your WalkPerro site.`,
    ``,
    `Name:    ${name}`,
    `Email:   ${email}`,
    phone ? `Phone:   ${phone}` : null,
    ``,
    `Message:`,
    message,
    ``,
    `—`,
    `Sent via the contact form on ${site.slug}.`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:24px;font-family:-apple-system,'SF Pro Text','Inter',system-ui,sans-serif;background:#f5f1e8;color:#0e0e0e;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;">
      <tr><td style="padding:24px 28px;background:#0e0e0e;color:#ebff00;">
        <p style="margin:0;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;font-weight:600;">WalkPerro</p>
        <p style="margin:6px 0 0 0;font-size:18px;color:#fff;font-weight:600;">New lead from your site</p>
      </td></tr>
      <tr><td style="padding:24px 28px;font-size:15px;line-height:1.7;">
        <p style="margin:0 0 16px 0;"><strong>${escapeHtml(name)}</strong> reached out via your contact form.</p>
        <table cellpadding="6" cellspacing="0" border="0" style="font-size:14px;">
          <tr><td style="color:#6b6b6b;">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
          ${phone ? `<tr><td style="color:#6b6b6b;">Phone</td><td><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></td></tr>` : ""}
        </table>
        <hr style="border:none;border-top:1px solid #e5e0d2;margin:18px 0;" />
        <p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </td></tr>
      <tr><td style="padding:14px 28px;background:#f5f1e8;font-size:11px;color:#6b6b6b;text-transform:uppercase;letter-spacing:0.18em;">
        Reply to this email to respond directly.
      </td></tr>
    </table>
  </body>
</html>`;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: [recipient],
      // Reply-To so a quick reply goes to the prospect, not to noreply@.
      replyTo: email,
      subject,
      html,
      text,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Couldn't send the message. Please call instead.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
