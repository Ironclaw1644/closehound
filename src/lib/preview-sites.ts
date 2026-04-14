import { notFound } from "next/navigation";
import { buildPreviewSlug } from "@/lib/preview";
import { generatePreviewSite } from "@/lib/site-generator";
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";
import type { Lead } from "@/types/lead";
import type { PreviewSite } from "@/lib/site-generator";
import type { Json } from "@/types/supabase";

function isObject(value: Json | null): value is Record<string, Json> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function asPreviewSite(payload: Json | null): PreviewSite | null {
  if (!isObject(payload)) {
    return null;
  }

  if (typeof payload.slug !== "string" || typeof payload.previewUrl !== "string") {
    return null;
  }

  return payload as unknown as PreviewSite;
}

export async function getPreviewSiteBySlug(slug: string) {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  const closehound = getSupabaseAdminClient().schema("closehound");
  const { data, error } = await closehound
    .from("preview_sites")
    .select("slug, preview_payload, preview_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!error && data) {
    return asPreviewSite(data.preview_payload);
  }

  const { data: leads, error: leadsError } = await closehound
    .from("leads")
    .select("*")
    .eq("status", "generated");

  if (leadsError || !leads) {
    return null;
  }

  const matchingLead = (leads as Lead[]).find((lead) => {
    const leadSlug = buildPreviewSlug({
      companyName: lead.company_name,
      city: lead.city,
      leadId: lead.id,
    });

    return leadSlug === slug;
  });

  if (!matchingLead || !matchingLead.industry) {
    return null;
  }

  return generatePreviewSite(matchingLead);
}

export async function requirePreviewSiteBySlug(slug: string) {
  const previewSite = await getPreviewSiteBySlug(slug);

  if (!previewSite) {
    notFound();
  }

  return previewSite;
}
