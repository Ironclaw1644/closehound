import type { NicheTemplate } from "@/lib/template-system/types";

export const JUNK_REMOVAL_NICHE_TEMPLATE: NicheTemplate = {
  key: "junk-removal-v1",
  familyKey: "blue-collar-service",
  name: "Junk Removal",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "operational, fast-moving, quote-led",
    typography: {
      headingFamily: "var(--font-geist-sans)",
      bodyFamily: "var(--font-geist-sans)",
      sizingNotes: ["high-clarity hero", "group job types instead of item lists"],
    },
    palette: {
      base: ["#111827", "#f8fafc"],
      accents: ["#0f766e", "#f59e0b"],
      usageNotes: ["keep the layout bright and practical", "reserve warm accent color for quote CTAs"],
    },
    layoutNotes: [
      "hero should support fast pickups and planned cleanouts",
      "service cards should describe job types, not endless item categories",
      "proof posture stays operational rather than hype-heavy",
    ],
  },
  vocabulary: {
    requiredTerms: ["junk removal", "cleanout", "haul-away", "quote"],
    preferredPhrases: ["clear the space", "remove unwanted items", "next-step pricing"],
    bannedPhrases: ["we take anything", "eco-friendly guaranteed", "same-day pickup guaranteed"],
    disallowedProofClaims: ["licensed and insured", "recycling first", "donation drop-off", "up-front pricing guarantee"],
  },
  seo: {
    metaTitleTemplate: "{{serviceAreaLabel}} Junk Removal | {{businessName}}",
    metaDescriptionTemplate:
      "{{businessName}} handles junk pickup, cleanouts, and haul-away work in {{serviceAreaLabel}} for homes and light commercial spaces.",
    headingRules: [
      "mention junk removal and geography in hero",
      "support both quick pickups and larger cleanout jobs",
    ],
    keywordTargets: ["junk removal", "junk pickup", "property cleanout", "haul away service"],
  },
  sections: {
    copy: {
      hero: {
        variantKey: "quote-led",
        heading: "Junk removal for pickups, cleanouts, and haul-away work",
        body:
          "{{businessName}} helps {{serviceAreaLabel}} homeowners, landlords, and small businesses clear unwanted items with a clear quote process and organized removal plan.",
        cta: { label: "Get a Quote", action: "quote" },
      },
      services: {
        variantKey: "grouped",
        heading: "Junk removal services built around real job types",
        items: [
          {
            title: "Home Pickups",
            body: "Furniture, appliances, and general household items that need to be removed without turning the visit into a full property cleanout.",
          },
          {
            title: "Garage / Storage Cleanouts",
            body: "Overflowing garages, attic storage, sheds, and accumulated items that need a planned cleanout.",
          },
          {
            title: "Move-Out / Property Cleanups",
            body: "Rental turnovers, move-out debris, and light commercial or office junk removal that needs a clear scope.",
          },
        ],
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "What matters when you hire a junk removal crew",
        items: [
          {
            title: "Clear scope before pickup",
            body: "Set expectations around what needs to go, what stays, and how the removal visit will work.",
          },
          {
            title: "Organized arrival and loading",
            body: "Keep the job moving with a practical crew process instead of vague urgency claims.",
          },
          {
            title: "Quote-first communication",
            body: "Make the next step obvious whether the job is a single pickup or a larger cleanout.",
          },
        ],
      },
      process: {
        variantKey: "default",
        heading: "How junk removal moves from estimate to cleared space",
        items: [
          {
            title: "Review the job",
            body: "Confirm what needs to be removed, access points, and whether the work is a pickup or a larger cleanout.",
          },
          {
            title: "Quote the scope",
            body: "Set the next step with clear pricing language and a defined scope of work.",
          },
          {
            title: "Load and clear the area",
            body: "Remove the agreed items efficiently and leave the space ready for what comes next.",
          },
        ],
      },
      faq: {
        variantKey: "mixed-intent",
        heading: "Junk removal questions people ask before booking",
        faqItems: [
          {
            question: "Do you only handle single-item pickups?",
            answer:
              "No. Junk removal jobs can range from a few bulky items to larger cleanouts for garages, storage areas, move-outs, and similar spaces.",
          },
          {
            question: "Can I get a quote before scheduling the job?",
            answer:
              "Yes. A clear quote helps confirm the scope, access, and next step before the removal visit is booked.",
          },
        ],
      },
      "service-area": {
        variantKey: "regional-coverage",
        heading: "Junk removal in {{serviceAreaLabel}}",
        body: "{{businessName}} handles household pickups, cleanouts, and haul-away work throughout {{serviceAreaLabel}}.",
      },
      contact: {
        variantKey: "dual-cta",
        heading: "Get a junk removal quote or call now",
        body: "Request pricing for cleanouts and haul-away work, or call now to talk through the pickup.",
        cta: { label: "Get a Quote", action: "quote" },
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
      "sameDayPickup",
      "licensedAndInsured",
      "ecoFriendlyDisposal",
      "recyclingFirst",
      "donationDropOff",
      "upfrontPricingGuarantee",
      "sampleTestimonials",
    ],
  },
};
