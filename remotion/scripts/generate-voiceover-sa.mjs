// Generate the explainer voiceover with Google Cloud Text-to-Speech using a
// SERVICE ACCOUNT (OAuth bearer token) instead of an API key. Use this when the
// API key has API restrictions that block texttospeech.googleapis.com
// (reason: API_KEY_SERVICE_BLOCKED). Bearer tokens aren't subject to those
// per-key API restrictions.
//
// Point GOOGLE_SA_FILE at a file containing the service-account JSON (the same
// value as GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON), then:
//   GOOGLE_SA_FILE=/path/to/sa.json node scripts/generate-voiceover-sa.mjs
//
// Writes ../../public/voiceover.mp3. No secret is printed.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const saPath = process.env.GOOGLE_SA_FILE;
if (!saPath) {
  console.error("Set GOOGLE_SA_FILE to the path of the service-account JSON file.");
  process.exit(1);
}

let raw = readFileSync(saPath, "utf8").trim();
// Tolerate a value wrapped in single/double quotes (as it may appear in .env).
if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
  raw = raw.slice(1, -1);
}
let sa;
try {
  sa = JSON.parse(raw);
} catch (e) {
  console.error("Could not parse service-account JSON (check quoting/escaping).");
  process.exit(1);
}
if (!sa.client_email || !sa.private_key) {
  console.error("Service-account JSON missing client_email/private_key.");
  process.exit(1);
}

// Override the script + output via env to render other voiceovers (e.g. the ad)
// without touching the explainer default:
//   VOICEOVER_TEXT="…" VOICEOVER_OUT=../../public/ad-voiceover.mp3 node scripts/generate-voiceover-sa.mjs
const SCRIPT =
  process.env.VOICEOVER_TEXT ||
  `Most real estate investors are guessing. But in the right markets, the Section 8 housing voucher pays more than the open market — for the exact same house. CloseHound checks every listing for you. Pick a market, and we pull the official HUD voucher rent, match live for-sale listings, and underwrite every property, ranking them by Deal Score. The deals where the government check beats the mortgage rise to the top. These are the markets where the opportunity is. Start free, at closehound dot com.`;

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

const now = Math.floor(Date.now() / 1000);
const header = { alg: "RS256", typ: "JWT" };
const claims = {
  iss: sa.client_email,
  scope: "https://www.googleapis.com/auth/cloud-platform",
  aud: "https://oauth2.googleapis.com/token",
  iat: now,
  exp: now + 3600,
};
const unsigned = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claims))}`;
const signer = crypto.createSign("RSA-SHA256");
signer.update(unsigned);
const jwt = `${unsigned}.${b64url(signer.sign(sa.private_key))}`;

const tokRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  }),
});
const tok = await tokRes.json();
if (!tok.access_token) {
  console.error("OAuth token exchange failed:", tokRes.status, tok.error, tok.error_description || "");
  process.exit(1);
}

const body = {
  input: { text: SCRIPT },
  voice: { languageCode: "en-US", name: "en-US-Studio-O" },
  audioConfig: { audioEncoding: "MP3", speakingRate: 1.0, pitch: 0 },
};

const res = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
  method: "POST",
  headers: {
    authorization: `Bearer ${tok.access_token}`,
    "content-type": "application/json",
    "x-goog-user-project": sa.project_id || "",
  },
  body: JSON.stringify(body),
});
if (!res.ok) {
  console.error("TTS failed:", res.status, await res.text());
  process.exit(1);
}

const { audioContent } = await res.json();
const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, process.env.VOICEOVER_OUT || "../../public/voiceover.mp3");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(audioContent, "base64"));
console.log("Wrote", out);
