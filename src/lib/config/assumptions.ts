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
  taxRatePct: 1.0, // state-driven; see defaultPropertyTaxRatePct
  insuranceRatePct: 0.6, // state-driven; see defaultInsuranceRatePct
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

// ── Opportunity grade ───────────────────────────────────────────────────────
// Honest, user-facing read on how hard a market cashflows for a Section 8
// (voucher) buy-and-hold. Drives the "Opportunity Zones" ranking and the
// "don't waste a screen here" warnings.
export type Grade = "A" | "B" | "C" | "D" | "F";

export interface GradeMeta {
  label: string;
  tone: "success" | "accent" | "warning" | "danger";
  blurb: string;
}

export const GRADE_META: Record<Grade, GradeMeta> = {
  A: { label: "Prime", tone: "success", blurb: "Voucher rent routinely beats market — strong cash-on-cash before financing." },
  B: { label: "Strong", tone: "accent", blurb: "Reliable cashflow with the right property. Worth screening regularly." },
  C: { label: "Mixed", tone: "warning", blurb: "Selective — prices or taxes have risen. Cherry-pick; don't carpet-screen." },
  D: { label: "Thin", tone: "warning", blurb: "Mostly an appreciation play. Cashflow is the exception, not the rule." },
  F: { label: "Appreciation only", tone: "danger", blurb: "Insurance/prices usually kill cash-on-cash. Screen only if you want appreciation, not yield." },
};

// ── State cost drivers (annual % of price) ──────────────────────────────────
// Insurance and property tax are the two line items that quietly decide whether
// a Section 8 deal cashflows. Both are state-driven defaults, overridable per
// market and in the UI.
const INSURANCE_BY_STATE: Record<string, number> = {
  FL: 2.0, LA: 1.9, OK: 1.6, TX: 1.5, MS: 1.4, KS: 1.3, CO: 1.2, AL: 0.9,
  MO: 0.9, SC: 0.9, IL: 0.8, MI: 0.8, KY: 0.8, TN: 0.7, OH: 0.7, GA: 0.6,
  IN: 0.6, NC: 0.6, WV: 0.6, WI: 0.6, PA: 0.5,
};

const PROPERTY_TAX_BY_STATE: Record<string, number> = {
  IL: 2.0, NJ: 2.2, TX: 1.7, NY: 1.7, OH: 1.6, NE: 1.6, WI: 1.6, KS: 1.3,
  MI: 1.4, PA: 1.4, MO: 1.0, GA: 0.9, OK: 0.9, IN: 0.85, KY: 0.8, NC: 0.8,
  MS: 0.7, LA: 0.6, TN: 0.6, WV: 0.55, SC: 0.55, AL: 0.4, AR: 0.6, FL: 0.9,
};

/** Insurance is a visible, overridable line item. FL is a deal-killer (~2%/yr). */
export function defaultInsuranceRatePct(state: string): number {
  return INSURANCE_BY_STATE[state.toUpperCase()] ?? 0.8;
}

/** Property tax varies wildly (AL ~0.4%, IL ~2%) and decides marginal deals. */
export function defaultPropertyTaxRatePct(state: string): number {
  return PROPERTY_TAX_BY_STATE[state.toUpperCase()] ?? 1.0;
}

/** Assumptions tuned for a given state (insurance + property tax). */
export function assumptionsForState(state: string): Assumptions {
  return {
    ...DEFAULT_ASSUMPTIONS,
    insuranceRatePct: defaultInsuranceRatePct(state),
    taxRatePct: defaultPropertyTaxRatePct(state),
  };
}

/** Assumptions tuned for a market: state defaults, then per-market overrides
 *  (e.g. Cuyahoga County's ~2% effective property tax). */
export function assumptionsForMarket(market: Pick<Market, "state" | "insuranceRatePct" | "taxRatePct">): Assumptions {
  const base = assumptionsForState(market.state);
  return {
    ...base,
    insuranceRatePct: market.insuranceRatePct ?? base.insuranceRatePct,
    taxRatePct: market.taxRatePct ?? base.taxRatePct,
  };
}

// ── Target markets ──────────────────────────────────────────────────────────
export interface Market {
  id: string;
  label: string;
  state: string;
  county: string;
  /** Cashflow opportunity grade. */
  grade: Grade;
  /** Region bucket for grouping in the UI. */
  region: "Midwest" | "South" | "Mid-Atlantic" | "Southwest" | "Mountain" | "Other";
  /** Representative ZIPs to screen in Stage 1. */
  zips: string[];
  /** Honest-framing note shown in the UI. */
  note?: string;
  /** Per-market cost overrides (county differs from state default). */
  insuranceRatePct?: number;
  taxRatePct?: number;
}

export const DEFAULT_MARKETS: Market[] = [
  // ── OHIO — among the best Section 8 cashflow in the country ────────────────
  { id: "oh-cuyahoga", label: "Cleveland (Cuyahoga)", state: "OH", county: "Cuyahoga", grade: "A", region: "Midwest",
    zips: ["44105", "44108", "44110", "44112", "44120", "44127", "44128", "44104"],
    taxRatePct: 2.1, note: "Top-tier voucher-to-price. Cuyahoga's ~2% effective property tax is the main drag — it's already priced in here." },
  { id: "oh-montgomery", label: "Dayton (Montgomery)", state: "OH", county: "Montgomery", grade: "A", region: "Midwest",
    zips: ["45402", "45404", "45405", "45406", "45417", "45420", "45427"] },
  { id: "oh-lucas", label: "Toledo (Lucas)", state: "OH", county: "Lucas", grade: "A", region: "Midwest",
    zips: ["43604", "43605", "43607", "43608", "43609", "43610", "43611", "43612"] },
  { id: "oh-summit", label: "Akron (Summit)", state: "OH", county: "Summit", grade: "A", region: "Midwest",
    zips: ["44301", "44305", "44306", "44310", "44314", "44320"] },
  { id: "oh-stark", label: "Canton (Stark)", state: "OH", county: "Stark", grade: "B", region: "Midwest",
    zips: ["44703", "44704", "44705", "44707", "44708", "44714"] },
  { id: "oh-franklin", label: "Columbus (Franklin)", state: "OH", county: "Franklin", grade: "B", region: "Midwest",
    zips: ["43204", "43207", "43211", "43219", "43223", "43227", "43229", "43232"],
    note: "Strong economy + appreciation; prices have run, so cherry-pick the cashflow." },
  { id: "oh-hamilton", label: "Cincinnati (Hamilton)", state: "OH", county: "Hamilton", grade: "B", region: "Midwest",
    zips: ["45205", "45211", "45224", "45229", "45237", "45238", "45239"] },

  // ── MICHIGAN ───────────────────────────────────────────────────────────────
  { id: "mi-wayne", label: "Detroit (Wayne)", state: "MI", county: "Wayne", grade: "A", region: "Midwest",
    zips: ["48201", "48205", "48206", "48213", "48219", "48227", "48228", "48235", "48238"],
    note: "Voucher rents far exceed price on the right block. Verify rehab + neighborhood block-by-block." },
  { id: "mi-genesee", label: "Flint (Genesee)", state: "MI", county: "Genesee", grade: "A", region: "Midwest",
    zips: ["48503", "48504", "48505", "48506", "48507", "48532"] },
  { id: "mi-saginaw", label: "Saginaw", state: "MI", county: "Saginaw", grade: "A", region: "Midwest",
    zips: ["48601", "48602", "48603", "48607"] },
  { id: "mi-kent", label: "Grand Rapids (Kent)", state: "MI", county: "Kent", grade: "B", region: "Midwest",
    zips: ["49503", "49504", "49507", "49508", "49509"] },

  // ── INDIANA ────────────────────────────────────────────────────────────────
  { id: "in-marion", label: "Indianapolis (Marion)", state: "IN", county: "Marion", grade: "A", region: "Midwest",
    zips: ["46201", "46203", "46205", "46208", "46218", "46222", "46226", "46235", "46241"],
    note: "10,500+ voucher holders, landlord-friendly (3–4 week evictions), deep demand." },
  { id: "in-allen", label: "Fort Wayne (Allen)", state: "IN", county: "Allen", grade: "B", region: "Midwest",
    zips: ["46802", "46803", "46805", "46806", "46807", "46808", "46816", "46819"] },
  { id: "in-lake", label: "Gary (Lake)", state: "IN", county: "Lake", grade: "B", region: "Midwest",
    zips: ["46402", "46404", "46406", "46407", "46408", "46409"] },

  // ── TENNESSEE ──────────────────────────────────────────────────────────────
  { id: "tn-shelby", label: "Memphis (Shelby)", state: "TN", county: "Shelby", grade: "A", region: "South",
    zips: ["38106", "38108", "38109", "38111", "38114", "38115", "38116", "38118", "38127", "38128"],
    note: "Classic ~9% cash-on-cash Section 8 market. Low taxes; pick management carefully." },
  { id: "tn-hamilton", label: "Chattanooga (Hamilton)", state: "TN", county: "Hamilton", grade: "B", region: "South",
    zips: ["37404", "37406", "37407", "37410", "37411", "37412", "37415"] },
  { id: "tn-knox", label: "Knoxville (Knox)", state: "TN", county: "Knox", grade: "B", region: "South",
    zips: ["37914", "37915", "37917", "37920", "37921", "37924"] },

  // ── ALABAMA ────────────────────────────────────────────────────────────────
  { id: "al-jefferson", label: "Birmingham (Jefferson)", state: "AL", county: "Jefferson", grade: "A", region: "South",
    zips: ["35206", "35207", "35208", "35211", "35212", "35215", "35217", "35218", "35224", "35228"],
    note: "Cheap entry + the lowest property tax in the country (~0.4%) = strong net yield." },
  { id: "al-montgomery", label: "Montgomery", state: "AL", county: "Montgomery", grade: "B", region: "South",
    zips: ["36104", "36105", "36107", "36108", "36109", "36110", "36116"] },
  { id: "al-mobile", label: "Mobile", state: "AL", county: "Mobile", grade: "B", region: "South",
    zips: ["36603", "36605", "36606", "36607", "36608", "36609", "36610", "36617"],
    insuranceRatePct: 1.6, note: "Gulf-coast wind insurance runs higher than the rest of AL — watch the premium." },

  // ── MISSOURI ───────────────────────────────────────────────────────────────
  { id: "mo-stlouis", label: "St. Louis (City)", state: "MO", county: "St. Louis City", grade: "A", region: "Midwest",
    zips: ["63107", "63111", "63113", "63115", "63116", "63118", "63120", "63136", "63147"] },
  { id: "mo-jackson", label: "Kansas City (Jackson)", state: "MO", county: "Jackson", grade: "B", region: "Midwest",
    zips: ["64109", "64110", "64127", "64128", "64130", "64132", "64134"] },

  // ── WISCONSIN ──────────────────────────────────────────────────────────────
  { id: "wi-milwaukee", label: "Milwaukee", state: "WI", county: "Milwaukee", grade: "A", region: "Midwest",
    zips: ["53204", "53205", "53206", "53208", "53209", "53210", "53212", "53216", "53218"],
    note: "Strong voucher rents; Wisconsin property tax (~1.6%) is the line item to watch." },

  // ── KENTUCKY ───────────────────────────────────────────────────────────────
  { id: "ky-jefferson", label: "Louisville (Jefferson)", state: "KY", county: "Jefferson", grade: "B", region: "South",
    zips: ["40203", "40208", "40210", "40211", "40212", "40215", "40216", "40218"] },

  // ── GEORGIA ────────────────────────────────────────────────────────────────
  { id: "ga-bibb", label: "Macon (Bibb)", state: "GA", county: "Bibb", grade: "A", region: "South",
    zips: ["31201", "31204", "31206", "31210", "31211", "31217", "31220"] },
  { id: "ga-richmond", label: "Augusta (Richmond)", state: "GA", county: "Richmond", grade: "A", region: "South",
    zips: ["30901", "30904", "30906", "30909", "30815", "30907"] },
  { id: "ga-muscogee", label: "Columbus (Muscogee)", state: "GA", county: "Muscogee", grade: "B", region: "South",
    zips: ["31901", "31903", "31904", "31906", "31907", "31909"] },
  { id: "ga-clayton", label: "Clayton (ATL exurb)", state: "GA", county: "Clayton", grade: "C", region: "South",
    zips: ["30236", "30238", "30260", "30273", "30274", "30297", "30349"],
    note: "ATL spillover has pushed prices up — cashflow is selective now." },
  { id: "ga-henry", label: "Henry (ATL exurb)", state: "GA", county: "Henry", grade: "C", region: "South",
    zips: ["30228", "30248", "30252", "30253", "30281"] },

  // ── NORTH CAROLINA ─────────────────────────────────────────────────────────
  { id: "nc-cumberland", label: "Fayetteville (Cumberland)", state: "NC", county: "Cumberland", grade: "B", region: "South",
    zips: ["28301", "28303", "28304", "28306", "28311", "28314"],
    note: "Fort Liberty drives deep, stable rental demand alongside vouchers." },
  { id: "nc-guilford", label: "Greensboro (Guilford)", state: "NC", county: "Guilford", grade: "B", region: "South",
    zips: ["27401", "27405", "27406", "27407", "27409", "27455"] },
  { id: "nc-forsyth", label: "Winston-Salem (Forsyth)", state: "NC", county: "Forsyth", grade: "B", region: "South",
    zips: ["27101", "27105", "27107", "27127"] },

  // ── SOUTH CAROLINA ─────────────────────────────────────────────────────────
  { id: "sc-richland", label: "Columbia (Richland)", state: "SC", county: "Richland", grade: "B", region: "South",
    zips: ["29201", "29203", "29204", "29205", "29209", "29210", "29223"] },

  // ── PENNSYLVANIA ───────────────────────────────────────────────────────────
  { id: "pa-allegheny", label: "Pittsburgh (Allegheny)", state: "PA", county: "Allegheny", grade: "B", region: "Mid-Atlantic",
    zips: ["15206", "15208", "15210", "15212", "15214", "15216", "15219", "15221", "15235"] },
  { id: "pa-erie", label: "Erie", state: "PA", county: "Erie", grade: "B", region: "Mid-Atlantic",
    zips: ["16501", "16503", "16504", "16505", "16508", "16510"] },
  { id: "pa-philadelphia", label: "Philadelphia", state: "PA", county: "Philadelphia", grade: "C", region: "Mid-Atlantic",
    zips: ["19120", "19121", "19124", "19132", "19133", "19134", "19138", "19139", "19140", "19142"],
    note: "Strong voucher demand but prices + transfer tax have risen — selective deals only." },

  // ── WEST VIRGINIA ──────────────────────────────────────────────────────────
  { id: "wv-kanawha", label: "Charleston (Kanawha)", state: "WV", county: "Kanawha", grade: "B", region: "Mid-Atlantic",
    zips: ["25302", "25303", "25304", "25306", "25309", "25311", "25312", "25387"] },

  // ── SOUTHWEST / TEXAS / OKLAHOMA / KANSAS ──────────────────────────────────
  { id: "tx-bexar", label: "San Antonio (Bexar)", state: "TX", county: "Bexar", grade: "B", region: "Southwest",
    zips: ["78207", "78210", "78211", "78214", "78220", "78223", "78228", "78237"],
    note: "Lower entry than the rest of TX. ~1.7% property tax is the cashflow drag to underwrite." },
  { id: "tx-harris", label: "Houston (Harris)", state: "TX", county: "Harris", grade: "C", region: "Southwest",
    zips: ["77026", "77033", "77051", "77078", "77091"],
    note: "High property tax + flood insurance. Cashflow is selective; underwrite carefully." },
  { id: "ok-oklahoma", label: "Oklahoma City (Oklahoma)", state: "OK", county: "Oklahoma", grade: "B", region: "Southwest",
    zips: ["73106", "73107", "73111", "73117", "73119", "73129"],
    insuranceRatePct: 1.8, note: "Tornado-alley insurance runs high — it's the line item that makes or breaks the deal." },
  { id: "ok-tulsa", label: "Tulsa", state: "OK", county: "Tulsa", grade: "B", region: "Southwest",
    zips: ["74106", "74110", "74115", "74126", "74127", "74128", "74129"], insuranceRatePct: 1.8 },
  { id: "ks-sedgwick", label: "Wichita (Sedgwick)", state: "KS", county: "Sedgwick", grade: "B", region: "Midwest",
    zips: ["67203", "67204", "67211", "67212", "67214", "67216", "67217", "67218"] },

  // ── ILLINOIS (downstate — avoid Cook/Chicago tax + tenant law) ──────────────
  { id: "il-winnebago", label: "Rockford (Winnebago)", state: "IL", county: "Winnebago", grade: "B", region: "Midwest",
    zips: ["61101", "61102", "61103", "61104", "61107", "61108", "61109"],
    note: "Downstate IL cashflows; Illinois property tax (~2%) is the catch — already weighted here." },
  { id: "il-peoria", label: "Peoria", state: "IL", county: "Peoria", grade: "B", region: "Midwest",
    zips: ["61603", "61604", "61605", "61606", "61614", "61615"] },

  // ── LOUISIANA (insurance-heavy) ────────────────────────────────────────────
  { id: "la-caddo", label: "Shreveport (Caddo)", state: "LA", county: "Caddo", grade: "C", region: "South",
    zips: ["71101", "71103", "71104", "71106", "71108", "71109"],
    note: "Cheap homes, but Louisiana insurance (~1.9%) eats the spread. Inland > coastal here." },

  // ── MISSISSIPPI ────────────────────────────────────────────────────────────
  { id: "ms-hinds", label: "Jackson (Hinds)", state: "MS", county: "Hinds", grade: "B", region: "South",
    zips: ["39203", "39204", "39206", "39209", "39212", "39213"] },

  // ── FLORIDA (honesty: appreciation, not cashflow) ──────────────────────────
  { id: "fl-duval", label: "Jacksonville (Duval)", state: "FL", county: "Duval", grade: "D", region: "South",
    zips: ["32206", "32208", "32209", "32254", "32202"],
    note: "The least-bad FL for cashflow, but FL insurance (~2%) still makes yield the exception." },
  { id: "fl-miamidade", label: "Miami-Dade", state: "FL", county: "Miami-Dade", grade: "F", region: "South",
    zips: ["33012", "33125", "33142", "33147", "33150", "33161", "33167", "33169"],
    note: "South FL is an appreciation play, not a Midwest-style cashflow play. High insurance + prices usually score low on cash-on-cash — the tool won't pretend otherwise." },
  { id: "fl-broward", label: "Broward", state: "FL", county: "Broward", grade: "F", region: "South",
    zips: ["33023", "33024", "33060", "33069", "33311", "33313", "33319"],
    note: "Appreciation play. Expect low cashflow scores after FL insurance." },
];

export function findMarket(id: string): Market | undefined {
  return DEFAULT_MARKETS.find((m) => m.id === id);
}

const GRADE_ORDER: Record<Grade, number> = { A: 0, B: 1, C: 2, D: 3, F: 4 };

/** Markets sorted best-cashflow first (for the picker + Opportunity Zones). */
export function marketsByOpportunity(): Market[] {
  return [...DEFAULT_MARKETS].sort(
    (a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.label.localeCompare(b.label)
  );
}

/** The featured "Opportunity Zones" — the A-grade prime cashflow markets. */
export function featuredZones(): Market[] {
  return DEFAULT_MARKETS.filter((m) => m.grade === "A");
}

/** Build an ad-hoc single-ZIP market so a user in ANY state can screen a
 *  specific ZIP that isn't in the curated list. Grade is unknown until screened. */
export function adhocMarket(zip: string, state = ""): Market {
  return {
    id: `zip-${zip}`,
    label: `ZIP ${zip}`,
    state: state.toUpperCase(),
    county: "",
    grade: "C",
    region: "Other",
    zips: [zip],
  };
}

export const COUNT_STATES = new Set(DEFAULT_MARKETS.map((m) => m.state)).size;
