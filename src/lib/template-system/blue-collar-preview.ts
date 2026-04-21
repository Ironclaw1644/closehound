import type { RenderPackage, SectionKey } from "@/lib/template-system/types";

export type BlueCollarPreviewModel = {
  businessName: string;
  sectionKeys: SectionKey[];
  hero: {
    heading: string;
    body: string;
    imageSrc: string | null;
    ctaLabel: string;
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta: {
      label: string;
      href: string;
    } | null;
  };
  services: {
    heading: string;
    items: Array<{ title?: string; body: string }>;
  };
  whyChooseUs: {
    heading: string;
    items: Array<{ title?: string; body: string }>;
  };
  process: {
    heading: string;
    items: Array<{ title?: string; body: string }>;
  };
  faq: {
    heading: string;
    items: Array<{ question: string; answer: string }>;
  };
  serviceArea: {
    heading: string;
    body: string;
  };
  contact: {
    heading: string;
    body: string;
    ctaLabel: string;
    phone?: string;
    email?: string;
  };
  status: RenderPackage["status"];
};

function readStringField(
  render: RenderPackage,
  key: string,
  fallback = ""
) {
  const value = render.resolvedFields[key];

  return typeof value === "string" ? value : fallback;
}

export function buildBlueCollarPreviewModel(
  render: RenderPackage
): BlueCollarPreviewModel {
  const primaryCta = {
    label: readStringField(render, "primaryCtaLabel"),
    href: readStringField(render, "primaryCtaHref"),
  };
  const secondaryCtaLabel = readStringField(render, "secondaryCtaLabel");
  const secondaryCtaHref = readStringField(render, "secondaryCtaHref");

  return {
    businessName: String(render.resolvedFields.businessName ?? ""),
    sectionKeys: Object.entries(render.resolvedSections)
      .filter(([, section]) => section.visible)
      .map(([sectionKey]) => sectionKey as SectionKey),
    hero: {
      heading: render.resolvedSections.hero.heading ?? "",
      body: render.resolvedSections.hero.body ?? "",
      imageSrc:
        render.resolvedVisuals.slots.find(
          (slot) => slot.slot === "hero" && slot.status === "rendered"
        )?.assetPath ?? null,
      ctaLabel: primaryCta.label,
      primaryCta,
      secondaryCta:
        secondaryCtaLabel !== "" && secondaryCtaHref !== ""
          ? {
              label: secondaryCtaLabel,
              href: secondaryCtaHref,
            }
          : null,
    },
    services: {
      heading: render.resolvedSections.services.heading ?? "",
      items: render.resolvedSections.services.items ?? [],
    },
    whyChooseUs: {
      heading: render.resolvedSections["why-choose-us"].heading ?? "",
      items: render.resolvedSections["why-choose-us"].items ?? [],
    },
    process: {
      heading: render.resolvedSections.process.heading ?? "",
      items: render.resolvedSections.process.items ?? [],
    },
    faq: {
      heading: render.resolvedSections.faq.heading ?? "",
      items: render.resolvedSections.faq.faqItems ?? [],
    },
    serviceArea: {
      heading: render.resolvedSections["service-area"].heading ?? "",
      body: render.resolvedSections["service-area"].body ?? "",
    },
    contact: {
      heading: render.resolvedSections.contact.heading ?? "",
      body: render.resolvedSections.contact.body ?? "",
      ctaLabel: render.resolvedSections.contact.cta?.label ?? "",
      phone: render.resolvedFields.primaryPhone as string | undefined,
      email: render.resolvedFields.contactEmail as string | undefined,
    },
    status: render.status,
  };
}
