// Client-safe re-exports. `import type` is erased at compile time, so pulling
// these from the server-only client modules does NOT bundle server code.
import type { ZipScreenRow } from "@/lib/screening/types";
import type { Listing } from "@/lib/rentcast/client";
import type { Safmr } from "@/lib/hud/client";
import type { UnderwriteResult } from "@/lib/underwriting/types";

export type { ZipScreenRow, Listing, Safmr };

export interface ListingsResponse {
  safmr: Safmr | null;
  listings: Listing[];
}

/** A listing underwritten client-side with the current assumptions. */
export interface ClientDeal {
  listing: Listing;
  safmrMonthly: number;
  underwriting: UnderwriteResult;
}
