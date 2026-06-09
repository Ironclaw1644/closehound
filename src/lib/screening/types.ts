import type { Listing } from "@/lib/rentcast/client";
import type { UnderwriteResult } from "@/lib/underwriting/types";

export interface ZipScreenRow {
  zip: string;
  bedrooms: number;
  safmrMonthly: number | null;
  medianSalePrice: number | null;
  medianRent: number | null;
  /** SAFMR ceiling ÷ median price, as a percent (the 1% rule metric). */
  zipRentToPricePct: number | null;
  metroName: string | null;
  insufficient: boolean;
}

export interface Deal {
  listing: Listing;
  safmrMonthly: number;
  underwriting: UnderwriteResult;
}
