import { notFound } from "next/navigation";
import { buildPreviewSlug } from "@/lib/preview";
import { generatePreviewSite } from "@/lib/site-generator";
import {
  getSupabaseAdminClient,
  getSupabaseClient,
  hasSupabaseAdminEnv,
  hasSupabaseEnv,
} from "@/lib/supabase";
import type { Lead } from "@/types/lead";
import type { PreviewSite } from "@/lib/site-generator";
import type { Json } from "@/types/supabase";

function isObject(value: Json | null): value is Record<string, Json> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
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

export async function getLeadById(leadId: string) {
  if (!isUuid(leadId)) {
    return null;
  }

  if (hasSupabaseAdminEnv()) {
    const { data, error } = await getSupabaseAdminClient()
      .schema("closehound")
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .maybeSingle();

    if (!error && data) {
      return data as Lead;
    }
  }

  if (!hasSupabaseEnv()) {
    return null;
  }

  const { data, error } = await getSupabaseClient()
    .schema("closehound")
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Lead;
}

export async function requirePreviewSiteBySlug(slug: string) {
  const previewSite = await getPreviewSiteBySlug(slug);

  if (!previewSite) {
    notFound();
  }

  return previewSite;
}

export async function requireLeadById(leadId: string) {
  const lead = await getLeadById(leadId);

  if (!lead) {
    notFound();
  }

  return lead;
}
