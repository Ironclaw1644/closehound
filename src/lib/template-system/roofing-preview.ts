import type { RenderPackage } from "@/lib/template-system/types";

export type RoofingPreviewModel = {
  businessName: string;
  hero: {
    heading: string;
    body: string;
    ctaLabel: string;
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
  contact: {
    heading: string;
    body: string;
    ctaLabel: string;
    phone?: string;
    email?: string;
  };
  status: RenderPackage["status"];
};

export function buildRoofingPreviewModel(
  render: RenderPackage
): RoofingPreviewModel {
  return {
    businessName: String(render.resolvedFields.businessName ?? ""),
    hero: {
      heading: render.resolvedSections.hero.heading ?? "",
      body: render.resolvedSections.hero.body ?? "",
      ctaLabel: render.resolvedSections.hero.cta?.label ?? "Request a Roofing Quote",
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
    contact: {
      heading: render.resolvedSections.contact.heading ?? "",
      body: render.resolvedSections.contact.body ?? "",
      ctaLabel:
        render.resolvedSections.contact.cta?.label ?? "Request a Roofing Quote",
      phone: render.resolvedFields.primaryPhone as string | undefined,
      email: render.resolvedFields.contactEmail as string | undefined,
    },
    status: render.status,
  };
}
