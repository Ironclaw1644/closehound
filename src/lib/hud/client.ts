import "server-only";
import { isMockMode } from "@/lib/env";
import { hasSupabaseAdminEnv, getClosehoundAdminSchema } from "@/lib/supabase";
import { isFresh, TTL } from "@/lib/cache/ttl";
import { syntheticSafmr } from "@/lib/mock/synthetic";
import { HudFmrResponseSchema, UspsCrosswalkSchema, HudSafmrRowSchema } from "./schema";
import { recordCall } from "@/lib/metrics";

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
    fresh = isMockMode() ? mockSafmr(zip) : await liveSafmr(zip);
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

// ── Live HUD path (best-effort per docs; primary path is MOCK_MODE) ──────────
async function liveSafmr(zip: string): Promise<Safmr | null> {
  const token = process.env.HUDUSER_API_KEY;
  if (!token) throw new Error("HUDUSER_API_KEY missing");
  const headers = { Authorization: `Bearer ${token}` };

  // ZIP → CBSA via USPS crosswalk (type=5).
  const xw = await fetch(
    `https://www.huduser.gov/hudapi/public/usps?type=5&query=${zip}`,
    { headers, cache: "no-store" }
  );
  if (!xw.ok) throw new Error(`HUD USPS ${xw.status}`);
  const cbsa = UspsCrosswalkSchema.parse(await xw.json()).data.results[0]?.geoid;
  recordCall("hud", "live");
  if (!cbsa) return null;

  // SAFMR by ZIP for that metro.
  const res = await fetch(
    `https://www.huduser.gov/hudapi/public/fmr/data/${cbsa}?year=${HUD_FISCAL_YEAR}`,
    { headers, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`HUD FMR ${res.status}`);
  recordCall("hud", "live");
  const parsed = HudFmrResponseSchema.parse(await res.json());
  const rows = parsed.data.basicdata;
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  const row = list.find((r) => r.zip_code === zip);
  if (!row) return null;

  const pick = (a?: number | null, b?: number | null) => a ?? b ?? 0;
  const safmr: Safmr["br"] = [
    pick(row["SAFMR 0BR"], row.Efficiency),
    pick(row["SAFMR 1BR"], row["One-Bedroom"]),
    pick(row["SAFMR 2BR"], row["Two-Bedroom"]),
    pick(row["SAFMR 3BR"], row["Three-Bedroom"]),
    pick(row["SAFMR 4BR"], row["Four-Bedroom"]),
  ];
  if (safmr.every((v) => v === 0)) return null;
  return { zip, fiscalYear: HUD_FISCAL_YEAR, br: safmr, metroName: parsed.data.area_name ?? null, isSafmr: true };
}

// Re-export for tests.
export { HudSafmrRowSchema };
