import type { SeedBusiness } from "@/lib/template-system/types";

export const PLUMBING_SEED_BUSINESS: SeedBusiness = {
  key: "steady-flow-plumbing-columbus",
  nicheTemplateKey: "plumbing-v1",
  businessProfile: {
    businessName: "Steady Flow Plumbing",
    serviceAreaLabel: "Columbus",
    primaryPhone: "(614) 555-0189",
    contactEmail: "service@steadyflowplumbing.com",
    primaryCtaLabel: "Call Now",
    primaryCtaHref: "tel:+16145550189",
    secondaryCtaLabel: "Request Estimate",
    secondaryCtaHref: "#contact",
    services: [
      "Leak Repair",
      "Drain Clearing",
      "Water Heater Service",
      "Fixture Installation",
    ],
  },
  conditionalProof: {
    sameDayService: {
      kind: "availability-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    emergencyAvailability: {
      kind: "availability-claim",
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
    warrantyCopy: {
      kind: "warranty-claim",
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
    sampleTestimonials: {
      kind: "testimonial-list",
      value: 0,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: true,
    },
  },
};
