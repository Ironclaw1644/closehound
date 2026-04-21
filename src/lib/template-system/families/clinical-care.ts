import type { TemplateFamily } from "@/lib/template-system/types";

type ClinicalCareFamily = TemplateFamily & {
  sampleModePolicy: {
    allowedModes: Array<"strict" | "preview-safe" | "seed-only">;
    sectionBehaviorByMode: {
      strict: { testimonials: string; proofBar: string };
      "preview-safe": { testimonials: string; proofBar: string };
      "seed-only": { testimonials: string; proofBar: string };
    };
    claimBehaviorByMode: {
      strict: { requiresApprovedEvidence: boolean };
      "preview-safe": { requiresApprovedEvidence: boolean };
      "seed-only": { requiresApprovedEvidence: boolean };
    };
    visualBehaviorByMode: {
      strict: { approvedAssetsOnly: boolean };
      "preview-safe": { approvedAssetsOnly: boolean };
      "seed-only": { approvedAssetsOnly: boolean };
    };
  };
};

export const CLINICAL_CARE_FAMILY: ClinicalCareFamily = {
  key: "clinical-care",
  name: "Clinical Care",
  version: "1.0.0",
  schemaVersion: "1.0.0",
  sampleModePolicy: {
    allowedModes: ["strict", "preview-safe", "seed-only"],
    sectionBehaviorByMode: {
      strict: {
        testimonials: "hide-unapproved",
        proofBar: "hide-unapproved",
      },
      "preview-safe": {
        testimonials: "hide-unapproved",
        proofBar: "hide-unapproved",
      },
      "seed-only": {
        testimonials: "allow-seed-labeled",
        proofBar: "allow-seed-labeled",
      },
    },
    claimBehaviorByMode: {
      strict: { requiresApprovedEvidence: true },
      "preview-safe": { requiresApprovedEvidence: true },
      "seed-only": { requiresApprovedEvidence: false },
    },
    visualBehaviorByMode: {
      strict: { approvedAssetsOnly: true },
      "preview-safe": { approvedAssetsOnly: true },
      "seed-only": { approvedAssetsOnly: false },
    },
  },
  structure: {
    defaultSectionOrder: [
      "header",
      "hero",
      "services",
      "why-choose-us",
      "process",
      "gallery",
      "faq",
      "service-area",
      "contact",
      "footer",
    ],
    requiredSections: ["header", "hero", "services", "contact", "footer"],
    optionalSections: [
      "about",
      "why-choose-us",
      "process",
      "gallery",
      "testimonials",
      "faq",
      "service-area",
    ],
    sectionPolicies: {
      header: {
        key: "header",
        canHide: false,
        requiredFields: ["businessName", "primaryPhone"],
        optionalFields: [],
        fallbackBehavior: "use-template-copy",
      },
      hero: {
        key: "hero",
        canHide: false,
        requiredFields: ["businessName", "serviceAreaLabel", "primaryCtaLabel", "primaryCtaHref"],
        optionalFields: ["primaryPhone"],
        fallbackBehavior: "downgrade-to-safe-copy",
      },
      about: {
        key: "about",
        canHide: true,
        requiredFields: [],
        optionalFields: ["aboutBody"],
        fallbackBehavior: "omit",
      },
      services: {
        key: "services",
        canHide: false,
        requiredFields: ["services"],
        optionalFields: [],
        fallbackBehavior: "use-template-copy",
      },
      "why-choose-us": {
        key: "why-choose-us",
        canHide: true,
        requiredFields: [],
        optionalFields: ["licensedAndInsured", "warrantyCopy"],
        fallbackBehavior: "switch-variant",
        fallbackVariantKey: "process-heavy",
      },
      process: {
        key: "process",
        canHide: true,
        requiredFields: [],
        optionalFields: [],
        fallbackBehavior: "use-template-copy",
      },
      gallery: {
        key: "gallery",
        canHide: true,
        requiredFields: [],
        optionalFields: ["heroImage"],
        fallbackBehavior: "omit",
      },
      testimonials: {
        key: "testimonials",
        canHide: true,
        requiredFields: ["approvedTestimonials"],
        optionalFields: [],
        fallbackBehavior: "omit",
      },
      faq: {
        key: "faq",
        canHide: true,
        requiredFields: [],
        optionalFields: [],
        fallbackBehavior: "use-template-copy",
      },
      "service-area": {
        key: "service-area",
        canHide: true,
        requiredFields: ["serviceAreaLabel"],
        optionalFields: [],
        fallbackBehavior: "omit",
      },
      contact: {
        key: "contact",
        canHide: false,
        requiredFields: ["businessName", "primaryPhone", "primaryCtaLabel", "primaryCtaHref"],
        optionalFields: ["contactEmail"],
        fallbackBehavior: "use-template-copy",
      },
      footer: {
        key: "footer",
        canHide: false,
        requiredFields: ["businessName"],
        optionalFields: ["primaryPhone", "contactEmail"],
        fallbackBehavior: "use-template-copy",
      },
    },
  },
  resolverPolicy: {
    criticalFields: [
      "businessName",
      "primaryCtaLabel",
      "primaryCtaHref",
      "serviceAreaLabel",
      "services",
    ],
    nonCriticalFields: ["secondaryCtaLabel", "secondaryCtaHref", "primaryPhone", "contactEmail"],
  },
  conversionModel: {
    ctaStyle: "appointment-led",
    proofStyle: "clarity-heavy",
    contactPriority: ["hero", "services", "contact"],
    primaryGoal: "consult",
  },
  guardrails: {
    bannedPhrases: [
      "your smile journey",
      "state-of-the-art solutions",
      "healthy smiles for the whole family",
      "compassionate care",
    ],
    bannedClaimTypes: [
      "emergency-availability",
      "sedation",
      "insurance-acceptance",
      "specialist-positioning",
    ],
    visualGuardrails: [
      "no over-retouched smiles",
      "no text embedded in images",
      "people imagery must be culturally diverse",
    ],
    vocabularyRules: [
      "plainspoken dental language",
      "no cosmetic-glam defaults",
      "no corporate healthcare filler",
    ],
  },
  fieldPolicies: {},
  claimPolicies: {},
};
