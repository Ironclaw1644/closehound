import { beforeAll, describe, it, expect } from "vitest";
import { screenZips } from "./stage1";
import { screenListings } from "./stage2";
import { DEFAULT_ASSUMPTIONS, assumptionsForState } from "@/lib/config/assumptions";

beforeAll(() => {
  process.env.MOCK_MODE = "1";
});

describe("screening (MOCK_MODE, no Supabase env)", () => {
  it("screens ZIPs and ranks by rent-to-price desc", async () => {
    const rows = await screenZips(["31201", "31206", "31210"], 3);
    expect(rows).toHaveLength(3);
    expect(rows.every((r) => !r.insufficient)).toBe(true);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].zipRentToPricePct!).toBeGreaterThanOrEqual(rows[i].zipRentToPricePct!);
    }
  });

  it("underwrites listings and ranks by Deal Score desc", async () => {
    const deals = await screenListings("31201", DEFAULT_ASSUMPTIONS);
    expect(deals.length).toBeGreaterThan(0);
    for (let i = 1; i < deals.length; i++) {
      expect(deals[i - 1].underwriting.dealScore).toBeGreaterThanOrEqual(
        deals[i].underwriting.dealScore
      );
    }
  });

  it("GA cashflow beats South FL on average cash-on-cash (the honest result)", async () => {
    const ga = await screenListings("31201", assumptionsForState("GA"));
    const fl = await screenListings("33012", assumptionsForState("FL"));
    const avgCoC = (ds: typeof ga) =>
      ds.reduce((s, d) => s + d.underwriting.cashOnCashPct, 0) / ds.length;
    expect(avgCoC(ga)).toBeGreaterThan(avgCoC(fl));
  });
});
