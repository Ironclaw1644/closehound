import "server-only";

// Free, unauthenticated domain availability lookups via RDAP (the modern
// replacement for WHOIS). Every TLD's registry runs a public RDAP server;
// rdap.org is a meta-resolver that proxies to the right one for us.
//
// Why RDAP instead of GoDaddy/Namecheap APIs:
//   - Free forever, no auth, no rate-limit signup
//   - Real-time accurate (registry-of-record data)
//   - 200 OK = registered; 404 = available
// The trade-off: it doesn't return prices. We hard-code conservative
// "starting at $X/yr" defaults per TLD — accurate enough to set buyer
// expectations while letting them buy at their own registrar.

export type DomainCheck = {
  domain: string;
  available: boolean;
  // Approximate retail price for a 1-yr registration. Conservative high-end
  // estimate so we don't undersell what the buyer will actually pay.
  approxPriceUsd: number;
  // Generic search/buy URL with the GoDaddy affiliate code applied if set.
  registerUrl: string;
};

// Approximate retail prices in USD for first-year registration. These are
// conservative — actual GoDaddy/Namecheap prices for a fresh registration
// usually come in slightly under these.
const TLD_PRICE_USD: Record<string, number> = {
  com: 14,
  net: 16,
  org: 13,
  io: 39,
  co: 30,
  dev: 16,
  app: 16,
  shop: 35,
  site: 25,
  online: 30,
  store: 50,
  xyz: 12,
  me: 19,
  us: 12,
  biz: 14,
  info: 16,
  tech: 50,
  pro: 14,
};
const PRICE_FALLBACK_USD = 25;

const RDAP_TIMEOUT_MS = 5000;

// Validate domain format (no scheme, no path).
const DOMAIN_RE = /^(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,}$/i;

export function isValidDomain(value: string): boolean {
  return DOMAIN_RE.test(value.trim());
}

function tldOf(domain: string): string {
  return domain.toLowerCase().split(".").pop() ?? "";
}

function approxPriceFor(domain: string): number {
  return TLD_PRICE_USD[tldOf(domain)] ?? PRICE_FALLBACK_USD;
}

function registerUrlFor(domain: string): string {
  // GoDaddy affiliate-friendly search URL. The `isc` query param is the
  // affiliate code if set in env. Without it, the URL still works and earns
  // us nothing — strictly an upsell-tracking thing, not required.
  const affiliateCode = process.env.GODADDY_AFFILIATE_CODE?.trim();
  const params = new URLSearchParams({ domainToCheck: domain });
  if (affiliateCode) params.set("isc", affiliateCode);
  return `https://www.godaddy.com/domainsearch/find?${params.toString()}`;
}

/**
 * Check whether a single domain is available for registration.
 * Returns `{ available }` per the RDAP response: 404 means no registration
 * exists (the domain is available); 200 means it's already registered.
 */
export async function checkDomainAvailability(
  domain: string
): Promise<DomainCheck | null> {
  const trimmed = domain.trim().toLowerCase();
  if (!isValidDomain(trimmed)) return null;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), RDAP_TIMEOUT_MS);
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(trimmed)}`, {
      signal: ctrl.signal,
      headers: { Accept: "application/rdap+json" },
      // RDAP responses don't change often; cache 5 min so we're nice to the
      // public registries.
      next: { revalidate: 300 },
    });
    if (res.status === 404) {
      return {
        domain: trimmed,
        available: true,
        approxPriceUsd: approxPriceFor(trimmed),
        registerUrl: registerUrlFor(trimmed),
      };
    }
    if (res.ok) {
      return {
        domain: trimmed,
        available: false,
        approxPriceUsd: approxPriceFor(trimmed),
        registerUrl: registerUrlFor(trimmed),
      };
    }
    // 5xx, 429, etc. — treat as unknown so the UI doesn't lie.
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Generate suggestion variations from a single seed query.
 * "tomspaint" → ["tomspaint.com", "tomspaint.co", "tomspaint.io",
 *                "getomspaint.com", "tomspaintco.com", ...]
 */
export function generateSuggestions(seed: string, max: number = 8): string[] {
  // If the seed already has a TLD (contains a dot), respect that as the
  // primary candidate. Otherwise, generate variations.
  const trimmed = seed.trim().toLowerCase().replace(/\s+/g, "");
  if (!trimmed) return [];
  const stripped = trimmed
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9-.]/g, "");

  if (stripped.includes(".")) {
    // Already has a TLD — generate sibling TLDs around the same name root.
    const root = stripped.split(".")[0];
    return generateSuggestions(root, max);
  }

  const root = stripped.replace(/^-+|-+$/g, "");
  if (!root) return [];

  const tldOrder = ["com", "co", "io", "net", "us", "biz", "org"];
  const prefixes = ["", "get", "go", "try", "use"];
  const suffixes = ["", "co", "hq", "site", "app", "online"];

  const out = new Set<string>();
  // Pure root + each TLD first (most likely picks)
  for (const tld of tldOrder) {
    out.add(`${root}.${tld}`);
    if (out.size >= max) break;
  }
  // Then variations until we hit max
  outer: for (const tld of ["com", "co", "io"]) {
    for (const prefix of prefixes) {
      for (const suffix of suffixes) {
        if (!prefix && !suffix) continue;
        const candidate =
          (prefix && root.startsWith(prefix)
            ? `${root}${suffix}`
            : `${prefix}${root}${suffix}`).replace(/^-+|-+$/g, "");
        if (candidate.length < 3) continue;
        out.add(`${candidate}.${tld}`);
        if (out.size >= max) break outer;
      }
    }
  }
  return Array.from(out).slice(0, max);
}

/**
 * Run availability checks for a list of candidate domains in parallel.
 * Returns one entry per candidate; entries that hit a network/RDAP
 * error are filtered out (better to show 6 confident results than 8 with
 * "unknown" badges).
 */
export async function checkSuggestions(
  candidates: string[]
): Promise<DomainCheck[]> {
  const results = await Promise.all(candidates.map(checkDomainAvailability));
  return results.filter((r): r is DomainCheck => r !== null);
}
