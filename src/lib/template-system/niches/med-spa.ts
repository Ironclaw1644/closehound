import type { NicheTemplate } from "@/lib/template-system/types";

export const MED_SPA_NICHE_TEMPLATE: NicheTemplate = {
  key: "med-spa-v1",
  familyKey: "health-wellness",
  name: "Med Spa",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "gender-neutral clinical-premium",
    typography: {
      headingFamily: "var(--font-geist-sans)",
      bodyFamily: "var(--font-geist-sans)",
      sizingNotes: ["refined hero", "calm section rhythm"],
    },
    palette: {
      base: ["#f7f3ef", "#ffffff", "#1f2937"],
      accents: ["#b08968", "#8aa29e"],
      usageNotes: ["keep contrast high", "avoid pink-coded defaults"],
    },
    layoutNotes: [
      "consultation-led",
      "clean spacing",
      "premium without luxury-theater",
    ],
  },
  vocabulary: {
    requiredTerms: [
      "consultation",
      "treatment plan",
      "injectables",
      "skin rejuvenation",
      "facial aesthetics",
    ],
    preferredPhrases: [
      "thoughtful treatment planning",
      "natural-looking goals",
      "comfortable, refined setting",
    ],
    bannedPhrases: [
      "ageless beauty",
      "perfect results",
      "transform your face",
      "pamper yourself",
    ],
    disallowedProofClaims: [
      "board certified",
      "medical director on site",
      "guaranteed results",
      "award-winning technology",
    ],
  },
  seo: {
    metaTitleTemplate: "{{serviceAreaLabel}} Med Spa | {{businessName}}",
    metaDescriptionTemplate:
      "{{businessName}} offers consultation-led injectables, skin rejuvenation, and aesthetic treatments in {{serviceAreaLabel}}.",
    headingRules: [
      "mention med spa and geography in hero",
      "keep treatment language specific",
    ],
    keywordTargets: [
      "med spa",
      "injectables",
      "skin rejuvenation",
      "aesthetic consultation",
    ],
  },
  sections: {
    copy: {
      hero: {
        variantKey: "default",
        heading: "Personalized aesthetic care. Real results.",
        body: "{{businessName}} helps clients in {{serviceAreaLabel}} explore injectables, skin treatments, and rejuvenation services in a calm, polished setting.",
        cta: { label: "Book Consultation", action: "consult" },
      },
      services: {
        variantKey: "default",
        heading: "Featured treatments",
        items: [
          {
            title: "Injectables",
            body: "Consultation-led injectable treatments focused on balanced, natural-looking results.",
          },
          {
            title: "Skin Rejuvenation",
            body: "Treatment plans centered on tone, texture, and long-term skin goals.",
          },
          {
            title: "Facial Aesthetics",
            body: "Curated services designed to support confidence with a refined, personalized approach.",
          },
        ],
      },
      about: {
        variantKey: "default",
        heading: "A med spa experience built around comfort, clarity, and care",
        body: "{{businessName}} is designed for clients who want thoughtful treatment planning, discreet care, and a polished setting that feels calm from the first consultation onward.",
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "Why clients choose this practice",
        items: [
          {
            title: "Consultation-first approach",
            body: "Start with goals, timing, and suitability before selecting a treatment path.",
          },
          {
            title: "Refined treatment planning",
            body: "Keep recommendations measured and centered on natural-looking outcomes.",
          },
          {
            title: "Comfortable environment",
            body: "A calm setting, discreet care, and an experience designed for your comfort.",
          },
        ],
      },
      process: {
        variantKey: "default",
        heading: "What the consultation process looks like",
        items: [
          {
            title: "Start with your goals",
            body: "Review priorities, comfort level, and where you want to begin.",
          },
          {
            title: "Build a treatment plan",
            body: "Talk through suitable treatment categories and what to expect next.",
          },
          {
            title: "Schedule with clarity",
            body: "Confirm the next visit, follow-up expectations, and how the plan moves forward.",
          },
        ],
      },
      gallery: {
        variantKey: "default",
        heading: "A private setting designed for comfort and ease",
        body: "Every detail is designed to make your visit feel calm, private, and comfortable.",
        items: [
          {
            title: "Private consultations",
            body: "Quiet conversations about goals, timing, and what treatment categories make sense for you.",
          },
          {
            title: "Bright treatment rooms",
            body: "Clean, comfortable spaces that support a smooth visit without feeling clinical or cold.",
          },
          {
            title: "A calm, welcoming arrival",
            body: "A welcoming, comfortable reception from the moment you arrive.",
          },
        ],
      },
      faq: {
        variantKey: "default",
        heading: "Questions clients ask before booking",
        faqItems: [
          {
            question: "Do I need a consultation before treatment?",
            answer:
              "Most clients start with a consultation so they can talk through goals, timing, and the treatments that make the most sense before scheduling anything further.",
          },
          {
            question: "How do I know which treatment is right for me?",
            answer:
              "Your first visit is the right time to review priorities, ask questions, and build a treatment plan that fits your comfort level and long-term goals.",
          },
        ],
      },
      contact: {
        variantKey: "default",
        heading: "Book your consultation",
        body: "Reach out to talk through treatment goals, timing, and the best first step for your visit.",
        cta: { label: "Book Consultation", action: "consult" },
      },
    },
  },
  editableModel: {
    lockedFields: ["sectionOrder", "claimPolicy", "imageStyleRules"],
    editableFields: [
      "businessName",
      "serviceAreaLabel",
      "primaryPhone",
      "contactEmail",
      "primaryCtaLabel",
      "primaryCtaHref",
      "secondaryCtaLabel",
      "secondaryCtaHref",
      "services",
    ],
    conditionalFields: [
      "boardCertification",
      "medicalDirector",
      "yearsInBusiness",
      "reviewCount",
      "namedAwards",
      "namedTechnologies",
      "financing",
      "guarantees",
      "clinicalOutcomeClaims",
      "sampleTestimonials",
      "promotionalOffer",
    ],
  },
};
