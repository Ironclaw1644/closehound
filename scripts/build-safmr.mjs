// Build a static voucher-rent dataset (ZIP → [0BR..4BR]) from the HUD FMR API.
//
// Two passes, because HUD only publishes ZIP-level Small Area FMR for ~38 metros:
//   1. SAFMR pass — iterate every HUD metro, collect per-ZIP SAFMR rows. This
//      sidesteps the unreliable ZIP→metro crosswalk by inverting metro→ZIPs.
//   2. County-FMR pass — for the curated markets (assumptions.ts) whose ZIPs
//      aren't SAFMR, look up the market's COUNTY FMR via /fmr/statedata (keyed
//      by the market's declared county — no crosswalk) and assign it to those
//      ZIPs. SAFMR (pass 1) always wins where both exist.
//
//   HUDUSER_API_KEY=… node scripts/build-safmr.mjs [year]
//
// Writes src/lib/hud/safmr-data.json → { fiscalYear, zips: { zip: [..5..] } }
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const KEY = process.env.HUDUSER_API_KEY;
if (!KEY) { console.error("HUDUSER_API_KEY missing"); process.exit(1); }
const YEAR = Number(process.argv[2]) || 2026;
const FALLBACK_YEAR = YEAR - 1;
const headers = { Authorization: `Bearer ${KEY}` };
const BASE = "https://www.huduser.gov/hudapi/public/fmr";
const __dirname = dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BR_COLS = ["Efficiency", "One-Bedroom", "Two-Bedroom", "Three-Bedroom", "Four-Bedroom"];

async function getJson(url, tries = 7) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers });
      if (res.status === 429 || res.status >= 500) { await sleep(Math.min(9000, 700 * 2 ** i)); continue; }
      if (!res.ok) return { __status: res.status };
      return await res.json();
    } catch { await sleep(Math.min(9000, 700 * 2 ** i)); }
  }
  return { __status: 0 };
}

const rents = (r) => BR_COLS.map((c) => Number(r[c]) || 0);
const valid = (a) => a.some((v) => v > 0);

const zips = {};

// ── Pass 1: SAFMR per-ZIP ────────────────────────────────────────────────────
const meta = await getJson(`${BASE}/listMetroAreas`);
const metros = (Array.isArray(meta) ? meta : meta.data || []).map((m) => m.cbsa_code).filter(Boolean);
console.log(`Pass 1 — SAFMR per-ZIP across ${metros.length} metros (FY${YEAR})…`);
const BATCH = 8;
for (let i = 0; i < metros.length; i += BATCH) {
  await Promise.all(metros.slice(i, i + BATCH).map(async (code) => {
    let data = await getJson(`${BASE}/data/${code}?year=${YEAR}`);
    if (data.__status) data = await getJson(`${BASE}/data/${code}?year=${FALLBACK_YEAR}`);
    const bd = data?.data?.basicdata;
    for (const r of Array.isArray(bd) ? bd : bd ? [bd] : []) {
      const zip = String(r.zip_code || "");
      if (/^\d{5}$/.test(zip) && !zips[zip] && valid(rents(r))) zips[zip] = rents(r);
    }
  }));
  await sleep(100);
}
const safmrCount = Object.keys(zips).length;
console.log(`  SAFMR ZIPs: ${safmrCount}`);

// ── Pass 2: county FMR for curated markets ───────────────────────────────────
const src = readFileSync(resolve(__dirname, "../src/lib/config/assumptions.ts"), "utf8");
const re = /id:\s*"([^"]+)",\s*label:\s*"([^"]+)",\s*state:\s*"([^"]+)",\s*county:\s*"([^"]+)"[\s\S]*?zips:\s*\[([^\]]*)\]/g;
const markets = [];
let m;
while ((m = re.exec(src))) {
  markets.push({ id: m[1], label: m[2], state: m[3], county: m[4], zips: (m[5].match(/\d{5}/g) || []) });
}
await sleep(5000); // cool-down so statedata isn't rate-limited after pass 1's 639 calls
console.log(`Pass 2 — county FMR for ${markets.length} curated markets…`);

const stateCache = {};
async function stateData(st) {
  if (!stateCache[st]) {
    let d = await getJson(`${BASE}/statedata/${st}?year=${YEAR}`);
    if (!d?.data?.counties) d = await getJson(`${BASE}/statedata/${st}?year=${FALLBACK_YEAR}`);
    stateCache[st] = { counties: d?.data?.counties || [], metros: d?.data?.metroareas || [] };
  }
  return stateCache[st];
}
const norm = (s) =>
  String(s || "").toLowerCase().replace(/\s+(county|parish|borough|city|msa|hud metro fmr area)\b.*$/i, "").trim();

const unmatched = [];
for (const mk of markets) {
  const missing = mk.zips.filter((z) => !zips[z]);
  if (!missing.length) continue;
  const { counties, metros } = await stateData(mk.state);
  const want = norm(mk.county);
  const city = norm(mk.label.replace(/\s*\(.*$/, "")); // "Macon (Bibb)" -> "macon"
  const row =
    counties.find((c) => norm(c.county_name) === want) ||
    counties.find((c) => { const n = norm(c.county_name); return n && (n.includes(want) || want.includes(n)); }) ||
    metros.find((m) => { const n = norm(m.metro_name); return n && (n.includes(city) || n.includes(want)); });
  if (!row) { unmatched.push(`${mk.label} (${mk.state}/${mk.county})`); continue; }
  const fmr = rents(row);
  if (!valid(fmr)) { unmatched.push(`${mk.label} (zero FMR)`); continue; }
  for (const z of missing) zips[z] = fmr;
}

console.log(`  county-FMR ZIPs added: ${Object.keys(zips).length - safmrCount}`);
if (unmatched.length) console.log(`  ⚠ unmatched markets: ${unmatched.join("; ")}`);

const out = resolve(__dirname, "../src/lib/hud/safmr-data.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ fiscalYear: YEAR, zips }));
console.log(`\nDone. ${Object.keys(zips).length} ZIPs total → ${out}`);
