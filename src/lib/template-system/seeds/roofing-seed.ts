import type { SeedBusiness } from "@/lib/template-system/types";

export const ROOFING_SEED_BUSINESS: SeedBusiness = {
  key: "summit-peak-roofing-columbus",
  nicheTemplateKey: "roofing-v1",
  businessProfile: {
    businessName: "Summit Peak Roofing",
    serviceAreaLabel: "Columbus, OH",
    primaryPhone: "(614) 555-0184",
    contactEmail: "office@summitpeakroofing.com",
    primaryCtaLabel: "Request a Roofing Quote",
    primaryCtaHref: "#contact",
    services: ["Roof Repair", "Roof Replacement", "Roof Inspection"],
  },
  conditionalProof: {
    sampleTestimonials: {
      kind: "testimonial-list",
      value: 0,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: true,
    },
  },
};
