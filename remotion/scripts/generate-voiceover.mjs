// Generate the explainer voiceover with Google Cloud Text-to-Speech.
// Run where the network can reach googleapis.com (your machine / CI), with
// GOOGLE_API_KEY set. Writes ../public/voiceover.mp3, then uncomment the
// <Audio> line in src/Demo.tsx and re-render.
//
//   GOOGLE_API_KEY=... node scripts/generate-voiceover.mjs
//
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KEY = process.env.GOOGLE_API_KEY || process.env.GOOGLE_TTS_API_KEY;
if (!KEY) {
  console.error("Set GOOGLE_API_KEY in your environment first.");
  process.exit(1);
}

// Narration timed to the 31s composition.
const SCRIPT = `Most real estate investors are guessing. But in the right markets, the Section 8 housing voucher pays more than the open market — for the exact same house. CloseHound checks every listing for you. Pick a market, and we pull the official HUD voucher rent, match live for-sale listings, and underwrite every property, ranking them by Deal Score. The deals where the government check beats the mortgage rise to the top. These are the markets where the opportunity is. Start free, at closehound dot com.`;

const body = {
  input: { text: SCRIPT },
  // Swap voice if you like — Studio/Neural2 voices sound most natural.
  voice: { languageCode: "en-US", name: "en-US-Studio-O" },
  audioConfig: { audioEncoding: "MP3", speakingRate: 1.0, pitch: 0 },
};

const res = await fetch(
  `https://texttospeech.googleapis.com/v1/text:synthesize?key=${KEY}`,
  { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }
);

if (!res.ok) {
  console.error("TTS failed:", res.status, await res.text());
  process.exit(1);
}

const { audioContent } = await res.json();
const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, "../../public/voiceover.mp3");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(audioContent, "base64"));
console.log("Wrote", out);
