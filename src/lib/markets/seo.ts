// ── Programmatic market-page SEO layer ──────────────────────────────────────
// Turns the curated Section 8 markets (assumptions.ts) + the bundled HUD SAFMR
// voucher dataset into a hub → state → city page tree at /markets/**. Every
// number rendered on those pages is real (FY voucher rents, state cost drivers,
// honest A–F grade) — the content is data-first, not thin doorway copy.
import {
  DEFAULT_MARKETS,
  GRADE_META,
  defaultInsuranceRatePct,
  defaultPropertyTaxRatePct,
  type Grade,
  type Market,
} from "@/lib/config/assumptions";
import SAFMR from "@/lib/hud/safmr-data.json";

const SAFMR_DATA = SAFMR as { fiscalYear: number; zips: Record<string, number[]> };
export const MARKETS_FY = SAFMR_DATA.fiscalYear; // 2026
const VOUCHERS = SAFMR_DATA.zips;

export const SITE =
  process.env.NEXT_PUBLIC_SITE?.trim().replace(/\/+$/, "") || "https://closehound.com";

/** State code → full name. Covers every state present in DEFAULT_MARKETS. */
export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", FL: "Florida", GA: "Georgia", IL: "Illinois", IN: "Indiana",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", MI: "Michigan", MO: "Missouri",
  MS: "Mississippi", NC: "North Carolina", OH: "Ohio", OK: "Oklahoma",
  PA: "Pennsylvania", SC: "South Carolina", TN: "Tennessee", TX: "Texas",
  WI: "Wisconsin", WV: "West Virginia",
};

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/&/g, " and ")
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stateSlug(code: string): string {
  return slugify(STATE_NAMES[code.toUpperCase()] ?? code);
}

/** Display city name = label with the trailing "(County)" stripped. */
export function cityName(m: Market): string {
  return m.label.replace(/\s*\(.*\)\s*$/, "").trim();
}

export const GRADE_RANK: Record<Grade, number> = { A: 0, B: 1, C: 2, D: 3, F: 4 };

// ── Entry model ─────────────────────────────────────────────────────────────
export interface MarketEntry {
  market: Market;
  state: string;
  stateName: string;
  stateSlug: string;
  city: string;
  citySlug: string;
  path: string; // /markets/ohio/cleveland
  url: string; // absolute
}

function buildMarketEntries(): MarketEntry[] {
  const seen = new Set<string>();
  const out: MarketEntry[] = [];
  for (const m of DEFAULT_MARKETS) {
    const sslug = stateSlug(m.state);
    let cslug = slugify(cityName(m));
    if (seen.has(`${sslug}/${cslug}`)) cslug = slugify(`${cityName(m)}-${m.county}`);
    seen.add(`${sslug}/${cslug}`);
    const path = `/markets/${sslug}/${cslug}`;
    out.push({
      market: m,
      state: m.state,
      stateName: STATE_NAMES[m.state] ?? m.state,
      stateSlug: sslug,
      city: cityName(m),
      citySlug: cslug,
      path,
      url: `${SITE}${path}`,
    });
  }
  return out;
}

export const MARKET_ENTRIES: MarketEntry[] = buildMarketEntries();

export function marketEntryBySlugs(state: string, city: string): MarketEntry | undefined {
  return MARKET_ENTRIES.find((e) => e.stateSlug === state && e.citySlug === city);
}

export interface StateEntry {
  state: string;
  stateName: string;
  stateSlug: string;
  path: string;
  url: string;
  markets: MarketEntry[];
  bestGrade: Grade;
}

function buildStateEntries(): StateEntry[] {
  const byState = new Map<string, MarketEntry[]>();
  for (const e of MARKET_ENTRIES) {
    const arr = byState.get(e.stateSlug) ?? [];
    arr.push(e);
    byState.set(e.stateSlug, arr);
  }
  return [...byState.values()]
    .map((markets) => {
      markets.sort(
        (a, b) =>
          GRADE_RANK[a.market.grade] - GRADE_RANK[b.market.grade] ||
          a.city.localeCompare(b.city)
      );
      const first = markets[0];
      return {
        state: first.state,
        stateName: first.stateName,
        stateSlug: first.stateSlug,
        path: `/markets/${first.stateSlug}`,
        url: `${SITE}/markets/${first.stateSlug}`,
        markets,
        bestGrade: markets[0].market.grade,
      };
    })
    .sort((a, b) => a.stateName.localeCompare(b.stateName));
}

export const STATE_ENTRIES: StateEntry[] = buildStateEntries();

export function stateEntryBySlug(slug: string): StateEntry | undefined {
  return STATE_ENTRIES.find((e) => e.stateSlug === slug);
}

// ── Real voucher + cost data ────────────────────────────────────────────────
export interface VoucherRow {
  zip: string;
  br2: number | null;
  br3: number | null;
  br4: number | null;
}

export function voucherRows(m: Market): VoucherRow[] {
  return m.zips.map((zip) => {
    const v = VOUCHERS[zip];
    return {
      zip,
      br2: v?.[2] ?? null,
      br3: v?.[3] ?? null,
      br4: v?.[4] ?? null,
    };
  });
}

export function median(nums: Array<number | null>): number | null {
  const a = nums.filter((n): n is number => !!n && n > 0).sort((x, y) => x - y);
  if (!a.length) return null;
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : Math.round((a[mid - 1] + a[mid]) / 2);
}

export function median3BR(m: Market): number | null {
  return median(voucherRows(m).map((r) => r.br3));
}

/** Illustrative "1% rule" supported purchase price from a monthly rent. */
export function onePctPrice(rent: number | null): number | null {
  return rent ? Math.round((rent * 100) / 1000) * 1000 : null;
}

export interface CostDrivers {
  taxPct: number;
  insPct: number;
}

export function costDrivers(m: Market): CostDrivers {
  return {
    taxPct: m.taxRatePct ?? defaultPropertyTaxRatePct(m.state),
    insPct: m.insuranceRatePct ?? defaultInsuranceRatePct(m.state),
  };
}

export function gradeLabel(g: Grade): string {
  return GRADE_META[g].label;
}

// ── Formatting ──────────────────────────────────────────────────────────────
export const usd = (n: number | null | undefined): string =>
  n == null ? "—" : `$${Math.round(n).toLocaleString("en-US")}`;

export const usdMo = (n: number | null | undefined): string =>
  n == null ? "—" : `${usd(n)}/mo`;

// ── JSON-LD builders ────────────────────────────────────────────────────────
export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

export function faqLd(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Render a JSON-LD object as a <script> payload string. */
export function ldJson(obj: unknown): string {
  return JSON.stringify(obj);
}
