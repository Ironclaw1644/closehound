import { describe, it, expect } from "vitest";
import { getSafmr, safmrForBeds } from "./client";

// Real mode (MOCK_MODE unset) + no Supabase env → getSafmr reads the bundled
// static SAFMR dataset directly. Locks in coverage for the curated markets.
describe("static SAFMR dataset", () => {
  it("resolves a SAFMR-metro ZIP (Cleveland 44105)", async () => {
    const s = await getSafmr("44105");
    expect(s).not.toBeNull();
    expect(s!.br).toHaveLength(5);
    expect(safmrForBeds(s!, 3)).toBeGreaterThan(0);
  });

  it("resolves a county-FMR ZIP (Memphis 38109, non-SAFMR metro)", async () => {
    const s = await getSafmr("38109");
    expect(s).not.toBeNull();
    expect(safmrForBeds(s!, 2)).toBeGreaterThan(0);
  });

  it("resolves Clayton County GA (30236)", async () => {
    const s = await getSafmr("30236");
    expect(s?.br[2]).toBe(1470);
  });

  it("returns null for an unknown ZIP", async () => {
    expect(await getSafmr("00000")).toBeNull();
  });
});
