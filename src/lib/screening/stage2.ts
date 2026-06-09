import "server-only";
import { getSafmr, safmrForBeds } from "@/lib/hud/client";
import { getListings } from "@/lib/rentcast/client";
import { underwrite } from "@/lib/underwriting/engine";
import type { Assumptions, ScoreWeights } from "@/lib/underwriting/types";
import type { Deal } from "./types";

/**
 * Stage 2 — per-property underwriting. Pull active for-sale listings in a ZIP,
 * underwrite each at the SAFMR ceiling for its bedroom count, rank by Deal Score.
 */
export async function screenListings(
  zip: string,
  assumptions: Assumptions,
  weights?: ScoreWeights
): Promise<Deal[]> {
  const [safmr, listings] = await Promise.all([getSafmr(zip), getListings(zip)]);
  if (!safmr) return [];

  const deals = listings
    .filter((l) => l.price != null && l.price > 0 && l.beds != null)
    .map((l): Deal => {
      const beds = l.beds ?? 3;
      const safmrMonthly = safmrForBeds(safmr, beds);
      const underwriting = underwrite({
        price: l.price!,
        safmrMonthly,
        annualPropertyTax: l.annualTax,
        assumptions,
        weights,
      });
      return { listing: l, safmrMonthly, underwriting };
    });

  return deals.sort((a, b) => b.underwriting.dealScore - a.underwriting.dealScore);
}
