import type { LeadIndustry } from "@/lib/industries";

export type PreviewService = {
  title: string;
  body: string;
  icon: PreviewIcon;
  // Buyer-provided free-text price label (e.g. "$199 / visit", "Starts at
  // $899", "Free estimates"). When set, replaces the industry-default
  // pricing on the per-service detail page. When null/missing, the page
  // falls back to SERVICE_PRICING[industry][index].
  price?: string | null;
};

export type PreviewIcon =
  | "wrench"
  | "house-chimney"
  | "broom"
  | "screwdriver-wrench"
  | "fan"
  | "snowflake"
  | "fire-flame-curved"
  | "droplet"
  | "shower"
  | "tooth"
  | "spa"
  | "leaf"
  | "truck-ramp-box"
  | "warehouse"
  | "couch"
  | "trash-can"
  | "car"
  | "soap"
  | "bolt"
  | "phone"
  | "envelope"
  | "location-dot"
  | "clock"
  | "shield-halved"
  | "handshake"
  | "star"
  | "calendar-check"
  | "circle-check"
  | "tree"
  | "scissors"
  | "paint-roller"
  | "paintbrush"
  | "plug"
  | "lightbulb"
  | "oil-can"
  | "gauge"
  | "bug"
  | "spray-can-sparkles";

export type PreviewReview = {
  quote: string;
  authorFirstName: string;
  rating: number;
};

export type PreviewModel = {
  slug: string;
  industry: LeadIndustry;
  templateKey: string;
  paletteKey: string;

  business: {
    name: string;
    city: string | null;
    phoneDisplay: string | null;
    phoneTelHref: string | null;
    rating: number | null;
    reviewCount: number | null;
    yearsInBusiness: number | null;
    // Buyer-overridable fields. Set by mergeBuyerOverrides() when present
    // in walkperro.preview_sites.preview_payload.basics.
    email?: string | null;
    hours?: string | null;
  };

  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string } | null;
  };

  topReview: PreviewReview | null;

  services: {
    heading: string;
    items: PreviewService[];
  };

  serviceArea: {
    heading: string;
    body: string;
    // Buyer override: explicit list of cities served (replaces auto-derived
    // neighbors when present).
    cities?: string[];
  };

  whyUs: {
    heading: string;
    bullets: { title: string; body: string; icon: PreviewIcon }[];
  };

  faq: {
    heading: string;
    items: { question: string; answer: string }[];
  };

  contact: {
    heading: string;
    body: string;
  };

  // Buyer-overridable About block. When present, About page renders these
  // values; otherwise falls back to per-industry static `getAboutForIndustry`.
  about?: {
    tagline?: string | null;
    story?: string | null;
  };

  // Buyer-overridable brand accent — when set, this overrides palette.accent
  // for inline-style accents in industry components and shared multipage UI.
  brand?: {
    accent?: string | null;
  };

  assets: {
    logoUrl: string | null;
    heroUrl: string | null;
    galleryUrls: string[];
  };

  buy: {
    headline: string;
    subhead: string;
    priceLabel: string;
    ctaLabel: string;
    href: string;
  };
};
