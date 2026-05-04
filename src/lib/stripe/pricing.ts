import "server-only";

export const V1_PRICE_CENTS = 49700;
export const V1_CURRENCY = "usd";

export function getStripeBuyLink(): string | null {
  return process.env.STRIPE_BUY_LINK_BASE?.trim() || null;
}

export function getNotifyPurchasesTo(): string | null {
  return process.env.NOTIFY_PURCHASES_TO?.trim() || null;
}
