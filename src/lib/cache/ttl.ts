// Cache freshness. Caching is the margin engine — repeat ZIP lookups must hit
// cache for $0 rather than re-billing RentCast.

export const TTL = {
  /** HUD updates SAFMR annually (FY starts Oct 1). */
  safmr: 365 * 24 * 60 * 60 * 1000,
  /** RentCast market data: 30-day TTL. */
  market: 30 * 24 * 60 * 60 * 1000,
  /** RentCast listings: 24-hour TTL. */
  listings: 24 * 60 * 60 * 1000,
  /** RentCast per-property records (tax/last-sale change rarely): 90-day TTL. */
  properties: 90 * 24 * 60 * 60 * 1000,
} as const;

export function isFresh(fetchedAt: string | null | undefined, ttlMs: number): boolean {
  if (!fetchedAt) return false;
  const t = Date.parse(fetchedAt);
  if (Number.isNaN(t)) return false;
  return Date.now() - t < ttlMs;
}
