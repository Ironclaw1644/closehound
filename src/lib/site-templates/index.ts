import type { LeadIndustry } from "@/lib/industries";
import type { SiteTemplate } from "@/lib/site-templates/types";

export const SITE_TEMPLATES = [
  {
    key: "handyman-v1",
    industryKey: "handyman",
    defaultSectionOrder: ["hero", "services", "reviews", "about", "cta", "contact"],
    hero: {
      eyebrow: "{{city}} Handyman Services",
      headline: "Small repairs handled without the runaround",
      subheadline:
        "{{companyName}} helps homeowners in {{city}} knock out repairs, punch-list projects, and everyday fixes with dependable scheduling.",
      primaryCta: "Request an Estimate",
      secondaryCta: "Call {{phoneDisplay}}",
      trustItems: ["Responsive scheduling", "Clear repair scope", "Clean finish work"],
    },
    services: {
      title: "Handyman Services",
      intro: "A practical set of services built around common home repair needs in {{city}}.",
      items: [
        {
          title: "Interior Repairs",
          description: "Drywall touch-ups, trim fixes, door adjustments, and routine punch-list work.",
        },
        {
          title: "Fixture Installation",
          description: "Shelving, ceiling fans, hardware, and other homeowner-ready installs.",
        },
        {
          title: "Property Maintenance",
          description: "Ongoing upkeep for rental turns, move-ins, and deferred maintenance items.",
        },
      ],
    },
    reviews: {
      title: "Why homeowners call back",
      intro: "The pitch is simple: show up, fix the issue, and make the process easy.",
      highlights: [
        "Easy communication from first call to finished work",
        "Repairs completed efficiently without cutting corners",
        "Helpful recommendations when customers are not sure where to start",
      ],
    },
    about: {
      title: "A dependable local handyman option",
      bodyTemplate:
        "{{companyName}} is positioned as a go-to choice for {{city}} homeowners who need help with repairs that are too important to ignore but too small for a full remodel crew.",
      bullets: ["Residential-focused work", "Straightforward quoting", "Built for repeat local customers"],
    },
    cta: {
      title: "Need help with a repair list?",
      body: "Tell {{companyName}} what needs attention and get a clear next step for your property.",
      primaryLabel: "Book a Walkthrough",
    },
    contact: {
      title: "Contact {{companyName}}",
      body: "Reach out for handyman service in {{city}} and nearby service areas.",
      phoneLabel: "Call for service",
      emailLabel: "Email the team",
    },
  },
  {
    key: "pressure-washing-v1",
    industryKey: "pressure washing",
    defaultSectionOrder: ["hero", "services", "reviews", "about", "cta", "contact"],
    hero: {
      eyebrow: "{{city}} Pressure Washing",
      headline: "Restore curb appeal with a cleaner exterior",
      subheadline:
        "{{companyName}} helps properties in {{city}} remove dirt, buildup, and weather staining from high-visibility surfaces.",
      primaryCta: "Get a Fast Quote",
      secondaryCta: "Call {{phoneDisplay}}",
      trustItems: ["Driveway cleaning", "House wash service", "Commercial-ready curb appeal"],
    },
    services: {
      title: "Exterior Cleaning Services",
      intro: "High-impact cleaning options designed around common residential and light commercial jobs.",
      items: [
        {
          title: "House Washing",
          description: "Exterior siding cleaning that helps brighten the home without a repaint project.",
        },
        {
          title: "Concrete Cleaning",
          description: "Driveways, walkways, and patios cleaned to remove surface grime and staining.",
        },
        {
          title: "Deck And Fence Washing",
          description: "Outdoor surfaces cleaned up for better appearance and ongoing maintenance.",
        },
      ],
    },
    reviews: {
      title: "Built around visible before-and-after results",
      intro: "Customers respond to a service that feels immediate, professional, and worth the spend.",
      highlights: [
        "Noticeable curb appeal improvement",
        "Easy scheduling for one-time or seasonal jobs",
        "Professional service that respects the property",
      ],
    },
    about: {
      title: "Exterior cleaning without the hassle",
      bodyTemplate:
        "{{companyName}} gives {{city}} property owners a practical way to refresh exterior surfaces, improve first impressions, and stay ahead of buildup that makes a property look tired.",
      bullets: ["Residential and small commercial fit", "Fast visual payoff", "Strong seasonal offer potential"],
    },
    cta: {
      title: "Ready to freshen up the property?",
      body: "Ask for a quote from {{companyName}} and get a simple plan for exterior cleaning in {{city}}.",
      primaryLabel: "Request Exterior Cleaning",
    },
    contact: {
      title: "Talk to the washing team",
      body: "Reach {{companyName}} for pressure washing service around {{city}}.",
      phoneLabel: "Call for a quote",
      emailLabel: "Send job details",
    },
  },
  {
    key: "roofing-v1",
    industryKey: "roofing",
    defaultSectionOrder: ["hero", "services", "reviews", "about", "cta", "contact"],
    hero: {
      eyebrow: "{{city}} Roofing Company",
      headline: "Roofing work that protects the home and the timeline",
      subheadline:
        "{{companyName}} is framed for homeowners in {{city}} who need repairs, replacement guidance, or a dependable inspection before problems spread.",
      primaryCta: "Schedule an Inspection",
      secondaryCta: "Call {{phoneDisplay}}",
      trustItems: ["Repair and replacement positioning", "Storm-damage friendly messaging", "Homeowner-first communication"],
    },
    services: {
      title: "Roofing Services",
      intro: "Service lines organized around urgent repairs and higher-ticket replacement work.",
      items: [
        {
          title: "Roof Repair",
          description: "Leak response, damaged shingle areas, and targeted fixes to limit further issues.",
        },
        {
          title: "Roof Replacement",
          description: "Full replacement positioning for aging roofs or storm-damaged systems.",
        },
        {
          title: "Roof Inspections",
          description: "Inspection-led conversations for buyers, sellers, and concerned homeowners.",
        },
      ],
    },
    reviews: {
      title: "Confidence matters in roofing",
      intro: "Roofing buyers want clarity, credibility, and a process they can understand.",
      highlights: [
        "Explains issues in plain language",
        "Responsive follow-through on estimate requests",
        "Professional project communication from start to finish",
      ],
    },
    about: {
      title: "A stronger local roofing position",
      bodyTemplate:
        "{{companyName}} is presented as a professional roofing choice in {{city}} for customers who want clear recommendations, reliable crews, and a process that feels organized from estimate through completion.",
      bullets: ["Inspection-led sales flow", "High-trust homeowner messaging", "Good fit for premium local positioning"],
    },
    cta: {
      title: "Think the roof needs attention?",
      body: "Start with an inspection or estimate from {{companyName}} in {{city}}.",
      primaryLabel: "Request a Roofing Quote",
    },
    contact: {
      title: "Contact the roofing office",
      body: "Reach {{companyName}} to discuss roofing repairs, replacement, or inspection needs.",
      phoneLabel: "Call for inspection",
      emailLabel: "Email project details",
    },
  },
  {
    key: "hvac-v1",
    industryKey: "HVAC",
    defaultSectionOrder: ["hero", "services", "reviews", "about", "cta", "contact"],
    hero: {
      eyebrow: "{{city}} HVAC Service",
      headline: "Keep the home comfortable without waiting around",
      subheadline:
        "{{companyName}} is positioned for heating and cooling customers in {{city}} who need responsive service, maintenance, or system replacement guidance.",
      primaryCta: "Book HVAC Service",
      secondaryCta: "Call {{phoneDisplay}}",
      trustItems: ["Heating and cooling service", "Maintenance positioning", "Emergency-ready messaging"],
    },
    services: {
      title: "Heating And Cooling Services",
      intro: "Core HVAC offerings aligned to the needs that most often drive calls.",
      items: [
        {
          title: "AC Repair And Service",
          description: "Cooling diagnostics and repair messaging focused on comfort and fast response.",
        },
        {
          title: "Heating Repair",
          description: "Service positioning for furnaces and heating systems when temperatures drop.",
        },
        {
          title: "System Maintenance",
          description: "Seasonal tune-up and upkeep offers that support recurring revenue later.",
        },
      ],
    },
    reviews: {
      title: "Comfort businesses win on trust",
      intro: "Customers want responsiveness and confidence that the problem will be handled correctly.",
      highlights: [
        "Quick response when the system is down",
        "Professional technicians and straightforward explanations",
        "Helpful maintenance guidance after the visit",
      ],
    },
    about: {
      title: "Built for dependable HVAC demand capture",
      bodyTemplate:
        "{{companyName}} is framed as a local HVAC option for {{city}} households that care about comfort, fast service, and a team that can handle both urgent calls and longer-term system planning.",
      bullets: ["Strong urgency-ready messaging", "Maintenance offer support", "High-repeat service potential"],
    },
    cta: {
      title: "Need heating or cooling help?",
      body: "Reach {{companyName}} for HVAC service, diagnostics, or a replacement conversation in {{city}}.",
      primaryLabel: "Schedule Heating Or Cooling Service",
    },
    contact: {
      title: "Get in touch",
      body: "Contact {{companyName}} for heating and cooling service around {{city}}.",
      phoneLabel: "Call for HVAC help",
      emailLabel: "Email the service desk",
    },
  },
  {
    key: "plumbing-v1",
    industryKey: "plumbing",
    defaultSectionOrder: ["hero", "services", "reviews", "about", "cta", "contact"],
    hero: {
      eyebrow: "{{city}} Plumbing Services",
      headline: "Professional plumbing help when the problem cannot wait",
      subheadline:
        "{{companyName}} helps homeowners in {{city}} with plumbing repairs, fixture upgrades, and service calls that need a clean, professional finish.",
      primaryCta: "Request Plumbing Service",
      secondaryCta: "Call {{phoneDisplay}}",
      trustItems: ["Repair-focused service", "Fixture and drain work", "Urgency-friendly positioning"],
    },
    services: {
      title: "Plumbing Services",
      intro: "Core service messaging built around the jobs that drive the most homeowner urgency.",
      items: [
        {
          title: "Leak And Pipe Repair",
          description: "Repair positioning for active leaks, worn components, and plumbing issues that should not be delayed.",
        },
        {
          title: "Drain And Fixture Service",
          description: "Drain line clearing, faucet updates, and fixture-related calls homeowners expect to solve quickly.",
        },
        {
          title: "Water Heater Support",
          description: "Service and replacement conversations for homes that need reliable hot water restored.",
        },
      ],
    },
    reviews: {
      title: "The local plumber people recommend",
      intro: "The strongest message is reliability under pressure and professionalism inside the home.",
      highlights: [
        "Quick turnaround on urgent plumbing issues",
        "Respectful service inside occupied homes",
        "Clear guidance on repair versus replacement decisions",
      ],
    },
    about: {
      title: "A practical plumbing brand position",
      bodyTemplate:
        "{{companyName}} is designed to feel like a dependable first call for {{city}} plumbing needs, whether the customer is dealing with an urgent repair or planning an upgrade that needs to be done right.",
      bullets: ["Strong homeowner urgency fit", "Repair and replacement flexibility", "Good local referral potential"],
    },
    cta: {
      title: "Plumbing issue on your list?",
      body: "Reach {{companyName}} for plumbing service in {{city}} and get a clear next step quickly.",
      primaryLabel: "Book Plumbing Help",
    },
    contact: {
      title: "Reach the plumbing team",
      body: "Call or email {{companyName}} for plumbing service in and around {{city}}.",
      phoneLabel: "Call now",
      emailLabel: "Email service details",
    },
  },
  {
    key: "junk-removal-v1",
    industryKey: "junk removal",
    defaultSectionOrder: ["hero", "services", "reviews", "about", "cta", "contact"],
    hero: {
      eyebrow: "{{city}} Junk Removal",
      headline: "Fast cleanout help without the heavy lifting",
      subheadline:
        "{{companyName}} helps {{city}} customers clear out garages, homes, offices, and job sites with simple scheduling and professional haul-away service.",
      primaryCta: "Get a Removal Quote",
      secondaryCta: "Call {{phoneDisplay}}",
      trustItems: ["Residential cleanouts", "Yard and debris pickup", "Real-estate and move support"],
    },
    services: {
      title: "Removal Services",
      intro: "Service lines shaped around the cleanout jobs customers most often want handled quickly.",
      items: [
        {
          title: "Household Junk Removal",
          description: "Garage, attic, basement, and whole-home cleanout positioning for busy households.",
        },
        {
          title: "Furniture And Appliance Pickup",
          description: "Large-item removal messaging focused on convenience and safe haul-away.",
        },
        {
          title: "Property And Job Site Cleanup",
          description: "Debris and cleanout support for property managers, landlords, and light contractors.",
        },
      ],
    },
    reviews: {
      title: "People want the job handled fast",
      intro: "The best message here is convenience, professionalism, and obvious effort reduction.",
      highlights: [
        "Easy booking and reliable arrival windows",
        "Friendly crews who work efficiently",
        "Stress relief for cluttered or time-sensitive situations",
      ],
    },
    about: {
      title: "A convenient local cleanout option",
      bodyTemplate:
        "{{companyName}} is positioned for {{city}} customers who want clutter gone without spending a weekend hauling it themselves, with service messaging centered on speed, convenience, and respectful crews.",
      bullets: ["High-convenience value prop", "Great fit for photo-led previews later", "Useful for residential and light commercial leads"],
    },
    cta: {
      title: "Need junk gone quickly?",
      body: "Reach out to {{companyName}} for a fast cleanout quote in {{city}}.",
      primaryLabel: "Request Junk Removal",
    },
    contact: {
      title: "Contact the removal crew",
      body: "Call or email {{companyName}} for cleanout and hauling service near {{city}}.",
      phoneLabel: "Call for removal",
      emailLabel: "Email item details",
    },
  },
  {
    key: "mobile-detailing-v1",
    industryKey: "mobile detailing",
    defaultSectionOrder: ["hero", "services", "reviews", "about", "cta", "contact"],
    hero: {
      eyebrow: "{{city}} Mobile Detailing",
      headline: "Vehicle detailing that comes to the customer",
      subheadline:
        "{{companyName}} is positioned for busy drivers in {{city}} who want professional detailing without rearranging the day around a shop visit.",
      primaryCta: "Book a Detail",
      secondaryCta: "Call {{phoneDisplay}}",
      trustItems: ["On-site convenience", "Interior and exterior packages", "Premium local-service positioning"],
    },
    services: {
      title: "Detailing Services",
      intro: "Offer structure focused on the packages customers expect from a mobile detailer.",
      items: [
        {
          title: "Exterior Detailing",
          description: "Washes, paint-safe cleanup, and visual refresh positioning for daily drivers and pride-of-ownership customers.",
        },
        {
          title: "Interior Detailing",
          description: "Cabin cleaning, vacuuming, wipe-down service, and attention to the details people notice immediately.",
        },
        {
          title: "Full-Service Packages",
          description: "Bundled interior and exterior offers that make the service feel complete and worth booking.",
        },
      ],
    },
    reviews: {
      title: "Convenience sells the service",
      intro: "Customers respond to polish, professionalism, and the fact that the service comes to them.",
      highlights: [
        "Easy booking for home or workplace appointments",
        "Visible upgrade in how the vehicle looks and feels",
        "Professional, premium-feeling service experience",
      ],
    },
    about: {
      title: "A strong local convenience play",
      bodyTemplate:
        "{{companyName}} is framed as a premium-but-accessible mobile detailing option in {{city}}, helping customers keep vehicles clean and presentation-ready without losing time to a shop visit.",
      bullets: ["Convenience-led value proposition", "Good fit for package offers", "Strong visual storytelling potential later"],
    },
    cta: {
      title: "Ready to refresh the vehicle?",
      body: "Book mobile detailing with {{companyName}} and get service delivered in {{city}}.",
      primaryLabel: "Schedule Mobile Detailing",
    },
    contact: {
      title: "Reach {{companyName}}",
      body: "Contact the team for mobile detailing appointments in {{city}} and surrounding areas.",
      phoneLabel: "Call to book",
      emailLabel: "Email appointment details",
    },
  },
] as const satisfies readonly SiteTemplate[];

const TEMPLATE_BY_INDUSTRY = new Map<LeadIndustry, SiteTemplate>(
  SITE_TEMPLATES.map((template) => [template.industryKey, template])
);

export function getSiteTemplate(industry: LeadIndustry) {
  return TEMPLATE_BY_INDUSTRY.get(industry);
}
