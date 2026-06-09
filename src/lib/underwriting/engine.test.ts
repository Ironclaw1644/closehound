import { describe, it, expect } from "vitest";
import { underwrite, monthlyPayment } from "./engine";
import { DEFAULT_ASSUMPTIONS } from "@/lib/config/assumptions";
import { DSCR_NO_DEBT, type Assumptions } from "./types";

const base: Assumptions = { ...DEFAULT_ASSUMPTIONS };

describe("monthlyPayment", () => {
  it("amortizes a 7% / 30yr loan correctly", () => {
    // $80k @ 7% / 30yr ≈ $532.24/mo.
    expect(monthlyPayment(80_000, 7, 30)).toBeCloseTo(532.24, 1);
  });
  it("handles a 0% loan as principal / term", () => {
    expect(monthlyPayment(80_000, 0, 30)).toBeCloseTo(80_000 / 360, 4);
  });
  it("returns 0 for no loan (cash purchase)", () => {
    expect(monthlyPayment(0, 7, 30)).toBe(0);
  });
});

describe("underwrite — hand-verified base case", () => {
  const r = underwrite({ price: 100_000, safmrMonthly: 1_200, assumptions: base });

  it("computes gross rent from SAFMR × payment standard", () => {
    expect(r.grossRent).toBe(1_200);
  });
  it("computes the loan and P&I", () => {
    expect(r.loan).toBe(80_000);
    expect(r.monthlyPI).toBeCloseTo(532.24, 1);
  });
  it("computes NOI and net cash flow", () => {
    // opexVar = 1200*0.29=348; opexFix = 1000/12 + 600/12 = 133.33; NOI ≈ 718.67
    expect(r.noiMonthly).toBeCloseTo(718.67, 1);
    expect(r.netCashFlowMonthly).toBeCloseTo(186.43, 1);
  });
  it("computes the return metrics", () => {
    expect(r.rentToPricePct).toBeCloseTo(1.2, 3);
    expect(r.capRatePct).toBeCloseTo(8.62, 1);
    expect(r.cashOnCashPct).toBeCloseTo(9.73, 1);
    expect(r.dscr).toBeCloseTo(1.35, 2);
  });
  it("produces a Deal Score around 80", () => {
    expect(r.dealScore).toBeGreaterThanOrEqual(78);
    expect(r.dealScore).toBeLessThanOrEqual(82);
  });
});

describe("underwrite — edge cases", () => {
  it("treats a cash purchase as no-debt (DSCR sentinel, P&I 0)", () => {
    const r = underwrite({
      price: 100_000,
      safmrMonthly: 1_200,
      assumptions: { ...base, downPaymentPct: 100 },
    });
    expect(r.loan).toBe(0);
    expect(r.monthlyPI).toBe(0);
    expect(r.dscr).toBe(DSCR_NO_DEBT);
  });

  it("raises gross rent with a 1.10 payment standard", () => {
    const r = underwrite({
      price: 100_000,
      safmrMonthly: 1_200,
      assumptions: { ...base, paymentStandardMultiplier: 1.1 },
    });
    expect(r.grossRent).toBeCloseTo(1_320, 2);
  });

  it("uses a listing's known tax over the fallback rate", () => {
    const withTax = underwrite({
      price: 100_000,
      safmrMonthly: 1_200,
      annualPropertyTax: 2_400,
      assumptions: base,
    });
    expect(withTax.annualPropertyTax).toBe(2_400);
  });

  it("FL-style high insurance drops cash-on-cash vs GA", () => {
    const ga = underwrite({ price: 200_000, safmrMonthly: 1_800, assumptions: { ...base, insuranceRatePct: 0.6 } });
    const fl = underwrite({ price: 200_000, safmrMonthly: 1_800, assumptions: { ...base, insuranceRatePct: 2.0 } });
    expect(fl.cashOnCashPct).toBeLessThan(ga.cashOnCashPct);
  });

  it("clamps Deal Score to 0–100", () => {
    const bad = underwrite({ price: 900_000, safmrMonthly: 900, assumptions: base });
    expect(bad.dealScore).toBeGreaterThanOrEqual(0);
    expect(bad.dealScore).toBeLessThanOrEqual(100);
  });
});
