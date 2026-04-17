import { buildPreviewUrl } from "@/lib/preview";
import {
  buildContractorSiteData,
  type ContractorPresetKey,
  type ContractorSiteData,
} from "@/lib/site-templates/contractor";
import type { Lead } from "@/types/lead";
import type { PreviewGenerationMetadata } from "@/types/operator";

const FALLBACK_COMPANY_NAME = "Local Contractor";
const FALLBACK_PHONE = "(555) 010-0000";
const FALLBACK_EMAIL = "estimating@example.com";
const FALLBACK_CITY = "Your Area";
const FALLBACK_STATE = "ST";
const FALLBACK_SERVICE_AREA = "Regional service area";

const INDUSTRY_KEYWORDS: Array<{
  presetKey: ContractorPresetKey;
  keywords: string[];
}> = [
  {
    presetKey: "underground-utility",
    keywords: [
      "utility",
      "utilities",
      "underground",
      "excavation",
      "excavating",
      "drilling",
      "directional",
      "fiber",
      "telecom",
      "trenching",
      "duct bank",
      "sitework",
      "water",
      "sewer",
      "gas",
      "electric",
      "civil",
    ],
  },
];

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function buildKeywordText(lead: Pick<Lead, "company_name" | "industry" | "city">) {
  return [lead.company_name, lead.industry, lead.city]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizedWords(value: string | null | undefined) {
  return normalizeText(value).toLowerCase();
}

function formatPhone(phone: string | null | undefined) {
  const normalized = normalizeText(phone);

  if (!normalized) {
    return FALLBACK_PHONE;
  }

  const digits = normalized.replace(/\D/g, "");

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return normalized;
}

function slugTitle(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function detectPresetFromLead(lead: Pick<Lead, "company_name" | "industry" | "city">) {
  const keywordText = buildKeywordText(lead);
  const industryText = normalizedWords(lead.industry);

  for (const matcher of INDUSTRY_KEYWORDS) {
    for (const keyword of matcher.keywords) {
      if (industryText && industryText.includes(keyword)) {
        return {
          presetKey: matcher.presetKey,
          detectionMode: "explicit" as const,
          matchedKeyword: keyword,
        };
      }

      if (keywordText.includes(keyword)) {
        return {
          presetKey: matcher.presetKey,
          detectionMode: "keyword" as const,
          matchedKeyword: keyword,
        };
      }
    }
  }

  return {
    presetKey: "underground-utility" as const,
    detectionMode: "fallback" as const,
    matchedKeyword: null,
  };
}

function detectIndustryLabel(lead: Pick<Lead, "company_name" | "industry" | "city">) {
  const rawIndustry = normalizeText(lead.industry);

  if (rawIndustry) {
    return slugTitle(rawIndustry);
  }

  const keywordText = buildKeywordText(lead);

  if (keywordText.includes("roof")) {
    return "Roofing Contractor";
  }

  if (keywordText.includes("plumb")) {
    return "Plumbing Contractor";
  }

  if (keywordText.includes("hvac") || keywordText.includes("heating") || keywordText.includes("cooling")) {
    return "HVAC Contractor";
  }

  if (keywordText.includes("wash")) {
    return "Exterior Cleaning Contractor";
  }

  if (keywordText.includes("junk")) {
    return "Removal Contractor";
  }

  return "Underground Utility Contractor";
}

function buildServiceArea(city: string) {
  if (!city || city === FALLBACK_CITY) {
    return [FALLBACK_SERVICE_AREA];
  }

  return [city, `${city} metro area`, "Nearby service region"];
}

function buildHeroHeadline(companyName: string, city: string, industryLabel: string) {
  if (city === FALLBACK_CITY) {
    return `${companyName} is positioned as a dependable ${industryLabel.toLowerCase()} option.`;
  }

  return `${companyName} is positioned as a dependable ${industryLabel.toLowerCase()} serving ${city} and nearby markets.`;
}

function buildHeroBody(companyName: string, city: string, industryLabel: string) {
  if (city === FALLBACK_CITY) {
    return `${companyName} uses the contractor template system inside CloseHound to turn lead data into a credible first-pass website preview with deterministic copy, structure, and calls to action.`;
  }

  return `${companyName} uses the contractor template system inside CloseHound to present a credible ${industryLabel.toLowerCase()} brand for ${city}, with deterministic copy, reusable sections, and no manual setup required for the first preview.`;
}

function buildTrustBullets(city: string, industryLabel: string, rating: number | null) {
  const bullets = [
    `Structured to position the business as a credible ${industryLabel.toLowerCase()} option.`,
    `Built to support city-level previews for ${city === FALLBACK_CITY ? "new markets" : city}.`,
    "Safe defaults keep the preview usable even when lead data is incomplete.",
  ];

  if (typeof rating === "number") {
    bullets[1] = `Current lead rating signal: ${rating.toFixed(1)} stars.`;
  }

  return bullets;
}

export function detectContractorPresetFromLead(
  lead: Pick<Lead, "company_name" | "industry" | "city">
) {
  const detection = detectPresetFromLead(lead);

  return {
    presetKey: detection.presetKey,
    industryLabel: detectIndustryLabel(lead),
    detectionMode: detection.detectionMode,
    matchedKeyword: detection.matchedKeyword,
  };
}

export function getPreviewGenerationMetadataFromLead(
  lead: Pick<Lead, "id" | "company_name" | "industry" | "city">
): PreviewGenerationMetadata {
  const detection = detectContractorPresetFromLead(lead);

  return {
    presetDetected: detection.presetKey,
    detectionMode: detection.detectionMode,
    matchedKeyword: detection.matchedKeyword,
    previewRoute: buildPreviewUrl(lead.id),
  };
}

export function generateContractorSiteDataFromLead(lead: Lead): ContractorSiteData {
  const companyName = normalizeText(lead.company_name) || FALLBACK_COMPANY_NAME;
  const city = normalizeText(lead.city) || FALLBACK_CITY;
  const email = normalizeText(lead.contact_email) || FALLBACK_EMAIL;
  const phone = formatPhone(lead.phone);
  const { presetKey, industryLabel } = detectContractorPresetFromLead(lead);
  const previewUrl = buildPreviewUrl(lead.id);

  return buildContractorSiteData(presetKey, {
    slug: lead.id,
    company: {
      name: companyName,
      legalName: companyName,
      phone,
      email,
      primaryLocation: {
        label: "Primary Service Area",
        city,
        state: FALLBACK_STATE,
      },
      additionalLocations: [],
      serviceArea: buildServiceArea(city),
    },
    branding: {
      headerTitle: industryLabel,
      headerSubtitle:
        city === FALLBACK_CITY
          ? `${industryLabel} preview generated from lead data inside CloseHound.`
          : `${industryLabel} preview generated for ${city} from lead data inside CloseHound.`,
      primaryCtaLabel: `Call ${companyName}`,
      secondaryCtaLabel: "View Services",
    },
    hero: {
      eyebrow: city === FALLBACK_CITY ? industryLabel : `${city} ${industryLabel}`,
      headline: buildHeroHeadline(companyName, city, industryLabel),
      body: buildHeroBody(companyName, city, industryLabel),
      stats: [
        {
          value: typeof lead.rating === "number" ? lead.rating.toFixed(1) : "New Lead",
          label: typeof lead.rating === "number" ? "Current rating signal" : "Lead status",
        },
        {
          value: lead.has_website ? "Has Site" : "Needs Site",
          label: "Website status",
        },
        {
          value: city,
          label: "Primary market",
        },
      ],
      trustItems: [
        `${industryLabel} positioning with deterministic section copy.`,
        "Lead-aware contact and service-area framing.",
        "Fast preview generation with zero AI dependency at render time.",
      ],
    },
    services: {
      heading: `${industryLabel} services framed for a first-pass preview.`,
      body:
        "This preview uses the existing contractor preset defaults, then layers in business-specific lead data so the page is usable immediately and extensible later.",
    },
    gallery: {
      heading: "Placeholder project visuals ready for real business media.",
      body:
        "The current preview uses template placeholder imagery so site generation remains stable even when the lead has no uploaded logo or project photos yet.",
    },
    trust: {
      heading: `${companyName} is presented as a contractor business with a believable local footprint.`,
      body:
        city === FALLBACK_CITY
          ? "The trust section pulls from deterministic defaults so each preview still reads like a credible contractor site even when the lead record is sparse."
          : `The trust section pulls from deterministic defaults so ${companyName} still reads like a credible contractor site for ${city} even when the lead record is sparse.`,
      bullets: buildTrustBullets(city, industryLabel, lead.rating),
      highlight: {
        eyebrow: "Lead Preview",
        title: "Generated directly from the CloseHound lead record.",
        body:
          "This preview is assembled from the stored lead data, contractor preset defaults, and safe fallbacks for missing content.",
        quote:
          typeof lead.rating === "number"
            ? `${companyName} currently shows a ${lead.rating.toFixed(1)}-star rating in the lead record.`
            : undefined,
        attribution: previewUrl,
      },
    },
    contact: {
      heading: `Contact ${companyName}`,
      body:
        city === FALLBACK_CITY
          ? `Reach ${companyName} to discuss scope, availability, and next steps.`
          : `Reach ${companyName} to discuss work in ${city} and the surrounding area.`,
      primaryCtaLabel: "Call Now",
      secondaryCtaLabel: "Email The Team",
    },
    footer: {
      summary:
        "This contractor preview is generated from a lead record using the reusable CloseHound contractor template system.",
      coverageItems: buildServiceArea(city),
    },
    seo: {
      title: `${companyName} | CloseHound Preview`,
      description:
        city === FALLBACK_CITY
          ? `Contractor preview generated by CloseHound for ${companyName}.`
          : `Contractor preview generated by CloseHound for ${companyName} in ${city}.`,
    },
  });
}
