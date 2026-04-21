import type { SeedBusiness } from "@/lib/template-system/types";

export const MED_SPA_SEED_BUSINESS: SeedBusiness = {
  key: "lumen-aesthetics-raleigh",
  nicheTemplateKey: "med-spa-v1",
  businessProfile: {
    businessName: "Lumen Aesthetics Studio",
    serviceAreaLabel: "Raleigh, NC",
    primaryPhone: "(919) 555-0142",
    contactEmail: "hello@lumenaesthetics.com",
    primaryCtaLabel: "Book Consultation",
    primaryCtaHref: "#contact",
    secondaryCtaLabel: "View Treatments",
    secondaryCtaHref: "#services",
    services: ["Injectables", "Skin Rejuvenation", "Facial Aesthetics"],
  },
  conditionalProof: {
    boardCertification: {
      kind: "credential-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    medicalDirector: {
      kind: "medical-oversight-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    yearsInBusiness: {
      kind: "years-in-business",
      value: 0,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    reviewCount: {
      kind: "review-count",
      value: 0,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    sampleTestimonials: {
      kind: "testimonial-proof",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    promotionalOffer: {
      kind: "promo-offer",
      value: "",
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
  },
};
