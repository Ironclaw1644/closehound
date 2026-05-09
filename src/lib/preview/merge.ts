import type { PreviewModel } from "@/lib/preview/types";

// Shape of the buyer-edited payload stored in walkperro.preview_sites.preview_payload.
// The editor's server actions write these top-level keys (see
// src/app/claim/[token]/edit/actions.ts).
export type BuyerOverrides = {
  basics?: {
    phone?: string | null;
    email?: string | null;
    hours?: string | null;
    ctaLabel?: string | null;
  };
  about?: {
    tagline?: string | null;
    story?: string | null;
  };
  serviceArea?: {
    cities?: string[];
  };
  brand?: {
    accent?: string | null;
  };
  assets?: {
    galleryUrls?: string[];
    heroUrl?: string | null;
    logoUrl?: string | null;
  };
};

// E.164-ish formatter — same approach as src/lib/preview/build.ts uses inline.
// Keeps the displayed phone string from buyer input but rebuilds tel: href.
function buildTelHref(displayed: string): string | null {
  const digits = displayed.replace(/\D/g, "");
  if (digits.length < 7) return null;
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  return `tel:+${digits}`;
}

/**
 * Merge buyer-edited overrides on top of a base PreviewModel.
 * Pure function; never mutates inputs. Returns a new model.
 *
 * Order of precedence: buyer override > base model.
 * Empty strings, null, and undefined in overrides are treated as "no override"
 * so saving a blank field doesn't blow away the base value.
 */
export function mergeBuyerOverrides(
  base: PreviewModel,
  overrides: BuyerOverrides | null | undefined
): PreviewModel {
  if (!overrides || typeof overrides !== "object") return base;

  // Helpers — reject empty/null/undefined as "no override"
  const sx = (v: unknown): string | undefined =>
    typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
  const arr = (v: unknown): string[] | undefined =>
    Array.isArray(v) && v.every((x) => typeof x === "string") && v.length > 0
      ? (v as string[])
      : undefined;

  const next: PreviewModel = {
    ...base,
    business: { ...base.business },
    hero: {
      ...base.hero,
      primaryCta: { ...base.hero.primaryCta },
      secondaryCta: base.hero.secondaryCta ? { ...base.hero.secondaryCta } : null,
    },
    serviceArea: { ...base.serviceArea },
    assets: {
      ...base.assets,
      galleryUrls: [...base.assets.galleryUrls],
    },
  };

  // Basics
  const bPhone = sx(overrides.basics?.phone);
  if (bPhone) {
    next.business.phoneDisplay = bPhone;
    next.business.phoneTelHref = buildTelHref(bPhone);
    // Re-thread phone into hero CTA href (the original CTA was bound to the lead's phone).
    if (next.business.phoneTelHref) {
      next.hero.primaryCta = {
        ...next.hero.primaryCta,
        href: next.business.phoneTelHref,
      };
    }
  }
  const bEmail = sx(overrides.basics?.email);
  if (bEmail) next.business.email = bEmail;
  const bHours = sx(overrides.basics?.hours);
  if (bHours) next.business.hours = bHours;
  const bCta = sx(overrides.basics?.ctaLabel);
  if (bCta) {
    next.hero.primaryCta = { ...next.hero.primaryCta, label: bCta };
  }

  // About — exposed as a new top-level field on the model.
  const aTag = sx(overrides.about?.tagline);
  const aStory = sx(overrides.about?.story);
  if (aTag || aStory) {
    next.about = {
      tagline: aTag ?? base.about?.tagline ?? null,
      story: aStory ?? base.about?.story ?? null,
    };
  }

  // Service area cities
  const cities = arr(overrides.serviceArea?.cities);
  if (cities) next.serviceArea = { ...next.serviceArea, cities };

  // Brand accent
  const accent = sx(overrides.brand?.accent);
  if (accent) {
    next.brand = { ...(base.brand ?? {}), accent };
  }

  // Assets — only override individual slots when buyer set them.
  const ovHero = sx(overrides.assets?.heroUrl);
  const ovLogo = sx(overrides.assets?.logoUrl);
  const ovGallery = arr(overrides.assets?.galleryUrls);
  if (ovHero) next.assets.heroUrl = ovHero;
  if (ovLogo) next.assets.logoUrl = ovLogo;
  if (ovGallery) {
    // Replace any non-empty buyer entries; keep base for empty slots.
    const merged = [...next.assets.galleryUrls];
    for (let i = 0; i < ovGallery.length; i++) {
      const v = ovGallery[i];
      if (typeof v === "string" && v.trim() !== "") merged[i] = v;
    }
    next.assets.galleryUrls = merged;
  }

  return next;
}

/**
 * Type guard: shallow validation that an unknown jsonb blob looks like
 * BuyerOverrides. Doesn't enforce field types — mergeBuyerOverrides() does
 * its own per-field validation via sx/arr helpers.
 */
export function isBuyerOverrides(value: unknown): value is BuyerOverrides {
  if (!value || typeof value !== "object") return false;
  // Accept anything object-shaped; the merge function safely ignores
  // unrecognized keys and malformed values.
  return true;
}
