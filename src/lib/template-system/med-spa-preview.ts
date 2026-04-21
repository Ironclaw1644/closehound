import type {
  RenderPackage,
  ResolvedSection,
  SectionKey,
} from "@/lib/template-system/types";

export type MedSpaPreviewModel = {
  businessName: string;
  serviceAreaLabel: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  sectionKeys: Array<SectionKey | "featured-treatments">;
  hero: ResolvedSection;
  treatments: ResolvedSection;
  about: ResolvedSection;
  whyChooseUs: ResolvedSection;
  process: ResolvedSection;
  gallery: ResolvedSection;
  faq: ResolvedSection;
  contact: ResolvedSection;
  contactDetails: {
    phone?: string;
    email?: string;
  };
  heroImageSrc: string | null;
  status: RenderPackage["status"];
};

function readStringField(render: RenderPackage, key: string, fallback = "") {
  const value = render.resolvedFields[key];

  return typeof value === "string" ? value : fallback;
}

function buildSectionKeys(render: RenderPackage) {
  const keys: Array<SectionKey | "featured-treatments"> = [];

  if (render.resolvedSections.hero?.visible) {
    keys.push("hero");
  }

  if (render.resolvedSections.services?.visible) {
    keys.push("featured-treatments");
  }

  if (render.resolvedSections.about?.visible) {
    keys.push("about");
  }

  if (render.resolvedSections["why-choose-us"]?.visible) {
    keys.push("why-choose-us");
  }

  if (render.resolvedSections.process?.visible) {
    keys.push("process");
  }

  if (render.resolvedSections.gallery?.visible) {
    keys.push("gallery");
  }

  if (render.resolvedSections.faq?.visible) {
    keys.push("faq");
  }

  if (render.resolvedSections.contact?.visible) {
    keys.push("contact");
  }

  return keys;
}

export function buildMedSpaPreviewModel(
  render: RenderPackage
): MedSpaPreviewModel {
  return {
    businessName: readStringField(render, "businessName"),
    serviceAreaLabel: readStringField(render, "serviceAreaLabel"),
    primaryCtaLabel: readStringField(render, "primaryCtaLabel", "Book Consultation"),
    primaryCtaHref: readStringField(render, "primaryCtaHref", "#contact"),
    secondaryCtaLabel: readStringField(render, "secondaryCtaLabel", "View Treatments"),
    secondaryCtaHref: readStringField(render, "secondaryCtaHref", "#services"),
    sectionKeys: buildSectionKeys(render),
    hero: render.resolvedSections.hero,
    treatments: render.resolvedSections.services,
    about: render.resolvedSections.about,
    whyChooseUs: render.resolvedSections["why-choose-us"],
    process: render.resolvedSections.process,
    gallery: render.resolvedSections.gallery,
    faq: render.resolvedSections.faq,
    contact: render.resolvedSections.contact,
    contactDetails: {
      phone: readStringField(render, "primaryPhone") || undefined,
      email: readStringField(render, "contactEmail") || undefined,
    },
    heroImageSrc:
      render.resolvedVisuals.slots.find(
        (slot) => slot.slot === "hero" && slot.status === "rendered"
      )?.assetPath ?? null,
    status: render.status,
  };
}
