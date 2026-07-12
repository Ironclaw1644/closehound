// ============================================================================
// demo_closehound seed — used by /api/demo/reset (nightly Vercel cron).
// ============================================================================
// Truncates every demo table and reseeds:
//   • curated SAFMR + market + listings cache rows for two real markets the
//     screener ships with — Macon, GA (ga-bibb, grade A cashflow) and
//     Jacksonville, FL (fl-duval, the honest "appreciation, not cashflow" foil)
//   • 16 plausible Section 8 listings across those ZIPs (columns match
//     closehound.listings_cache exactly; deal-signal extras live in `raw`
//     jsonb like the live RentCast path writes them)
//   • a hunter-plan profile + usage row for the synthetic demo user
//   • 3 saved deals for the demo user, underwritten with the REAL engine so
//     every number on /saved is internally consistent
//
// ZIPs not seeded here still work in the demo: DEMO_MODE implies MOCK_MODE,
// so cache misses fall through to the deterministic synthetic generator and
// get written back into demo_closehound (wiped again at the next reset).
// ============================================================================

import type { getClosehoundAdminSchema } from "@/lib/supabase";
import { DEMO_USER_ID } from "@/lib/auth/getSessionUser";
import { currentPeriod } from "@/lib/quota";
import { underwrite } from "@/lib/underwriting/engine";
import {
  assumptionsForMarket,
  findMarket,
  DEFAULT_WEIGHTS,
} from "@/lib/config/assumptions";

type Db = ReturnType<typeof getClosehoundAdminSchema>;

/** Mirrors hud/client.ts — seeded SAFMR rows must land on the fiscal year the
 *  app reads, or every cache lookup misses. */
const FISCAL_YEAR = Number(process.env.HUD_FISCAL_YEAR) || 2026;

// ── Curated SAFMR by ZIP (0BR..4BR monthly $) ────────────────────────────────

const MACON_METRO = "Macon-Bibb County, GA MSA";
const JAX_METRO = "Jacksonville, FL HUD Metro FMR Area";

const SAFMR: Record<string, { br: [number, number, number, number, number]; metro: string }> = {
  // Macon (ga-bibb) — voucher rents comfortably above local market rents.
  "31201": { br: [820, 930, 1130, 1440, 1700], metro: MACON_METRO },
  "31204": { br: [840, 950, 1160, 1480, 1740], metro: MACON_METRO },
  "31206": { br: [800, 910, 1100, 1410, 1660], metro: MACON_METRO },
  "31210": { br: [880, 1000, 1220, 1550, 1830], metro: MACON_METRO },
  "31211": { br: [830, 940, 1140, 1450, 1710], metro: MACON_METRO },
  "31217": { br: [790, 900, 1090, 1390, 1640], metro: MACON_METRO },
  "31220": { br: [900, 1020, 1240, 1580, 1860], metro: MACON_METRO },
  // Jacksonville (fl-duval) — decent ceilings, but FL prices/insurance bite.
  "32202": { br: [1000, 1150, 1380, 1760, 2080], metro: JAX_METRO },
  "32206": { br: [980, 1120, 1350, 1720, 2030], metro: JAX_METRO },
  "32208": { br: [1010, 1160, 1390, 1780, 2100], metro: JAX_METRO },
  "32209": { br: [960, 1100, 1330, 1700, 2010], metro: JAX_METRO },
  "32254": { br: [990, 1130, 1360, 1740, 2050], metro: JAX_METRO },
};

// ── Curated market medians (3BR, matching the screener's default) ───────────

const MARKET_3BR: Record<string, { price: number; rent: number }> = {
  "31201": { price: 102_000, rent: 1180 },
  "31204": { price: 118_000, rent: 1240 },
  "31206": { price: 94_000, rent: 1120 },
  "31210": { price: 168_000, rent: 1350 },
  "31211": { price: 109_000, rent: 1190 },
  "31217": { price: 88_000, rent: 1080 },
  "31220": { price: 189_000, rent: 1420 },
  "32202": { price: 238_000, rent: 1690 },
  "32206": { price: 216_000, rent: 1620 },
  "32208": { price: 228_000, rent: 1710 },
  "32209": { price: 198_000, rent: 1580 },
  "32254": { price: 209_000, rent: 1640 },
};

// ── 16 listings across Macon + Jacksonville ─────────────────────────────────

interface SeedListing {
  id: string;
  zip: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  annualTax: number;
  propertyType: string;
  daysOnMarket: number;
  priceCutFrom: number | null;
}

const LISTINGS: SeedListing[] = [
  // Macon, GA 31201
  { id: "demo-mac-001", zip: "31201", address: "742 Oglethorpe St, Macon, GA 31201", price: 74_500, beds: 3, baths: 1, sqft: 1180, yearBuilt: 1948, annualTax: 780, propertyType: "Single Family", daysOnMarket: 34, priceCutFrom: null },
  { id: "demo-mac-002", zip: "31201", address: "1315 Second St, Macon, GA 31201", price: 89_900, beds: 3, baths: 2, sqft: 1320, yearBuilt: 1955, annualTax: 940, propertyType: "Single Family", daysOnMarket: 57, priceCutFrom: 97_000 },
  { id: "demo-mac-003", zip: "31201", address: "568 Monroe St, Macon, GA 31201", price: 105_000, beds: 4, baths: 2, sqft: 1560, yearBuilt: 1962, annualTax: 1120, propertyType: "Single Family", daysOnMarket: 22, priceCutFrom: null },
  { id: "demo-mac-004", zip: "31201", address: "231 Rogers Ave, Macon, GA 31201", price: 67_900, beds: 2, baths: 1, sqft: 940, yearBuilt: 1940, annualTax: 690, propertyType: "Single Family", daysOnMarket: 73, priceCutFrom: 74_900 },
  // Macon, GA 31204
  { id: "demo-mac-005", zip: "31204", address: "1128 Napier Ave, Macon, GA 31204", price: 98_500, beds: 3, baths: 2, sqft: 1410, yearBuilt: 1958, annualTax: 1010, propertyType: "Single Family", daysOnMarket: 41, priceCutFrom: null },
  { id: "demo-mac-006", zip: "31204", address: "3467 Vineville Ave, Macon, GA 31204", price: 124_900, beds: 3, baths: 2, sqft: 1620, yearBuilt: 1965, annualTax: 1290, propertyType: "Single Family", daysOnMarket: 18, priceCutFrom: null },
  { id: "demo-mac-007", zip: "31204", address: "2210 Ingleside Ave, Macon, GA 31204", price: 112_000, beds: 3, baths: 1.5, sqft: 1385, yearBuilt: 1950, annualTax: 1160, propertyType: "Single Family", daysOnMarket: 64, priceCutFrom: 119_900 },
  // Macon, GA 31206
  { id: "demo-mac-008", zip: "31206", address: "3820 Houston Ave, Macon, GA 31206", price: 79_900, beds: 3, baths: 1, sqft: 1220, yearBuilt: 1952, annualTax: 830, propertyType: "Single Family", daysOnMarket: 29, priceCutFrom: null },
  { id: "demo-mac-009", zip: "31206", address: "2745 Millerfield Rd, Macon, GA 31206", price: 86_500, beds: 3, baths: 2, sqft: 1300, yearBuilt: 1960, annualTax: 900, propertyType: "Single Family", daysOnMarket: 46, priceCutFrom: null },
  { id: "demo-mac-010", zip: "31206", address: "1932 Pio Nono Ave, Macon, GA 31206", price: 71_000, beds: 2, baths: 1, sqft: 1010, yearBuilt: 1945, annualTax: 740, propertyType: "Townhouse", daysOnMarket: 88, priceCutFrom: 78_500 },
  // Jacksonville, FL 32206
  { id: "demo-jax-001", zip: "32206", address: "1745 E 21st St, Jacksonville, FL 32206", price: 189_900, beds: 3, baths: 1, sqft: 1150, yearBuilt: 1949, annualTax: 2050, propertyType: "Single Family", daysOnMarket: 39, priceCutFrom: null },
  { id: "demo-jax-002", zip: "32206", address: "2318 N Liberty St, Jacksonville, FL 32206", price: 214_500, beds: 3, baths: 2, sqft: 1340, yearBuilt: 1957, annualTax: 2310, propertyType: "Single Family", daysOnMarket: 71, priceCutFrom: 229_000 },
  // Jacksonville, FL 32208
  { id: "demo-jax-003", zip: "32208", address: "8934 Sibbald Rd, Jacksonville, FL 32208", price: 205_000, beds: 3, baths: 2, sqft: 1290, yearBuilt: 1961, annualTax: 2220, propertyType: "Single Family", daysOnMarket: 27, priceCutFrom: null },
  { id: "demo-jax-004", zip: "32208", address: "7626 N Pearl St, Jacksonville, FL 32208", price: 198_500, beds: 4, baths: 2, sqft: 1480, yearBuilt: 1955, annualTax: 2140, propertyType: "Single Family", daysOnMarket: 52, priceCutFrom: null },
  // Jacksonville, FL 32209
  { id: "demo-jax-005", zip: "32209", address: "1521 W 13th St, Jacksonville, FL 32209", price: 178_000, beds: 3, baths: 1, sqft: 1100, yearBuilt: 1948, annualTax: 1920, propertyType: "Single Family", daysOnMarket: 96, priceCutFrom: 195_000 },
  { id: "demo-jax-006", zip: "32209", address: "3611 Commonwealth Ave, Jacksonville, FL 32209", price: 232_000, beds: 4, baths: 2, sqft: 1610, yearBuilt: 1968, annualTax: 2480, propertyType: "Multi-Family", daysOnMarket: 33, priceCutFrom: null },
];

// ── Saved deals for the demo user (underwritten with the real engine) ───────

const SAVED: Array<{ listingId: string; status: string; notes: string | null }> = [
  { listingId: "demo-mac-002", status: "offer", notes: "seller motivated — already cut once. inspection scheduled." },
  { listingId: "demo-mac-005", status: "reviewing", notes: "roof looks 10+ yrs old in photos; price in a rehab credit." },
  { listingId: "demo-mac-008", status: "new", notes: null },
];

/** Client-side Listing shape — mirrors what Dashboard POSTs to /api/deals. */
function toClientListing(l: SeedListing) {
  return {
    rentcastId: l.id,
    zip: l.zip,
    address: l.address,
    price: l.price,
    beds: l.beds,
    baths: l.baths,
    sqft: l.sqft,
    yearBuilt: l.yearBuilt,
    annualTax: l.annualTax,
    propertyType: l.propertyType,
    daysOnMarket: l.daysOnMarket,
    priceCutFrom: l.priceCutFrom,
  };
}

/** Wipe + reseed every demo table. Idempotent; runs nightly via cron. */
export async function resetAndSeedDemo(db: Db): Promise<{ listings: number; savedDeals: number }> {
  const now = new Date().toISOString();

  // ── Truncate (PostgREST needs a filter; match-all on the PK) ──────────────
  const wipe = async (table: string, pk: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (db.from(table as any) as any).delete().not(pk, "is", null);
    if (error) throw new Error(`wipe ${table} failed: ${error.message}`);
  };
  await wipe("saved_deals", "id");
  await wipe("screening_runs", "id");
  await wipe("usage", "user_id");
  await wipe("profiles", "user_id");
  await wipe("leads", "id");
  await wipe("listings_cache", "rentcast_id");
  await wipe("market_cache", "zip");
  await wipe("safmr_cache", "zip");
  await wipe("properties_cache", "address");
  await wipe("processed_events", "event_id");

  // ── Demo user: hunter plan, some usage on the meter, spare credits ────────
  {
    const { error } = await db.from("profiles").insert({
      user_id: DEMO_USER_ID,
      plan: "hunter",
      status: "active",
      credit_balance: 240,
    });
    if (error) throw new Error(`seed profiles failed: ${error.message}`);
  }
  {
    const { error } = await db.from("usage").insert({
      user_id: DEMO_USER_ID,
      period_month: currentPeriod(),
      screens_used: 412,
    });
    if (error) throw new Error(`seed usage failed: ${error.message}`);
  }

  // ── Caches ────────────────────────────────────────────────────────────────
  {
    const rows = Object.entries(SAFMR).map(([zip, s]) => ({
      zip,
      fiscal_year: FISCAL_YEAR,
      br0: s.br[0],
      br1: s.br[1],
      br2: s.br[2],
      br3: s.br[3],
      br4: s.br[4],
      metro_name: s.metro,
      is_safmr: true,
      fetched_at: now,
    }));
    const { error } = await db.from("safmr_cache").insert(rows);
    if (error) throw new Error(`seed safmr_cache failed: ${error.message}`);
  }
  {
    const rows = Object.entries(MARKET_3BR).map(([zip, m]) => ({
      zip,
      bedrooms: 3,
      median_sale_price: m.price,
      median_rent: m.rent,
      fetched_at: now,
    }));
    const { error } = await db.from("market_cache").insert(rows);
    if (error) throw new Error(`seed market_cache failed: ${error.message}`);
  }
  {
    const rows = LISTINGS.map((l) => ({
      rentcast_id: l.id,
      zip: l.zip,
      address: l.address,
      price: l.price,
      beds: l.beds,
      baths: l.baths,
      sqft: l.sqft,
      year_built: l.yearBuilt,
      annual_tax: l.annualTax,
      raw: {
        propertyType: l.propertyType,
        daysOnMarket: l.daysOnMarket,
        priceCutFrom: l.priceCutFrom,
      },
      fetched_at: now,
    }));
    const { error } = await db.from("listings_cache").insert(rows);
    if (error) throw new Error(`seed listings_cache failed: ${error.message}`);
  }

  // ── Saved deals, underwritten with the real engine (ga-bibb assumptions) ──
  {
    const macon = findMarket("ga-bibb");
    if (!macon) throw new Error("seed: market ga-bibb missing from DEFAULT_MARKETS");
    const assumptions = assumptionsForMarket(macon);

    const rows = SAVED.map((s) => {
      const l = LISTINGS.find((x) => x.id === s.listingId);
      if (!l) throw new Error(`seed: saved deal references unknown listing ${s.listingId}`);
      const beds = Math.min(Math.max(l.beds, 0), 4);
      const safmrMonthly = SAFMR[l.zip].br[beds];
      const underwriting = underwrite({
        price: l.price,
        safmrMonthly,
        annualPropertyTax: l.annualTax,
        assumptions,
        weights: DEFAULT_WEIGHTS,
      });
      return {
        user_id: DEMO_USER_ID,
        listing: toClientListing(l),
        underwriting,
        safmr_monthly: safmrMonthly,
        status: s.status,
        notes: s.notes,
      };
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await db.from("saved_deals").insert(rows as any);
    if (error) throw new Error(`seed saved_deals failed: ${error.message}`);
  }

  return { listings: LISTINGS.length, savedDeals: SAVED.length };
}
