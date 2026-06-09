import type { Assumptions, ScoreWeights } from "@/lib/underwriting/types";

// ── Default underwriting assumptions (every value is overridable in the UI) ──
export const DEFAULT_ASSUMPTIONS: Assumptions = {
  downPaymentPct: 20,
  interestRatePct: 7.0,
  loanTermYears: 30,
  closingCostPct: 3,
  rehabCost: 0,
  propertyMgmtPct: 8,
  vacancyPct: 6,
  maintenancePct: 8,
  capexReservePct: 7,
  taxRatePct: 1.0,
  insuranceRatePct: 0.6, // GA default; FL overridden below
  monthlyHOA: 0,
  paymentStandardMultiplier: 1.0,
};

// Deal Score weights — must sum to 1.0. Normalization targets live in the engine.
export const DEFAULT_WEIGHTS: ScoreWeights = {
  cashOnCash: 0.35,
  capRate: 0.25,
  rentToPrice: 0.25,
  dscr: 0.15,
};

/** Insurance is state-driven and a visible, overridable line item. FL is a
 *  deal-killer (~2.0% of price/yr); GA ~0.6%. */
export function defaultInsuranceRatePct(state: string): number {
  switch (state.toUpperCase()) {
    case "FL":
      return 2.0;
    case "GA":
      return 0.6;
    default:
      return 0.8;
  }
}

/** Assumptions tuned for a given market's state (insurance especially). */
export function assumptionsForState(state: string): Assumptions {
  return { ...DEFAULT_ASSUMPTIONS, insuranceRatePct: defaultInsuranceRatePct(state) };
}

// ── Seed target markets (user-editable) ─────────────────────────────────────
export interface Market {
  id: string;
  label: string;
  state: string;
  county: string;
  /** Representative ZIPs to screen in Stage 1. */
  zips: string[];
  /** Honest-framing note shown in the UI (e.g. South FL is appreciation, not cashflow). */
  note?: string;
}

export const DEFAULT_MARKETS: Market[] = [
  // GA cashflow.
  { id: "ga-bibb", label: "Macon (Bibb)", state: "GA", county: "Bibb",
    zips: ["31201", "31204", "31206", "31210", "31211", "31217", "31220"] },
  { id: "ga-richmond", label: "Augusta (Richmond)", state: "GA", county: "Richmond",
    zips: ["30901", "30904", "30906", "30909", "30815", "30907"] },
  { id: "ga-muscogee", label: "Columbus (Muscogee)", state: "GA", county: "Muscogee",
    zips: ["31901", "31903", "31904", "31906", "31907", "31909"] },
  { id: "ga-clayton", label: "Clayton (ATL exurb)", state: "GA", county: "Clayton",
    zips: ["30236", "30238", "30260", "30273", "30274", "30297", "30349"] },
  { id: "ga-henry", label: "Henry (ATL exurb)", state: "GA", county: "Henry",
    zips: ["30228", "30248", "30252", "30253", "30281"] },
  { id: "ga-douglas", label: "Douglas (ATL exurb)", state: "GA", county: "Douglas",
    zips: ["30134", "30135"] },
  // South FL honesty test.
  { id: "fl-miamidade", label: "Miami-Dade", state: "FL", county: "Miami-Dade",
    zips: ["33012", "33125", "33142", "33147", "33150", "33161", "33167", "33169"],
    note: "South FL is an appreciation play, not a Midwest-style cashflow play. High insurance + prices usually score low on cash-on-cash — the tool won't pretend otherwise." },
  { id: "fl-broward", label: "Broward", state: "FL", county: "Broward",
    zips: ["33023", "33024", "33060", "33069", "33311", "33313", "33319"],
    note: "Appreciation play. Expect low cashflow scores after FL insurance." },
];

export function findMarket(id: string): Market | undefined {
  return DEFAULT_MARKETS.find((m) => m.id === id);
}
