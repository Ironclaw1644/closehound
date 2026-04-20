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
  approvedImageCandidates?: Record<
    string,
    {
      id: string;
      slot: string;
      status: "approved";
      storagePath: string;
      assetUrl?: string | null;
      cropNotes?: string;
    }
  >;
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

function toServiceItems(
  services: string[],
  fallbackItems: ResolvedSection["items"],
  variantKey?: string
) {
  if (variantKey === "grouped" && fallbackItems?.length) {
    return fallbackItems;
  }

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

function collectStrictProofSuppressions({
  template,
  seed,
  sampleMode,
}: Pick<ResolveTemplateRenderInput, "template" | "seed" | "sampleMode">) {
  const suppressed: RenderPackage["overrideAudit"]["suppressed"] = [];
  const seedProofFields = Object.keys(seed.conditionalProof);
  const proofFields = [
    ...template.editableModel.conditionalFields,
    ...seedProofFields.filter((field) => !template.editableModel.conditionalFields.includes(field)),
  ];
  const missingProofReason =
    sampleMode === "strict"
      ? "is not approved for strict rendering."
      : "is not approved for this render path.";

  for (const field of proofFields) {
    const proof = seed.conditionalProof[field];

    if (!proof) {
      suppressed.push({
        field,
        reasonCode: REASON_CODES.MISSING_EVIDENCE,
        reason: `${field} ${missingProofReason}`,
      });

      continue;
    }

    if (proof.approvalStatus !== "approved" || proof.sample) {
      const reason =
        proof.sample && sampleMode !== "strict"
          ? `${field} is a sample proof and is not approved for this render path.`
          : `${field} ${missingProofReason}`;

      suppressed.push({
        field,
        reasonCode: REASON_CODES.MISSING_EVIDENCE,
        reason,
      });
    }
  }

  return suppressed;
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
  approvedImageCandidates,
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
  const secondaryCtaLabel = String(
    readBusinessField(seed, lead, "secondaryCtaLabel") ?? ""
  );
  const secondaryCtaHref = String(
    readBusinessField(seed, lead, "secondaryCtaHref") ?? ""
  );
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

  let testimonialSuppressionNote =
    "Testimonial proof is not approved for this render path.";

  if (!testimonialsApproved && sampleMode === "strict") {
    testimonialSuppressionNote =
      "Pending testimonial proof suppressed in strict mode.";
  } else if (testimonialsApproved && testimonialsAreSample && sampleMode === "strict") {
    testimonialSuppressionNote =
      "Sample testimonial proof suppressed in strict mode.";
  } else if (testimonialsApproved && testimonialsAreSample) {
    testimonialSuppressionNote =
      "Sample testimonial proof is not approved for this render path.";
  }

  const suppressedAudit = collectStrictProofSuppressions({
    template,
    seed,
    sampleMode,
  });

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
      resolutionNotes: ["Not used in this render path."],
    }),
    services: buildSection({
      key: "services",
      variantKey: template.sections.copy.services?.variantKey ?? "default",
      visible: true,
      heading: template.sections.copy.services?.heading,
      items: toServiceItems(
        services,
        template.sections.copy.services?.items,
        template.sections.copy.services?.variantKey
      ),
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
      resolutionNotes: ["No approved assets available for this render path."],
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

  const heroApproved = approvedImageCandidates?.hero;
  const visualSlots: ResolvedVisualSlot[] = heroApproved
    ? [
        {
          key: "hero-visual",
          slot: "hero",
          status: "rendered",
          source: "approved-generated",
          assetPath: heroApproved.assetUrl ?? heroApproved.storagePath,
          cropNotes: heroApproved.cropNotes,
        },
      ]
    : [
        {
          key: "hero-visual",
          slot: "hero",
          status: "omitted",
          reasonCode: REASON_CODES.MISSING_APPROVED_ASSET,
        },
      ];

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
        action: affectedSection === "hero" ? "downgraded" : "hidden",
        reasonCode: slot.reasonCode ?? REASON_CODES.MISSING_APPROVED_ASSET,
        note: "No approved assets available for this render path.",
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
      secondaryCtaLabel,
      secondaryCtaHref,
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
