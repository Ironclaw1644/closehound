import type { NicheTemplate } from "@/lib/template-system/types";

export const HVAC_NICHE_TEMPLATE: NicheTemplate = {
  key: "hvac-v1",
  familyKey: "blue-collar-service",
  name: "HVAC",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "direct, comfort-focused, homeowner-trust",
    typography: {
      headingFamily: "var(--font-geist-sans)",
      bodyFamily: "var(--font-geist-sans)",
      sizingNotes: ["large hero headline", "clean service cards"],
    },
    palette: {
      base: ["#0f172a", "#f8fafc"],
      accents: ["#0f766e", "#f97316"],
      usageNotes: ["use orange for CTA emphasis", "keep HVAC layouts bright and grounded"],
    },
    layoutNotes: [
      "strong hero CTA",
      "comfort-language stays factual",
      "no proof bars without evidence",
    ],
  },
  vocabulary: {
    requiredTerms: ["air conditioning repair", "heating service", "system replacement", "maintenance"],
    preferredPhrases: ["restore comfort", "diagnose the issue", "keep the system running"],
    bannedPhrases: ["cutting-edge solutions", "passionate team"],
    disallowedProofClaims: ["24/7 emergency service", "top-rated in every neighborhood"],
  },
  seo: {
    metaTitleTemplate: "{{serviceAreaLabel}} HVAC Company | {{businessName}}",
    metaDescriptionTemplate:
      "{{businessName}} handles air conditioning repair, heating service, and HVAC replacement in {{serviceAreaLabel}}.",
    headingRules: ["mention HVAC service and geography in hero", "use homeowner comfort search language"],
    keywordTargets: ["air conditioning repair", "heating repair", "HVAC replacement", "seasonal maintenance"],
  },
  sections: {
    copy: {
      hero: {
        variantKey: "default",
        heading: "Heating and cooling service without the vague upsell",
        body: "{{businessName}} helps homeowners in {{serviceAreaLabel}} diagnose comfort problems, plan repairs, and compare replacement options with a clear next step.",
        cta: { label: "Request HVAC Service", action: "quote" },
      },
      services: {
        variantKey: "default",
        heading: "HVAC services for repair, replacement, and seasonal upkeep",
        items: [
          {
            title: "AC Repair",
            body: "Find the cooling issue, explain what failed, and restore performance without padding the scope.",
          },
          {
            title: "Heating Service",
            body: "Diagnose furnace and heating problems before they turn into no-heat calls.",
          },
          {
            title: "System Replacement",
            body: "Compare replacement paths with a clear explanation of system fit, timing, and next steps.",
          },
        ],
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "What homeowners want from an HVAC company",
        items: [
          {
            title: "Straight diagnostics",
            body: "Explain the issue clearly before jumping to replacement language.",
          },
          {
            title: "Comfort-focused service",
            body: "Keep the visit centered on restoring reliable heating or cooling.",
          },
          {
            title: "Organized follow-through",
            body: "Make scheduling, scope, and next steps easy to track.",
          },
        ],
      },
      process: {
        variantKey: "default",
        heading: "How service moves from diagnosis to resolution",
        items: [
          {
            title: "Inspect the system",
            body: "Start with the symptom, the equipment condition, and the likely failure point.",
          },
          {
            title: "Review the options",
            body: "Lay out repair or replacement paths in plain language.",
          },
          {
            title: "Schedule the work",
            body: "Confirm timing, equipment plan, and the next homeowner touchpoint.",
          },
        ],
      },
      faq: {
        variantKey: "default",
        heading: "HVAC questions homeowners ask before booking service",
        faqItems: [
          {
            question: "Should I repair or replace the system?",
            answer:
              "That depends on the age of the equipment, the nature of the failure, and whether repeated repairs are stacking up.",
          },
          {
            question: "Do you handle both heating and cooling service?",
            answer:
              "The template should support full-service positioning without inventing proof claims that the business has not supplied.",
          },
        ],
      },
      "service-area": {
        variantKey: "regional-coverage",
        heading: "HVAC service in {{serviceAreaLabel}}",
        body: "Use a regional coverage statement when hyperlocal proof is weak or incomplete.",
      },
      contact: {
        variantKey: "default",
        heading: "Talk through the comfort issue",
        body: "Call or request service to get the next step for air conditioning repair, heating service, or system replacement.",
        cta: { label: "Book HVAC Service", action: "quote" },
      },
    },
  },
  editableModel: {
    lockedFields: ["heroHeading", "sectionOrder", "claimPolicy"],
    editableFields: [
      "businessName",
      "serviceAreaLabel",
      "primaryPhone",
      "contactEmail",
      "services",
      "primaryCtaLabel",
      "primaryCtaHref",
    ],
    conditionalFields: [
      "emergencyService",
      "financing",
      "warrantyCopy",
      "certifications",
      "licensedAndInsured",
      "sampleTestimonials",
    ],
  },
};
