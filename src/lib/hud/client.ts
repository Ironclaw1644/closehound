import "server-only";
import { isMockMode } from "@/lib/env";
import { hasSupabaseAdminEnv, getClosehoundAdminSchema } from "@/lib/supabase";
import { isFresh, TTL } from "@/lib/cache/ttl";
import { syntheticSafmr } from "@/lib/mock/synthetic";
import { HudSafmrRowSchema } from "./schema";
import { recordCall } from "@/lib/metrics";
import safmrData from "./safmr-data.json";

// Bundled voucher-rent dataset, baked from HUD (scripts/build-safmr.mjs):
// per-ZIP SAFMR for the ~38 SAFMR metros + county FMR for the rest. Replaces the
// live HUD API, whose ZIP→metro crosswalk is unreliable across CBSA vintages.
const SAFMR_DATA = safmrData as { fiscalYear: number; zips: Record<string, number[]> };

/** HUD FMR fiscal year (FY starts Oct 1). Overridable via env. */
export const HUD_FISCAL_YEAR = Number(process.env.HUD_FISCAL_YEAR) || 2026;

export interface Safmr {
  zip: string;
  fiscalYear: number;
  br: [number, number, number, number, number]; // 0BR..4BR monthly $
  metroName: string | null;
  isSafmr: boolean;
}

/** SAFMR ceiling for a given bedroom count (clamped 0..4). */
export function safmrForBeds(s: Safmr, beds: number): number {
  return s.br[Math.min(Math.max(beds, 0), 4)];
}

// Lazily-cached list of every ZIP with voucher coverage, for nearest-ZIP search.
let COVERED_ZIPS: string[] | null = null;
const coveredZips = (): string[] => (COVERED_ZIPS ??= Object.keys(SAFMR_DATA.zips));

const commonPrefixLen = (a: string, b: string): number => {
  let n = 0;
  while (n < a.length && n < b.length && a[n] === b[n]) n++;
  return n;
};

export interface ZipResolution {
  /** The ZIP we'll actually screen (== requested when exact). */
  zip: string;
  /** True when the requested ZIP itself has coverage. */
  exact: boolean;
}

/**
 * Resolve a 5-digit ZIP to itself if it has SAFMR voucher coverage, otherwise to
 * the NEAREST covered ZIP — preferring the same area (longest shared ZIP prefix),
 * then numeric proximity. Pure data lookup over the bundled dataset; not billable.
 */
export function resolveZip(zip: string): ZipResolution | null {
  if (!/^\d{5}$/.test(zip)) return null;
  if (SAFMR_DATA.zips[zip]) return { zip, exact: true };
  const target = parseInt(zip, 10);
  let best: string | null = null;
  let bestPrefix = -1;
  let bestDist = Infinity;
  for (const z of coveredZips()) {
    const p = commonPrefixLen(z, zip);
    if (p < bestPrefix) continue;
    const d = Math.abs(parseInt(z, 10) - target);
    if (p > bestPrefix || d < bestDist) {
      best = z;
      bestPrefix = p;
      bestDist = d;
    }
  }
  return best ? { zip: best, exact: false } : null;
}

function rowToSafmr(row: {
  zip: string;
  fiscal_year: number;
  br0: number | null;
  br1: number | null;
  br2: number | null;
  br3: number | null;
  br4: number | null;
  metro_name: string | null;
  is_safmr: boolean;
}): Safmr {
  return {
    zip: row.zip,
    fiscalYear: row.fiscal_year,
    br: [row.br0 ?? 0, row.br1 ?? 0, row.br2 ?? 0, row.br3 ?? 0, row.br4 ?? 0],
    metroName: row.metro_name,
    isSafmr: row.is_safmr,
  };
}

/**
 * SAFMR by ZIP with cache read-through. Order: fresh cache → MOCK_MODE synthetic
 * or live HUD → upsert cache. Returns null when no reliable SAFMR is available
 * (caller labels "insufficient data" and excludes from ranking).
 */
export async function getSafmr(zip: string): Promise<Safmr | null> {
  const canCache = hasSupabaseAdminEnv();
  const db = canCache ? getClosehoundAdminSchema() : null;

  let stale: Safmr | null = null;
  if (db) {
    const { data: cached } = await db
      .from("safmr_cache")
      .select("*")
      .eq("zip", zip)
      .eq("fiscal_year", HUD_FISCAL_YEAR)
      .maybeSingle();
    if (cached) {
      if (isFresh(cached.fetched_at, TTL.safmr)) {
        recordCall("hud", "cache");
        return rowToSafmr(cached);
      }
      stale = rowToSafmr(cached);
    }
  }

  let fresh: Safmr | null = null;
  try {
    fresh = isMockMode() ? mockSafmr(zip) : staticSafmr(zip);
  } catch {
    fresh = null;
  }
  if (!fresh) return stale;

  if (db) {
    await db.from("safmr_cache").upsert({
      zip: fresh.zip,
      fiscal_year: fresh.fiscalYear,
      br0: fresh.br[0],
      br1: fresh.br[1],
      br2: fresh.br[2],
      br3: fresh.br[3],
      br4: fresh.br[4],
      metro_name: fresh.metroName,
      is_safmr: fresh.isSafmr,
      fetched_at: new Date().toISOString(),
    });
  }
  return fresh;
}

function mockSafmr(zip: string): Safmr {
  const s = syntheticSafmr(zip);
  recordCall("hud", "mock");
  return { zip, fiscalYear: HUD_FISCAL_YEAR, br: s.br, metroName: s.metroName, isSafmr: s.isSafmr };
}

// ── Static SAFMR path (bundled HUD dataset; no live API call) ────────────────
function staticSafmr(zip: string): Safmr | null {
  const v = SAFMR_DATA.zips[zip];
  if (!v || v.length < 5 || v.every((x) => !x)) return null;
  recordCall("hud", "live");
  return {
    zip,
    fiscalYear: SAFMR_DATA.fiscalYear,
    br: [v[0], v[1], v[2], v[3], v[4]],
    metroName: null,
    isSafmr: true,
  };
}

// Re-export for tests.
export { HudSafmrRowSchema };
