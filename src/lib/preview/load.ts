import { notFound } from "next/navigation";
import { buildPreviewSlug } from "@/lib/preview";
import { buildPreviewModel } from "@/lib/preview/build";
import {
  getSupabaseAdminClient,
  getSupabaseClient,
  hasSupabaseAdminEnv,
  hasSupabaseEnv,
} from "@/lib/supabase";
import type { Lead } from "@/types/lead";
import type { PreviewModel } from "@/lib/preview/types";
import {
  mergeBuyerOverrides,
  isBuyerOverrides,
  type BuyerOverrides,
} from "@/lib/preview/merge";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_RE.test(value);
}

function getReader() {
  if (hasSupabaseAdminEnv()) {
    return getSupabaseAdminClient().schema("closehound");
  }
  if (hasSupabaseEnv()) {
    return getSupabaseClient().schema("closehound");
  }
  return null;
}

export async function findLeadById(leadId: string): Promise<Lead | null> {
  if (!isUuid(leadId)) {
    return null;
  }
  const reader = getReader();
  if (!reader) {
    return null;
  }
  const { data, error } = await reader
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  return data as Lead;
}

async function findLeadBySlug(slug: string): Promise<Lead | null> {
  const reader = getReader();
  if (!reader) {
    return null;
  }

  // Tail of slug after the last dash should be the last 6 of the lead UUID.
  const tail = slug.split("-").at(-1) ?? "";
  if (!tail || tail.length < 4) {
    return null;
  }

  const { data, error } = await reader
    .from("leads")
    .select("*")
    .ilike("id", `%${tail}`)
    .limit(25);

  if (error || !data) {
    return null;
  }

  for (const row of data as Lead[]) {
    const candidateSlug = buildPreviewSlug({
      companyName: row.company_name,
      city: row.city,
      leadId: row.id,
    });
    if (candidateSlug === slug) {
      return row;
    }
  }

  return null;
}

type CachedPreview = {
  preview_payload: unknown;
  logo_url: string | null;
  hero_url: string | null;
};

async function findCachedPreviewBySlug(slug: string): Promise<CachedPreview | null> {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }
  const closehound = getSupabaseAdminClient().schema("closehound");
  const { data, error } = await closehound
    .from("preview_sites")
    .select("preview_payload, logo_url, hero_url")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) {
    return null;
  }
  return data as CachedPreview;
}

/**
 * Fetch buyer overrides from walkperro.preview_sites for the slug.
 * The walkperro schema isn't typed in `Database`, so we cast through `any`.
 * Returns null if the row doesn't exist OR if the payload is empty/garbage.
 */
async function findBuyerOverridesBySlug(
  slug: string
): Promise<BuyerOverrides | null> {
  if (!hasSupabaseAdminEnv()) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walkperro: any = (
      getSupabaseAdminClient() as unknown as { schema: (s: string) => unknown }
    ).schema("walkperro");
    const { data, error } = await walkperro
      .from("preview_sites")
      .select("preview_payload, logo_url, hero_url")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    const payload = data.preview_payload as unknown;
    if (!isBuyerOverrides(payload)) return null;
    // Surface the column-level logo/hero overrides into the payload's assets
    // bucket so they get applied through the same merge path.
    const merged: BuyerOverrides = { ...(payload as BuyerOverrides) };
    const logo = data.logo_url as string | null;
    const hero = data.hero_url as string | null;
    if (logo || hero) {
      merged.assets = {
        ...(merged.assets ?? {}),
        ...(logo ? { logoUrl: logo } : {}),
        ...(hero ? { heroUrl: hero } : {}),
      };
    }
    return merged;
  } catch {
    return null;
  }
}

/**
 * Apply buyer overrides if any exist for this slug. If no overrides,
 * returns the base model untouched.
 */
async function withBuyerOverrides(
  slug: string,
  base: PreviewModel
): Promise<PreviewModel> {
  const overrides = await findBuyerOverridesBySlug(slug);
  if (!overrides) return base;
  return mergeBuyerOverrides(base, overrides);
}

function isPreviewModelShape(value: unknown): value is PreviewModel {
  if (!value || typeof value !== "object") {
    return false;
  }
  const v = value as Partial<PreviewModel>;
  return (
    typeof v.slug === "string" &&
    typeof v.templateKey === "string" &&
    typeof v.paletteKey === "string" &&
    !!v.business &&
    !!v.hero &&
    !!v.services
  );
}

export async function loadPreviewBySlug(slug: string): Promise<PreviewModel> {
  // 1. If slug looks like a uuid (legacy preview_url stored as just the lead id), fast path.
  if (isUuid(slug)) {
    const lead = await findLeadById(slug);
    if (lead) {
      const builtSlug = buildPreviewSlug({
        companyName: lead.company_name,
        city: lead.city,
        leadId: lead.id,
      });
      const cached = await findCachedPreviewBySlug(builtSlug);
      const base = buildPreviewModel(lead, {
        logoUrl: cached?.logo_url ?? null,
        heroUrl: cached?.hero_url ?? null,
      });
      return withBuyerOverrides(builtSlug, base);
    }
  }

  // 2. Try to use cached preview_payload (it already includes the model + assets).
  const cached = await findCachedPreviewBySlug(slug);
  if (cached && isPreviewModelShape(cached.preview_payload)) {
    const model = cached.preview_payload as PreviewModel;
    const base: PreviewModel = {
      ...model,
      assets: {
        logoUrl: cached.logo_url ?? model.assets?.logoUrl ?? null,
        heroUrl: cached.hero_url ?? model.assets?.heroUrl ?? null,
        galleryUrls: model.assets?.galleryUrls ?? [],
      },
    };
    return withBuyerOverrides(slug, base);
  }

  // 3. Fall back to rebuilding from the lead row by slug.
  const lead = await findLeadBySlug(slug);
  if (lead) {
    const base = buildPreviewModel(lead, {
      logoUrl: cached?.logo_url ?? null,
      heroUrl: cached?.hero_url ?? null,
    });
    return withBuyerOverrides(slug, base);
  }

  notFound();
}
