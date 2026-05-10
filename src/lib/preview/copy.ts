import type { LeadIndustry } from "@/lib/industries";
import type { PreviewIcon } from "@/lib/preview/types";

export type IndustryCopy = {
  templateKey: string;

  hero: {
    eyebrow: (city: string | null) => string;
    headline: (companyName: string, city: string | null) => string;
    subheadline: (companyName: string, city: string | null) => string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string | null;
  };

  services: {
    heading: string;
    items: { title: string; body: string; icon: PreviewIcon }[];
  };

  serviceArea: {
    heading: string;
    body: (companyName: string, city: string | null) => string;
  };

  whyUs: {
    heading: string;
    bullets: { title: string; body: string; icon: PreviewIcon }[];
  };

  faq: {
    heading: string;
    items: (companyName: string, city: string | null) => { question: string; answer: string }[];
  };

  contact: {
    heading: (companyName: string) => string;
    body: (companyName: string, city: string | null) => string;
  };
};

const cityOrArea = (city: string | null) => city ?? "your area";

const INDUSTRY_COPY: Record<LeadIndustry, IndustryCopy> = {
  // ────────────────────── HANDYMAN ──────────────────────
  handyman: {
    templateKey: "handyman_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} handyman`,
      headline: () =>
        `The list, finally crossed off.`,
      subheadline: (_company, city) =>
        `Drywall patches, leaky faucets, ceiling fans, picture hanging, and the random list taped to the fridge. One trip, one bill, one less weekend lost in ${cityOrArea(city)}.`,
      primaryCtaLabel: "Call now",
      secondaryCtaLabel: "Get a same-week estimate",
    },
    services: {
      heading: "What we knock out in a single visit",
      items: [
        {
          title: "Drywall, doors, and trim",
          body: "Holes patched, doors that won't latch, trim that's been off since the kids were small. Clean, painted, and gone.",
          icon: "screwdriver-wrench",
        },
        {
          title: "Mounting and installs",
          body: "TVs, shelves, ceiling fans, towel bars, baby gates, smart locks. Anchored into studs the right way the first time.",
          icon: "wrench",
        },
        {
          title: "The honey-do list",
          body: "Bring the list. We'll batch it, quote it on the spot, and finish in one afternoon when the scope allows.",
          icon: "circle-check",
        },
      ],
    },
    serviceArea: {
      heading: "Local handyman, no travel-day surprises",
      body: (company, city) =>
        `${company} works ${cityOrArea(city)} and the surrounding zip codes. If you're inside the loop, we can usually be on site in two days.`,
    },
    whyUs: {
      heading: "Why neighbors keep our number on the fridge",
      bullets: [
        {
          title: "We show up when we say",
          body: "Texted arrival window, photo of the tech before they pull up. No four-hour windows.",
          icon: "clock",
        },
        {
          title: "Flat-rate quotes, no creeping invoices",
          body: "You see the price before we lift a tool. If something else turns up, we ask before adding it.",
          icon: "shield-halved",
        },
        {
          title: "Clean finish or it's not done",
          body: "Drop cloths down, dust vacuumed up, scraps hauled away. Looks like we were never there.",
          icon: "broom",
        },
      ],
    },
    faq: {
      heading: "Quick answers",
      items: (company) => [
        {
          question: "What's the minimum charge?",
          answer:
            "Most homeowners book a 2-hour minimum and stack a few items together. We'll tell you up front if your list is too small and not worth the trip.",
        },
        {
          question: "Do you give estimates over the phone?",
          answer:
            "For straight-forward jobs, yes. For anything we should look at first, we'll book a free 15-minute walkthrough.",
        },
        {
          question: "Are you licensed and insured?",
          answer: `${company} carries general liability insurance. We'll send proof on request before the visit.`,
        },
      ],
    },
    contact: {
      heading: (company) => `Tell ${company} what's on the list`,
      body: (_company, city) =>
        `Snap a photo of the project, send a short message, or just call. We'll get back the same day in ${cityOrArea(city)}.`,
    },
  },

  // ────────────────────── PRESSURE WASHING ──────────────────────
  "pressure washing": {
    templateKey: "pressure_washing_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} pressure washing`,
      headline: () =>
        `Make the house look painted again.`,
      subheadline: (_company, city) =>
        `Soft-wash for siding, surface-clean for driveways, and a careful job around windows and landscaping. Your house will look painted from the street.`,
      primaryCtaLabel: "Call now",
      secondaryCtaLabel: "Get a free estimate",
    },
    services: {
      heading: "What we clean",
      items: [
        {
          title: "House soft-wash",
          body: "Low-pressure, high-detergent wash that's safe for siding, paint, and shutters. Removes the green and gray that the rain leaves behind.",
          icon: "house-chimney",
        },
        {
          title: "Driveways and walkways",
          body: "Surface-cleaner pass and a final rinse. Tire marks, leaf stains, oil drips and the gray film all come up.",
          icon: "soap",
        },
        {
          title: "Decks, fences, and patios",
          body: "Pressure tuned to the surface. We won't fuzz up your deck boards or strip stain that should stay on.",
          icon: "broom",
        },
      ],
    },
    serviceArea: {
      heading: "Trucks already in the area",
      body: (company, city) =>
        `${company} runs routes through ${cityOrArea(city)} weekly. Schedule on the route day and the price drops.`,
    },
    whyUs: {
      heading: "Why people send pictures to their HOA after",
      bullets: [
        {
          title: "Soft-wash, not blast-and-pray",
          body: "We don't strip paint or carve lines into your concrete. Cleaning is a chemistry job, not a horsepower contest.",
          icon: "shield-halved",
        },
        {
          title: "Plants and pets respected",
          body: "We rinse and tarp landscaping before the wash and rinse again after. Your dog can stay in the yard.",
          icon: "leaf",
        },
        {
          title: "On-time, every time",
          body: "Two-hour arrival window, texted on the morning of. We're done before lunch on most homes.",
          icon: "clock",
        },
      ],
    },
    faq: {
      heading: "Common questions",
      items: () => [
        {
          question: "How long does a typical house take?",
          answer:
            "Most single-story homes take 90 minutes to 2 hours. Two-story takes 2-3. Driveways add about an hour.",
        },
        {
          question: "Do I need to be home?",
          answer:
            "Not unless you want to be. We just need access to a working outdoor spigot and the gates left unlocked.",
        },
        {
          question: "How often should it be done?",
          answer: "Most homes look freshly washed for 12-18 months. Shaded north-facing walls show growth sooner.",
        },
      ],
    },
    contact: {
      heading: (company) => `Get a quote from ${company}`,
      body: (_company, city) =>
        `Text a couple photos of the property and we'll quote it back the same day. Most ${cityOrArea(city)} homes are between $189 and $429.`,
    },
  },

  // ────────────────────── ROOFING ──────────────────────
  roofing: {
    templateKey: "roofing_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} roofing`,
      headline: () =>
        `Roofs that outlast the warranty.`,
      subheadline: (_company, _city) =>
        `Repairs, full replacements, and honest inspections. We climb up, take photos, and explain what we found in plain English. No high-pressure sit-down sales.`,
      primaryCtaLabel: "Schedule a free inspection",
      secondaryCtaLabel: "Call now",
    },
    services: {
      heading: "What we do",
      items: [
        {
          title: "Full roof replacement",
          body: "Tear-off, deck inspection, ice & water, drip edge, synthetic underlayment, then architectural shingles. One crew, start to finish, usually one day.",
          icon: "house-chimney",
        },
        {
          title: "Repair and storm response",
          body: "Lifted shingles, flashing leaks, missing ridge caps, and storm damage walks. We document everything for your insurance carrier.",
          icon: "screwdriver-wrench",
        },
        {
          title: "Inspections and pre-listing reports",
          body: "Buying or selling? We'll climb up, take photos, write a one-page report, and stand behind it.",
          icon: "circle-check",
        },
      ],
    },
    serviceArea: {
      heading: "Local crews, local supply houses",
      body: (company, city) =>
        `${company} works ${cityOrArea(city)} and the surrounding counties. Our material comes from suppliers within 30 miles, so storm season doesn't slow us down.`,
    },
    whyUs: {
      heading: "Why homeowners choose us over the door-knockers",
      bullets: [
        {
          title: "We're not a storm-chasing crew",
          body: "Same phone, same crew, same address as five years ago. If you have a question after the warranty starts, we pick up.",
          icon: "shield-halved",
        },
        {
          title: "Workmanship warranty in writing",
          body: "Five-year labor warranty plus the manufacturer's material warranty. Both delivered as PDFs the day we finish.",
          icon: "circle-check",
        },
        {
          title: "Cleanup that earns the tip",
          body: "Magnetic sweep over the lawn and driveway, debris hauled the same day, no nail in your tire next month.",
          icon: "broom",
        },
      ],
    },
    faq: {
      heading: "Roofing questions, straight answers",
      items: () => [
        {
          question: "How long does a full replacement take?",
          answer:
            "A typical 2,400 sq ft home is one long day. Larger or steep-pitch roofs go to two. We'll give you the crew schedule the day we sign.",
        },
        {
          question: "Do you handle insurance claims?",
          answer:
            "Yes. We meet the adjuster on the roof, walk the damage with them, and supply the line-item documentation they need.",
        },
        {
          question: "What shingle do you install?",
          answer:
            "We default to architectural laminates from GAF or Owens Corning with a 30-year limited warranty. Upgrades to designer or impact-rated are available.",
        },
      ],
    },
    contact: {
      heading: (company) => `Have ${company} take a look`,
      body: (_company, city) =>
        `Free inspections, no obligation, photo report sent to your phone. Most ${cityOrArea(city)} homeowners hear from us within 90 minutes of calling.`,
    },
  },

  // ────────────────────── HVAC ──────────────────────
  HVAC: {
    templateKey: "hvac_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} heating & cooling`,
      headline: () =>
        `Comfort, same day.`,
      subheadline: (_company, city) =>
        `Same-day service for AC and heat, fair flat-rate pricing, and technicians who actually explain what's wrong. Serving ${cityOrArea(city)} since the trucks rolled out.`,
      primaryCtaLabel: "Call for same-day service",
      secondaryCtaLabel: "Book a tune-up",
    },
    services: {
      heading: "Service we deliver",
      items: [
        {
          title: "AC repair and replacement",
          body: "Diagnostic in 30 minutes, options on a printed page, no surprise charges. Repair if it makes sense, replace if it doesn't.",
          icon: "snowflake",
        },
        {
          title: "Furnace and heat-pump service",
          body: "Ignition, blower, and gas-valve issues handled by techs who carry parts on the truck. Most calls fixed in one trip.",
          icon: "fire-flame-curved",
        },
        {
          title: "Maintenance club",
          body: "Two visits a year, priority dispatch, 15% off repairs, and no diagnostic fee. Most members make it back on the first visit.",
          icon: "calendar-check",
        },
      ],
    },
    serviceArea: {
      heading: "Trucks dispatched from local yards",
      body: (company, city) =>
        `${company} runs out of yards close to ${cityOrArea(city)}, so the truck is usually 20 minutes away when you need us.`,
    },
    whyUs: {
      heading: "What you get with us",
      bullets: [
        {
          title: "Up-front, flat-rate pricing",
          body: "You see the price before we turn a wrench. No 'time and materials' surprises, no padded labor.",
          icon: "shield-halved",
        },
        {
          title: "Background-checked, in uniform",
          body: "Every tech is W-2, drug-tested, and background-checked. Booties on inside, picture sent before we arrive.",
          icon: "handshake",
        },
        {
          title: "We answer the phone",
          body: "Real person on the line nights and weekends. If you're without heat or AC, we'll find a way to get out today.",
          icon: "phone",
        },
      ],
    },
    faq: {
      heading: "What homeowners ask first",
      items: () => [
        {
          question: "Is there a service-call fee?",
          answer:
            "Diagnostic is $89 and is waived if you proceed with the repair. We'll always quote the repair before starting work.",
        },
        {
          question: "How long does a new system install take?",
          answer:
            "Standard furnace + AC swap is one day. Heat pump conversions or attic units may go a day and a half.",
        },
        {
          question: "Do you finance?",
          answer:
            "Yes, including 0% for 18 months on new systems for qualified buyers. We'll text you the application before the visit.",
        },
      ],
    },
    contact: {
      heading: (company) => `Get ${company} on the way`,
      body: (_company, city) =>
        `Call, text, or book online. Most ${cityOrArea(city)} customers have a tech in the driveway within four hours.`,
    },
  },

  // ────────────────────── PLUMBING ──────────────────────
  plumbing: {
    templateKey: "plumbing_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} plumbing`,
      headline: () =>
        `We answer at 9pm.`,
      subheadline: (_company, _city) =>
        `Leaks, water heaters, drains, repipes, and the slow toilet that's been ignoring everyone in the house. Flat-rate pricing, photos of the work, and a clean kitchen when we leave.`,
      primaryCtaLabel: "Call now",
      secondaryCtaLabel: "Schedule a visit",
    },
    services: {
      heading: "Plumbing we handle",
      items: [
        {
          title: "Leaks and emergency calls",
          body: "Water shut off, leak located, repaired, and pressure tested. We've stopped a lot of basements from being remodels.",
          icon: "droplet",
        },
        {
          title: "Water heaters",
          body: "Tank, tankless, and hybrid. Same-day swaps when we have your model in stock, which is most of them.",
          icon: "fire-flame-curved",
        },
        {
          title: "Drains, fixtures, and remodels",
          body: "Slow drains cleared, fixtures replaced, kitchen and bath rough-ins done to code and inspected.",
          icon: "shower",
        },
      ],
    },
    serviceArea: {
      heading: "Trucks stocked, close to home",
      body: (company, city) =>
        `${company} carries 90% of common parts on the truck, so most ${cityOrArea(city)} jobs finish on the first visit.`,
    },
    whyUs: {
      heading: "Why people put us in their phone",
      bullets: [
        {
          title: "Licensed plumbers, not handymen",
          body: "Master license on file, journeymen on every truck, work pulled and inspected when the city requires it.",
          icon: "shield-halved",
        },
        {
          title: "Photos before and after",
          body: "We text photos of the issue, photos of the repair, and the receipt. Documentation you can hand a future buyer.",
          icon: "circle-check",
        },
        {
          title: "Flat rate, no clock-watching",
          body: "Price is set when you approve, not when we leave. If we run into a real surprise, we ask before charging.",
          icon: "handshake",
        },
      ],
    },
    faq: {
      heading: "Quick answers",
      items: (company) => [
        {
          question: "Do you charge for an estimate?",
          answer:
            "On-site diagnostics are $59 and waived with repair. Phone estimates are free for straightforward jobs.",
        },
        {
          question: "Are you available after hours?",
          answer:
            "Yes — emergency calls 24/7. After-hours rates apply but we tell you exactly what those are before dispatch.",
        },
        {
          question: "Do you warranty the work?",
          answer: `${company} warranties parts for the manufacturer's term and labor for one year on most repairs, two years on water heaters.`,
        },
      ],
    },
    contact: {
      heading: (company) => `Reach ${company}`,
      body: (_company, city) =>
        `Most ${cityOrArea(city)} calls get a truck dispatched within two hours. Emergency? Just call.`,
    },
  },

  // ────────────────────── DENTAL ──────────────────────
  dental: {
    templateKey: "dental_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} dentist`,
      headline: () =>
        `On time. No surprises.`,
      subheadline: (_company, city) =>
        `Cleanings, crowns, Invisalign, and emergency visits. Modern equipment, gentle cleanings, and a front desk that calls your insurance for you. Welcoming new patients across ${cityOrArea(city)}.`,
      primaryCtaLabel: "Book a new-patient visit",
      secondaryCtaLabel: "Call the front desk",
    },
    services: {
      heading: "Care we provide",
      items: [
        {
          title: "Cleanings & exams",
          body: "Gentle hygiene, digital x-rays only when we need them, and a doctor who tells you what's actually urgent.",
          icon: "tooth",
        },
        {
          title: "Crowns, fillings, and same-day repair",
          body: "Mercury-free fillings, same-day crowns when possible, and pain control that actually works.",
          icon: "circle-check",
        },
        {
          title: "Cosmetic & Invisalign",
          body: "Whitening, veneers, and clear aligners with weekly check-ins and a flat case price.",
          icon: "star",
        },
      ],
    },
    serviceArea: {
      heading: "Easy to reach, easy to park",
      body: (company, city) =>
        `${company} is centrally located in ${cityOrArea(city)} with free parking and Saturday hours twice a month.`,
    },
    whyUs: {
      heading: "What patients tell their friends",
      bullets: [
        {
          title: "On-time, every time",
          body: "Most patients are in the chair within five minutes of their appointment.",
          icon: "clock",
        },
        {
          title: "We'll handle the insurance",
          body: "We file in-network and out-of-network. You pay your portion, not the gap.",
          icon: "shield-halved",
        },
        {
          title: "No upselling",
          body: "If a treatment can wait, we'll say so. If it can't, we'll explain why with the x-ray on the screen.",
          icon: "handshake",
        },
      ],
    },
    faq: {
      heading: "Patient questions",
      items: (company) => [
        {
          question: "Are you taking new patients?",
          answer: `Yes — ${company} is welcoming new patients of all ages. Most new-patient visits are scheduled within two weeks.`,
        },
        {
          question: "Do you take my insurance?",
          answer:
            "We're in-network with most major PPOs and file out-of-network claims for the rest. Call the front desk and we'll verify before your visit.",
        },
        {
          question: "Do you see kids?",
          answer:
            "Yes, ages 3 and up. We make first visits short, easy, and rewarding so they leave wanting to come back.",
        },
      ],
    },
    contact: {
      heading: (company) => `Make an appointment with ${company}`,
      body: (_company, _city) =>
        `Call, text, or request online. Same-day emergencies usually fit in by mid-afternoon.`,
    },
  },

  // ────────────────────── MED SPA ──────────────────────
  "med spa": {
    templateKey: "med_spa_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} med spa`,
      headline: () =>
        `Refreshed. Not redone.`,
      subheadline: (_company, _city) =>
        `Botox, fillers, laser, microneedling, and skincare plans built around your face — not a brochure. Free consultations, transparent pricing, and a calm space.`,
      primaryCtaLabel: "Book a free consultation",
      secondaryCtaLabel: "Call us",
    },
    services: {
      heading: "Signature treatments",
      items: [
        {
          title: "Injectables",
          body: "Neuromodulators (Botox, Dysport) and HA fillers placed by licensed injectors. Subtle, considered, never overdone.",
          icon: "spa",
        },
        {
          title: "Laser & skin",
          body: "IPL, laser hair removal, microneedling with PRP, and chemical peels matched to your tone and goals.",
          icon: "bolt",
        },
        {
          title: "Memberships & skincare",
          body: "Monthly memberships that include treatments and clinical-grade skincare at member pricing.",
          icon: "calendar-check",
        },
      ],
    },
    serviceArea: {
      heading: "A calm clinic, not a sales floor",
      body: (company, city) =>
        `${company} is in ${cityOrArea(city)} with private treatment rooms, evening hours twice a week, and a quiet recovery area.`,
    },
    whyUs: {
      heading: "Why clients refer their sister",
      bullets: [
        {
          title: "Real medical oversight",
          body: "Treatments performed under the direction of an MD with a signed protocol on every visit.",
          icon: "shield-halved",
        },
        {
          title: "Honest, conservative dosing",
          body: "We err on the lower side and bring you back two weeks later if you want more. You can't take filler back out.",
          icon: "handshake",
        },
        {
          title: "Transparent pricing",
          body: "Per-unit pricing posted in the consult. No 'package' upsells before we know what you actually need.",
          icon: "circle-check",
        },
      ],
    },
    faq: {
      heading: "Common questions",
      items: () => [
        {
          question: "How much does a typical Botox visit cost?",
          answer:
            "Per-unit pricing — most first-time clients spend between $260 and $480 depending on areas treated. Quoted before we start.",
        },
        {
          question: "Will I look 'done'?",
          answer:
            "Not the way we dose. Our clients usually hear that they look rested or sharper, not that they had work done.",
        },
        {
          question: "Is there downtime?",
          answer:
            "Botox, none. Filler, mild bruising for some clients. Laser and microneedling, 1-3 days of pinkness depending on the device.",
        },
      ],
    },
    contact: {
      heading: (company) => `Schedule a consultation with ${company}`,
      body: (_company, _city) =>
        `Free 30-minute consults with an injector, no pressure to book a treatment that day.`,
    },
  },

  // ────────────────────── JUNK REMOVAL ──────────────────────
  "junk removal": {
    templateKey: "junk_removal_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} junk removal`,
      headline: () =>
        `Gone by lunch.`,
      subheadline: (_company, city) =>
        `Garage cleanouts, furniture haul-away, estate clear-outs, and post-renovation debris. Two-person crew, big truck, fixed price before we lift anything in ${cityOrArea(city)}.`,
      primaryCtaLabel: "Get a same-day quote",
      secondaryCtaLabel: "Call now",
    },
    services: {
      heading: "What we haul",
      items: [
        {
          title: "Garage and basement cleanouts",
          body: "We come in, you point. Two people moving, one truck loaded, swept clean before we leave.",
          icon: "warehouse",
        },
        {
          title: "Furniture and appliance pickup",
          body: "Couches, mattresses, fridges, treadmills. Up two flights or down to the curb — same price.",
          icon: "couch",
        },
        {
          title: "Post-renovation and estate clear-outs",
          body: "Drywall debris, contractor leftovers, full-home estates. We sort donatable items separately when we can.",
          icon: "trash-can",
        },
      ],
    },
    serviceArea: {
      heading: "Routes through your zip every day",
      body: (company, city) =>
        `${company} runs ${cityOrArea(city)} routes daily. Same-day pickup is usually possible if you call before noon.`,
    },
    whyUs: {
      heading: "Why people text us pictures and skip the form",
      bullets: [
        {
          title: "All-in flat pricing",
          body: "Quoted on the truck before we lift. The price covers labor, dumping fees, and the sweep-up.",
          icon: "shield-halved",
        },
        {
          title: "We donate what we can",
          body: "Working appliances, sturdy furniture, and unopened goods get dropped at local nonprofits when possible.",
          icon: "leaf",
        },
        {
          title: "Two-hour arrival window",
          body: "No waiting around all day. We text when we're 30 minutes out and on our way.",
          icon: "clock",
        },
      ],
    },
    faq: {
      heading: "Common questions",
      items: () => [
        {
          question: "How is pricing calculated?",
          answer:
            "By how much of the truck your stuff fills. We give you the price after a quick walk-through, before any lifting.",
        },
        {
          question: "What can't you take?",
          answer:
            "Hazardous waste like paint thinner, full propane tanks, and tires (depending on county). We'll point you to the right disposal.",
        },
        {
          question: "Same-day service?",
          answer:
            "Usually yes if you call before noon. Saturdays book out — earlier is better.",
        },
      ],
    },
    contact: {
      heading: (company) => `Get ${company} on your driveway`,
      body: (_company, city) =>
        `Text photos for a faster quote, or call and tell us what's there. We're in ${cityOrArea(city)} every day.`,
    },
  },

  // ────────────────────── MOBILE DETAILING ──────────────────────
  "mobile detailing": {
    templateKey: "mobile_detailing_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} mobile detailing`,
      headline: () =>
        `We bring the shop to your driveway.`,
      subheadline: (_company, city) =>
        `We pull up with water, power, and a full kit. You stay inside. Two to four hours later your car looks like the dealer demo. Serving ${cityOrArea(city)} weekly.`,
      primaryCtaLabel: "Book a detail",
      secondaryCtaLabel: "See packages",
    },
    services: {
      heading: "Packages",
      items: [
        {
          title: "Refresh — exterior + light interior",
          body: "Hand wash, wheels, tires dressed, windows in and out, vacuum, wipe-down. About 90 minutes.",
          icon: "car",
        },
        {
          title: "Full detail",
          body: "Decontamination wash, clay bar, sealant, full interior shampoo and steam, leather conditioned. 3-4 hours.",
          icon: "soap",
        },
        {
          title: "Paint correction & coating",
          body: "Single or two-stage polish to remove swirls and light scratches, then a 1-3 year ceramic coating.",
          icon: "star",
        },
      ],
    },
    serviceArea: {
      heading: "We come to your home or office",
      body: (company, city) =>
        `${company} is fully self-sufficient — we bring water, power, and lighting. ${cityOrArea(city)} routes book out about a week ahead.`,
    },
    whyUs: {
      heading: "Why customers stay on the schedule",
      bullets: [
        {
          title: "Pro products, real technique",
          body: "Foam guns, microfiber towels rotated by panel, pH-balanced wheel cleaner. No drive-through scratches here.",
          icon: "shield-halved",
        },
        {
          title: "Self-contained setup",
          body: "Onboard water tank and inverter — no need for your hose, no water on your driveway.",
          icon: "circle-check",
        },
        {
          title: "Schedule that respects your day",
          body: "We arrive when we said, finish when we promised, and get out of your way.",
          icon: "clock",
        },
      ],
    },
    faq: {
      heading: "Common questions",
      items: () => [
        {
          question: "Do you need anything from me?",
          answer:
            "Just a parking spot. We bring water, power, and lighting. Drop the keys with us and go back to your day.",
        },
        {
          question: "How long does a full detail take?",
          answer:
            "Most sedans and SUVs are 3-4 hours. Full-size trucks and three-row SUVs add an hour. We send updates as we work.",
        },
        {
          question: "Do you remove pet hair?",
          answer:
            "Yes — included in the full detail. Heavily-shed vehicles may need a deep-clean upgrade, which we'll quote up front.",
        },
      ],
    },
    contact: {
      heading: (company) => `Book ${company}`,
      body: (_company, _city) =>
        `Pick a day, send your address, and tell us a little about the car. Confirmation back the same day.`,
    },
  },

  // ────────────────────── LANDSCAPING ──────────────────────
  landscaping: {
    templateKey: "landscaping_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} landscaping`,
      headline: () =>
        `The best yard on the block.`,
      subheadline: (_company, city) =>
        `Weekly mows that hit every edge, beds that hold their shape, and a hedge line you can read across the street. ${cityOrArea(city)} crews who treat your lawn like it's the model home on the block.`,
      primaryCtaLabel: "Get a free quote",
      secondaryCtaLabel: "See our work",
    },
    services: {
      heading: "What our crews handle",
      items: [
        {
          title: "Weekly mow & maintenance",
          body: "Cut, trim, edge, blow. Same crew, same day each week, so your yard looks dialed in instead of just freshly cut.",
          icon: "leaf",
        },
        {
          title: "Bed care & seasonal color",
          body: "Mulch refresh, weed pulls, pre-emergent, and seasonal flowers swapped in twice a year. Beds that frame the house instead of disappearing into it.",
          icon: "tree",
        },
        {
          title: "Hedges, shaping, and pruning",
          body: "Boxwoods, hollies, crepe myrtles, and the back-fence privacy line. We shape for the species, not with a single template.",
          icon: "scissors",
        },
      ],
    },
    serviceArea: {
      heading: "Routes already on your street",
      body: (company, city) =>
        `${company} runs ${cityOrArea(city)} on a fixed weekly schedule. Tuesdays in the north end, Thursdays south, Fridays for monthly clients. Get on the route and the price holds for the season.`,
    },
    whyUs: {
      heading: "Why neighbors switch to us mid-season",
      bullets: [
        {
          title: "The same crew every week",
          body: "Two-person team that knows your gates, your dog, the bed where the sprinkler heads hide. No rotating subcontractors.",
          icon: "handshake",
        },
        {
          title: "Edges and detail you'll notice",
          body: "Stick-edged driveways, blown sidewalks, and the line at the curb sharpened every visit. The boring stuff that sells the cut.",
          icon: "circle-check",
        },
        {
          title: "Drought-aware and water-wise",
          body: "We mow taller in summer, time the irrigation to your zone, and mulch deep so your beds aren't drinking through the August heat.",
          icon: "droplet",
        },
      ],
    },
    faq: {
      heading: "Common questions",
      items: () => [
        {
          question: "Do I sign a contract?",
          answer:
            "Month-to-month. Cancel anytime with two weeks' notice. We'd rather earn next month than lock you in.",
        },
        {
          question: "What's included in a weekly mow?",
          answer:
            "Mow, line-trim around all obstacles, edged hard surfaces, and a full blow-off of driveways, walks, and patio. Beds and pruning are billed separately.",
        },
        {
          question: "Are you licensed and insured?",
          answer:
            "Yes — general liability and workers' comp on every employee. Certificate sent before the first visit on request.",
        },
      ],
    },
    contact: {
      heading: (company) => `Get on the route with ${company}`,
      body: (_company, city) =>
        `Send your address and a couple photos of the yard. We'll have a price and a start date back the same day in ${cityOrArea(city)}.`,
    },
  },

  // ────────────────────── PAINTING ──────────────────────
  painting: {
    templateKey: "painting_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} painting`,
      headline: () =>
        `Walls done right.`,
      subheadline: (_company, city) =>
        `Interior repaints, full exterior packages, and the tricky stairwells most crews skip. Clean lines, full coverage, and a job site you'd let a designer walk through. Working across ${cityOrArea(city)}.`,
      primaryCtaLabel: "Book your color consult",
      secondaryCtaLabel: "Get a free estimate",
    },
    services: {
      heading: "What we paint",
      items: [
        {
          title: "Interior repaint",
          body: "Walls, ceilings, trim, doors. Furniture moved and protected, cuts hand-rolled where it matters, and floors covered before a brush comes out.",
          icon: "paint-roller",
        },
        {
          title: "Full exterior package",
          body: "Pressure wash, scrape, prime, and two coats of premium paint. Caulked joints and warrantied for the life of the paint manufacturer's coverage.",
          icon: "house-chimney",
        },
        {
          title: "Cabinets & trim refinish",
          body: "Doors pulled, sprayed in a controlled environment, and re-hung with new hardware. Gives a kitchen a $30k feel for a fraction.",
          icon: "paintbrush",
        },
      ],
    },
    serviceArea: {
      heading: "Local crew, local references",
      body: (company, city) =>
        `${company} works ${cityOrArea(city)} and the surrounding neighborhoods. Most of our jobs come from a neighbor pointing at a house and asking who painted it.`,
    },
    whyUs: {
      heading: "Why our walls hold up",
      bullets: [
        {
          title: "Prep is half the price",
          body: "Most failed paint jobs failed at prep. We sand, fill, prime, and sand again. The paint is the easy part.",
          icon: "shield-halved",
        },
        {
          title: "Premium product, no upcharge",
          body: "Sherwin-Williams Emerald or Benjamin Moore Aura on every job, included. We don't bait-and-switch with builder-grade paint at the back of the truck.",
          icon: "star",
        },
        {
          title: "Daily clean site, end-of-day reset",
          body: "Drop cloths down, rooms reset before we leave, and a punch-list walk on the last day so nothing slips.",
          icon: "broom",
        },
      ],
    },
    faq: {
      heading: "Common questions",
      items: () => [
        {
          question: "How long until I can use the room?",
          answer:
            "Walls dry in 2-4 hours. Most rooms are back in service the same evening. Cabinet doors take 5-7 days to fully cure before stacking dishes.",
        },
        {
          question: "How do you handle color choice?",
          answer:
            "Free consult with samples on your wall before the start date. We'll bring the most popular trim and ceiling whites and three options in your accent color.",
        },
        {
          question: "Do you fix the wall before painting?",
          answer:
            "Holes, cracks, and old caulk lines are included. Major drywall replacement is a separate line item, but we'll handle it if you want one crew start to finish.",
        },
      ],
    },
    contact: {
      heading: (company) => `Walk through with ${company}`,
      body: (_company, city) =>
        `Send a few photos of the rooms or the exterior. We'll bring color samples and a written quote to your door in ${cityOrArea(city)} within the week.`,
    },
  },

  // ────────────────────── ELECTRICAL ──────────────────────
  electrical: {
    templateKey: "electrical_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} licensed electrician`,
      headline: () =>
        `Licensed. Permitted. On site this week.`,
      subheadline: (_company, city) =>
        `Panel upgrades, EV chargers, generator hookups, and the buzzing outlet in the kitchen you've been ignoring. Master-electrician-led crews working ${cityOrArea(city)} on safety-first jobs.`,
      primaryCtaLabel: "Book a service call",
      secondaryCtaLabel: "Get a quote",
    },
    services: {
      heading: "What we wire",
      items: [
        {
          title: "Panel upgrades & service changes",
          body: "100A to 200A or 200A to 400A swaps, permitted and inspected. We coordinate with the utility so the power-off window is hours, not days.",
          icon: "bolt",
        },
        {
          title: "EV chargers & generators",
          body: "Level 2 home chargers wired to a dedicated 240V circuit. Whole-house generator hookups with automatic transfer switch. Done to manufacturer spec.",
          icon: "plug",
        },
        {
          title: "Lighting, outlets, troubleshooting",
          body: "Recessed lighting, smart switches, GFCI/AFCI retrofit, and the mystery breaker that trips when the microwave runs. Rooted out at the source.",
          icon: "lightbulb",
        },
      ],
    },
    serviceArea: {
      heading: "Same-week service across the metro",
      body: (company, city) =>
        `${company} dispatches across ${cityOrArea(city)} and surrounding counties. Service calls book inside three business days. Emergencies — sparking, smoke, dead panel — get same-day priority.`,
    },
    whyUs: {
      heading: "Why our work passes inspection the first time",
      bullets: [
        {
          title: "Master electrician on every job",
          body: "Not a salesperson, not a junior tech. The licensed master pulls the permit, scopes the work, and stamps the inspection.",
          icon: "shield-halved",
        },
        {
          title: "NEC-current, every install",
          body: "We pull permits even when the homeowner doesn't ask. Means your insurance, resale, and inspection records all line up the day you sell.",
          icon: "circle-check",
        },
        {
          title: "Clean panel, labeled circuits",
          body: "Every breaker labeled, neutral and grounds dressed flat, and a photo of the finished panel sent to you. The next electrician will thank us.",
          icon: "gauge",
        },
      ],
    },
    faq: {
      heading: "Common questions",
      items: () => [
        {
          question: "Are you licensed and insured?",
          answer:
            "Yes — state-licensed master electrician, $2M general liability, and full workers' comp. License and insurance certificate sent on request.",
        },
        {
          question: "Do you handle the permit?",
          answer:
            "On any work that requires one, yes — pulled in our name, inspected with the AHJ, and the closed permit emailed to you when complete.",
        },
        {
          question: "Do you provide written estimates?",
          answer:
            "Always. Service calls have a flat trip fee, and any work over that gets a written, signed estimate before we touch a wire.",
        },
      ],
    },
    contact: {
      heading: (company) => `Schedule with ${company}`,
      body: (_company, city) =>
        `Tell us what's going on — sparking outlet, full panel, EV install — and we'll quote it or book a service window in ${cityOrArea(city)} the same day you call.`,
    },
  },

  // ────────────────────── AUTO REPAIR ──────────────────────
  "auto repair": {
    templateKey: "auto_repair_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} auto repair`,
      headline: () =>
        `Dealer work. Independent price.`,
      subheadline: (_company, city) =>
        `Diagnostics that actually find the problem, repairs done with OEM-grade parts, and a quote in writing before we lift a wrench. ASE-certified techs on the floor in ${cityOrArea(city)}.`,
      primaryCtaLabel: "Book a service",
      secondaryCtaLabel: "Get a quote",
    },
    services: {
      heading: "What we work on",
      items: [
        {
          title: "Diagnostics & check-engine",
          body: "Code pull plus full systems scan, road test, and a written diagnosis with photos of what we found. No guessing, no parts-shotgun repairs.",
          icon: "gauge",
        },
        {
          title: "Brakes, suspension, and steering",
          body: "Rotors, pads, struts, control arms, and alignments. Done on a four-corner rack with calibrated equipment, then road-tested before pickup.",
          icon: "car",
        },
        {
          title: "Maintenance & fluids",
          body: "Oil services, transmission flushes, coolant exchanges, brake fluid bleeds. We follow your manufacturer's interval — not a generic chain script.",
          icon: "oil-can",
        },
      ],
    },
    serviceArea: {
      heading: "One shop, the whole metro",
      body: (company, city) =>
        `${company} serves ${cityOrArea(city)} and the surrounding suburbs. Free local pickup and drop-off inside a ten-mile radius. Loaner cars on multi-day jobs.`,
    },
    whyUs: {
      heading: "Why drivers leave the dealer for us",
      bullets: [
        {
          title: "ASE-certified mechanics",
          body: "Every tech holds at least one ASE cert in the system they're working on. Most hold five-plus. We invest in training quarterly.",
          icon: "wrench",
        },
        {
          title: "Photos, video, written quote",
          body: "Digital inspection texted to your phone with photos of the worn part and a written quote before we start work. You decide what gets fixed.",
          icon: "circle-check",
        },
        {
          title: "Two-year, 24K-mile warranty",
          body: "Doubled the industry-standard warranty on parts and labor. If something we touched fails, you don't pay twice.",
          icon: "shield-halved",
        },
      ],
    },
    faq: {
      heading: "Common questions",
      items: () => [
        {
          question: "Do I need an appointment?",
          answer:
            "Yes — we book the bay so your car isn't sitting all day. Drop-offs the day before are welcome with a key drop.",
        },
        {
          question: "Do you work on European cars?",
          answer:
            "BMW, Mercedes, Audi, VW, Volvo, and Mini. We have the OEM scan tools and tech support contracts for the major European platforms.",
        },
        {
          question: "Do you handle insurance and warranty work?",
          answer:
            "Yes on most extended warranty platforms. We'll call the carrier from the shop, get authorization, and bill them direct.",
        },
      ],
    },
    contact: {
      heading: (company) => `Book a bay at ${company}`,
      body: (_company, city) =>
        `Tell us what your car is doing, when it's available, and your year/make/model. We'll text back a service window in ${cityOrArea(city)} same day.`,
    },
  },

  // ────────────────────── PEST CONTROL ──────────────────────
  "pest control": {
    templateKey: "pest_control_v1",
    hero: {
      eyebrow: (city) => `${cityOrArea(city)} pest control`,
      headline: () =>
        `Out. And gone for good.`,
      subheadline: (_company, city) =>
        `Quarterly perimeter treatment, targeted interior care, and the weird seasonal stuff — German roaches, fire ants, fall mice, summer wasps. Family-and-pet-safe products in ${cityOrArea(city)} homes.`,
      primaryCtaLabel: "Get a free inspection",
      secondaryCtaLabel: "Book a service",
    },
    services: {
      heading: "What we treat",
      items: [
        {
          title: "Quarterly perimeter program",
          body: "Four scheduled visits a year that keep ants, spiders, roaches, and rodents from making it inside. We swap product seasonally so resistance can't build.",
          icon: "shield-halved",
        },
        {
          title: "Targeted interior treatment",
          body: "Gel baits, IGRs, and non-repellent perimeters in kitchens, baths, and laundries. Safe for kids and pets the moment we leave.",
          icon: "spray-can-sparkles",
        },
        {
          title: "Termite & rodent exclusion",
          body: "Liquid termite barriers, bait stations, and full-home rodent exclusion that seals every entry point we find. Annual inspection included.",
          icon: "bug",
        },
      ],
    },
    serviceArea: {
      heading: "On a route through your neighborhood",
      body: (company, city) =>
        `${company} runs a fixed quarterly route through ${cityOrArea(city)} and the surrounding counties. Same tech every visit, same arrival window, same time of year.`,
    },
    whyUs: {
      heading: "Why our treatments hold",
      bullets: [
        {
          title: "Family-and-pet safe products",
          body: "We use the same low-impact formulations licensed for daycares and food-service kitchens. No 'stay out four hours' warning sheets.",
          icon: "leaf",
        },
        {
          title: "State-licensed applicators",
          body: "Every tech holds a state pest-control license and recertifies annually. We never send untrained help to handle pesticides on your property.",
          icon: "circle-check",
        },
        {
          title: "Free re-treats between visits",
          body: "If something pops up between your quarterly visits, we come back free. The program isn't quarterly results, it's coverage.",
          icon: "handshake",
        },
      ],
    },
    faq: {
      heading: "Common questions",
      items: () => [
        {
          question: "Is the treatment safe for my kids and dogs?",
          answer:
            "Yes — products dry within 30 minutes and are safe to walk on after that. We'll tell you up front when a treatment needs a longer reentry window.",
        },
        {
          question: "How fast will the bugs go away?",
          answer:
            "Most homeowners see the activity drop sharply inside seven days and resolve fully inside 30. Heavy roach or rodent issues sometimes need a follow-up at no charge.",
        },
        {
          question: "Do I have to sign a contract?",
          answer:
            "Quarterly service is month-to-month with a 30-day cancel. One-time and emergency visits have no commitment at all.",
        },
      ],
    },
    contact: {
      heading: (company) => `Book an inspection with ${company}`,
      body: (_company, city) =>
        `Tell us what you're seeing — and where — and we'll book a free inspection in ${cityOrArea(city)} the same week. Quote and treatment plan handed to you on site.`,
    },
  },
};

export function getCopyForIndustry(industry: LeadIndustry): IndustryCopy {
  return INDUSTRY_COPY[industry];
}
