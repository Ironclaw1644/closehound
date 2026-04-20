import { extractPreviewPath } from "@/lib/preview";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { HVAC_NICHE_TEMPLATE } from "@/lib/template-system/niches/hvac";
import { PLUMBING_NICHE_TEMPLATE } from "@/lib/template-system/niches/plumbing";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { HVAC_SEED_BUSINESS } from "@/lib/template-system/seeds/hvac-seed";
import { PLUMBING_SEED_BUSINESS } from "@/lib/template-system/seeds/plumbing-seed";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";
import type { Lead } from "@/types/lead";
import type { LeadRecord, RenderPackage } from "@/lib/template-system/types";

type SupportedIndustry = "roofing" | "hvac" | "plumbing";

type SupportedPreviewResult =
  | {
      supported: true;
      familyKey: string;
      templateKey: string;
      renderPackage: RenderPackage;
    }
  | {
      supported: false;
      reason: "UNSUPPORTED_INDUSTRY" | "UNSAFE_RENDER";
    };

type LeadWithOptionalPreviewFields = Lead & {
  email?: string | null;
};

const HVAC_INDUSTRY_ALIASES = new Set([
  "hvac",
  "heating and air",
  "heating and cooling",
  "heating and air conditioning",
  "heating ventilation and air conditioning",
  "heating ventilation air conditioning",
  "air conditioning",
  "air conditioning repair",
  "air conditioning service",
  "air conditioning maintenance",
  "air conditioning installation",
  "air conditioner repair",
  "air conditioner service",
  "air conditioner maintenance",
  "hvac service",
  "hvac repair",
  "hvac maintenance",
  "hvac installation",
  "hvac replacement",
  "heating service",
  "heating repair",
  "heating maintenance",
  "cooling service",
  "a c repair",
  "a c service",
  "a c maintenance",
]);

const PLUMBING_INDUSTRY_ALIASES = new Set([
  "plumbing",
  "plumber",
  "residential plumbing",
  "plumbing repair",
  "emergency plumbing",
  "drain and plumbing",
  "water heater service",
]);

function canonicalizeIndustry(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[-/.,!?()]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildLeadRecord(
  lead: LeadWithOptionalPreviewFields,
  industry: SupportedIndustry
): LeadRecord {
  const serviceAreaLabel = lead.city?.trim() ?? "";
  const contactEmail = lead.contact_email ?? lead.email ?? null;
  const primaryCtaLabel =
    industry === "roofing"
      ? "Request a Roofing Quote"
      : industry === "hvac"
        ? "Request HVAC Service"
        : "Call Now";
  const primaryCtaHref =
    industry === "plumbing" && lead.phone?.trim()
      ? `tel:${lead.phone.trim()}`
      : "#contact";

  return {
    source: "closehound-lead",
    normalizedFields: {
      businessName: lead.company_name,
      serviceAreaLabel,
      primaryPhone: lead.phone,
      contactEmail,
      primaryCtaLabel,
      primaryCtaHref,
      secondaryCtaLabel: industry === "plumbing" ? "Request Estimate" : null,
      secondaryCtaHref: industry === "plumbing" ? "#contact" : null,
    },
  };
}

function extractLegacyFallbackSlug(previewUrl: string | null | undefined) {
  if (!previewUrl) {
    return null;
  }

  const previewPath = extractPreviewPath(previewUrl);

  if (previewPath) {
    return previewPath.replace(/^\/preview\//, "");
  }

  try {
    const pathname = new URL(previewUrl).pathname.replace(/\/+$/, "");
    const slug = pathname.split("/").filter(Boolean).at(-1);

    return slug || null;
  } catch {
    return null;
  }
}

function resolveSupportedPreview(
  templateKey: SupportedIndustry,
  lead: LeadWithOptionalPreviewFields
): SupportedPreviewResult {
  const template =
    templateKey === "roofing"
      ? ROOFING_NICHE_TEMPLATE
      : templateKey === "hvac"
        ? HVAC_NICHE_TEMPLATE
        : PLUMBING_NICHE_TEMPLATE;
  const seed =
    templateKey === "roofing"
      ? ROOFING_SEED_BUSINESS
      : templateKey === "hvac"
        ? HVAC_SEED_BUSINESS
        : PLUMBING_SEED_BUSINESS;

  const renderPackage = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template,
    seed,
    lead: buildLeadRecord(lead, templateKey),
    sampleMode: "strict",
  });

  if (!renderPackage.status.isPreviewSafe) {
    return {
      supported: false,
      reason: "UNSAFE_RENDER",
    };
  }

  return {
    supported: true,
    familyKey: BLUE_COLLAR_SERVICE_FAMILY.key,
    templateKey: template.key,
    renderPackage,
  };
}

export function normalizeSupportedIndustry(
  industry: string | null | undefined
): SupportedIndustry | null {
  const value = industry ? canonicalizeIndustry(industry) : null;

  if (!value) {
    return null;
  }

  if (value === "roofing") {
    return "roofing";
  }

  if (HVAC_INDUSTRY_ALIASES.has(value)) {
    return "hvac";
  }

  if (PLUMBING_INDUSTRY_ALIASES.has(value)) {
    return "plumbing";
  }

  return null;
}

export function resolveLeadTemplatePreview(
  lead: LeadWithOptionalPreviewFields
): SupportedPreviewResult {
  const normalizedIndustry = normalizeSupportedIndustry(lead.industry);

  if (normalizedIndustry === "roofing") {
    return resolveSupportedPreview("roofing", lead);
  }

  if (normalizedIndustry === "hvac") {
    return resolveSupportedPreview("hvac", lead);
  }

  if (normalizedIndustry === "plumbing") {
    return resolveSupportedPreview("plumbing", lead);
  }

  return {
    supported: false,
    reason: "UNSUPPORTED_INDUSTRY",
  };
}

export function buildLeadPreviewView(
  lead: LeadWithOptionalPreviewFields,
  resolver: (lead: LeadWithOptionalPreviewFields) => SupportedPreviewResult = resolveLeadTemplatePreview
) {
  if (lead.status !== "generated") {
    return {
      kind: "legacy" as const,
      reason: "LEAD_NOT_READY" as const,
      fallbackSlug: null,
    };
  }

  return buildLeadPreviewViewWithResolver(lead, resolver);
}

export function buildLeadPreviewViewWithResolver(
  lead: LeadWithOptionalPreviewFields,
  resolver: (lead: LeadWithOptionalPreviewFields) => SupportedPreviewResult
) {
  const resolvedPreview = resolver(lead);

  if (!resolvedPreview.supported) {
    return {
      kind: "legacy" as const,
      reason: resolvedPreview.reason,
      fallbackSlug: extractLegacyFallbackSlug(lead.preview_url),
    };
  }

  return {
    kind: "blue-collar" as const,
    model: buildBlueCollarPreviewModel(resolvedPreview.renderPackage),
    renderPackage: resolvedPreview.renderPackage,
  };
}
