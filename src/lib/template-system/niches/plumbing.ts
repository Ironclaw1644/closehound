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
        heading: "Plumbing help for urgent repairs and new installations",
        body:
          "{{businessName}} helps {{serviceAreaLabel}} homeowners handle leaks, clogs, water heater issues, and plumbing upgrades with clear recommendations and a practical next step.",
        cta: { label: "Call Now", action: "call" },
      },
      services: {
        variantKey: "grouped",
        heading: "Plumbing services for repairs and installations",
        items: [
          {
            title: "Immediate Needs",
            body: "Leaking lines, backed-up drains, running fixtures, and other active plumbing problems that need a fast diagnosis.",
          },
          {
            title: "Upgrades & Installations",
            body: "Water heater replacements, fixture installs, and pipe upgrades for your home.",
          },
        ],
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "What matters when you hire a plumbing company",
        items: [
          {
            title: "Fast diagnosis",
            body: "Clear diagnosis before any repair or replacement recommendations.",
          },
          {
            title: "Clear scope",
            body: "Know what needs fixing now and what can be handled later.",
          },
          {
            title: "Organized follow-through",
            body: "Keep the next step, estimate, and scheduling process easy to follow.",
          },
        ],
      },
      process: {
        variantKey: "default",
        heading: "How plumbing work moves from problem to plan",
        items: [
          {
            title: "Inspect the issue",
            body: "We look at what you're seeing, what's causing it, and where the problem is.",
          },
          {
            title: "Explain the scope",
            body: "Lay out repair or installation options in plain language.",
          },
          {
            title: "Confirm the next step",
            body: "Move into service or estimate scheduling with a clear next step.",
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
              "If water is actively leaking, a fixture will not shut off, or a drain is backing up into the home, it makes sense to call right away so the problem can be diagnosed before it spreads.",
          },
          {
            question: "Do you provide estimates for larger plumbing work?",
            answer:
              "Yes. Larger plumbing work usually starts with a walkthrough of the scope, the access points, and the best next step for the home.",
          },
        ],
      },
      "service-area": {
        variantKey: "regional-coverage",
        heading: "Plumbing service in {{serviceAreaLabel}}",
        body: "{{businessName}} handles residential plumbing calls and estimate-based work throughout {{serviceAreaLabel}}.",
      },
      contact: {
        variantKey: "dual-cta",
        heading: "Call now or request a plumbing estimate",
        body: "Call for active plumbing issues or request an estimate for larger residential work.",
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
