import "server-only";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import { mintOnboardingToken } from "@/lib/onboarding/token";

// Server-side helpers for reading + writing the walkperro.preview_sites and
// walkperro.onboarding_tokens tables. All call sites need the admin client
// because we need to bypass RLS during webhook + claim flows.
//
// The `Database` type only enumerates the closehound schema, so we cast to
// `any` when scoping to `walkperro` and rely on local TS types in this file
// for type safety.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function admin(): any {
  if (!hasSupabaseAdminEnv()) {
    throw new Error(
      "Supabase admin env not configured (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (getSupabaseAdminClient() as any).schema("walkperro");
}

export type PreviewSiteRow = {
  id: string;
  slug: string;
  lead_id: string | null;
  preview_url: string;
  preview_payload: Record<string, unknown>;
  logo_url: string | null;
  hero_url: string | null;
  is_published: boolean;
  custom_domain: string | null;
  custom_domain_status: {
    verification?: {
      type: string;
      domain: string;
      value: string;
      reason?: string;
    } | null;
    verified?: boolean;
    attached_at?: string;
    last_error?: string | null;
  } | null;
  published_at: string | null;
  claimed_at: string | null;
  buyer_email: string | null;
  buyer_name: string | null;
  stripe_session_id: string | null;
  site_style: "single" | "multi";
  created_at: string;
  updated_at: string;
};

export async function findPreviewSiteBySlug(
  slug: string
): Promise<PreviewSiteRow | null> {
  const { data, error } = await admin()
    .from("preview_sites")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PreviewSiteRow;
}

export async function findPreviewSiteById(
  id: string
): Promise<PreviewSiteRow | null> {
  const { data, error } = await admin()
    .from("preview_sites")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PreviewSiteRow;
}

export async function findPreviewSiteByStripeSession(
  stripeSessionId: string
): Promise<PreviewSiteRow | null> {
  const { data, error } = await admin()
    .from("preview_sites")
    .select("*")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PreviewSiteRow;
}

export async function upsertPreviewSiteFromCheckout(opts: {
  slug: string;
  leadId: string | null;
  buyerEmail: string;
  buyerName: string | null;
  stripeSessionId: string;
  previewUrl: string;
  payload?: Record<string, unknown>;
}): Promise<PreviewSiteRow> {
  // Try update by stripe_session_id first (idempotent in case the webhook fires twice)
  const existing = await findPreviewSiteByStripeSession(opts.stripeSessionId);
  if (existing) return existing;

  // Otherwise upsert by slug
  const { data, error } = await admin()
    .from("preview_sites")
    .upsert(
      {
        slug: opts.slug,
        lead_id: opts.leadId,
        buyer_email: opts.buyerEmail,
        buyer_name: opts.buyerName,
        stripe_session_id: opts.stripeSessionId,
        preview_url: opts.previewUrl,
        preview_payload: opts.payload ?? {},
      },
      { onConflict: "slug" }
    )
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`upsert preview_site failed: ${error?.message ?? "no data"}`);
  }
  return data as unknown as PreviewSiteRow;
}

export async function recordOnboardingToken(opts: {
  previewSiteId: string;
  jti: string;
  email: string;
  expiresAt: Date;
}): Promise<void> {
  const { error } = await admin()
    .from("onboarding_tokens")
    .insert({
      preview_site_id: opts.previewSiteId,
      jti: opts.jti,
      issued_to_email: opts.email,
      expires_at: opts.expiresAt.toISOString(),
    });
  if (error) {
    throw new Error(`record onboarding_token failed: ${error.message}`);
  }
}

export async function markPreviewSiteClaimed(opts: {
  previewSiteId: string;
}): Promise<void> {
  const { error } = await admin()
    .from("preview_sites")
    .update({ claimed_at: new Date().toISOString() })
    .eq("id", opts.previewSiteId)
    .is("claimed_at", null);
  if (error) {
    throw new Error(`mark claimed failed: ${error.message}`);
  }
}

export async function publishPreviewSite(opts: {
  previewSiteId: string;
}): Promise<void> {
  const { error } = await admin()
    .from("preview_sites")
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
    })
    .eq("id", opts.previewSiteId);
  if (error) {
    throw new Error(`publish failed: ${error.message}`);
  }
}

export async function setCustomDomain(opts: {
  previewSiteId: string;
  domain: string | null;
}): Promise<void> {
  const { error } = await admin()
    .from("preview_sites")
    .update({
      custom_domain: opts.domain,
      // Clear status when domain is removed/changed; will be re-populated on Publish.
      custom_domain_status: null,
    })
    .eq("id", opts.previewSiteId);
  if (error) {
    throw new Error(`set custom_domain failed: ${error.message}`);
  }
}

export async function setCustomDomainStatus(opts: {
  previewSiteId: string;
  status: PreviewSiteRow["custom_domain_status"];
}): Promise<void> {
  const { error } = await admin()
    .from("preview_sites")
    .update({ custom_domain_status: opts.status })
    .eq("id", opts.previewSiteId);
  if (error) {
    throw new Error(`set custom_domain_status failed: ${error.message}`);
  }
}

export async function findPreviewSiteByCustomDomain(
  domain: string
): Promise<PreviewSiteRow | null> {
  const { data, error } = await admin()
    .from("preview_sites")
    .select("*")
    .eq("custom_domain", domain.toLowerCase())
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as PreviewSiteRow;
}

export async function archivePreviewSiteAction(opts: {
  previewSiteId: string;
}): Promise<{ removedDomain: string | null }> {
  // Look up the existing row to get any custom_domain we need to detach.
  const existing = await findPreviewSiteById(opts.previewSiteId);
  const customDomain = existing?.custom_domain ?? null;

  const { error } = await admin()
    .from("preview_sites")
    .update({
      is_published: false,
      custom_domain: null,
      custom_domain_status: null,
    })
    .eq("id", opts.previewSiteId);
  if (error) {
    throw new Error(`archive failed: ${error.message}`);
  }

  // If there was a custom domain attached to Vercel, detach it. We import
  // lazily so the storage module stays free of Vercel-API side effects when
  // archive isn't being called.
  if (customDomain) {
    try {
      const { removeCustomDomain } = await import("@/lib/vercel/domains");
      const r = await removeCustomDomain(customDomain);
      if (!r.ok) {
        console.warn(
          "[archivePreviewSiteAction] vercel domain remove failed:",
          r.error
        );
      }
    } catch (err) {
      console.warn(
        "[archivePreviewSiteAction] vercel domain remove threw:",
        err instanceof Error ? err.message : err
      );
    }
  }

  return { removedDomain: customDomain };
}

export async function updatePreviewPayload(opts: {
  previewSiteId: string;
  patch: Record<string, unknown>;
}): Promise<PreviewSiteRow> {
  // Pull existing payload, deep-merge the patch, write back.
  const existing = await findPreviewSiteById(opts.previewSiteId);
  if (!existing) throw new Error("preview_site not found");
  const merged = {
    ...existing.preview_payload,
    ...opts.patch,
  };
  const { data, error } = await admin()
    .from("preview_sites")
    .update({ preview_payload: merged })
    .eq("id", opts.previewSiteId)
    .select("*")
    .single();
  if (error || !data) {
    throw new Error(`update payload failed: ${error?.message ?? "no data"}`);
  }
  return data as unknown as PreviewSiteRow;
}

// Convenience: mint + persist in one call. Returns the token to embed in the URL.
export async function mintAndPersistOnboardingToken(opts: {
  previewSiteId: string;
  leadId: string | null;
  email: string;
  ttlDays?: number;
}): Promise<string> {
  const { token, jti, expiresAt } = await mintOnboardingToken(opts);
  await recordOnboardingToken({
    previewSiteId: opts.previewSiteId,
    jti,
    email: opts.email,
    expiresAt,
  });
  return token;
}
