import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateGeminiImage } from "@/lib/images/gemini";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Hardcoded absolute path to the live walkperro project on this machine.
// One-off generation script; not portable, on purpose.
const REFERENCE_LOGO =
  "/Users/ironclaw/projects/walkperro/public/images/logos/logo-main-black-bg.png";
const OUT = path.join(PROJECT_ROOT, "public", "walkperro", "og-default.png");

const PROMPT = `Compose a 1200x630 Open Graph card for the brand "WalkPerro".

Reference image: the WalkPerro wordmark + line-art dog mark on a charcoal background.

Layout:
- Solid charcoal background (#0E0E0E).
- Centered: refined version of the WalkPerro wordmark and dog mark from the reference image, in bone white (#F5F1E8) clean monoline strokes, geometrically perfected, no anti-aliasing artifacts.
- Below the wordmark: tagline "For the ones who make." in clean modern serif typography (Instrument Serif aesthetic), bone white, 38px equivalent, centered.
- Subtle signal-yellow (#EBFF00) accent: a 4px-wide horizontal hairline above the tagline (about 80px wide, centered).
- 80px safe-area margin around all edges.
- No additional decorative elements. No clutter. No drop shadows.

Aspect ratio: 1200×630 exactly. Cinematic, modern, restrained brand graphic. Print-quality typography rendering. No watermarks, no extra text other than "WALK PERRO" wordmark and the tagline "For the ones who make."`;

async function main() {
  process.stdout.write(`Loading reference: ${REFERENCE_LOGO}\n`);
  const refBytes = await fs.readFile(REFERENCE_LOGO);
  const refBase64 = refBytes.toString("base64");

  process.stdout.write(`Generating WalkPerro OG default …\n`);
  const image = await generateGeminiImage({
    prompt: PROMPT,
    timeoutMs: 120_000,
    referenceImages: [{ base64: refBase64, mimeType: "image/png" }],
  });

  const ext = image.mimeType === "image/jpeg" ? "jpg" : "png";
  const outPath = OUT.replace(/\.png$/, `.${ext}`);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, Buffer.from(image.base64, "base64"));
  process.stdout.write(`Wrote ${outPath} (${(image.base64.length * 0.75) | 0} bytes)\n`);
}

main().catch((err) => {
  console.error("walkperro OG gen failed:", err);
  process.exitCode = 1;
});
