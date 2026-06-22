// Deterministic synthetic data for MOCK_MODE. Seeded by ZIP so every market
// renders realistic, reproducible numbers with ZERO live/billable API calls —
// the whole funnel demos offline. GA reads as cashflow; South FL reads as a
// high-price/high-insurance appreciation play (the honest result).

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Seeded PRNG (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (r: number, lo: number, hi: number) => lo + r * (hi - lo);

export function stateForZip(zip: string): "GA" | "FL" | "US" {
  const p = parseInt(zip.slice(0, 3), 10);
  if (p >= 300 && p <= 319) return "GA";
  if (p >= 320 && p <= 349) return "FL";
  return "US";
}

// FMR bedroom ratios relative to the 2BR.
const BR_RATIO = [0.74, 0.8, 1.0, 1.28, 1.52];

export interface SyntheticSafmr {
  br: [number, number, number, number, number];
  metroName: string;
  isSafmr: boolean;
}

export function syntheticSafmr(zip: string): SyntheticSafmr {
  const r = rng(hashStr("safmr:" + zip));
  const state = stateForZip(zip);
  const base2br =
    state === "FL" ? lerp(r(), 1750, 2650) : state === "GA" ? lerp(r(), 950, 1400) : lerp(r(), 1100, 1700);
  const br = BR_RATIO.map((ratio) => Math.round((base2br * ratio) / 5) * 5) as [
    number, number, number, number, number,
  ];
  return {
    br,
    metroName:
      state === "FL" ? "Miami-Fort Lauderdale-West Palm Beach, FL MSA" : state === "GA" ? "Georgia (HUD FMR Area)" : "HUD FMR Area",
    isSafmr: true,
  };
}

export interface SyntheticMarket {
  median_sale_price: number;
  median_rent: number;
}

export function syntheticMarket(zip: string, bedrooms: number): SyntheticMarket {
  const r = rng(hashStr(`market:${zip}:${bedrooms}`));
  const state = stateForZip(zip);
  const safmr = syntheticSafmr(zip).br[Math.min(Math.max(bedrooms, 0), 4)];
  // Price per the 2BR base, scaled by bedroom.
  const base2brPrice =
    state === "FL" ? lerp(r(), 240_000, 480_000) : state === "GA" ? lerp(r(), 85_000, 195_000) : lerp(r(), 140_000, 300_000);
  const bedScale = [0.78, 0.88, 1.0, 1.22, 1.45][Math.min(Math.max(bedrooms, 0), 4)];
  const median_sale_price = Math.round((base2brPrice * bedScale) / 1000) * 1000;
  // Market rent often sits BELOW the SAFMR ceiling in GA (the voucher edge);
  // closer to/above it in FL.
  const rentFactor = state === "FL" ? lerp(r(), 0.85, 1.05) : lerp(r(), 0.74, 0.96);
  const median_rent = Math.round((safmr * rentFactor) / 5) * 5;
  return { median_sale_price, median_rent };
}

export interface SyntheticListing {
  rentcast_id: string;
  zip: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  year_built: number;
  annual_tax: number;
  property_type: string;
  days_on_market: number;
  price_cut_from: number | null;
}

const PROPERTY_TYPES = ["Single Family", "Single Family", "Single Family", "Townhouse", "Multi-Family"];

const STREETS = [
  "Oak", "Maple", "Pine", "Magnolia", "Peachtree", "Cypress", "Dogwood",
  "Sunset", "Lakeview", "Hibiscus", "Palmetto", "Camellia",
];

export interface SyntheticProperty {
  annual_tax: number;
  last_sale_price: number;
  last_sale_date: string;
}

/** Deterministic per-property record for MOCK_MODE (seeded by address) — a
 *  plausible assessed tax + an older last sale, so the demo shows the true-tax
 *  re-underwrite + comps without any billable /properties call. */
export function syntheticProperty(address: string): SyntheticProperty {
  const r = rng(hashStr("property:" + address));
  const annual_tax = Math.round(lerp(r(), 900, 4200) / 10) * 10;
  const last_sale_price = Math.round(lerp(r(), 18000, 140000) / 1000) * 1000;
  const yearsAgo = 2 + Math.floor(r() * 28);
  const month = String(1 + Math.floor(r() * 12)).padStart(2, "0");
  return { annual_tax, last_sale_price, last_sale_date: `${2026 - yearsAgo}-${month}-15` };
}

export function syntheticListings(zip: string, count = 8): SyntheticListing[] {
  const r = rng(hashStr("listings:" + zip));
  const state = stateForZip(zip);
  const out: SyntheticListing[] = [];
  for (let i = 0; i < count; i++) {
    const beds = 2 + Math.floor(r() * 3); // 2–4
    const market = syntheticMarket(zip, beds);
    const price = Math.round((market.median_sale_price * lerp(r(), 0.7, 1.3)) / 1000) * 1000;
    const baths = [1, 1.5, 2, 2.5, 3][Math.floor(r() * 5)];
    const sqft = Math.round(lerp(r(), 950, 2200) / 10) * 10;
    const year_built = 1955 + Math.floor(r() * 68);
    const taxRate = state === "FL" ? lerp(r(), 0.9, 1.4) : lerp(r(), 0.7, 1.2);
    const annual_tax = Math.round((price * taxRate) / 100);
    const num = 100 + Math.floor(r() * 9800);
    const days_on_market = Math.round(lerp(r(), 4, 210));
    // ~30% of listings have been price-cut (a motivated-seller signal).
    const price_cut_from = r() < 0.3 ? Math.round((price * lerp(r(), 1.04, 1.14)) / 500) * 500 : null;
    out.push({
      rentcast_id: `mock-${zip}-${i}`,
      zip,
      address: `${num} ${STREETS[Math.floor(r() * STREETS.length)]} St, ${zip}`,
      price,
      beds,
      baths,
      sqft,
      year_built,
      annual_tax,
      property_type: PROPERTY_TYPES[Math.floor(r() * PROPERTY_TYPES.length)],
      days_on_market,
      price_cut_from,
    });
  }
  return out;
}
