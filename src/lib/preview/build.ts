import type { LeadIndustry } from "@/lib/industries";
import { getCopyForIndustry } from "@/lib/preview/copy";
import { getPaletteForIndustry } from "@/lib/preview/palettes";
import type { PreviewModel, PreviewReview } from "@/lib/preview/types";
import { buildPreviewSlug } from "@/lib/preview";
import type { Lead } from "@/types/lead";

const DEFAULT_INDUSTRY: LeadIndustry = "handyman";

const PRICE_LABEL = "$497 one-time";
const BUY_HEADLINE = "Own this site for your business.";
const BUY_SUBHEAD =
  "We deliver a live website on your domain within 7 days, with hosting, SSL, contact form, and Google Business connection. Cancel hosting anytime.";
const BUY_CTA = `Buy this site · ${PRICE_LABEL}`;

function formatPhone(raw: string | null): { display: string | null; tel: string | null } {
  if (!raw) {
    return { display: null, tel: null };
  }
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) {
    return { display: raw, tel: `tel:${digits}` };
  }
  const local = digits.slice(-10);
  const display = `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`;
  const tel = digits.length === 11 ? `tel:+${digits}` : `tel:+1${local}`;
  return { display, tel };
}

function pickIndustry(industry: LeadIndustry | null | undefined): LeadIndustry {
  return industry ?? DEFAULT_INDUSTRY;
}

function buildTopReview(lead: Lead): PreviewReview | null {
  const quote = lead.top_review?.trim();
  if (!quote) {
    return null;
  }
  return {
    quote,
    authorFirstName: lead.top_reviewer_name?.trim() || "Verified customer",
    rating: typeof lead.rating === "number" ? lead.rating : 5,
  };
}

export function buildPreviewModel(
  lead: Lead,
  options: { logoUrl?: string | null; heroUrl?: string | null } = {}
): PreviewModel {
  const industry = pickIndustry(lead.industry);
  const copy = getCopyForIndustry(industry);
  const palette = getPaletteForIndustry(industry);
  const phone = formatPhone(lead.phone);
  const slug = buildPreviewSlug({
    companyName: lead.company_name,
    city: lead.city,
    leadId: lead.id,
  });

  const primaryCtaHref = phone.tel ?? "#contact";
  const secondaryCtaHref = "#contact";

  const heroPrimaryLabel = copy.hero.primaryCtaLabel;
  const heroSecondaryLabel = copy.hero.secondaryCtaLabel;

  return {
    slug,
    industry,
    templateKey: copy.templateKey,
    paletteKey: palette.key,
    business: {
      name: lead.company_name,
      city: lead.city,
      phoneDisplay: phone.display,
      phoneTelHref: phone.tel,
      rating: lead.rating ?? null,
      reviewCount: lead.review_count ?? null,
      yearsInBusiness: lead.years_in_business ?? null,
    },
    hero: {
      eyebrow: copy.hero.eyebrow(lead.city),
      headline: copy.hero.headline(lead.company_name, lead.city),
      subheadline: copy.hero.subheadline(lead.company_name, lead.city),
      primaryCta: { label: heroPrimaryLabel, href: primaryCtaHref },
      secondaryCta: heroSecondaryLabel
        ? { label: heroSecondaryLabel, href: secondaryCtaHref }
        : null,
    },
    topReview: buildTopReview(lead),
    services: {
      heading: copy.services.heading,
      items: copy.services.items,
    },
    serviceArea: {
      heading: copy.serviceArea.heading,
      body: copy.serviceArea.body(lead.company_name, lead.city),
    },
    whyUs: {
      heading: copy.whyUs.heading,
      bullets: copy.whyUs.bullets,
    },
    faq: {
      heading: copy.faq.heading,
      items: copy.faq.items(lead.company_name, lead.city),
    },
    contact: {
      heading: copy.contact.heading(lead.company_name),
      body: copy.contact.body(lead.company_name, lead.city),
    },
    assets: {
      logoUrl: options.logoUrl ?? null,
      heroUrl: options.heroUrl ?? null,
    },
    buy: {
      headline: BUY_HEADLINE,
      subhead: BUY_SUBHEAD,
      priceLabel: PRICE_LABEL,
      ctaLabel: BUY_CTA,
      href: `/api/buy/${lead.id}`,
    },
  };
}
