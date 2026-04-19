import { REASON_CODES } from "@/lib/template-system/reason-codes";
import type {
  LeadRecord,
  NicheTemplate,
  RenderPackage,
  ResolvedSection,
  ResolvedVisualSlot,
  SampleMode,
  SeedBusiness,
  TemplateFamily,
} from "@/lib/template-system/types";

type ResolveTemplateRenderInput = {
  family: TemplateFamily;
  template: NicheTemplate;
  seed: SeedBusiness;
  lead?: LeadRecord;
  sampleMode: SampleMode;
};

function readBusinessField(
  seed: SeedBusiness,
  lead: LeadRecord | undefined,
  key: string
) {
  const leadValue = lead?.normalizedFields[key];

  if (leadValue !== undefined && leadValue !== null && leadValue !== "") {
    return leadValue;
  }

  return seed.businessProfile[key];
}

function buildSection(section: ResolvedSection): ResolvedSection {
  return section;
}

export function resolveTemplateRender({
  family,
  template,
  seed,
  lead,
  sampleMode,
}: ResolveTemplateRenderInput): RenderPackage {
  const businessName = String(readBusinessField(seed, lead, "businessName") ?? "");
  const serviceAreaLabel = String(
    readBusinessField(seed, lead, "serviceAreaLabel") ?? ""
  );
  const primaryCtaLabel = String(
    readBusinessField(seed, lead, "primaryCtaLabel") ?? ""
  );
  const primaryCtaHref = String(readBusinessField(seed, lead, "primaryCtaHref") ?? "");
  const services = Array.isArray(readBusinessField(seed, lead, "services"))
    ? (readBusinessField(seed, lead, "services") as string[])
    : [];

  const missingCriticalFields = family.resolverPolicy.criticalFields.filter((field) => {
    if (field === "services") {
      return services.length === 0;
    }

    const value =
      {
        businessName,
        serviceAreaLabel,
        primaryCtaLabel,
        primaryCtaHref,
      }[field as "businessName" | "serviceAreaLabel" | "primaryCtaLabel" | "primaryCtaHref"] ??
      readBusinessField(seed, lead, field);

    return value === undefined || value === null || value === "";
  });

  const testimonialsProof = seed.conditionalProof.sampleTestimonials;
  const testimonialsVisible =
    sampleMode !== "strict" &&
    testimonialsProof?.approvalStatus === "approved" &&
    testimonialsProof.sample === true;

  const resolvedSections = {
    header: buildSection({
      key: "header",
      variantKey: "default",
      visible: true,
      heading: businessName,
    }),
    hero: buildSection({
      key: "hero",
      variantKey: template.sections.copy.hero?.variantKey ?? "default",
      visible: true,
      heading: template.sections.copy.hero?.heading?.replace(
        "{{businessName}}",
        businessName
      ),
      body: template.sections.copy.hero?.body
        ?.replace("{{businessName}}", businessName)
        .replace("{{serviceAreaLabel}}", serviceAreaLabel),
      cta: {
        label: primaryCtaLabel,
        action: "quote",
      },
    }),
    about: buildSection({
      key: "about",
      variantKey: "default",
      visible: false,
      resolutionNotes: ["Not used in v1 roofing path"],
    }),
    services: buildSection({
      key: "services",
      variantKey: "default",
      visible: true,
      heading: template.sections.copy.services?.heading,
      items: template.sections.copy.services?.items,
    }),
    "why-choose-us": buildSection({
      key: "why-choose-us",
      variantKey: "process-heavy",
      visible: true,
      heading: template.sections.copy["why-choose-us"]?.heading,
      items: template.sections.copy["why-choose-us"]?.items,
    }),
    process: buildSection({
      key: "process",
      variantKey: "default",
      visible: true,
      heading: template.sections.copy.process?.heading,
      items: template.sections.copy.process?.items,
    }),
    gallery: buildSection({
      key: "gallery",
      variantKey: "default",
      visible: false,
      resolutionNotes: ["No approved assets available for v1"],
    }),
    testimonials: buildSection({
      key: "testimonials",
      variantKey: "default",
      visible: testimonialsVisible,
      resolutionNotes: testimonialsVisible
        ? []
        : ["Suppressed pending testimonial proof"],
    }),
    faq: buildSection({
      key: "faq",
      variantKey: "default",
      visible: true,
      heading: template.sections.copy.faq?.heading,
      faqItems: template.sections.copy.faq?.faqItems,
    }),
    "service-area": buildSection({
      key: "service-area",
      variantKey: "regional-coverage",
      visible: true,
      heading: template.sections.copy["service-area"]?.heading?.replace(
        "{{serviceAreaLabel}}",
        serviceAreaLabel
      ),
      body: template.sections.copy["service-area"]?.body?.replace(
        "{{serviceAreaLabel}}",
        serviceAreaLabel
      ),
    }),
    contact: buildSection({
      key: "contact",
      variantKey: "default",
      visible: true,
      heading: template.sections.copy.contact?.heading,
      body: template.sections.copy.contact?.body,
      cta: {
        label: primaryCtaLabel,
        action: "quote",
      },
    }),
    footer: buildSection({
      key: "footer",
      variantKey: "default",
      visible: true,
      heading: businessName,
    }),
  } satisfies RenderPackage["resolvedSections"];

  const visualSlots: ResolvedVisualSlot[] = [
    {
      key: "roofing-hero",
      slot: "hero",
      status: "omitted",
      reasonCode: REASON_CODES.MISSING_APPROVED_ASSET,
    },
  ];

  return {
    schemaVersion: family.schemaVersion,
    templateKey: template.key,
    familyKey: family.key,
    sampleMode,
    resolvedFields: {
      businessName,
      serviceAreaLabel,
      primaryCtaLabel,
      primaryCtaHref,
      services,
    },
    resolvedSections,
    resolvedSeo: {
      title: template.seo.metaTitleTemplate
        .replace("{{serviceAreaLabel}}", serviceAreaLabel)
        .replace("{{businessName}}", businessName),
      description: template.seo.metaDescriptionTemplate
        .replace("{{businessName}}", businessName)
        .replace("{{serviceAreaLabel}}", serviceAreaLabel),
    },
    resolvedVisuals: {
      strategy: {
        tone: template.canonicalStyle.tone,
        realismRules: [
          "documentary/commercial feel",
          "no fake logos",
          "no embedded text",
        ],
        shotCategories: ["hero", "detail", "crew"],
        cropRules: {
          hero: "16:9 safe center crop",
          card: "4:3 safe center crop",
          gallery: "1:1 safe center crop",
        },
        priorities: ["hero", "detail", "crew"],
        assetApprovalRequired: true,
      },
      slots: visualSlots,
    },
    status: {
      isPreviewSafe: missingCriticalFields.length === 0,
      hasSuppressedClaims: !testimonialsVisible,
      hasFallbackSections: true,
      missingCriticalFields,
    },
    overrideAudit: {
      accepted: [],
      rejected: [],
      fallbacks: missingCriticalFields.map((field) => ({
        field,
        strategy: "missing-critical-field",
        reasonCode: REASON_CODES.MISSING_CRITICAL_FIELD,
      })),
      suppressed: testimonialsVisible
        ? []
        : [
            {
              field: "sampleTestimonials",
              reasonCode: REASON_CODES.MISSING_EVIDENCE,
              reason:
                "Pending seed testimonial proof is not allowed in strict mode.",
            },
          ],
    },
    sectionAudit: {
      decisions: [
        {
          section: "testimonials",
          action: "hidden",
          reasonCode: REASON_CODES.MISSING_EVIDENCE,
          note: "Pending testimonial proof suppressed in strict mode.",
        },
        {
          section: "gallery",
          action: "hidden",
          reasonCode: REASON_CODES.MISSING_APPROVED_ASSET,
          note: "No approved roofing assets available yet.",
        },
      ],
    },
  };
}
