import type { AboutCopyVariantKey } from "@/lib/copy-variants";
import type { LeadIndustry } from "@/lib/industries";
import type { PaletteKey } from "@/lib/palettes";
import type { SiteSectionKey } from "@/lib/site-templates/types";

export type TypographyPairing = {
  key: string;
  headingFamily: string;
  bodyFamily: string;
};

export type SiteGeneratorLeadInput = {
  id: string;
  company_name: string;
  city: string | null;
  industry: LeadIndustry | null;
  phone: string | null;
  contact_email: string | null;
  rating: number | null;
};

export type PreviewSiteSectionContent = {
  title: string;
  body?: string;
  items?: Array<{
    title?: string;
    description: string;
  }>;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
};

export type PreviewSite = {
  version: "v1";
  slug: string;
  previewUrl: string;
  templateKey: string;
  industryKey: LeadIndustry;
  leadId: string;
  business: {
    name: string;
    city: string;
    phone: string | null;
    phoneDisplay: string;
    email: string | null;
    rating: number | null;
  };
  theme: {
    paletteKey: PaletteKey;
    typographyKey: string;
    aboutCopyVariantKey: AboutCopyVariantKey;
  };
  sectionOrder: SiteSectionKey[];
  sections: Record<SiteSectionKey, PreviewSiteSectionContent>;
  metadata: {
    seed: string;
    deterministic: true;
    aiRequired: false;
    generatedFrom: "lead";
  };
};
