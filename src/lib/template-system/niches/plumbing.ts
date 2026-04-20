import type { NicheTemplate } from "@/lib/template-system/types";

export const PLUMBING_NICHE_TEMPLATE: NicheTemplate = {
  key: "plumbing-v1",
  familyKey: "blue-collar-service",
  name: "Plumbing",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "urgent-first, homeowner-trust, scope-clear",
    typography: {
      headingFamily: "var(--font-geist-sans)",
      bodyFamily: "var(--font-geist-sans)",
      sizingNotes: ["large repair-first hero", "grouped services stay scannable"],
    },
    palette: {
      base: ["#0f172a", "#f8fafc"],
      accents: ["#0369a1", "#ea580c"],
      usageNotes: ["use blue as the stabilizing base", "reserve orange for calls to action"],
    },
    layoutNotes: [
      "hero should support urgent repair and planned work",
      "call-first CTA posture without fake emergency proof",
      "group services into immediate and planned categories",
    ],
  },
  vocabulary: {
    requiredTerms: ["plumbing repair", "clogged drain", "water heater", "leak"],
    preferredPhrases: ["diagnose the issue", "clear next step", "repair-first response"],
    bannedPhrases: ["24/7 emergency response", "trusted by the whole city"],
    disallowedProofClaims: [
      "same-day service guaranteed",
      "licensed and insured",
      "lifetime warranty on every job",
    ],
  },
  seo: {
    metaTitleTemplate: "{{serviceAreaLabel}} Plumbing Company | {{businessName}}",
    metaDescriptionTemplate:
      "{{businessName}} handles plumbing repair, drain issues, water heater work, and residential plumbing estimates in {{serviceAreaLabel}}.",
    headingRules: [
      "mention plumbing service and geography in hero",
      "support both urgent repair and estimate-driven work",
    ],
    keywordTargets: [
      "plumbing repair",
      "plumber near me",
      "water heater repair",
      "residential plumbing",
    ],
  },
  sections: {
    copy: {
      hero: {
        variantKey: "urgent-first",
        heading: "Plumbing help for active issues and planned work",
        body:
          "{{businessName}} helps homeowners in {{serviceAreaLabel}} handle leaks, clogs, water-heater trouble, and larger plumbing work with a clear next step instead of vague urgency language.",
        cta: { label: "Call Now", action: "call" },
      },
      services: {
        variantKey: "grouped",
        heading: "Plumbing services for immediate problems and planned work",
        items: [
          {
            title: "Immediate Needs",
            body: "Leaking lines, backed-up drains, running fixtures, and other active plumbing problems that need a fast diagnosis.",
          },
          {
            title: "Planned Work / Installations",
            body: "Water-heater replacements, fixture installs, line updates, and scope-based residential plumbing work.",
          },
        ],
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "What homeowners want from a plumbing company",
        items: [
          {
            title: "Fast diagnosis",
            body: "Explain the problem before turning every visit into a replacement pitch.",
          },
          {
            title: "Clear scope",
            body: "Make it obvious what needs attention now and what can be planned.",
          },
          {
            title: "Organized follow-through",
            body: "Keep the next step, estimate, and scheduling process easy to understand.",
          },
        ],
      },
      process: {
        variantKey: "default",
        heading: "How plumbing work moves from problem to plan",
        items: [
          {
            title: "Inspect the issue",
            body: "Start with the visible symptom, likely cause, and access point.",
          },
          {
            title: "Explain the scope",
            body: "Lay out repair or installation options in plain language.",
          },
          {
            title: "Confirm the next step",
            body: "Move into service or estimate scheduling without vague promises.",
          },
        ],
      },
      faq: {
        variantKey: "mixed-intent",
        heading: "Plumbing questions homeowners ask before booking",
        faqItems: [
          {
            question: "Should I call for this leak right away?",
            answer:
              "The template should support active-issue urgency without inventing emergency or same-day claims.",
          },
          {
            question: "Do you provide estimates for larger plumbing work?",
            answer:
              "Yes. The page should support estimate-driven residential plumbing without weakening the call-first posture.",
          },
        ],
      },
      "service-area": {
        variantKey: "regional-coverage",
        heading: "Plumbing service in {{serviceAreaLabel}}",
        body: "Use a regional coverage statement when hyperlocal proof is limited or unverified.",
      },
      contact: {
        variantKey: "dual-cta",
        heading: "Call now or request a plumbing estimate",
        body: "Use the direct call path for active plumbing issues or request an estimate for larger residential work.",
        cta: { label: "Call Now", action: "call" },
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
      "secondaryCtaLabel",
      "secondaryCtaHref",
    ],
    conditionalFields: [
      "sameDayService",
      "emergencyAvailability",
      "licensedAndInsured",
      "warrantyCopy",
      "financing",
      "sampleTestimonials",
    ],
  },
};
