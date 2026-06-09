import { DEFAULT_WEIGHTS } from "@/lib/config/assumptions";
import {
  DSCR_NO_DEBT,
  type UnderwriteInput,
  type UnderwriteResult,
} from "./types";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const round = (n: number, dp = 2) => {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
};

/**
 * Monthly principal & interest for a fully-amortizing loan.
 * Handles the 0%-rate and 0-loan (cash purchase) edge cases.
 */
export function monthlyPayment(loan: number, annualRatePct: number, termYears: number): number {
  if (loan <= 0) return 0;
  const n = termYears * 12;
  if (n <= 0) return 0; // guard a zeroed-out loan term (avoids Infinity)
  const r = annualRatePct / 100 / 12;
  if (r === 0) return loan / n;
  const factor = (r * (1 + r) ** n) / ((1 + r) ** n - 1);
  return loan * factor;
}

/**
 * Underwrite a single property. Pure function — returns every intermediate
 * value so the detail drawer can render the full waterfall transparently.
 */
export function underwrite(input: UnderwriteInput): UnderwriteResult {
  const { price, safmrMonthly, assumptions: a } = input;
  const weights = input.weights ?? DEFAULT_WEIGHTS;

  // Rent input — the key step. Voucher ceiling × payment-standard multiplier.
  const grossRent = safmrMonthly * a.paymentStandardMultiplier;

  // Financing.
  const loan = price * (1 - a.downPaymentPct / 100);
  const monthlyPI = monthlyPayment(loan, a.interestRatePct, a.loanTermYears);

  // Operating expenses.
  const opexVar =
    grossRent *
    ((a.propertyMgmtPct + a.vacancyPct + a.maintenancePct + a.capexReservePct) / 100);
  const annualPropertyTax =
    input.annualPropertyTax != null && input.annualPropertyTax > 0
      ? input.annualPropertyTax
      : (a.taxRatePct / 100) * price;
  const insuranceAnnual = (a.insuranceRatePct / 100) * price;
  const opexFix = annualPropertyTax / 12 + insuranceAnnual / 12 + a.monthlyHOA;

  const noiMonthly = grossRent - opexVar - opexFix;
  const netCashFlowMonthly = noiMonthly - monthlyPI;

  // Cash invested.
  const cashIn =
    price * (a.downPaymentPct / 100) + price * (a.closingCostPct / 100) + a.rehabCost;

  // Return metrics.
  const cashOnCashPct = cashIn > 0 ? (netCashFlowMonthly * 12) / cashIn * 100 : 0;
  const capRatePct = price > 0 ? (noiMonthly * 12) / price * 100 : 0;
  const rentToPricePct = price > 0 ? (grossRent / price) * 100 : 0;
  const dscr =
    monthlyPI > 0 ? (noiMonthly * 12) / (monthlyPI * 12) : DSCR_NO_DEBT;

  // ── Deal Score: normalize each metric to 0–1, then weight. ────────────────
  const nCoC = clamp(cashOnCashPct / 15, 0, 1); // 0% → 0, 15%+ → 1
  const nCap = clamp(capRatePct / 10, 0, 1); // 0% → 0, 10%+ → 1
  const nRtp = clamp((rentToPricePct - 0.5) / (1.2 - 0.5), 0, 1); // 0.5% → 0, 1.2%+ → 1
  const nDscr = clamp((dscr - 1.0) / (1.5 - 1.0), 0, 1); // 1.0 → 0, 1.5+ → 1

  const dealScore = Math.round(
    (weights.cashOnCash * nCoC +
      weights.capRate * nCap +
      weights.rentToPrice * nRtp +
      weights.dscr * nDscr) *
      100
  );

  return {
    grossRent: round(grossRent),
    loan: round(loan),
    monthlyPI: round(monthlyPI),
    opexVar: round(opexVar),
    opexFix: round(opexFix),
    annualPropertyTax: round(annualPropertyTax),
    insuranceAnnual: round(insuranceAnnual),
    noiMonthly: round(noiMonthly),
    netCashFlowMonthly: round(netCashFlowMonthly),
    cashIn: round(cashIn),
    cashOnCashPct: round(cashOnCashPct),
    capRatePct: round(capRatePct),
    rentToPricePct: round(rentToPricePct, 3),
    dscr: dscr === DSCR_NO_DEBT ? DSCR_NO_DEBT : round(dscr, 3),
    dealScore,
    scoreBreakdown: {
      cashOnCash: round(nCoC, 4),
      capRate: round(nCap, 4),
      rentToPrice: round(nRtp, 4),
      dscr: round(nDscr, 4),
    },
  };
}
