import type { LeadIndustry } from "@/lib/industries";

export type PreviewService = {
  title: string;
  body: string;
  icon: PreviewIcon;
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
  | "circle-check";

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

  assets: {
    logoUrl: string | null;
    heroUrl: string | null;
  };

  buy: {
    headline: string;
    subhead: string;
    priceLabel: string;
    ctaLabel: string;
    href: string;
  };
};
