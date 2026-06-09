import "server-only";
import { getSafmr, safmrForBeds } from "@/lib/hud/client";
import { getMarketData } from "@/lib/rentcast/client";
import type { ZipScreenRow } from "./types";

/**
 * Stage 1 — cheap ZIP screen. Per ZIP: SAFMR ceiling (HUD) + median sale price
 * (RentCast) for the target bedroom count → zipRentToPrice. Ranks the
 * neighborhoods worth hunting before spending listing calls. ZIPs without
 * reliable SAFMR or price are labeled insufficient and excluded from ranking.
 */
export async function screenZips(zips: string[], bedrooms = 3): Promise<ZipScreenRow[]> {
  const rows = await Promise.all(
    zips.map(async (zip): Promise<ZipScreenRow> => {
      const [safmr, market] = await Promise.all([getSafmr(zip), getMarketData(zip, bedrooms)]);
      const safmrMonthly = safmr ? safmrForBeds(safmr, bedrooms) : null;
      const medianSalePrice = market.medianSalePrice;
      const insufficient = !safmrMonthly || !medianSalePrice || medianSalePrice <= 0;
      return {
        zip,
        bedrooms,
        safmrMonthly,
        medianSalePrice,
        medianRent: market.medianRent,
        zipRentToPricePct: insufficient ? null : (safmrMonthly! / medianSalePrice!) * 100,
        metroName: safmr?.metroName ?? null,
        insufficient,
      };
    })
  );

  // Rank by rent-to-price desc; insufficient ZIPs sink to the bottom.
  return rows.sort(
    (a, b) => (b.zipRentToPricePct ?? -1) - (a.zipRentToPricePct ?? -1)
  );
}
