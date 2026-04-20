import type { SeedBusiness } from "@/lib/template-system/types";

export const HVAC_SEED_BUSINESS: SeedBusiness = {
  key: "summit-comfort-columbus",
  nicheTemplateKey: "hvac-v1",
  businessProfile: {
    businessName: "Summit Comfort Heating & Air",
    serviceAreaLabel: "Columbus, OH",
    primaryPhone: "(614) 555-0126",
    contactEmail: "service@summitcomfortair.com",
    primaryCtaLabel: "Request HVAC Service",
    primaryCtaHref: "#contact",
    services: ["AC Repair", "Heating Service", "System Replacement"],
  },
  conditionalProof: {
    emergencyService: {
      kind: "availability-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    financing: {
      kind: "offer-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    warrantyCopy: {
      kind: "warranty-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    certifications: {
      kind: "credential-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    licensedAndInsured: {
      kind: "credential-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    sampleTestimonials: {
      kind: "testimonial-list",
      value: 0,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: true,
    },
  },
};
