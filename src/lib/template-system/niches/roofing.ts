import type { NicheTemplate } from "@/lib/template-system/types";

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
        heading: "Roofing work that protects your home and keeps the job moving",
        body: "From active leaks to full roof replacement planning, {{businessName}} helps {{serviceAreaLabel}} homeowners understand the problem, the scope, and the next step.",
        cta: { label: "Request a Roofing Quote", action: "quote" },
      },
      services: {
        variantKey: "default",
        heading: "Roofing services for repairs, replacement, and inspections",
        items: [
          { title: "Roof Repair", body: "Track down leaks, replace damaged shingles, and stabilize problem areas before they spread." },
          { title: "Roof Replacement", body: "Replace your roof with confidence: clear options, honest pricing, and communication every step of the way." },
          { title: "Roof Inspection", body: "Inspect storm damage, aging roof sections, and active issues before deciding on repair versus replacement." },
        ],
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "What matters when you hire a roofing company",
        items: [
          { title: "Clear scope", body: "Clear answers. Honest priorities. No confusion." },
          { title: "Easy scheduling", body: "Fast scheduling, clear time windows, and crews that show up when promised." },
          { title: "Organized communication", body: "Clear timelines, steady communication, and no surprises." },
        ],
      },
      process: {
        variantKey: "default",
        heading: "How the job moves from inspection to completion",
        items: [
          { title: "Inspect the roof", body: "Start with the visible problem areas and the likely source of the issue." },
          { title: "Review the scope", body: "Lay out repair and replacement options in a way that is easy to compare." },
          { title: "Schedule the work", body: "Confirm timing, materials, and the next step before the work begins." },
        ],
      },
      faq: {
        variantKey: "default",
        heading: "Roofing questions homeowners ask before hiring",
        faqItems: [
          { question: "Do I need repair or replacement?", answer: "That depends on the age of the roof, the spread of damage, and whether the issue is isolated or systemic." },
          { question: "Do you handle storm-related roof issues?", answer: "Yes. After wind, hail, or sudden leaks, the first step is figuring out whether the damage is limited to one area or part of a larger roofing issue." },
        ],
      },
      "service-area": {
        variantKey: "regional-coverage",
        heading: "Roofing service in {{serviceAreaLabel}}",
        body: "{{businessName}} works with homeowners across {{serviceAreaLabel}} on roof repair, roof replacement, and inspection work.",
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
