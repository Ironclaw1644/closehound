// Confirmation email when a customer hits Publish.

export type PublishedEmailInput = {
  buyerName: string | null;
  businessName: string;
  liveUrl: string;
};

export function renderPublishedEmail(input: PublishedEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const greeting = input.buyerName
    ? `Hey ${input.buyerName.split(/\s+/)[0]},`
    : "Hey there,";
  const subject = `Your site is live · ${input.businessName}`;

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0; padding:0; background:#f5f1e8; font-family: -apple-system, 'SF Pro Text', 'Inter', system-ui, sans-serif; color:#0e0e0e;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f1e8; padding:40px 20px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 32px rgba(14,14,14,0.08);">
          <tr><td style="background:#0e0e0e; padding:28px 32px;">
            <p style="margin:0; font-size:11px; letter-spacing:0.32em; text-transform:uppercase; color:#ebff00; font-weight:600;">WalkPerro</p>
            <p style="margin:8px 0 0 0; font-size:20px; line-height:1.3; color:#ffffff; font-weight:600;">Your site is live.</p>
          </td></tr>
          <tr><td style="padding:36px 32px 24px 32px;">
            <p style="margin:0; font-size:16px; line-height:1.6;">${greeting}</p>
            <p style="margin:14px 0 0 0; font-size:16px; line-height:1.6;">
              <strong>${input.businessName}</strong> is live and ready to share.
              Send the URL to anyone who's been asking — text it to a customer,
              add it to your Google Business listing, or drop it in your
              Instagram bio.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
              <tr><td>
                <a href="${escapeAttr(input.liveUrl)}"
                   style="display:inline-block; background:#ebff00; color:#0e0e0e; padding:14px 24px; border-radius:999px; font-weight:700; font-size:15px; text-decoration:none;">
                  Visit your site →
                </a>
              </td></tr>
            </table>
            <p style="margin:18px 0 0 0; font-size:13px; color:#6b6b6b; word-break:break-all;">
              ${escapeText(input.liveUrl)}
            </p>
            <hr style="border:none; border-top:1px solid #e5e0d2; margin:32px 0;" />
            <p style="margin:0; font-size:13px; line-height:1.6; color:#6b6b6b;">
              Need to make a change? Open the editor again — your link still
              works for 30 days from purchase. After that, reply to this email
              and we'll send a fresh one.
            </p>
          </td></tr>
          <tr><td style="background:#f5f1e8; padding:20px 32px; text-align:center;">
            <p style="margin:0; font-size:11px; letter-spacing:0.18em; text-transform:uppercase; color:#6b6b6b;">
              WalkPerro · The operator's hub for the AI era
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = [
    greeting,
    "",
    `${input.businessName} is live and ready to share.`,
    "",
    `Visit your site: ${input.liveUrl}`,
    "",
    "Need to make a change? Open the editor again — your link still works for 30 days from purchase.",
    "",
    "— WalkPerro",
  ].join("\n");

  return { subject, html, text };
}

function escapeAttr(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeText(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
