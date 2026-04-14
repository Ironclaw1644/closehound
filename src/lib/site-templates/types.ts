import type { LeadIndustry } from "@/lib/industries";

export type SiteSectionKey =
  | "hero"
  | "services"
  | "reviews"
  | "about"
  | "cta"
  | "contact";

export type SiteTemplate = {
  key: string;
  industryKey: LeadIndustry;
  defaultSectionOrder: SiteSectionKey[];
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    trustItems: string[];
  };
  services: {
    title: string;
    intro: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  reviews: {
    title: string;
    intro: string;
    highlights: string[];
  };
  about: {
    title: string;
    bodyTemplate: string;
    bullets: string[];
  };
  cta: {
    title: string;
    body: string;
    primaryLabel: string;
  };
  contact: {
    title: string;
    body: string;
    phoneLabel: string;
    emailLabel: string;
  };
};
