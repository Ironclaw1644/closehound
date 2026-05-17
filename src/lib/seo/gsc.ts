import "server-only";
import { SignJWT, importPKCS8 } from "jose";

// Google Indexing API + Search Console Sitemaps API wrappers using a service
// account. Reads the service account JSON from
// `GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON` (single-line minified JSON).
//
// One-time setup the operator must complete BEFORE any of these calls succeed:
//   1. Create a Cloud project + service account at console.cloud.google.com.
//   2. Enable the "Web Search Indexing API" + "Search Console API" on it.
//   3. Download the service account JSON key.
//   4. In Search Console (https://search.google.com/search-console),
//      verify ownership of walkperro.com.
//   5. Add the service account's email as an "Owner" (not just delegated user)
//      of the walkperro.com property.
//   6. Set GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON to the entire JSON file
//      (minified) in .env.local AND on Vercel for production+development.
//
// All functions return `{ ok: true }` on success or `{ ok: false, error }` on
// failure — they NEVER throw, so they're safe to fire-and-forget from inside
// webhooks + server actions.

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
  type?: string;
};

type GscResult = { ok: true } | { ok: false; error: string };

function getServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Cache the access token in memory for ~50 min — they last 60 but we refresh
// early to avoid edge-case 401s.
let cachedToken: { token: string; expiresAt: number } | null = null;
const TOKEN_TTL_MS = 50 * 60 * 1000;

async function getAccessToken(scope: string): Promise<string | null> {
  const sa = getServiceAccount();
  if (!sa) return null;

  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: sa.client_email,
      scope,
      aud: sa.token_uri ?? "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };

    // Service account keys come in PKCS#8 format with literal "\n" sequences.
    // Replace them so jose can parse the PEM.
    const privateKeyPem = sa.private_key.replace(/\\n/g, "\n");
    const privateKey = await importPKCS8(privateKeyPem, "RS256");

    const jwt = await new SignJWT(claim)
      .setProtectedHeader({ alg: "RS256", typ: "JWT" })
      .sign(privateKey);

    const tokenRes = await fetch(sa.token_uri ?? "https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }).toString(),
    });

    if (!tokenRes.ok) {
      console.warn(
        "[gsc] token exchange failed:",
        tokenRes.status,
        (await tokenRes.text()).slice(0, 240)
      );
      return null;
    }

    const body = (await tokenRes.json()) as { access_token: string };
    cachedToken = { token: body.access_token, expiresAt: Date.now() + TOKEN_TTL_MS };
    return body.access_token;
  } catch (err) {
    console.warn(
      "[gsc] access token error:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

/**
 * Submit a URL to the Google Indexing API. The Indexing API is officially
 * limited to JobPosting + BroadcastEvent schemas, but Google still picks up
 * most submissions and surfaces them faster than waiting for organic crawl.
 * Worth pinging on Purchase + Publish.
 */
export async function submitUrlForIndexing(url: string): Promise<GscResult> {
  const accessToken = await getAccessToken(
    "https://www.googleapis.com/auth/indexing"
  );
  if (!accessToken) {
    return { ok: false, error: "GSC service account not configured." };
  }
  try {
    const res = await fetch(
      "https://indexing.googleapis.com/v3/urlNotifications:publish",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ url, type: "URL_UPDATED" }),
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Indexing API ${res.status}: ${text.slice(0, 240)}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "indexing API call failed",
    };
  }
}

/**
 * Submit a sitemap to Search Console. `siteUrl` should be the verified property
 * (e.g. "https://walkperro.com/" or "sc-domain:walkperro.com"). `feedpath` is
 * the absolute sitemap URL.
 */
export async function submitSitemap(
  siteUrl: string,
  feedpath: string
): Promise<GscResult> {
  const accessToken = await getAccessToken(
    "https://www.googleapis.com/auth/webmasters"
  );
  if (!accessToken) {
    return { ok: false, error: "GSC service account not configured." };
  }
  try {
    const res = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps/${encodeURIComponent(feedpath)}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `Sitemaps API ${res.status}: ${text.slice(0, 240)}`,
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "sitemaps API call failed",
    };
  }
}

/**
 * Convenience wrapper for the standard purchase/publish chain:
 * - Submit the new URL to the Indexing API.
 * - Resubmit the canonical sitemap so Google sees the new entry.
 * Both calls fire-and-forget; failures are logged, never thrown.
 */
export async function pingGoogleForUrl(opts: {
  url: string;
  siteUrl?: string; // defaults to "https://walkperro.com/"
  sitemapUrl?: string; // defaults to "https://walkperro.com/sitemap.xml"
}): Promise<{ url: GscResult; sitemap: GscResult }> {
  const siteUrl = opts.siteUrl ?? "https://walkperro.com/";
  const sitemapUrl = opts.sitemapUrl ?? "https://walkperro.com/sitemap.xml";

  const [url, sitemap] = await Promise.all([
    submitUrlForIndexing(opts.url),
    submitSitemap(siteUrl, sitemapUrl),
  ]);

  if (!url.ok) console.warn("[gsc.pingGoogleForUrl] indexing:", url.error);
  if (!sitemap.ok) console.warn("[gsc.pingGoogleForUrl] sitemap:", sitemap.error);

  return { url, sitemap };
}
