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
