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

function buildResolvedCta(
  primaryCtaLabel: string,
  primaryCtaHref: string
): ResolvedSection["cta"] {
  if (primaryCtaLabel === "" || primaryCtaHref === "") {
    return undefined;
  }

  return {
    label: primaryCtaLabel,
    action: "quote",
  };
}

function toServiceItems(services: string[], fallbackItems: ResolvedSection["items"]) {
  if (services.length === 0) {
    return fallbackItems;
  }

  return services.map((service, index) => ({
    title: service,
    body:
      fallbackItems?.[index]?.body ??
      `Details for ${service} should be supplied by the resolved business data.`,
  }));
}

function assertResolverCompatibility({
  family,
  template,
  seed,
}: Pick<ResolveTemplateRenderInput, "family" | "template" | "seed">) {
  if (template.familyKey !== family.key) {
    throw new Error(
      `Template family mismatch: template family "${template.familyKey}" does not match family "${family.key}".`
    );
  }

  if (template.expectedSchemaVersion !== family.schemaVersion) {
    throw new Error(
      `Template schema version mismatch: template expects "${template.expectedSchemaVersion}" but family provides "${family.schemaVersion}".`
    );
  }

  if (seed.nicheTemplateKey !== template.key) {
    throw new Error(
      `Seed niche template mismatch: seed template "${seed.nicheTemplateKey}" does not match template "${template.key}".`
    );
  }
}

export function resolveTemplateRender({
  family,
  template,
  seed,
  lead,
  sampleMode,
}: ResolveTemplateRenderInput): RenderPackage {
  assertResolverCompatibility({ family, template, seed });

  const businessName = String(readBusinessField(seed, lead, "businessName") ?? "");
  const serviceAreaLabel = String(
    readBusinessField(seed, lead, "serviceAreaLabel") ?? ""
  );
  const primaryCtaLabel = String(
    readBusinessField(seed, lead, "primaryCtaLabel") ?? ""
  );
  const primaryCtaHref = String(readBusinessField(seed, lead, "primaryCtaHref") ?? "");
  const primaryPhone = String(readBusinessField(seed, lead, "primaryPhone") ?? "");
  const contactEmail = String(readBusinessField(seed, lead, "contactEmail") ?? "");
  const services = Array.isArray(readBusinessField(seed, lead, "services"))
    ? (readBusinessField(seed, lead, "services") as string[])
    : [];
  const resolvedPrimaryCta = buildResolvedCta(primaryCtaLabel, primaryCtaHref);

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
  const testimonialsApproved = testimonialsProof?.approvalStatus === "approved";
  const testimonialsAreSample = testimonialsProof?.sample === true;
  const testimonialsVisible = testimonialsApproved && !testimonialsAreSample;

  let testimonialSuppressionReason =
    "Testimonial proof is not approved for rendering in this mode.";
  let testimonialSuppressionNote =
    "Testimonial proof is not approved for this render path.";

  if (!testimonialsApproved && sampleMode === "strict") {
    testimonialSuppressionReason =
      "Pending seed testimonial proof is not allowed in strict mode.";
    testimonialSuppressionNote =
      "Pending testimonial proof suppressed in strict mode.";
  } else if (testimonialsApproved && testimonialsAreSample && sampleMode === "strict") {
    testimonialSuppressionReason =
      "Approved sample testimonial proof is not allowed in strict mode.";
    testimonialSuppressionNote =
      "Sample testimonial proof suppressed in strict mode.";
  } else if (testimonialsApproved && testimonialsAreSample) {
    testimonialSuppressionReason =
      "Approved sample testimonial proof requires explicit labeling support before rendering.";
    testimonialSuppressionNote =
      "Sample testimonial proof is not approved for this render path.";
  }

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
      cta: resolvedPrimaryCta,
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
      items: toServiceItems(services, template.sections.copy.services?.items),
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
      resolutionNotes: testimonialsVisible ? [] : [testimonialSuppressionNote],
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
      cta: resolvedPrimaryCta,
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

  const suppressedAudit = !testimonialsVisible
    ? [
        {
          field: "sampleTestimonials",
          reasonCode: REASON_CODES.MISSING_EVIDENCE,
          reason: testimonialSuppressionReason,
        },
      ]
    : [];

  const sectionAuditDecisions: RenderPackage["sectionAudit"]["decisions"] = [];

  if (!testimonialsVisible) {
    sectionAuditDecisions.push({
      section: "testimonials",
      action: "hidden",
      reasonCode: REASON_CODES.MISSING_EVIDENCE,
      note: testimonialSuppressionNote,
    });
  }

  visualSlots
    .filter((slot) => slot.status === "omitted")
    .forEach((slot) => {
      const affectedSection =
        slot.slot === "hero" || slot.slot === "gallery" ? slot.slot : "gallery";

      sectionAuditDecisions.push({
        section: affectedSection,
        action: "hidden",
        reasonCode: slot.reasonCode ?? REASON_CODES.MISSING_APPROVED_ASSET,
        note: "No approved roofing assets available yet.",
      });
    });

  const hasFallbackSections = sectionAuditDecisions.some((decision) =>
    ["hidden", "switched-variant", "downgraded"].includes(decision.action)
  );

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
      primaryPhone,
      contactEmail,
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
      hasSuppressedClaims: suppressedAudit.length > 0,
      hasFallbackSections,
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
      suppressed: suppressedAudit,
    },
    sectionAudit: {
      decisions: sectionAuditDecisions,
    },
  };
}
