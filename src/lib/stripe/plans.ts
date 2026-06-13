// ── CloseHound plan + price registry ────────────────────────────────────────
// Single source of truth for billing. Live Stripe price IDs (WalkPerro acct
// acct_1SXlZTCCBLLo4EMc) are baked in, each overridable by env for portability.
//
// Model (no metered-overage surprises — a user is structurally incapable of
// running up a charge they can't see):
//   • Subscriptions (hunter/closer/agency) grant a MONTHLY screen allotment.
//   • Scout packs are ONE-TIME purchases that add NON-EXPIRING credits.
//   • When the monthly allotment is exhausted, screening draws from credits;
//     out of both → upgrade or buy a pack. Nothing auto-bills beyond that.

export type PlanId = "free" | "hunter" | "closer" | "agency";
export type Cadence = "monthly" | "annual";

const ENV = process.env;

/** Live Stripe price IDs, env-overridable. */
export const STRIPE_PRICES = {
  hunter_monthly: ENV.STRIPE_PRICE_HUNTER_MONTHLY ?? "price_1Thi6nCCBLLo4EMcyVApaxtc",
  hunter_annual: ENV.STRIPE_PRICE_HUNTER_ANNUAL ?? "price_1Thi6oCCBLLo4EMcalMkzBtm",
  closer_monthly: ENV.STRIPE_PRICE_CLOSER_MONTHLY ?? "price_1Thi6qCCBLLo4EMcUzl8KIQh",
  closer_annual: ENV.STRIPE_PRICE_CLOSER_ANNUAL ?? "price_1Thi6sCCBLLo4EMc6vU2nrdq",
  agency_monthly: ENV.STRIPE_PRICE_AGENCY_MONTHLY ?? "price_1Thi6tCCBLLo4EMcACkCYSWb",
  agency_annual: ENV.STRIPE_PRICE_AGENCY_ANNUAL ?? "price_1Thi6vCCBLLo4EMcemz4Cc70",
  scout_40: ENV.STRIPE_PRICE_SCOUT_40 ?? "price_1Thi6wCCBLLo4EMchCvmii8r",
  scout_150: ENV.STRIPE_PRICE_SCOUT_150 ?? "price_1Thi6xCCBLLo4EMcKoG7GVEx",
} as const;

export type PriceKey = keyof typeof STRIPE_PRICES;

export interface Plan {
  id: PlanId;
  name: string;
  /** Monthly screen allotment. */
  screens: number;
  priceMonthly: number; // USD/mo (0 for free)
  priceAnnual: number; // USD/yr (0 for free)
  monthlyPriceId: string | null;
  annualPriceId: string | null;
  blurb: string;
  features: string[];
  popular?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    screens: 10,
    priceMonthly: 0,
    priceAnnual: 0,
    monthlyPriceId: null,
    annualPriceId: null,
    blurb: "Taste the hunt. No card.",
    features: [
      "10 deal screens",
      "All 50 states + opportunity grades",
      "Full Deal Score underwriting",
    ],
  },
  hunter: {
    id: "hunter",
    name: "Hunter",
    screens: 300,
    priceMonthly: 39,
    priceAnnual: 390,
    monthlyPriceId: STRIPE_PRICES.hunter_monthly,
    annualPriceId: STRIPE_PRICES.hunter_annual,
    blurb: "For the active investor working markets weekly.",
    popular: true,
    features: [
      "300 screens / month",
      "Save deals + CSV export",
      "Opportunity Zone rankings",
      "Email support",
    ],
  },
  closer: {
    id: "closer",
    name: "Closer",
    screens: 1500,
    priceMonthly: 129,
    priceAnnual: 1290,
    monthlyPriceId: STRIPE_PRICES.closer_monthly,
    annualPriceId: STRIPE_PRICES.closer_annual,
    blurb: "Run volume across multiple markets.",
    features: [
      "1,500 screens / month",
      "Bulk CSV export + multi-market batch",
      "Early access to new markets",
      "Priority support",
    ],
  },
  agency: {
    id: "agency",
    name: "Agency",
    screens: 5000,
    priceMonthly: 299,
    priceAnnual: 2990,
    monthlyPriceId: STRIPE_PRICES.agency_monthly,
    annualPriceId: STRIPE_PRICES.agency_annual,
    blurb: "For funds + teams deploying capital at scale.",
    features: [
      "5,000 screens / month",
      "Team seats",
      "Priority data refresh",
      "Everything in Closer",
    ],
  },
};

/** Pay-as-you-go credit packs (one-time). */
export interface CreditPack {
  key: PriceKey;
  priceId: string;
  screens: number;
  price: number; // USD
}

export const CREDIT_PACKS: CreditPack[] = [
  { key: "scout_40", priceId: STRIPE_PRICES.scout_40, screens: 40, price: 19 },
  { key: "scout_150", priceId: STRIPE_PRICES.scout_150, screens: 150, price: 49 },
];

/** Every sellable price ID → its meaning. Used to validate checkout + map webhooks. */
export interface PriceInfo {
  kind: "subscription" | "credits";
  plan: PlanId | "scout";
  cadence?: Cadence;
  screens: number; // monthly allotment for subs, credit count for packs
}

export const PRICE_REGISTRY: Record<string, PriceInfo> = {
  [STRIPE_PRICES.hunter_monthly]: { kind: "subscription", plan: "hunter", cadence: "monthly", screens: 300 },
  [STRIPE_PRICES.hunter_annual]: { kind: "subscription", plan: "hunter", cadence: "annual", screens: 300 },
  [STRIPE_PRICES.closer_monthly]: { kind: "subscription", plan: "closer", cadence: "monthly", screens: 1500 },
  [STRIPE_PRICES.closer_annual]: { kind: "subscription", plan: "closer", cadence: "annual", screens: 1500 },
  [STRIPE_PRICES.agency_monthly]: { kind: "subscription", plan: "agency", cadence: "monthly", screens: 5000 },
  [STRIPE_PRICES.agency_annual]: { kind: "subscription", plan: "agency", cadence: "annual", screens: 5000 },
  [STRIPE_PRICES.scout_40]: { kind: "credits", plan: "scout", screens: 40 },
  [STRIPE_PRICES.scout_150]: { kind: "credits", plan: "scout", screens: 150 },
};

export function priceInfo(priceId: string): PriceInfo | undefined {
  return PRICE_REGISTRY[priceId];
}

/** Effective plan from a profile. Active subs map to their tier; "pro" is a
 *  legacy alias for Hunter. Everything else → free. */
export function planFor(plan: string | null | undefined, status: string | null | undefined): Plan {
  if (status !== "active") return PLANS.free;
  const normalized = plan === "pro" ? "hunter" : plan;
  if (normalized && normalized in PLANS && normalized !== "free") {
    return PLANS[normalized as PlanId];
  }
  return PLANS.free;
}

/** Map a Stripe price ID → the PlanId it grants (for webhook subscription sync). */
export function planIdForPrice(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  const info = PRICE_REGISTRY[priceId];
  return info && info.kind === "subscription" ? (info.plan as PlanId) : null;
}
