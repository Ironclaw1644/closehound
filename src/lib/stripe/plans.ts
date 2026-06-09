export interface Plan {
  id: "free" | "pro";
  name: string;
  screens: number;
  pricePerMonth: number;
  priceId: string | null;
  overagePerScreen: number | null;
}

export const PLANS: Record<"free" | "pro", Plan> = {
  free: { id: "free", name: "Free trial", screens: 10, pricePerMonth: 0, priceId: null, overagePerScreen: null },
  pro: {
    id: "pro",
    name: "Pro",
    screens: 300,
    pricePerMonth: 49,
    priceId: process.env.STRIPE_PRICE_PRO ?? null,
    overagePerScreen: 0.4,
  },
};

/** Effective plan: Pro only counts when the subscription is active. */
export function planFor(plan: string | null | undefined, status: string | null | undefined): Plan {
  return plan === "pro" && status === "active" ? PLANS.pro : PLANS.free;
}
