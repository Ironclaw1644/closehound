// Underwriting domain types. All assumptions are configurable (surfaced in the
// Settings panel) — nothing is hardcoded in the engine.

export interface Assumptions {
  downPaymentPct: number;
  interestRatePct: number;
  loanTermYears: number;
  closingCostPct: number;
  rehabCost: number;
  propertyMgmtPct: number;
  vacancyPct: number;
  maintenancePct: number;
  capexReservePct: number;
  /** Fallback annual property-tax rate (% of price) when a listing's tax is unknown. */
  taxRatePct: number;
  /** Annual insurance as % of price. FL is a deal-killer (~2.0%); GA ~0.6%. */
  insuranceRatePct: number;
  monthlyHOA: number;
  /** Payment-standard multiplier applied to SAFMR: 1.00 default, up to 1.10. */
  paymentStandardMultiplier: number;
}

export interface ScoreWeights {
  cashOnCash: number;
  capRate: number;
  rentToPrice: number;
  dscr: number;
}

export interface UnderwriteInput {
  /** Purchase price. */
  price: number;
  /** SAFMR ceiling (monthly $) for the unit's bedroom count. */
  safmrMonthly: number;
  /** Known annual property tax (from the listing); falls back to taxRatePct. */
  annualPropertyTax?: number | null;
  assumptions: Assumptions;
  weights?: ScoreWeights;
}

export interface UnderwriteResult {
  grossRent: number;
  loan: number;
  monthlyPI: number;
  opexVar: number;
  opexFix: number;
  annualPropertyTax: number;
  insuranceAnnual: number;
  noiMonthly: number;
  netCashFlowMonthly: number;
  cashIn: number;
  cashOnCashPct: number;
  capRatePct: number;
  rentToPricePct: number;
  /** Debt-service coverage ratio. 999 sentinel = no debt (cash purchase). */
  dscr: number;
  /** 0–100, weighted blend of the normalized metrics. */
  dealScore: number;
  /** Normalized (0–1) components behind the score, for the transparent drawer. */
  scoreBreakdown: {
    cashOnCash: number;
    capRate: number;
    rentToPrice: number;
    dscr: number;
  };
}

/** Sentinel DSCR meaning "no debt / cash purchase" (DSCR undefined). */
export const DSCR_NO_DEBT = 999;
