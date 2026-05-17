import type { Metadata } from "next";
import type { LeadIndustry } from "@/lib/industries";
import type { PreviewModel } from "@/lib/preview/types";
import { getPreferredPreviewOrigin } from "@/lib/preview";

// ─────────────────────────────────────────────────────────────────────────────
// Origin resolver: matches what `buildPreviewUrl()` uses, but always returns a
// non-empty origin so we can safely build absolute URLs for OG/canonical even
// in dev / unconfigured environments.
// ─────────────────────────────────────────────────────────────────────────────
export function getSiteOrigin(): string {
  return getPreferredPreviewOrigin() ?? "https://walkperro.com";
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const origin = getSiteOrigin();
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${path}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Industry → Schema.org @type override map. The more specific schemas unlock
// richer SERP features (sitelinks, knowledge panel hints).
// ─────────────────────────────────────────────────────────────────────────────
const INDUSTRY_SCHEMA_TYPE: Record<LeadIndustry, string> = {
  handyman: "HomeAndConstructionBusiness",
  "pressure washing": "HomeAndConstructionBusiness",
  roofing: "RoofingContractor",
  HVAC: "HVACBusiness",
  plumbing: "Plumber",
  dental: "Dentist",
  "med spa": "MedicalBusiness",
  "junk removal": "MovingCompany",
  "mobile detailing": "AutoBodyShop",
  landscaping: "HomeAndConstructionBusiness",
  painting: "HousePainter",
  electrical: "Electrician",
  "auto repair": "AutoRepair",
  "pest control": "HomeAndConstructionBusiness",
};

// Per-industry SEO description boost terms — appended to descriptions to capture
// transactional local intent (e.g. "near me", "{city} {industry}").
const INDUSTRY_INTENT: Record<LeadIndustry, { primary: string; alts: string[] }> =
  {
    handyman: {
      primary: "handyman",
      alts: ["handyman near me", "home repair", "small repair pros"],
    },
    "pressure washing": {
      primary: "pressure washing",
      alts: ["power washing", "soft wash", "exterior cleaning"],
    },
    roofing: {
      primary: "roofing contractor",
      alts: ["roof repair", "roof replacement", "roofing near me"],
    },
    HVAC: {
      primary: "HVAC service",
      alts: ["AC repair", "heating and cooling", "HVAC near me"],
    },
    plumbing: {
      primary: "licensed plumber",
      alts: ["plumber near me", "emergency plumber", "water heater repair"],
    },
    dental: {
      primary: "family dentist",
      alts: ["dentist near me", "cosmetic dentistry", "Invisalign"],
    },
    "med spa": {
      primary: "med spa",
      alts: ["Botox", "fillers", "laser treatment"],
    },
    "junk removal": {
      primary: "junk removal",
      alts: ["estate cleanout", "garage cleanout", "junk haul-away"],
    },
    "mobile detailing": {
      primary: "mobile auto detailing",
      alts: [
        "car detailing near me",
        "ceramic coating",
        "paint correction",
      ],
    },
    landscaping: {
      primary: "landscaping",
      alts: ["lawn care", "yard maintenance", "landscaper near me"],
    },
    painting: {
      primary: "house painter",
      alts: ["interior painting", "exterior painting", "cabinet refinishing"],
    },
    electrical: {
      primary: "licensed electrician",
      alts: ["electrician near me", "panel upgrade", "EV charger install"],
    },
    "auto repair": {
      primary: "auto repair shop",
      alts: ["mechanic near me", "ASE-certified", "brake service"],
    },
    "pest control": {
      primary: "pest control",
      alts: ["exterminator", "termite treatment", "rodent removal"],
    },
  };

const INDUSTRY_DISPLAY: Record<LeadIndustry, string> = {
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

// ─────────────────────────────────────────────────────────────────────────────
// Per-lead preview metadata. The canonical URL points at /preview/<slug>.
// ─────────────────────────────────────────────────────────────────────────────
export function buildPreviewMetadata(model: PreviewModel): Metadata {
  const intent = INDUSTRY_INTENT[model.industry];
  const display = INDUSTRY_DISPLAY[model.industry];
  const cityPart = model.business.city ? ` in ${model.business.city}` : "";
  const ratingPart =
    typeof model.business.rating === "number" &&
    typeof model.business.reviewCount === "number"
      ? ` ${model.business.rating.toFixed(1)}★ across ${model.business.reviewCount} reviews.`
      : "";

  const title = `${model.business.name} — ${display}${cityPart}`;
  const description = `${model.business.name} is a ${intent.primary}${cityPart}. ${model.hero.subheadline}${ratingPart}`.slice(
    0,
    280
  );

  const canonical = `/preview/${model.slug}`;
  const ogImage = absoluteUrl(`/preview/${model.slug}/opengraph-image`);

  return {
    title,
    description,
    keywords: [
      intent.primary,
      ...intent.alts,
      model.business.city ? `${intent.primary} ${model.business.city}` : null,
      model.business.name,
    ].filter(Boolean) as string[],
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonical),
      title,
      description,
      siteName: "WalkPerro",
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${model.business.name} — ${display}${cityPart}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-template metadata (e.g. /preview/templates/handyman). Used when showcasing
// the template library before a real lead is bound to it.
// ─────────────────────────────────────────────────────────────────────────────
export function buildIndustryTemplateMetadata(
  industry: LeadIndustry
): Metadata {
  const intent = INDUSTRY_INTENT[industry];
  const display = INDUSTRY_DISPLAY[industry];
  const slug = industry.replace(/\s+/g, "-").toLowerCase();
  const canonical = `/preview/templates/${slug}`;

  const title = `${display} website template`;
  const description = `Premium ${intent.primary} website template by WalkPerro — designed for ${intent.alts
    .slice(0, 2)
    .join(", ")} businesses. $497 launch site, live in 7 days.`;

  const ogImage = absoluteUrl(`/preview/templates/${slug}/opengraph-image`);

  return {
    title,
    description,
    keywords: [intent.primary, ...intent.alts, `${display.toLowerCase()} website template`, "WalkPerro"],
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: absoluteUrl(canonical),
      title: `${title} · WalkPerro`,
      description,
      siteName: "WalkPerro",
      locale: "en_US",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${display} website template by WalkPerro`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · WalkPerro`,
      description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// JSON-LD builders. Each preview emits a graph: LocalBusiness + Service[] +
// BreadcrumbList + WebSite. The schema @type for the LocalBusiness node uses
// the most specific type available per industry (Plumber, Dentist, etc.).
// ─────────────────────────────────────────────────────────────────────────────
type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

const PHONE_RE = /[^\d+]/g;
function normalizePhoneE164(phoneTelHref: string | null, phoneDisplay: string | null): string | null {
  if (phoneTelHref?.startsWith("tel:")) {
    const tel = phoneTelHref.slice(4).replace(PHONE_RE, "");
    if (tel) return tel.startsWith("+") ? tel : `+${tel}`;
  }
  if (phoneDisplay) {
    const digits = phoneDisplay.replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  }
  return null;
}

export function buildPreviewJsonLd(model: PreviewModel): JsonLd {
  const origin = getSiteOrigin();
  const url = `${origin}/preview/${model.slug}`;
  const localBusinessId = `${url}#business`;
  const websiteId = `${origin}#website`;

  const localBusinessType = INDUSTRY_SCHEMA_TYPE[model.industry];
  const intent = INDUSTRY_INTENT[model.industry];
  const phone = normalizePhoneE164(
    model.business.phoneTelHref,
    model.business.phoneDisplay
  );

  const ogImage = `${url}/opengraph-image`;
  const heroImage = model.assets.heroUrl
    ? absoluteUrl(model.assets.heroUrl)
    : ogImage;
  const galleryImages = (model.assets.galleryUrls ?? [])
    .slice(0, 4)
    .map(absoluteUrl);

  const localBusiness: Record<string, unknown> = {
    "@type": localBusinessType,
    "@id": localBusinessId,
    name: model.business.name,
    url,
    image: [heroImage, ...galleryImages],
    description: model.hero.subheadline,
    priceRange: "$$",
    knowsAbout: intent.alts,
    slogan: model.hero.headline,
  };

  if (phone) {
    localBusiness.telephone = phone;
  }
  if (model.business.city) {
    localBusiness.address = {
      "@type": "PostalAddress",
      addressLocality: model.business.city,
      addressCountry: "US",
    };
    localBusiness.areaServed = {
      "@type": "City",
      name: model.business.city,
    };
  }
  if (
    typeof model.business.rating === "number" &&
    typeof model.business.reviewCount === "number" &&
    model.business.reviewCount > 0
  ) {
    localBusiness.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: model.business.rating,
      reviewCount: model.business.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (model.topReview) {
    localBusiness.review = [
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: model.topReview.authorFirstName,
        },
        reviewBody: model.topReview.quote,
        reviewRating: {
          "@type": "Rating",
          ratingValue: model.topReview.rating,
          bestRating: 5,
          worstRating: 1,
        },
      },
    ];
  }
  if (model.business.yearsInBusiness && model.business.yearsInBusiness >= 1) {
    localBusiness.foundingDate = String(
      new Date().getFullYear() - model.business.yearsInBusiness
    );
  }

  // Per-service Service nodes — each one points back at the LocalBusiness.
  const services = model.services.items.map((service) => ({
    "@type": "Service",
    name: service.title,
    description: service.body,
    serviceType: service.title,
    provider: { "@id": localBusinessId },
    areaServed: model.business.city
      ? { "@type": "City", name: model.business.city }
      : undefined,
  }));

  // FAQ schema from the FAQ section.
  const faq =
    model.faq.items.length > 0
      ? {
          "@type": "FAQPage",
          mainEntity: model.faq.items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  // BreadcrumbList: WalkPerro → Previews → {Business name}
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "WalkPerro",
        item: origin,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Previews",
        item: `${origin}/preview`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: model.business.name,
        item: url,
      },
    ],
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: origin,
    name: "WalkPerro",
    publisher: { "@id": `${origin}#org` },
  };

  const organization = {
    "@type": "Organization",
    "@id": `${origin}#org`,
    name: "WalkPerro",
    url: origin,
    logo: `${origin}/walkperro/stripe-receipt-logo.png`,
  };

  const graph: Record<string, unknown>[] = [
    localBusiness,
    ...services,
    breadcrumb,
    website,
    organization,
  ];
  if (faq) graph.push(faq);

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

// Industry template (showcase) JSON-LD: WebPage + BreadcrumbList. Less rich
// than a real lead preview because it's a template, not a real business.
export function buildIndustryTemplateJsonLd(industry: LeadIndustry): JsonLd {
  const origin = getSiteOrigin();
  const slug = industry.replace(/\s+/g, "-").toLowerCase();
  const url = `${origin}/preview/templates/${slug}`;
  const display = INDUSTRY_DISPLAY[industry];
  const intent = INDUSTRY_INTENT[industry];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${display} website template`,
        description: `Premium ${intent.primary} website template by WalkPerro.`,
        isPartOf: { "@id": `${origin}#website` },
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "WalkPerro", item: origin },
          {
            "@type": "ListItem",
            position: 2,
            name: "Templates",
            item: `${origin}/preview/templates`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${display} template`,
            item: url,
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${origin}#website`,
        url: origin,
        name: "WalkPerro",
      },
    ],
  };
}
