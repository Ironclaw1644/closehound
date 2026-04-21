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
        heading: "Heating and cooling solutions you can trust",
        body: "{{businessName}} helps {{serviceAreaLabel}} homeowners diagnose comfort issues, plan repairs, and choose the right solution clearly and confidently.",
        cta: { label: "Request HVAC Service", action: "quote" },
      },
      services: {
        variantKey: "default",
        heading: "HVAC services for repair, replacement, and seasonal upkeep",
        items: [
          {
            title: "AC Repair",
            body: "We find the problem, explain what failed, and get your system working again.",
          },
          {
            title: "Heating Service",
            body: "Diagnose furnace and heating problems before they turn into no-heat calls.",
          },
          {
            title: "System Replacement",
            body: "Compare replacement options with a clear explanation of system fit, timing, and next steps.",
          },
        ],
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "What matters when you hire an HVAC company",
        items: [
          {
            title: "Straight diagnostics",
            body: "Explain the issue clearly before recommending bigger work.",
          },
          {
            title: "Comfort-focused service",
            body: "Restoring reliable comfort-every visit.",
          },
          {
            title: "Organized follow-through",
            body: "Keep scheduling, scope, and next steps easy to follow.",
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
            body: "Confirm timing, equipment plans, and the next step before the work begins.",
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
              "Yes. It helps to have one company that can inspect the full system and explain the next step clearly, whether the issue is heating or cooling.",
          },
        ],
      },
      "service-area": {
        variantKey: "regional-coverage",
        heading: "HVAC service in {{serviceAreaLabel}}",
        body: "{{businessName}} helps homeowners across {{serviceAreaLabel}} with heating service, air conditioning repair, and system replacement planning.",
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
