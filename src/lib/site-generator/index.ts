import {
  ABOUT_COPY_VARIANTS,
  type AboutCopyVariant,
} from "@/lib/copy-variants";
import type { LeadIndustry } from "@/lib/industries";
import { PALETTE_PRESETS } from "@/lib/palettes";
import { buildPreviewSlug, buildPreviewUrl } from "@/lib/preview";
import { getSiteTemplate } from "@/lib/site-templates";
import type { SiteSectionKey } from "@/lib/site-templates/types";
import {
  TYPOGRAPHY_PAIRINGS,
} from "@/lib/site-generator/typography";
import type {
  PreviewSite,
  PreviewSiteSectionContent,
  SiteGeneratorLeadInput,
} from "@/lib/site-generator/types";

const FALLBACK_CITY = "your area";

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function pickDeterministicVariant<T>(options: readonly T[], seed: string) {
  return options[hashString(seed) % options.length];
}

function titleCaseIndustry(industry: LeadIndustry) {
  if (industry === "HVAC") {
    return industry;
  }

  return industry.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPhone(phone: string | null) {
  if (!phone) {
    return "(555) 010-0000";
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
}

function replacePlaceholders(
  template: string,
  values: Record<string, string>
) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? "");
}

function mapItems(
  items: Array<{ title?: string; description: string }>,
  values: Record<string, string>
) {
  return items.map((item) => ({
    title: item.title ? replacePlaceholders(item.title, values) : undefined,
    description: replacePlaceholders(item.description, values),
  }));
}

function buildSectionRecord(
  sectionOrder: SiteSectionKey[],
  sections: Record<SiteSectionKey, PreviewSiteSectionContent>
) {
  return sectionOrder.reduce(
    (record, key) => {
      record[key] = sections[key];
      return record;
    },
    {} as Record<SiteSectionKey, PreviewSiteSectionContent>
  );
}

function resolveIndustry(lead: SiteGeneratorLeadInput): LeadIndustry {
  if (!lead.industry) {
    throw new Error(`Lead ${lead.id} is missing an industry.`);
  }

  return lead.industry;
}

function resolveAboutBody(
  lead: SiteGeneratorLeadInput,
  variant: AboutCopyVariant,
  values: Record<string, string>
) {
  const template = lead.rating && lead.rating >= 4.7
    ? `${variant.bodyTemplate} Customers already see the business as a highly rated local option.`
    : variant.bodyTemplate;

  return replacePlaceholders(template, values);
}

export function generatePreviewSite(lead: SiteGeneratorLeadInput): PreviewSite {
  const industry = resolveIndustry(lead);
  const template = getSiteTemplate(industry);

  if (!template) {
    throw new Error(`No site template configured for industry "${industry}".`);
  }

  const city = lead.city?.trim() || FALLBACK_CITY;
  const phoneDisplay = formatPhone(lead.phone);
  const industryLabel = titleCaseIndustry(industry);
  const seed = [lead.id, lead.company_name, city, industry].join("|");
  const palette = pickDeterministicVariant(PALETTE_PRESETS, `${seed}|palette`);
  const typography = pickDeterministicVariant(TYPOGRAPHY_PAIRINGS, `${seed}|type`);
  const aboutVariant = pickDeterministicVariant(ABOUT_COPY_VARIANTS, `${seed}|about`);
  const slug = buildPreviewSlug({
    companyName: lead.company_name,
    city: lead.city,
    leadId: lead.id,
  });
  const values = {
    companyName: lead.company_name,
    city,
    phoneDisplay,
    industryLabel,
    industryLabelLower: industryLabel.toLowerCase(),
  };

  const sections: Record<SiteSectionKey, PreviewSiteSectionContent> = {
    hero: {
      title: replacePlaceholders(template.hero.headline, values),
      body: replacePlaceholders(template.hero.subheadline, values),
      items: mapItems(
        template.hero.trustItems.map((description) => ({ description })),
        values
      ),
      primaryCtaLabel: replacePlaceholders(template.hero.primaryCta, values),
      secondaryCtaLabel: replacePlaceholders(template.hero.secondaryCta, values),
    },
    services: {
      title: replacePlaceholders(template.services.title, values),
      body: replacePlaceholders(template.services.intro, values),
      items: mapItems(template.services.items, values),
    },
    reviews: {
      title: replacePlaceholders(template.reviews.title, values),
      body: replacePlaceholders(template.reviews.intro, values),
      items: mapItems(
        template.reviews.highlights.map((description) => ({ description })),
        values
      ),
    },
    about: {
      title: replacePlaceholders(template.about.title, values),
      body: resolveAboutBody(lead, aboutVariant, values),
      items: mapItems(
        template.about.bullets.map((description) => ({ description })),
        values
      ),
    },
    cta: {
      title: replacePlaceholders(template.cta.title, values),
      body: replacePlaceholders(template.cta.body, values),
      primaryCtaLabel: replacePlaceholders(template.cta.primaryLabel, values),
    },
    contact: {
      title: replacePlaceholders(template.contact.title, values),
      body: replacePlaceholders(template.contact.body, values),
      items: [
        {
          title: replacePlaceholders(template.contact.phoneLabel, values),
          description: lead.phone ?? "Phone number to be confirmed",
        },
        {
          title: replacePlaceholders(template.contact.emailLabel, values),
          description: lead.contact_email ?? "Email address to be confirmed",
        },
      ],
    },
  };

  return {
    version: "v1",
    slug,
    previewUrl: buildPreviewUrl(slug),
    templateKey: template.key,
    industryKey: industry,
    leadId: lead.id,
    business: {
      name: lead.company_name,
      city,
      phone: lead.phone,
      phoneDisplay,
      email: lead.contact_email,
      rating: lead.rating,
    },
    theme: {
      paletteKey: palette.key,
      typographyKey: typography.key,
      aboutCopyVariantKey: aboutVariant.key,
    },
    sectionOrder: template.defaultSectionOrder,
    sections: buildSectionRecord(template.defaultSectionOrder, sections),
    metadata: {
      seed,
      deterministic: true,
      aiRequired: false,
      generatedFrom: "lead",
    },
  };
}

export type {
  PreviewSite,
  PreviewSiteSectionContent,
  SiteGeneratorLeadInput,
} from "@/lib/site-generator/types";
