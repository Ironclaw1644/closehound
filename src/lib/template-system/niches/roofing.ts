import type { NicheTemplate, SeedBusiness } from "@/lib/template-system/types";

export const ROOFING_NICHE_TEMPLATE: NicheTemplate = {
  key: "roofing-v1",
  familyKey: "blue-collar-service",
  name: "Roofing",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "direct, high-trust, homeowner-focused",
    typography: {
      headingFamily: "var(--font-geist-sans)",
      bodyFamily: "var(--font-geist-sans)",
      sizingNotes: ["large hero headline", "compact service cards"],
    },
    palette: {
      base: ["#111827", "#f8fafc"],
      accents: ["#b91c1c", "#f59e0b"],
      usageNotes: ["use red sparingly for CTA emphasis", "keep backgrounds bright and practical"],
    },
    layoutNotes: ["prominent hero CTA", "trust panel above the fold", "roofing proof modules stay factual"],
  },
  vocabulary: {
    requiredTerms: ["roof repair", "roof replacement", "storm damage", "inspection"],
    preferredPhrases: ["straight answers", "clear scope", "protect the home"],
    bannedPhrases: ["transform your vision into reality", "passionate team"],
    disallowedProofClaims: ["best roofer in town", "thousands of five-star reviews"],
  },
  seo: {
    metaTitleTemplate: "{{serviceAreaLabel}} Roofing Company | {{businessName}}",
    metaDescriptionTemplate: "{{businessName}} handles roof repair, roof replacement, and inspections in {{serviceAreaLabel}}.",
    headingRules: ["mention roofing service and geography in hero", "use homeowner search language"],
    keywordTargets: ["roof repair", "roof replacement", "roof inspection", "storm damage roofing"],
  },
  sections: {
    copy: {
      hero: {
        variantKey: "default",
        heading: "Roofing work that protects the home and the timeline",
        body: "From active leaks to full replacement planning, {{businessName}} gives homeowners in {{serviceAreaLabel}} a clear next step without vague promises or inflated claims.",
        cta: { label: "Request a Roofing Quote", action: "quote" },
      },
      services: {
        variantKey: "default",
        heading: "Roofing services for repairs, replacement, and inspections",
        items: [
          { title: "Roof Repair", body: "Track down leaks, replace damaged shingles, and stabilize problem areas before they spread." },
          { title: "Roof Replacement", body: "Replace worn roofing systems with a clear scope, material options, and homeowner-focused communication." },
          { title: "Roof Inspection", body: "Inspect storm damage, aging roof sections, and active issues before deciding on repair versus replacement." },
        ],
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "What homeowners want from a roofing company",
        items: [
          { title: "Clear scope", body: "Explain the problem in plain language and show what needs to be repaired now." },
          { title: "Responsive scheduling", body: "Keep the process moving when the roof issue is urgent." },
          { title: "Organized communication", body: "Make replacement and repair work feel predictable instead of chaotic." },
        ],
      },
      process: {
        variantKey: "default",
        heading: "How the job moves from inspection to completion",
        items: [
          { title: "Inspect the roof", body: "Start with the visible problem areas and the likely source of the issue." },
          { title: "Review the scope", body: "Lay out repair or replacement options in a way the homeowner can actually compare." },
          { title: "Schedule the work", body: "Confirm timing, material plan, and the next homeowner touchpoint." },
        ],
      },
      faq: {
        variantKey: "default",
        heading: "Roofing questions homeowners ask before hiring",
        faqItems: [
          { question: "Do I need repair or replacement?", answer: "That depends on the age of the roof, the spread of damage, and whether the issue is isolated or systemic." },
          { question: "Do you handle storm-related roof issues?", answer: "The template should support storm-damage positioning without inventing insurance or claim language." },
        ],
      },
      "service-area": {
        variantKey: "regional-coverage",
        heading: "Roofing service in {{serviceAreaLabel}}",
        body: "Use a regional coverage statement when city-level proof is weak or incomplete.",
      },
      contact: {
        variantKey: "default",
        heading: "Talk through the roofing issue",
        body: "Call or request a quote to get the next step for roof repair, roof replacement, or inspection work.",
        cta: { label: "Get a Roofing Estimate", action: "quote" },
      },
    },
  },
  editableModel: {
    lockedFields: ["heroHeading", "sectionOrder", "claimPolicy"],
    editableFields: ["businessName", "serviceAreaLabel", "primaryPhone", "contactEmail", "services", "primaryCtaLabel", "primaryCtaHref"],
    conditionalFields: ["licensedAndInsured", "warrantyCopy", "sampleTestimonials"],
  },
};

export const ROOFING_SEED_BUSINESS: SeedBusiness = {
  key: "summit-peak-roofing-columbus",
  nicheTemplateKey: "roofing-v1",
  businessProfile: {
    businessName: "Summit Peak Roofing",
    serviceAreaLabel: "Columbus, OH",
    primaryPhone: "(614) 555-0184",
    contactEmail: "office@summitpeakroofing.com",
    primaryCtaLabel: "Request a Roofing Quote",
    primaryCtaHref: "#contact",
    services: ["Roof Repair", "Roof Replacement", "Roof Inspection"],
  },
  conditionalProof: {
    sampleTestimonials: {
      kind: "testimonial-list",
      value: 0,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: true,
    },
  },
};
