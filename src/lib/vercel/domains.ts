import "server-only";

// Vercel REST API wrappers — attach a custom domain to the closehound project,
// remove a domain, and inspect verification status. Reads VERCEL_API_TOKEN
// from env.
//
// One-time setup: at https://vercel.com/account/tokens generate a
// "WalkPerro" token (or similar). Set VERCEL_API_TOKEN locally + on Vercel for
// production+development. The token must have access to the team that owns
// the closehound project.
//
// Project ID + team ID are pulled from .vercel/project.json (committed via
// `vercel link`). They can be overridden by env if you need to point at a
// different deploy.

const PROJECT_ID =
  process.env.VERCEL_PROJECT_ID?.trim() ||
  "prj_qVzyL0Gtjh3plnd4LMX0Bq6TZPhN";
const TEAM_ID =
  process.env.VERCEL_TEAM_ID?.trim() || "team_BTQzipxCt5FTn6a9NiVjNPZT";

const API_BASE = "https://api.vercel.com";

function getApiToken(): string | null {
  const t = process.env.VERCEL_API_TOKEN?.trim();
  if (!t) return null;
  return t;
}

type DomainAttachResult =
  | {
      ok: true;
      domain: string;
      verified: boolean;
      verification?: {
        type: string;
        domain: string;
        value: string;
        reason?: string;
      } | null;
    }
  | { ok: false; error: string; status?: number };

/**
 * Attach a custom domain to the project. Idempotent — Vercel returns success
 * even if the domain is already attached.
 */
export async function attachCustomDomain(
  domain: string
): Promise<DomainAttachResult> {
  const token = getApiToken();
  if (!token) return { ok: false, error: "VERCEL_API_TOKEN not configured" };
  const url = `${API_BASE}/v10/projects/${encodeURIComponent(PROJECT_ID)}/domains?teamId=${encodeURIComponent(TEAM_ID)}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: domain }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // Domain already attached → treat as success
      if (
        res.status === 409 ||
        text.includes("domain_already_in_use") ||
        text.includes("already in use")
      ) {
        return await getDomainStatus(domain);
      }
      return { ok: false, status: res.status, error: text.slice(0, 240) };
    }
    type AttachResponse = {
      name: string;
      verified: boolean;
      verification?: {
        type: string;
        domain: string;
        value: string;
        reason?: string;
      }[];
    };
    const body = (await res.json()) as AttachResponse;
    const v = body.verification?.[0] ?? null;
    return {
      ok: true,
      domain: body.name,
      verified: Boolean(body.verified),
      verification: v,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "vercel attach failed",
    };
  }
}

/**
 * Refresh the verification + verified status of an already-attached domain.
 */
export async function getDomainStatus(
  domain: string
): Promise<DomainAttachResult> {
  const token = getApiToken();
  if (!token) return { ok: false, error: "VERCEL_API_TOKEN not configured" };
  const url = `${API_BASE}/v9/projects/${encodeURIComponent(PROJECT_ID)}/domains/${encodeURIComponent(domain)}?teamId=${encodeURIComponent(TEAM_ID)}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, status: res.status, error: text.slice(0, 240) };
    }
    type StatusResponse = {
      name: string;
      verified: boolean;
      verification?: {
        type: string;
        domain: string;
        value: string;
        reason?: string;
      }[];
    };
    const body = (await res.json()) as StatusResponse;
    return {
      ok: true,
      domain: body.name,
      verified: Boolean(body.verified),
      verification: body.verification?.[0] ?? null,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "vercel status failed",
    };
  }
}

/**
 * Remove a domain from the project. Used by archivePreviewSiteAction when a
 * lead is marked bad / we need to free the domain for a new sale.
 */
export async function removeCustomDomain(
  domain: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = getApiToken();
  if (!token) return { ok: false, error: "VERCEL_API_TOKEN not configured" };
  const url = `${API_BASE}/v9/projects/${encodeURIComponent(PROJECT_ID)}/domains/${encodeURIComponent(domain)}?teamId=${encodeURIComponent(TEAM_ID)}`;
  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok && res.status !== 404) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `${res.status}: ${text.slice(0, 240)}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "vercel remove failed",
    };
  }
}
