import { NextResponse, type NextRequest } from "next/server";

// Multi-tenant routing: requests to a custom domain (e.g. tomspaint.com) are
// rewritten to /preview/<slug> on the closehound app so the customer's site
// renders without the buyer ever seeing the slug.
//
// Lookup approach: query a small Supabase RPC-style endpoint at /api/domain-lookup
// that returns the matching slug. The route caches results in-memory for
// 5 min so the typical hot-path is a single in-process map lookup.
//
// Edge runtime so latency is < 30 ms in most regions.

export const config = {
  // Run on every page request; skip API routes, static assets, and Next
  // internals.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|walkperro|stock|.*\\..*).*)",
  ],
};

// Hosts that should NEVER trigger the slug rewrite. Includes our canonical
// origin and any *.vercel.app preview URLs. Everything else is treated as a
// potential custom domain.
const PASSTHROUGH_HOST_RE = /^(?:walkperro\.com|.+\.vercel\.app|localhost(?::\d+)?)$/i;

// In-memory cache of host → slug. Clears on a fresh deploy (which is fine —
// after a deploy the cache rebuilds in seconds). 5-minute TTL.
const HOST_SLUG_CACHE = new Map<
  string,
  { slug: string | null; expiresAt: number }
>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function lookupSlugByHost(host: string): Promise<string | null> {
  const cached = HOST_SLUG_CACHE.get(host);
  if (cached && cached.expiresAt > Date.now()) return cached.slug;

  // Hit the lookup API. We use the same origin as the request so it works in
  // every environment (preview, prod, local).
  const apiUrl = `https://walkperro.com/api/domain-lookup?host=${encodeURIComponent(host)}`;
  let slug: string | null = null;
  try {
    const res = await fetch(apiUrl, {
      headers: { "x-internal-middleware": "1" },
      // Cache aggressively at the edge.
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const body = (await res.json()) as { slug?: string | null };
      slug = body.slug ?? null;
    }
  } catch {
    slug = null;
  }
  HOST_SLUG_CACHE.set(host, { slug, expiresAt: Date.now() + CACHE_TTL_MS });
  return slug;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (!host || PASSTHROUGH_HOST_RE.test(host)) {
    return NextResponse.next();
  }

  const slug = await lookupSlugByHost(host);
  if (!slug) {
    // Unknown custom domain — let Next render a 404 against the literal path.
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  // Don't double-rewrite if the URL already starts with /preview/
  if (url.pathname.startsWith("/preview/")) return NextResponse.next();

  // Rewrite: /<anything> on the custom domain → /preview/<slug><anything>
  // For root, that's /preview/<slug>; for /services it's /preview/<slug>/services.
  url.pathname =
    url.pathname === "/"
      ? `/preview/${slug}`
      : `/preview/${slug}${url.pathname}`;

  return NextResponse.rewrite(url);
}
