// Plain-string Resend HTML email template for the post-purchase claim flow.
// Kept dependency-free (no react-email) so it works server-side without
// adding bundle weight. The template renders a friendly hand-off email with
// brand-aligned colors (charcoal + bone + signal-yellow) and a single CTA.

export type ClaimEmailInput = {
  buyerName: string | null;
  buyerEmail: string;
  businessName: string;
  claimUrl: string;
  expiresInDays: number;
};

const HEADER_LOGO_URL = "https://walkperro.com/walkperro/og-default.png";

export function renderClaimEmail(input: ClaimEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const greeting = input.buyerName
    ? `Hey ${input.buyerName.split(/\s+/)[0]},`
    : "Hey there,";

  const subject = `Your WalkPerro site is ready — claim it for ${input.businessName}`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0; padding:0; background:#f5f1e8; font-family: -apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif; color:#0e0e0e;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f1e8; padding:40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 32px rgba(14,14,14,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:#0e0e0e; padding:28px 32px; text-align:left;">
                <p style="margin:0; font-size:11px; letter-spacing:0.32em; text-transform:uppercase; color:#ebff00; font-weight:600;">WalkPerro</p>
                <p style="margin:8px 0 0 0; font-size:20px; line-height:1.3; color:#ffffff; font-weight:600;">Your site is ready to claim.</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:36px 32px 24px 32px;">
                <p style="margin:0; font-size:16px; line-height:1.6; color:#0e0e0e;">${greeting}</p>
                <p style="margin:14px 0 0 0; font-size:16px; line-height:1.6; color:#0e0e0e;">
                  Thanks for picking up <strong>${input.businessName}</strong>'s site. We've spun it up on your dedicated subdomain and it's ready for you to customize.
                </p>
                <p style="margin:14px 0 0 0; font-size:16px; line-height:1.6; color:#0e0e0e;">
                  Click the button below to claim it. From the editor you can swap photos, edit your phone and hours, choose your accent color, and publish whenever you're ready.
                </p>

                <!-- CTA -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                  <tr>
                    <td>
                      <a href="${escapeAttr(input.claimUrl)}"
                         style="display:inline-block; background:#ebff00; color:#0e0e0e; padding:14px 24px; border-radius:999px; font-weight:700; font-size:15px; text-decoration:none; letter-spacing:0.02em;">
                        Claim your site →
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0 0; font-size:13px; line-height:1.6; color:#6b6b6b;">
                  Or copy + paste this URL into your browser:<br />
                  <span style="word-break:break-all; color:#0e0e0e;">${escapeText(input.claimUrl)}</span>
                </p>

                <hr style="border:none; border-top:1px solid #e5e0d2; margin:32px 0;" />

                <p style="margin:0; font-size:13px; line-height:1.6; color:#6b6b6b;">
                  This link expires in <strong>${input.expiresInDays} days</strong>. If it expires, just reply to this email and we'll send a new one. Questions? Reply directly — we read every email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f5f1e8; padding:20px 32px; text-align:center;">
                <p style="margin:0; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#6b6b6b;">
                  WalkPerro · The operator's hub for the AI era
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    greeting,
    "",
    `Thanks for picking up ${input.businessName}'s site. We've spun it up on your dedicated subdomain and it's ready for you to customize.`,
    "",
    "Click the link below to claim it. From the editor you can swap photos, edit your phone and hours, choose your accent color, and publish whenever you're ready.",
    "",
    `Claim your site: ${input.claimUrl}`,
    "",
    `This link expires in ${input.expiresInDays} days. If it expires, just reply and we'll send a new one.`,
    "",
    "— WalkPerro",
  ].join("\n");

  return { subject, html, text };
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
