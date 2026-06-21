// Emits grounded SEO facts for every /markets page → /tmp/market-facts.json.
// These facts (real voucher medians, cost drivers, honest grade) are passed to
// the copy generator so no page prose invents a number.  Run: npx tsx scripts/dump-market-facts.mts
import { writeFileSync } from "node:fs";
import {
  MARKET_ENTRIES,
  STATE_ENTRIES,
  MARKETS_FY,
  voucherRows,
  median3BR,
  onePctPrice,
  costDrivers,
  median,
  gradeLabel,
} from "@/lib/markets/seo";
import { GRADE_META, type Grade } from "@/lib/config/assumptions";

type Fact = Record<string, unknown>;
const facts: Fact[] = [];

// ── Hub ──────────────────────────────────────────────────────────────────────
const gradeCounts = (grades: Grade[]) =>
  grades.reduce<Record<string, number>>((a, g) => ((a[g] = (a[g] ?? 0) + 1), a), {});

const allGrades = MARKET_ENTRIES.map((e) => e.market.grade);
facts.push({
  type: "hub",
  key: "hub",
  path: "/markets",
  fy: MARKETS_FY,
  totalMarkets: MARKET_ENTRIES.length,
  totalStates: STATE_ENTRIES.length,
  gradeCounts: gradeCounts(allGrades),
  primeCities: MARKET_ENTRIES.filter((e) => e.market.grade === "A").map((e) => `${e.city}, ${e.state}`),
});

// ── States ───────────────────────────────────────────────────────────────────
for (const s of STATE_ENTRIES) {
  const med = median(s.markets.map((e) => median3BR(e.market)));
  const cd = costDrivers(s.markets[0].market);
  facts.push({
    type: "state",
    key: s.stateSlug,
    path: s.path,
    fy: MARKETS_FY,
    state: s.state,
    stateName: s.stateName,
    marketCount: s.markets.length,
    gradeCounts: gradeCounts(s.markets.map((e) => e.market.grade)),
    topCities: s.markets
      .filter((e) => e.market.grade === "A" || e.market.grade === "B")
      .map((e) => `${e.city} (${e.market.grade})`),
    allCities: s.markets.map((e) => e.city),
    medianVoucher3BR: med,
    statePropertyTaxPct: cd.taxPct,
    stateInsurancePct: cd.insPct,
  });
}

// ── Cities ───────────────────────────────────────────────────────────────────
for (const e of MARKET_ENTRIES) {
  const m = e.market;
  const rows = voucherRows(m);
  const br3 = rows.map((r) => r.br3).filter((n): n is number => !!n);
  const med = median3BR(m);
  const cd = costDrivers(m);
  facts.push({
    type: "city",
    key: `${e.stateSlug}/${e.citySlug}`,
    path: e.path,
    statePath: `/markets/${e.stateSlug}`,
    fy: MARKETS_FY,
    city: e.city,
    county: m.county,
    state: m.state,
    stateName: e.stateName,
    region: m.region,
    grade: m.grade,
    gradeLabel: gradeLabel(m.grade),
    gradeMeaning: GRADE_META[m.grade].blurb,
    honestNote: m.note ?? "",
    zipCount: m.zips.length,
    sampleZips: m.zips.slice(0, 4),
    medianVoucher3BR: med,
    voucher3BRrange: br3.length ? [Math.min(...br3), Math.max(...br3)] : null,
    onePctSupportedPrice: onePctPrice(med),
    propertyTaxPct: cd.taxPct,
    insurancePct: cd.insPct,
  });
}

writeFileSync("/tmp/market-facts.json", JSON.stringify(facts, null, 2));
console.log(
  `wrote /tmp/market-facts.json — ${facts.length} facts ` +
    `(1 hub + ${STATE_ENTRIES.length} states + ${MARKET_ENTRIES.length} cities)`
);
