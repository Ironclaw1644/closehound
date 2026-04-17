import type {
  ContractorPreset,
  ContractorSiteData,
  ContractorTheme,
} from "@/lib/site-templates/contractor/types";

const undergroundUtilityTheme: ContractorTheme = {
  pageBackground: "#f4f7fa",
  pageGradient:
    "radial-gradient(circle at top left, rgba(29, 93, 135, 0.10), transparent 34%), linear-gradient(180deg, #f8fafc 0%, #eef3f7 100%)",
  surface: "#ffffff",
  surfaceAlt: "#e7edf3",
  surfaceStrong: "#102234",
  heroPanel: "#16324c",
  heroText: "#f8fafc",
  heading: "#102234",
  body: "#20384d",
  muted: "#5a6b7c",
  accent: "#1d5d87",
  accentStrong: "#134868",
  accentSoft: "rgba(29, 93, 135, 0.12)",
  border: "#d5dde6",
  footerBackground: "#0f1d2d",
};

const undergroundUtilityDefaults: ContractorSiteData = {
  presetKey: "underground-utility",
  slug: "contractor-template",
  company: {
    name: "Contractor Name",
    legalName: "Contractor Name, LLC",
    phone: "(555) 010-0000",
    email: "estimating@example.com",
    primaryLocation: {
      label: "Main Office",
      addressLine1: "123 Utility Park Drive",
      city: "Denham Springs",
      state: "LA",
      postalCode: "70726",
    },
    additionalLocations: [
      {
        label: "Regional Yard",
        addressLine1: "2500 Corridor Lane",
        city: "Loganville",
        state: "GA",
        postalCode: "30052",
      },
    ],
    serviceArea: ["Louisiana", "Mississippi", "Southeast utility corridors"],
  },
  branding: {
    headerTitle: "Underground Utility Construction",
    headerSubtitle:
      "Directional drilling, trenching, duct bank installation, and utility field support for crews that need real execution capacity.",
    primaryCtaLabel: "Request a Project Review",
    secondaryCtaLabel: "View Capabilities",
    navItems: [
      { label: "Services", href: "#services" },
      { label: "Projects", href: "#projects" },
      { label: "About", href: "#about" },
      { label: "Contact", href: "#contact" },
    ],
    theme: undergroundUtilityTheme,
  },
  hero: {
    eyebrow: "Underground Utility Contractor",
    headline: "Dependable underground utility crews for civil, telecom, power, water, and gas work.",
    body:
      "This template is structured for contractor businesses that need a field-first website with strong service framing, believable proof language, and clear next-step calls to action.",
    image: {
      src: "/site-templates/contractor/utility-hero.svg",
      alt: "Illustrated underground utility worksite with drill equipment and trench line.",
    },
    supportingImages: [
      {
        src: "/site-templates/contractor/utility-support-1.svg",
        alt: "Illustrated utility crew preparing a roadside work area.",
      },
      {
        src: "/site-templates/contractor/utility-support-2.svg",
        alt: "Illustrated yard and fleet staging area for a contractor.",
      },
    ],
    stats: [
      { value: "30+ Years", label: "Established underground utility experience" },
      { value: "~100", label: "Crew and support staff capacity" },
      { value: "LA + MS", label: "Core Gulf South service footprint" },
    ],
    trustItems: [
      "Directional drilling and trenching capability",
      "Utility corridor work in urban, rural, and industrial environments",
      "Field-ready crews with office and yard support behind them",
    ],
  },
  services: {
    heading: "Utility services built around real field scopes.",
    body:
      "The preset starts with the service lines and section structure that fit underground utility contractors, then allows each business to swap in its actual capabilities.",
    items: [
      {
        title: "Directional Drilling",
        description:
          "Trenchless installation support for congested corridors, crossings, and projects where minimizing surface disruption matters.",
      },
      {
        title: "Trenching And Open-Cut Work",
        description:
          "Field excavation and installation support for underground utility systems across municipal, roadside, and industrial conditions.",
      },
      {
        title: "Duct Bank Construction",
        description:
          "In-town and infrastructure-heavy duct bank work coordinated for active streets, utility corridors, and growth projects.",
      },
      {
        title: "Utility Support Services",
        description:
          "Telecom, power, gas, sewer, and water support work backed by crews that understand field constraints and schedule pressure.",
      },
    ],
  },
  gallery: {
    heading: "Project visuals that make the work feel real.",
    body:
      "The gallery section is designed for actual equipment, crews, yards, and project snapshots so lead-generated previews feel grounded instead of generic.",
    images: [
      {
        title: "Directional Drill Setup",
        category: "Field Work",
        caption: "Utility crossing prep and trenchless installation support at an active worksite.",
        image: {
          src: "/site-templates/contractor/utility-gallery-1.svg",
          alt: "Illustrated directional drill rig at a utility project site.",
        },
      },
      {
        title: "Duct Bank Corridor",
        category: "Municipal Work",
        caption: "Structured utility construction positioned for dense corridors and public infrastructure jobs.",
        image: {
          src: "/site-templates/contractor/utility-gallery-2.svg",
          alt: "Illustrated duct bank trench running through a city corridor.",
        },
      },
      {
        title: "Fleet And Yard Support",
        category: "Operations",
        caption: "Operational yard presence that signals mobilization capacity and field readiness.",
        image: {
          src: "/site-templates/contractor/utility-gallery-3.svg",
          alt: "Illustrated contractor yard with fleet vehicles and equipment.",
        },
      },
    ],
  },
  trust: {
    heading: "Contractor-trust framing without generic fluff.",
    body:
      "This section packages company background, regional coverage, and operating style in a way that feels credible for commercial buyers, municipalities, utilities, and general contractors.",
    bullets: [
      "Regional positioning that works for local and multi-state service areas",
      "Trust language built around crews, equipment, execution, and scheduling",
      "Flexible enough to support utility, civil, and specialty contractor businesses later",
    ],
    highlight: {
      eyebrow: "Field Experience",
      title: "Proof language that fits the category.",
      body:
        "The highlight card gives each business a place for partner recognition, a short testimonial, or a clear statement about the kind of projects and field conditions it handles well.",
      quote:
        "Crews stayed organized, communicated clearly, and handled the field work the way a utility partner expects.",
      attribution: "Sample utility-partner recognition",
      image: {
        src: "/site-templates/contractor/utility-highlight.svg",
        alt: "Illustrated contractor crew working around underground utility lines.",
      },
    },
  },
  contact: {
    heading: "Make it obvious how to start the conversation.",
    body:
      "The contact block is built for project inquiries, estimating calls, and service-area clarity, with room for one main office and additional yard or regional locations.",
    primaryCtaLabel: "Talk To The Estimating Team",
    secondaryCtaLabel: "Review Service Area",
  },
  footer: {
    summary:
      "Reusable contractor website template inside CloseHound, modeled on the V-Tech layout and tone, but fully driven by business data and preset defaults.",
    coverageHeading: "Coverage",
    coverageItems: ["Louisiana", "Mississippi", "Regional utility corridors"],
    note: "Structured for future presets like roofing, HVAC, plumbing, pressure washing, and junk removal.",
  },
  seo: {
    title: "Contractor Website Template Preview",
    description:
      "Preview of a reusable underground utility contractor website template built inside CloseHound.",
  },
};

export const CONTRACTOR_PRESETS = [
  {
    key: "underground-utility",
    label: "Underground Utility Contractor",
    description:
      "V-Tech-style structure for underground utility, civil, and field-service contractors.",
    defaults: undergroundUtilityDefaults,
  },
] as const satisfies readonly ContractorPreset[];
