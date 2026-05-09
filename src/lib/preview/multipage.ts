import type { LeadIndustry } from "@/lib/industries";
import type { PreviewModel, PreviewService } from "@/lib/preview/types";

// ─────────────────────────────────────────────────────────────────────────────
// URL helpers
// ─────────────────────────────────────────────────────────────────────────────

export function serviceSlug(serviceTitle: string): string {
  return serviceTitle
    .trim()
    .toLowerCase()
    .replace(/[&]/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function previewHomeUrl(slug: string): string {
  return `/preview/${slug}`;
}

export function previewServicesUrl(slug: string): string {
  return `/preview/${slug}/services`;
}

export function previewServiceUrl(slug: string, svcSlug: string): string {
  return `/preview/${slug}/services/${svcSlug}`;
}

export function previewServiceAreaUrl(slug: string): string {
  return `/preview/${slug}/service-area`;
}

export function previewAboutUrl(slug: string): string {
  return `/preview/${slug}/about`;
}

export function previewContactUrl(slug: string): string {
  return `/preview/${slug}/contact`;
}

// All deep URLs for a given slug — used by sitemap.ts and the footer site map.
export function multiPageRoutes(slug: string): {
  label: string;
  url: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
}[] {
  return [
    { label: "Home", url: previewHomeUrl(slug), changeFrequency: "weekly", priority: 0.9 },
    { label: "Services", url: previewServicesUrl(slug), changeFrequency: "monthly", priority: 0.7 },
    { label: "Service Area", url: previewServiceAreaUrl(slug), changeFrequency: "monthly", priority: 0.6 },
    { label: "About", url: previewAboutUrl(slug), changeFrequency: "monthly", priority: 0.5 },
    { label: "Contact", url: previewContactUrl(slug), changeFrequency: "monthly", priority: 0.7 },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// Service lookup helpers
// ─────────────────────────────────────────────────────────────────────────────

export function findServiceBySlug(
  model: PreviewModel,
  svcSlug: string
): { service: PreviewService; index: number } | null {
  for (let i = 0; i < model.services.items.length; i++) {
    const item = model.services.items[i];
    if (serviceSlug(item.title) === svcSlug) {
      return { service: item, index: i };
    }
  }
  return null;
}

export function otherServices(
  model: PreviewModel,
  excludeIndex: number
): PreviewService[] {
  return model.services.items.filter((_, i) => i !== excludeIndex);
}

// ─────────────────────────────────────────────────────────────────────────────
// Site style mode
// ─────────────────────────────────────────────────────────────────────────────

export type SiteStyle = "single" | "multi";
export type RenderMode = "single" | "multi-home";

export function getSiteStyle(model: PreviewModel): SiteStyle {
  // The model carries no site_style field directly; check assets / payload metadata.
  // For now, default to "multi" for fresh leads. Existing demo previews stay "single".
  // Once walkperro.preview_sites.site_style exists in the payload we'll thread it
  // through buildPreviewModel.
  return "multi";
}

// ─────────────────────────────────────────────────────────────────────────────
// Industry display name (single source of truth so route pages can label things)
// ─────────────────────────────────────────────────────────────────────────────

export const INDUSTRY_DISPLAY: Record<LeadIndustry, string> = {
  handyman: "Handyman",
  "pressure washing": "Pressure Washing",
  roofing: "Roofing",
  HVAC: "HVAC",
  plumbing: "Plumbing",
  dental: "Dentistry",
  "med spa": "Med Spa",
  "junk removal": "Junk Removal",
  "mobile detailing": "Mobile Detailing",
  landscaping: "Landscaping",
  painting: "Painting",
  electrical: "Electrical",
  "auto repair": "Auto Repair",
  "pest control": "Pest Control",
};
