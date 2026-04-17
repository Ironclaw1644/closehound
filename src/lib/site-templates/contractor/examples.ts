import {
  buildContractorSiteData,
  getContractorPreset,
} from "@/lib/site-templates/contractor/builder";
import type { ContractorSiteExample } from "@/lib/site-templates/contractor/types";

const undergroundUtilityPreset = getContractorPreset("underground-utility");

if (!undergroundUtilityPreset) {
  throw new Error("Underground utility contractor preset is not configured.");
}

export const CONTRACTOR_SITE_EXAMPLES = [
  {
    key: "delta-utility-group",
    label: "Delta Utility Group",
    description:
      "Seeded V-Tech-like sample data for immediate CloseHound contractor-template previews.",
    data: buildContractorSiteData(undergroundUtilityPreset.key, {
      slug: "delta-utility-group",
      company: {
        name: "Delta Utility Group",
        legalName: "Delta Utility Group, LLC",
        phone: "(225) 555-0142",
        email: "estimating@deltautilitygroup.com",
        primaryLocation: {
          label: "Main Office",
          addressLine1: "8410 Utility Park Drive",
          city: "Denham Springs",
          state: "LA",
          postalCode: "70726",
        },
        additionalLocations: [
          {
            label: "Regional Operations Yard",
            addressLine1: "1960 Highway Access Road",
            city: "Loganville",
            state: "GA",
            postalCode: "30052",
          },
        ],
        serviceArea: [
          "Louisiana",
          "Mississippi",
          "Georgia",
          "Southeast utility corridors",
        ],
      },
      branding: {
        headerTitle: "Underground Utility Construction",
        headerSubtitle:
          "Directional drilling, trenching, duct bank, and utility support crews serving Gulf South and Southeast infrastructure projects.",
        primaryCtaLabel: "Request A Utility Quote",
        secondaryCtaLabel: "See Project Fit",
      },
      hero: {
        headline: "Trusted underground utility construction for Louisiana, Mississippi, and the Southeast.",
        body:
          "Delta Utility Group is a seeded example based on the V-Tech site structure: credible field language, regional contractor positioning, and sections built to showcase services, project visuals, trust signals, and contact details from structured data.",
        stats: [
          { value: "32 Years", label: "Underground utility and field support experience" },
          { value: "~100", label: "Employees supporting crews, fleet, and shop operations" },
          { value: "3-State Reach", label: "Primary coverage across Louisiana, Mississippi, and Georgia" },
        ],
        trustItems: [
          "Directional drilling, trenching, and duct bank support",
          "Telecom, power, gas, sewer, and water project positioning",
          "Main office and regional yard structure for mobilization credibility",
        ],
      },
      services: {
        heading: "Underground utility capabilities aligned to real project work.",
        body:
          "The first preset intentionally follows the same section rhythm as the finished V-Tech site while keeping all headings, service cards, and proof language configurable.",
        items: [
          {
            title: "Directional Drilling",
            description:
              "Trenchless installation work for crossings, urban corridors, and utility jobs where minimizing surface disruption matters.",
          },
          {
            title: "Trenching",
            description:
              "Open-cut utility excavation and installation support for municipal, roadside, and industrial job conditions.",
          },
          {
            title: "Fiber And Telecom Support",
            description:
              "Telecom-rooted utility support for conduit, network, and field coordination scopes tied to underground infrastructure.",
          },
          {
            title: "Power, Water, And Gas Support",
            description:
              "Field execution support for energy and utility projects that need dependable crews, equipment, and schedule follow-through.",
          },
        ],
      },
      gallery: {
        heading: "Sample gallery content ready for business-specific swaps.",
        body:
          "Each gallery item is driven from data so future preview sites can inject real lead photos, yard shots, equipment images, or project snapshots without touching the renderer.",
      },
      trust: {
        heading: "Telecom roots, broader utility capability, and a field-first operating style.",
        body:
          "This example keeps the contractor-professional tone from V-Tech: experienced crews, believable service language, and enough operational detail to feel established without overclaiming.",
        bullets: [
          "Positioned for utilities, municipalities, general contractors, and infrastructure buyers",
          "Structured to support regional office, yard, and service-area details from data",
          "Ready for custom service lists, logos, photos, and city-specific overrides per lead",
        ],
        highlight: {
          eyebrow: "Partner Confidence",
          title: "Recognition framing that sounds like the category.",
          body:
            "The trust highlight can hold a testimonial, partner note, or proof statement without changing layout code.",
          quote:
            "The crew stayed organized in the field, communicated clearly, and represented the project professionally from start to finish.",
          attribution: "Sample recognition from a regional utility partner",
        },
      },
      contact: {
        heading: "Need underground utility support for the next scope?",
        body:
          "Use this block to frame estimating, project review, and service-area contact details for each business preview generated inside CloseHound.",
        primaryCtaLabel: "Call Estimating",
        secondaryCtaLabel: "Email Project Details",
      },
      footer: {
        summary:
          "Delta Utility Group is a seeded CloseHound example showing how preset defaults and business-specific overrides combine into one preview-ready contractor site.",
        coverageItems: [
          "Louisiana",
          "Mississippi",
          "Georgia",
          "Southeast utility corridors",
        ],
      },
      seo: {
        title: "Delta Utility Group | Contractor Template Preview",
        description:
          "CloseHound preview for a reusable underground utility contractor website template seeded with Delta Utility Group sample data.",
      },
    }),
  },
] as const satisfies readonly ContractorSiteExample[];
