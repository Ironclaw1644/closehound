import { extractPreviewPath } from "@/lib/preview";
import { CLINICAL_CARE_FAMILY } from "@/lib/template-system/families/clinical-care";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { HEALTH_WELLNESS_FAMILY } from "@/lib/template-system/families/health-wellness";
import { DENTAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/dental";
import { HVAC_NICHE_TEMPLATE } from "@/lib/template-system/niches/hvac";
import { JUNK_REMOVAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/junk-removal";
import { MED_SPA_NICHE_TEMPLATE } from "@/lib/template-system/niches/med-spa";
import { PLUMBING_NICHE_TEMPLATE } from "@/lib/template-system/niches/plumbing";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { buildHealthWellnessPreviewModel } from "@/lib/template-system/health-wellness-preview";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { DENTAL_SEED_BUSINESS } from "@/lib/template-system/seeds/dental-seed";
import { HVAC_SEED_BUSINESS } from "@/lib/template-system/seeds/hvac-seed";
import { JUNK_REMOVAL_SEED_BUSINESS } from "@/lib/template-system/seeds/junk-removal-seed";
import { MED_SPA_SEED_BUSINESS } from "@/lib/template-system/seeds/med-spa-seed";
import { PLUMBING_SEED_BUSINESS } from "@/lib/template-system/seeds/plumbing-seed";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";
import type { Lead } from "@/types/lead";
import type { LeadRecord, RenderPackage } from "@/lib/template-system/types";

type SupportedIndustry =
  | "roofing"
  | "hvac"
  | "plumbing"
  | "med-spa"
  | "dental"
  | "junk removal";

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

const MED_SPA_INDUSTRY_ALIASES = new Set([
  "med spa",
  "medspa",
  "medical spa",
  "aesthetic med spa",
]);

const DENTAL_INDUSTRY_ALIASES = new Set([
  "dentist",
  "dental",
  "general dentist",
  "family dentist",
  "family dentistry",
  "general dentistry",
]);

const JUNK_REMOVAL_INDUSTRY_ALIASES = new Set([
  "junk removal",
  "junk hauling",
  "junk hauling service",
  "junk pickup",
  "haul away",
  "cleanout service",
  "property cleanout",
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

function buildTelHref(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 0) {
    return null;
  }

  const canonicalDigits =
    digits.length === 11 && digits.startsWith("1") ? digits : `1${digits}`;

  return `tel:+${canonicalDigits}`;
}

function getPrimaryCtaLabel(industry: SupportedIndustry) {
  if (industry === "roofing") {
    return "Request a Roofing Quote";
  }

  if (industry === "hvac") {
    return "Request HVAC Service";
  }

  if (industry === "plumbing") {
    return "Call Now";
  }

  if (industry === "dental") {
    return "Schedule Visit";
  }

  if (industry === "med-spa") {
    return "Book Consultation";
  }

  return "Get a Quote";
}

function getSecondaryCtaLabel(industry: SupportedIndustry) {
  if (industry === "plumbing") {
    return "Request Estimate";
  }

  if (industry === "dental") {
    return "View Services";
  }

  if (industry === "med-spa") {
    return "View Treatments";
  }

  if (industry === "junk removal") {
    return "Call Now";
  }

  return null;
}

function getSecondaryCtaHref(
  industry: SupportedIndustry,
  lead: LeadWithOptionalPreviewFields
) {
  if (industry === "plumbing") {
    return "#contact";
  }

  if (industry === "dental") {
    return "#services";
  }

  if (industry === "med-spa") {
    return "#services";
  }

  if (industry === "junk removal") {
    return lead.phone?.trim() ? buildTelHref(lead.phone.trim()) : null;
  }

  return null;
}

function buildLeadRecord(
  lead: LeadWithOptionalPreviewFields,
  industry: SupportedIndustry
): LeadRecord {
  const serviceAreaLabel = lead.city?.trim() ?? "";
  const contactEmail = lead.contact_email ?? lead.email ?? null;
  const primaryCtaLabel = getPrimaryCtaLabel(industry);
  const primaryCtaHref =
    industry === "plumbing" && lead.phone?.trim()
      ? `tel:${lead.phone.trim()}`
      : "#contact";
  const secondaryCtaLabel = getSecondaryCtaLabel(industry);
  const secondaryCtaHref = getSecondaryCtaHref(industry, lead);

  return {
    source: "closehound-lead",
    normalizedFields: {
      businessName: lead.company_name,
      serviceAreaLabel,
      primaryPhone: lead.phone,
      contactEmail,
      primaryCtaLabel,
      primaryCtaHref,
      secondaryCtaLabel,
      secondaryCtaHref,
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
        : templateKey === "plumbing"
      ? PLUMBING_NICHE_TEMPLATE
      : templateKey === "dental"
        ? DENTAL_NICHE_TEMPLATE
        : templateKey === "junk removal"
          ? JUNK_REMOVAL_NICHE_TEMPLATE
          : MED_SPA_NICHE_TEMPLATE;
  const seed =
    templateKey === "roofing"
      ? ROOFING_SEED_BUSINESS
      : templateKey === "hvac"
        ? HVAC_SEED_BUSINESS
        : templateKey === "plumbing"
          ? PLUMBING_SEED_BUSINESS
          : templateKey === "dental"
            ? DENTAL_SEED_BUSINESS
            : templateKey === "junk removal"
              ? JUNK_REMOVAL_SEED_BUSINESS
            : MED_SPA_SEED_BUSINESS;
  const family =
    templateKey === "dental"
      ? CLINICAL_CARE_FAMILY
      : templateKey === "med-spa"
      ? HEALTH_WELLNESS_FAMILY
      : BLUE_COLLAR_SERVICE_FAMILY;

  const renderPackage = resolveTemplateRender({
    family,
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
    familyKey: family.key,
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

  if (MED_SPA_INDUSTRY_ALIASES.has(value)) {
    return "med-spa";
  }

  if (DENTAL_INDUSTRY_ALIASES.has(value)) {
    return "dental";
  }

  if (JUNK_REMOVAL_INDUSTRY_ALIASES.has(value)) {
    return "junk removal";
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

  if (normalizedIndustry === "med-spa") {
    return resolveSupportedPreview("med-spa", lead);
  }

  if (normalizedIndustry === "dental") {
    return resolveSupportedPreview("dental", lead);
  }

  if (normalizedIndustry === "junk removal") {
    return resolveSupportedPreview("junk removal", lead);
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
  if (lead.status === "new") {
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

  if (resolvedPreview.familyKey !== BLUE_COLLAR_SERVICE_FAMILY.key) {
    if (
      resolvedPreview.familyKey === HEALTH_WELLNESS_FAMILY.key ||
      resolvedPreview.familyKey === CLINICAL_CARE_FAMILY.key
    ) {
      if (resolvedPreview.familyKey === CLINICAL_CARE_FAMILY.key) {
        return {
          kind: "clinical-care" as const,
          renderPackage: resolvedPreview.renderPackage,
        };
      }

      return {
        kind: "health-wellness" as const,
        model: buildHealthWellnessPreviewModel(resolvedPreview.renderPackage),
        renderPackage: resolvedPreview.renderPackage,
      };
    }

    return {
      kind: "legacy" as const,
      reason: "UNSUPPORTED_INDUSTRY" as const,
      fallbackSlug: extractLegacyFallbackSlug(lead.preview_url),
    };
  }

  return {
    kind: "blue-collar" as const,
    model: buildBlueCollarPreviewModel(resolvedPreview.renderPackage),
    renderPackage: resolvedPreview.renderPackage,
  };
}
