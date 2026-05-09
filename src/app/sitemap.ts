import type { MetadataRoute } from "next";
import { TARGET_INDUSTRIES } from "@/lib/industries";
import {
  getSupabaseAdminClient,
  hasSupabaseAdminEnv,
} from "@/lib/supabase";
import { getSiteOrigin } from "@/lib/preview/seo";
import { multiPageRoutes, serviceSlug } from "@/lib/preview/multipage";
import { getCopyForIndustry } from "@/lib/preview/copy";
import type { LeadIndustry } from "@/lib/industries";

// Re-evaluate the sitemap once an hour. Cheap, but means a freshly-generated
// preview surfaces in the sitemap inside the same day.
export const revalidate = 3600;

const TEMPLATE_SLUGS: Record<string, string> = {
  handyman: "handyman",
  "pressure washing": "pressure-washing",
  roofing: "roofing",
  HVAC: "hvac",
  plumbing: "plumbing",
  dental: "dental",
  "med spa": "med-spa",
  "junk removal": "junk-removal",
  "mobile detailing": "mobile-detailing",
  landscaping: "landscaping",
  painting: "painting",
  electrical: "electrical",
  "auto repair": "auto-repair",
  "pest control": "pest-control",
};

type PreviewRecord = {
  slug: string;
  updatedAt: Date;
  industry: LeadIndustry | null;
};

async function listPreviewSlugs(): Promise<PreviewRecord[]> {
  if (!hasSupabaseAdminEnv()) return [];
  try {
    const closehound = getSupabaseAdminClient().schema("closehound");
    // We pull lead_id along with the slug so we can fetch industry from leads
    // — the multi-page sitemap entries need to know the industry to enumerate
    // service URLs.
    const { data, error } = await closehound
      .from("preview_sites")
      .select("slug, updated_at, lead_id")
      .order("updated_at", { ascending: false })
      .limit(5000);
    if (error || !data) return [];

    const leadIds = data.map((row) => row.lead_id).filter(Boolean) as string[];
    let industryByLead = new Map<string, LeadIndustry>();
    if (leadIds.length > 0) {
      const { data: leads } = await closehound
        .from("leads")
        .select("id, industry")
        .in("id", leadIds);
      if (leads) {
        industryByLead = new Map(
          leads
            .filter((l) => l.industry && l.id)
            .map((l) => [l.id as string, l.industry as LeadIndustry])
        );
      }
    }

    return data
      .map((row) => ({
        slug: row.slug as string,
        updatedAt: row.updated_at ? new Date(row.updated_at as string) : new Date(),
        industry: row.lead_id ? industryByLead.get(row.lead_id as string) ?? null : null,
      }))
      .filter((row) => Boolean(row.slug));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();
  const now = new Date();

  // 1. Marketing root
  const home: MetadataRoute.Sitemap = [
    {
      url: `${origin}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // 2. Per-industry template showcases — high-priority indexable pages
  const templates: MetadataRoute.Sitemap = TARGET_INDUSTRIES.map((opt) => {
    const slug = TEMPLATE_SLUGS[opt.value];
    return {
      url: `${origin}/preview/templates/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    };
  });

  // 3. Live customer previews — pulled from Supabase. Each preview gets the
  // multi-page URL set: home, services overview, per-service detail pages,
  // service area, about, contact. Service detail slugs derive from copy.ts.
  const previews = await listPreviewSlugs();
  const previewEntries: MetadataRoute.Sitemap = [];
  for (const row of previews) {
    // Always include the 6 standard pages (home/services/area/about/contact)
    for (const route of multiPageRoutes(row.slug)) {
      previewEntries.push({
        url: `${origin}${route.url}`,
        lastModified: row.updatedAt,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }
    // Include per-service detail pages when we know the industry
    if (row.industry) {
      try {
        const copy = getCopyForIndustry(row.industry);
        for (const service of copy.services.items) {
          previewEntries.push({
            url: `${origin}/preview/${row.slug}/services/${serviceSlug(service.title)}`,
            lastModified: row.updatedAt,
            changeFrequency: "monthly",
            priority: 0.65,
          });
        }
      } catch {
        // industry unknown / no copy — skip per-service entries silently
      }
    }
  }

  return [...home, ...templates, ...previewEntries];
}
