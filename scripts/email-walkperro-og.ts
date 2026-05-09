// One-off: email the freshly-generated WalkPerro OG card to a recipient via Resend.
// Usage: npm run email:walkperro-og -- johnsalsberry1980@gmail.com

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getResendClient, getOutboundSender } from "@/lib/resend";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const IMAGE_PATH = path.join(PROJECT_ROOT, "public", "walkperro", "og-default.png");

const recipient = (process.argv[2] ?? "").trim();
if (!recipient) {
  console.error("Usage: npm run email:walkperro-og -- <recipient@example.com>");
  process.exit(1);
}

async function main() {
  const buffer = await fs.readFile(IMAGE_PATH);

  const resend = getResendClient();
  const sender = getOutboundSender();

  const subject = "WalkPerro logo — for the ones who make.";
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; color: #0E0E0E; max-width: 640px; margin: 0 auto; padding: 32px 24px;">
      <p style="font-size: 16px; line-height: 1.6;">
        New WalkPerro brand card — refreshed with the new tagline:
        <strong>For the ones who make.</strong>
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        Refined via Nano Banana 2 (Gemini 2.5 Flash Image) using the existing
        WalkPerro logo as the image-to-image reference, so the line-art mark
        and wordmark stay locked to the original brand. Signal-yellow hairline
        accent under the wordmark.
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        See attached. PNG, 1024×1024. Used as the default OG card on
        walkperro.com previews.
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #6B6B6B; margin-top: 32px;">
        — WalkPerro
      </p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: sender,
    to: recipient,
    subject,
    html,
    attachments: [
      {
        filename: "walkperro-og-default.png",
        content: buffer,
      },
    ],
  });

  if (error) {
    console.error("Send failed:", error);
    process.exit(1);
  }

  console.log(`Sent OG card to ${recipient}. Resend message id: ${data?.id ?? "unknown"}`);
}

main().catch((err) => {
  console.error("walkperro OG email failed:", err);
  process.exitCode = 1;
});
