import type { NicheTemplate } from "@/lib/template-system/types";

type DentalNicheTemplate = NicheTemplate & {
  icons: {
    sectionIcons: Record<
      "hero" | "services" | "about" | "why-choose-us" | "process" | "gallery" | "testimonials" | "faq" | "contact",
      string
    >;
    library: "font-awesome";
  };
  visuals: {
    strategy: {
      tone: string;
      realismRules: string[];
      shotCategories: string[];
      cropRules: {
        hero: string;
        card: string;
        gallery: string;
      };
      priorities: string[];
      assetApprovalRequired: true;
    };
    assets: { prompts: [] };
  };
  leadMapping: {
    directMap: Record<string, string>;
    conditionalMap: Record<string, string>;
    blockedOverrides: string[];
  };
  fallbackRules: {
    missingDataRules: string[];
    safeRewriteRules: string[];
  };
};

export const DENTAL_NICHE_TEMPLATE: DentalNicheTemplate = {
  key: "dental-v1",
  familyKey: "clinical-care",
  name: "Dental",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "clean clinical-modern",
    typography: {
      headingFamily: '"Instrument Serif", Georgia, serif',
      bodyFamily: '"Manrope", "Helvetica Neue", sans-serif',
      sizingNotes: [
        "clean hierarchy",
        "high readability",
        "clinical-modern restraint",
      ],
    },
    palette: {
      base: ["#f4f7f7", "#ffffff", "#16333b"],
      accents: ["#5e8d96", "#8bb7bc"],
      usageNotes: [
        "bright neutral base",
        "keep trust contrast high",
        "no luxury-gold drift",
      ],
    },
    layoutNotes: ["trust-led", "clean rhythm", "modern local-practice feel"],
  },
  vocabulary: {
    requiredTerms: ["cleanings", "exams", "fillings", "crowns", "treatment plan"],
    preferredPhrases: [
      "clear explanations",
      "comfortable visits",
      "modern office environment",
    ],
    bannedPhrases: [
      "your smile journey",
      "state-of-the-art solutions",
      "transform your smile",
      "healthy smiles for the whole family",
    ],
    disallowedProofClaims: [
      "same-day care",
      "emergency dentist",
      "sedation available",
      "insurance accepted",
    ],
  },
  seo: {
    metaTitleTemplate: "General Dentistry in {{serviceAreaLabel}} | {{businessName}}",
    metaDescriptionTemplate:
      "Modern general dentistry in {{serviceAreaLabel}} with cleanings, exams, restorative care, and a clear first step for new patients.",
    headingRules: ["trust-led", "plainspoken", "general-practice-first"],
    keywordTargets: ["general dentistry", "cleanings and exams", "restorative dental care"],
  },
  icons: {
    sectionIcons: {
      hero: "stethoscope",
      services: "tooth",
      about: "building",
      "why-choose-us": "shield-heart",
      process: "clipboard-check",
      gallery: "camera",
      testimonials: "comment-medical",
      faq: "circle-question",
      contact: "calendar-check",
    },
    library: "font-awesome",
  },
  sections: {
    copy: {
      hero: {
        variantKey: "default",
        heading: "General dentistry with clear guidance and comfortable visits",
        body:
          "{{businessName}} serves patients in {{serviceAreaLabel}} with cleanings, exams, restorative care, and straightforward next steps.",
        cta: { label: "Schedule Visit", action: "consult" },
      },
      services: {
        variantKey: "default",
        heading: "Dental services for prevention and restorative care",
        items: [
          {
            title: "Cleanings",
            body: "Routine visits focused on prevention and long-term oral health.",
          },
          {
            title: "Exams",
            body: "Clear checkups that explain what you need now and what can wait.",
          },
          {
            title: "Fillings",
            body: "Restorative care handled with a plain explanation of the work involved.",
          },
        ],
      },
      about: {
        variantKey: "default",
        heading: "Care that feels clear, modern, and comfortable",
        body:
          "{{businessName}} is built for patients who want straightforward guidance, a calm office experience, and treatment plans that make sense before anything moves forward.",
      },
      "why-choose-us": {
        variantKey: "default",
        heading: "What patients value in this office",
        items: [
          {
            title: "Clear explanations",
            body: "Visits focus on what is happening, what needs attention now, and what can be planned later.",
          },
          {
            title: "Comfortable appointments",
            body: "The office experience is designed to feel calm, organized, and easy to navigate from check-in to follow-up.",
          },
          {
            title: "Practical treatment planning",
            body: "Recommendations stay grounded in your needs, your timeline, and the next sensible step.",
          },
        ],
      },
      process: {
        variantKey: "default",
        heading: "What to expect at your first visit",
        items: [
          {
            title: "Start with a clear exam",
            body: "Your visit begins with a conversation about concerns, priorities, and the reason you came in.",
          },
          {
            title: "Review findings together",
            body: "You will walk through what the exam shows and what options make sense before any bigger treatment decisions.",
          },
          {
            title: "Leave with a next step",
            body: "Whether you need routine care or restorative work, the plan should feel clear before you leave the office.",
          },
        ],
      },
      gallery: {
        variantKey: "default",
        heading: "A clean, modern office designed for comfortable visits",
        body:
          "From the treatment rooms to the front desk, the office should feel bright, organized, and easy to settle into.",
        items: [
          {
            title: "Bright treatment rooms",
            body: "Clean spaces and modern equipment help visits feel calm and straightforward.",
          },
          {
            title: "Welcoming reception",
            body: "The front desk and waiting area are designed to feel polished without feeling cold or corporate.",
          },
          {
            title: "Comfort-focused details",
            body: "Small touches throughout the office support a smoother experience from arrival to checkout.",
          },
        ],
      },
      faq: {
        variantKey: "default",
        heading: "Questions before your first visit",
        faqItems: [
          {
            question: "What happens at a first appointment?",
            answer:
              "Most first visits include an exam, a conversation about concerns or goals, and a clear review of what comes next.",
          },
          {
            question: "How do I know if I need treatment right away?",
            answer:
              "The visit should make it clear what needs attention now, what can be monitored, and what options are available before scheduling more involved care.",
          },
        ],
      },
      contact: {
        variantKey: "default",
        heading: "Schedule your visit",
        body:
          "Call or request an appointment to get a clear first step for cleanings, exams, or restorative care.",
        cta: { label: "Schedule Visit", action: "consult" },
      },
    },
  },
  visuals: {
    strategy: {
      tone: "clean clinical-modern",
      realismRules: ["documentary realism", "no glam smiles", "no embedded text"],
      shotCategories: [
        "consultation",
        "care-action",
        "detail",
        "office",
        "team",
        "gallery",
      ],
      cropRules: {
        hero: "safe center crop for desktop and mobile hero layouts",
        card: "mid-range crop safe for feature cards",
        gallery: "balanced crop for masonry and grid layouts",
      },
      priorities: ["hero", "service", "detail", "workspace", "team", "gallery"],
      assetApprovalRequired: true,
    },
    assets: {
      prompts: [],
    },
  },
  editableModel: {
    lockedFields: [],
    editableFields: [],
    conditionalFields: [],
  },
  leadMapping: {
    directMap: {},
    conditionalMap: {},
    blockedOverrides: [],
  },
  fallbackRules: {
    missingDataRules: [],
    safeRewriteRules: [],
  },
};
