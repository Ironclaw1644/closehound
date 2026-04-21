import type { SeedBusiness } from "@/lib/template-system/types";

export const JUNK_REMOVAL_SEED_BUSINESS: SeedBusiness = {
  key: "clearpath-junk-removal-raleigh",
  nicheTemplateKey: "junk-removal-v1",
  businessProfile: {
    businessName: "ClearPath Junk Removal",
    serviceAreaLabel: "Raleigh, NC",
    primaryPhone: "(919) 555-0168",
    contactEmail: "quotes@clearpathjunk.com",
    primaryCtaLabel: "Get a Quote",
    primaryCtaHref: "#contact",
    secondaryCtaLabel: "Call Now",
    secondaryCtaHref: "tel:+19195550168",
    services: ["Home Pickups", "Garage / Storage Cleanouts", "Move-Out / Property Cleanups"],
  },
  conditionalProof: {
    sameDayPickup: {
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
    ecoFriendlyDisposal: {
      kind: "process-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    recyclingFirst: {
      kind: "process-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    donationDropOff: {
      kind: "service-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    upfrontPricingGuarantee: {
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
