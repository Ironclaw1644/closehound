import type {
  RenderPackage,
  ResolvedSection,
  SectionKey,
} from "@/lib/template-system/types";

export type DentalPreviewIcon =
  | "tooth"
  | "shield-heart"
  | "calendar-check"
  | "clipboard-check"
  | "location-dot"
  | "envelope"
  | "phone"
  | "building"
  | "circle-question";

export type DentalPreviewModel = {
  businessName: string;
  serviceAreaLabel: string;
  sectionKeys: SectionKey[];
  hero: {
    badgeIcon: DentalPreviewIcon;
    badgeLabel: string;
    heading: string;
    body: string;
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta: {
      label: string;
      href: string;
    } | null;
    imageSrc: string | null;
  };
  featuredServices: Array<{
    title?: string;
    body: string;
    icon: DentalPreviewIcon;
  }>;
  about: {
    heading: string;
    body: string;
  } | null;
  whyChooseUs: {
    heading: string;
    items: Array<{
      title?: string;
      body: string;
      icon: DentalPreviewIcon;
    }>;
  } | null;
  process: {
    heading: string;
    items: Array<{
      title?: string;
      body: string;
      icon: DentalPreviewIcon;
    }>;
  } | null;
  gallery: {
    heading: string;
    body: string;
    cards: Array<{
      title: string;
      body: string;
      icon: DentalPreviewIcon;
    }>;
  } | null;
  faq: {
    heading: string;
    items: Array<{ question: string; answer: string }>;
  } | null;
  contact: {
    heading: string;
    body: string;
    cta: {
      label: string;
      href: string;
    } | null;
    phone?: string;
    email?: string;
  };
  status: RenderPackage["status"];
};

const featuredServiceIcons: DentalPreviewIcon[] = [
  "shield-heart",
  "tooth",
  "calendar-check",
];

const whyChooseUsIcons: DentalPreviewIcon[] = [
  "shield-heart",
  "clipboard-check",
  "building",
];

const processIcons: DentalPreviewIcon[] = [
  "calendar-check",
  "clipboard-check",
  "tooth",
];

function readStringField(render: RenderPackage, key: string, fallback = "") {
  const value = render.resolvedFields[key];

  return typeof value === "string" ? value : fallback;
}

function buildSectionKeys(render: RenderPackage) {
  return Object.entries(render.resolvedSections)
    .filter(([, section]) => section.visible)
    .map(([sectionKey]) => sectionKey as SectionKey);
}

function getVisibleItems(section: ResolvedSection | undefined) {
  return section?.items ?? [];
}

function buildContactHref(render: RenderPackage) {
  const action = render.resolvedSections.contact.cta?.action;
  const phone = readStringField(render, "primaryPhone");
  const primaryHref = readStringField(render, "primaryCtaHref", "#contact");

  if (action === "call" && phone !== "") {
    return `tel:${phone}`;
  }

  return primaryHref;
}

export function buildDentalPreviewModel(
  render: RenderPackage
): DentalPreviewModel {
  const primaryCta = {
    label: readStringField(render, "primaryCtaLabel", "Schedule Visit"),
    href: readStringField(render, "primaryCtaHref", "#contact"),
  };
  const secondaryCtaLabel = readStringField(
    render,
    "secondaryCtaLabel",
    "View Services"
  );
  const secondaryCtaHref = readStringField(render, "secondaryCtaHref", "#services");
  const contactCtaLabel =
    render.resolvedSections.contact.cta?.label ??
    readStringField(render, "primaryCtaLabel", "Schedule Visit");
  const contactCtaHref = buildContactHref(render);

  return {
    businessName: readStringField(render, "businessName"),
    serviceAreaLabel: readStringField(render, "serviceAreaLabel"),
    sectionKeys: buildSectionKeys(render),
    hero: {
      badgeIcon: "tooth",
      badgeLabel: "General dentistry",
      heading:
        render.resolvedSections.hero.heading ??
        "General dentistry with clear guidance and comfortable visits",
      body:
        render.resolvedSections.hero.body ??
        "Straightforward preventive and restorative care with a calm first step for new patients.",
      primaryCta,
      secondaryCta:
        secondaryCtaLabel !== "" && secondaryCtaHref !== ""
          ? {
              label: secondaryCtaLabel,
              href: secondaryCtaHref,
            }
          : null,
      imageSrc:
        render.resolvedVisuals.slots.find(
          (slot) => slot.slot === "hero" && slot.status === "rendered"
        )?.assetPath ?? null,
    },
    featuredServices: getVisibleItems(render.resolvedSections.services).map(
      (item, index) => ({
        title: item.title,
        body: item.body,
        icon: featuredServiceIcons[index % featuredServiceIcons.length],
      })
    ),
    about: render.resolvedSections.about.visible
      ? {
          heading: render.resolvedSections.about.heading ?? "",
          body: render.resolvedSections.about.body ?? "",
        }
      : null,
    whyChooseUs: render.resolvedSections["why-choose-us"].visible
      ? {
          heading: render.resolvedSections["why-choose-us"].heading ?? "",
          items: getVisibleItems(render.resolvedSections["why-choose-us"]).map(
            (item, index) => ({
              title: item.title,
              body: item.body,
              icon: whyChooseUsIcons[index % whyChooseUsIcons.length],
            })
          ),
        }
      : null,
    process: render.resolvedSections.process.visible
      ? {
          heading: render.resolvedSections.process.heading ?? "",
          items: getVisibleItems(render.resolvedSections.process).map((item, index) => ({
            title: item.title,
            body: item.body,
            icon: processIcons[index % processIcons.length],
          })),
        }
      : null,
    gallery: render.resolvedSections.gallery.visible
      ? {
          heading:
            render.resolvedSections.gallery.heading ??
            "A clean, modern office designed for comfortable visits",
          body: render.resolvedSections.gallery.body ?? "",
          cards: getVisibleItems(render.resolvedSections.gallery).map((item, index) => ({
            title: item.title ?? `Gallery ${index + 1}`,
            body: item.body,
            icon: processIcons[index % processIcons.length],
          })),
        }
      : null,
    faq: render.resolvedSections.faq.visible
      ? {
          heading: render.resolvedSections.faq.heading ?? "",
          items: render.resolvedSections.faq.faqItems ?? [],
        }
      : null,
    contact: {
      heading: render.resolvedSections.contact.heading ?? "Schedule your visit",
      body:
        render.resolvedSections.contact.body ??
        "Call or request an appointment to get a clear first step for preventive or restorative care.",
      cta:
        contactCtaLabel !== "" && contactCtaHref !== ""
          ? {
              label: contactCtaLabel,
              href: contactCtaHref,
            }
          : null,
      phone: readStringField(render, "primaryPhone") || undefined,
      email: readStringField(render, "contactEmail") || undefined,
    },
    status: render.status,
  };
}
