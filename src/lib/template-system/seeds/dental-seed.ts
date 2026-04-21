import type { SeedBusiness } from "@/lib/template-system/types";

export const DENTAL_SEED_BUSINESS: SeedBusiness = {
  key: "dental-seed-v1",
  nicheTemplateKey: "dental-v1",
  businessProfile: {
    businessName: "Harbor Point Dental",
    serviceAreaLabel: "Raleigh, NC",
    primaryCtaLabel: "Schedule Visit",
    primaryCtaHref: "#contact",
    secondaryCtaLabel: "View Services",
    secondaryCtaHref: "#services",
    primaryPhone: "(919) 555-0133",
    contactEmail: "hello@harborpointdental.com",
    services: ["Cleanings", "Exams", "Fillings"],
  },
  conditionalProof: {
    insuranceAccepted: {
      kind: "insuranceAccepted",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    sedationAvailable: {
      kind: "sedationAvailable",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    emergencyAvailability: {
      kind: "emergencyAvailability",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
  },
};
