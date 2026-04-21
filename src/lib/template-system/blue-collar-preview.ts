import type { RenderPackage, SectionKey } from "@/lib/template-system/types";

export type BlueCollarPreviewIcon =
  | "truck-ramp-box"
  | "couch"
  | "warehouse"
  | "building"
  | "clipboard-check"
  | "phone"
  | "location-dot"
  | "circle-question";

type PreviewIconItem = {
  title?: string;
  body: string;
  icon: BlueCollarPreviewIcon;
  iconLabel: string;
};

export type BlueCollarPreviewModel = {
  businessName: string;
  sectionKeys: SectionKey[];
  hero: {
    heading: string;
    body: string;
    imageSrc: string | null;
    ctaLabel: string;
    badgeIcon: BlueCollarPreviewIcon;
    badgeLabel: string;
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
    items: PreviewIconItem[];
  };
  whyChooseUs: {
    heading: string;
    items: PreviewIconItem[];
  } | null;
  process: {
    heading: string;
    items: PreviewIconItem[];
  } | null;
  faq: {
    heading: string;
    icon: BlueCollarPreviewIcon;
    items: Array<{ question: string; answer: string }>;
  } | null;
  serviceArea: {
    heading: string;
    body: string;
    icon: BlueCollarPreviewIcon;
  } | null;
  contact: {
    heading: string;
    body: string;
    cta: {
      label: string;
      href: string;
    } | null;
    phoneIcon: BlueCollarPreviewIcon;
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

function withIcons(
  items: Array<{ title?: string; body: string }>,
  iconSet: Array<{ icon: BlueCollarPreviewIcon; iconLabel: string }>
): PreviewIconItem[] {
  return items.map((item, index) => ({
    ...item,
    icon: iconSet[index]?.icon ?? iconSet[iconSet.length - 1].icon,
    iconLabel:
      iconSet[index]?.iconLabel ?? iconSet[iconSet.length - 1].iconLabel,
  }));
}

function buildCanonicalTelHref(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 0) {
    return null;
  }

  const canonicalDigits =
    digits.length === 11 && digits.startsWith("1") ? digits : `1${digits}`;

  return `tel:+${canonicalDigits}`;
}

function normalizeHref(render: RenderPackage, href: string) {
  if (!href.startsWith("tel:")) {
    return href;
  }

  const phone = readStringField(render, "primaryPhone");

  return buildCanonicalTelHref(phone) ?? href;
}

function buildContactHref(render: RenderPackage) {
  const action = render.resolvedSections.contact.cta?.action;
  const primaryHref = readStringField(render, "primaryCtaHref", "#contact");

  if (action === "call" && primaryHref.startsWith("tel:")) {
    return normalizeHref(render, primaryHref);
  }

  return primaryHref;
}

export function buildBlueCollarPreviewModel(
  render: RenderPackage
): BlueCollarPreviewModel {
  const primaryCtaHref = normalizeHref(
    render,
    readStringField(render, "primaryCtaHref")
  );
  const primaryCta = {
    label: readStringField(render, "primaryCtaLabel"),
    href: primaryCtaHref,
  };
  const secondaryCtaLabel = readStringField(render, "secondaryCtaLabel");
  const secondaryCtaHref = readStringField(render, "secondaryCtaHref");
  const contactCtaLabel = render.resolvedSections.contact.cta?.label ?? "";
  const contactCtaHref = buildContactHref(render);

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
      badgeIcon: "truck-ramp-box",
      badgeLabel: "Local field crew",
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
      items: withIcons(render.resolvedSections.services.items ?? [], [
        { icon: "truck-ramp-box", iconLabel: "Fast dispatch" },
        { icon: "couch", iconLabel: "Scope by job" },
        { icon: "warehouse", iconLabel: "Property-ready crews" },
      ]),
    },
    whyChooseUs: render.resolvedSections["why-choose-us"].visible
      ? {
          heading: render.resolvedSections["why-choose-us"].heading ?? "",
          items: withIcons(render.resolvedSections["why-choose-us"].items ?? [], [
            { icon: "building", iconLabel: "Structured crew planning" },
            { icon: "clipboard-check", iconLabel: "Clear scope confirmation" },
            { icon: "phone", iconLabel: "Direct quote communication" },
          ]),
        }
      : null,
    process: render.resolvedSections.process.visible
      ? {
          heading: render.resolvedSections.process.heading ?? "",
          items: withIcons(render.resolvedSections.process.items ?? [], [
            { icon: "circle-question", iconLabel: "Review the job" },
            { icon: "clipboard-check", iconLabel: "Quote the scope" },
            { icon: "truck-ramp-box", iconLabel: "Work gets moving" },
          ]),
        }
      : null,
    faq: render.resolvedSections.faq.visible
      ? {
          heading: render.resolvedSections.faq.heading ?? "",
          icon: "circle-question",
          items: render.resolvedSections.faq.faqItems ?? [],
        }
      : null,
    serviceArea: render.resolvedSections["service-area"].visible
      ? {
          heading: render.resolvedSections["service-area"].heading ?? "",
          body: render.resolvedSections["service-area"].body ?? "",
          icon: "location-dot",
        }
      : null,
    contact: {
      heading: render.resolvedSections.contact.heading ?? "",
      body: render.resolvedSections.contact.body ?? "",
      cta:
        contactCtaLabel !== "" && contactCtaHref !== ""
          ? {
              label: contactCtaLabel,
              href: contactCtaHref,
            }
          : null,
      phoneIcon: "phone",
      phone: readStringField(render, "primaryPhone") || undefined,
      email: readStringField(render, "contactEmail") || undefined,
    },
    status: render.status,
  };
}
