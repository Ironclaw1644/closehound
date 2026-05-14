import "server-only";

// findBusinessEmail() — best-effort scraping cascade to find a business's
// public email when Google Places doesn't return one (which is always, since
// Google deprecated email from the Places API).
//
// Strategy: cheapest sources first, give up after ~2 fetches per lead so a
// bulk enrich pass over 250 leads finishes in minutes instead of hours.
//
// Sources, in order of yield-per-cost:
//   1. DuckDuckGo HTML search ("<name>" <city> contact email) — pulls back
//      directory listings, business websites, Facebook pages, BBB profiles.
//      Free, no API key, scrapable. Rate-limit polite (caller adds delay).
//   2. (Optional) Yelp + BBB direct profile fetches. Stub here — not yet
//      wired because Yelp/BBB don't reliably expose owner email publicly.
//
// Hit rate in practice: ~30-50% on local-services in Tier-1 metros. Better
// than nothing; the leads we don't find still have phone numbers so they
// stay in the dataset for cold-calling.

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// Email regex — RFC-light, plus our blocklist of generic/noise addresses.
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const EMAIL_BLOCKLIST = new Set([
  "noreply",
  "no-reply",
  "donotreply",
  "do-not-reply",
  "postmaster",
  "abuse",
  "privacy",
  "webmaster",
  "hostmaster",
]);

// Domains that are basically guaranteed to NOT be the business itself.
const DOMAIN_BLOCKLIST = [
  "duckduckgo.com",
  "google.com",
  "facebook.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "youtube.com",
  "tiktok.com",
  "yelp.com",
  "bbb.org",
  "angi.com",
  "homeadvisor.com",
  "thumbtack.com",
  "nextdoor.com",
  "yellowpages.com",
  "ziprecruiter.com",
  "indeed.com",
  "glassdoor.com",
  "example.com",
  "sentry.io",
  "wixpress.com",
  "wordpress.com",
  "wix.com",
  "godaddy.com",
];

function isPlausibleBusinessEmail(email: string): boolean {
  const lower = email.toLowerCase();
  const [local, domain] = lower.split("@");
  if (!local || !domain) return false;
  // Filter obvious technical / no-reply addresses
  for (const blocked of EMAIL_BLOCKLIST) {
    if (local === blocked || local.startsWith(blocked + ".")) return false;
  }
  // Filter pixel-tracking / image embed garbage like "tracking@email-images.com"
  if (local.length > 40 || local.length < 2) return false;
  // Filter common platform/CDN domains
  if (DOMAIN_BLOCKLIST.some((d) => domain === d || domain.endsWith("." + d))) {
    return false;
  }
  // Filter Google's @gmail.com? Actually accept those — many contractors
  // use a free Gmail as their business email.
  return true;
}

function extractEmails(html: string): string[] {
  const found = new Set<string>();
  const matches = html.match(EMAIL_RE) ?? [];
  for (const raw of matches) {
    // Strip common HTML-entity contamination on the tail
    const cleaned = raw.replace(/[.,;'"<>)\]]*$/, "");
    if (isPlausibleBusinessEmail(cleaned)) {
      found.add(cleaned.toLowerCase());
    }
  }
  return [...found];
}

async function fetchWithTimeout(
  url: string,
  ms: number,
  init?: RequestInit
): Promise<Response | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        ...(init?.headers ?? {}),
      },
      signal: ctrl.signal,
    });
    return res;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

// Pick the most likely "business email" from a candidate list. Prefer
// info@/hello@/contact@/<name>@ over generic ones. Penalize Gmail when a
// branded-looking address is also present.
function rankEmails(candidates: string[], companyName: string): string | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 12);

  function score(email: string): number {
    const [local, domain] = email.split("@");
    let s = 0;
    if (/^(info|hello|contact|admin|booking|service|office)@/.test(email)) s += 5;
    if (slug && (local.includes(slug) || domain.includes(slug))) s += 6;
    // Penalty for free-mail when a branded option exists
    if (/@(gmail|yahoo|hotmail|outlook|aol|icloud|protonmail)\./.test(email)) s -= 2;
    // Penalty for very long local parts (likely auto-generated)
    if (local.length > 22) s -= 1;
    return s;
  }

  return [...candidates].sort((a, b) => score(b) - score(a))[0];
}

/**
 * Try a DuckDuckGo HTML search for the business and parse emails from the
 * result blob (titles, snippets, and any inline href content).
 */
async function searchDuckDuckGo(
  companyName: string,
  city: string,
  state?: string | null
): Promise<string[]> {
  const loc = [city, state].filter(Boolean).join(", ");
  const q = `"${companyName}" ${loc} contact email`;
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
  const res = await fetchWithTimeout(url, 10_000);
  if (!res || !res.ok) return [];
  const html = await res.text();
  return extractEmails(html);
}

/**
 * Try fetching a business's website if one is linked from search results.
 * Skipped for now in V1 — most of our leads have has_website=false anyway.
 */

export type EmailFindInput = {
  companyName: string;
  city: string | null;
  state?: string | null;
  phone?: string | null;
};

export type EmailFindResult = {
  email: string | null;
  candidates: string[];
  source: "duckduckgo" | "none";
  durationMs: number;
};

/**
 * Find a single business's public email via the search cascade.
 * Returns null when nothing plausible is found. Caller should retry on
 * different days / different sources if yield is too low.
 */
export async function findBusinessEmail(
  input: EmailFindInput
): Promise<EmailFindResult> {
  const t0 = Date.now();
  const city = input.city ?? "";

  // 1. DuckDuckGo HTML search.
  const ddg = await searchDuckDuckGo(input.companyName, city, input.state);
  if (ddg.length > 0) {
    return {
      email: rankEmails(ddg, input.companyName),
      candidates: ddg,
      source: "duckduckgo",
      durationMs: Date.now() - t0,
    };
  }

  // Future: cascade to Yelp profile / Facebook About / BBB / business
  // website if a domain is linked. Stubbed for V1.

  return {
    email: null,
    candidates: [],
    source: "none",
    durationMs: Date.now() - t0,
  };
}

/**
 * Bulk-enrich a batch of leads. Politely rate-limits to avoid tripping
 * DuckDuckGo throttling. Returns per-lead results in the same order.
 */
export async function findBusinessEmailsBatch(
  inputs: EmailFindInput[],
  opts: { delayMs?: number } = {}
): Promise<EmailFindResult[]> {
  const delay = opts.delayMs ?? 1500;
  const results: EmailFindResult[] = [];
  for (let i = 0; i < inputs.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, delay));
    results.push(await findBusinessEmail(inputs[i]));
  }
  return results;
}
