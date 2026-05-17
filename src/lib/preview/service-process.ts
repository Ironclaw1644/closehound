import type { LeadIndustry } from "@/lib/industries";

export type ProcessStep = {
  step: string;
  title: string;
  body: string;
};

// Per-industry "How we do it" — 4 steps each. Hand-written, plain language,
// matches the voice we already use across the templates.

export const SERVICE_PROCESS: Record<LeadIndustry, ProcessStep[]> = {
  handyman: [
    {
      step: "01",
      title: "Send your list",
      body: "Text the list to us — photos help. We'll quote it back the same day.",
    },
    {
      step: "02",
      title: "Pick a day",
      body: "Most jobs land within the week. Two-hour arrival window, texted on the morning of.",
    },
    {
      step: "03",
      title: "We work",
      body: "One trip, one bill. Drop cloths down, dust contained, and we batch your list so nothing else gets postponed.",
    },
    {
      step: "04",
      title: "Walk-through",
      body: "We walk every item with you before we leave. If something isn't right, it gets fixed before we close out.",
    },
  ],
  "pressure washing": [
    {
      step: "01",
      title: "Snap a few photos",
      body: "Send pictures of the house, drive, deck — whatever you want cleaned. We'll quote a flat rate.",
    },
    {
      step: "02",
      title: "We pre-treat",
      body: "Soft-wash detergent on siding, surface-cleaner on concrete. We rinse landscaping before and after — your plants are safe.",
    },
    {
      step: "03",
      title: "We wash",
      body: "Pressure tuned to the surface. No fuzzed-up deck boards, no carved lines in concrete.",
    },
    {
      step: "04",
      title: "Final rinse",
      body: "Final rinse on landscaping. We send before/after photos so you can show the neighbors.",
    },
  ],
  roofing: [
    {
      step: "01",
      title: "Free inspection",
      body: "We climb up, take photos, and walk you through what we found in plain English. No high-pressure sit-down sales.",
    },
    {
      step: "02",
      title: "Written estimate",
      body: "Materials spelled out by name (GAF, CertainTeed, etc.). Labor and warranty broken out so you can compare apples to apples.",
    },
    {
      step: "03",
      title: "Schedule + permit",
      body: "We pull the permit. You pick a start date that works for you — most projects land inside 2 weeks.",
    },
    {
      step: "04",
      title: "Tear-off + replace",
      body: "Most homes are a 1-day install. Magnetic sweep of the yard at the end so no nails get left behind.",
    },
  ],
  HVAC: [
    {
      step: "01",
      title: "Diagnose",
      body: "Same-day arrival on most calls. Tech walks you through the issue with photos and a written quote before any work starts.",
    },
    {
      step: "02",
      title: "Approve the price",
      body: "Flat-rate. No 'while we're here' surprises. You see the cost before we touch a tool.",
    },
    {
      step: "03",
      title: "Repair or replace",
      body: "Most repairs finish that day. Full system replacement is typically a 1-day install with a new thermostat included.",
    },
    {
      step: "04",
      title: "Verify performance",
      body: "Full system check after install: pressures, supply/return temps, drain line. We don't leave until it's running clean.",
    },
  ],
  plumbing: [
    {
      step: "01",
      title: "Call or text",
      body: "Phone is answered live during business hours; emergency line answered 24/7. We confirm a tech and a window inside an hour.",
    },
    {
      step: "02",
      title: "Diagnose + quote",
      body: "On-site diagnosis, photo of the issue, flat-rate quote in hand before any wrenches turn.",
    },
    {
      step: "03",
      title: "Fix it",
      body: "Most repairs are same-day. Repipes and water heater installs are next-day with parts on the truck.",
    },
    {
      step: "04",
      title: "Clean kitchen",
      body: "Kitchen cleaner than when we started. Photos of the finished work emailed to you before we leave.",
    },
  ],
  dental: [
    {
      step: "01",
      title: "New-patient call",
      body: "Front desk runs your insurance before you arrive — you'll know your copay before you walk in.",
    },
    {
      step: "02",
      title: "Comprehensive exam",
      body: "Full exam, x-rays, perio screening, intra-oral photos. Treatment plan walked through with a member of the team.",
    },
    {
      step: "03",
      title: "Treatment",
      body: "We sequence treatment so urgent items go first; cosmetic and elective phase later. Nothing gets done without your sign-off.",
    },
    {
      step: "04",
      title: "Maintenance plan",
      body: "Six-month cleanings booked before you leave. Reminders by text the week of.",
    },
  ],
  "med spa": [
    {
      step: "01",
      title: "Free consultation",
      body: "30-minute consult. We listen first; we'll tell you when you don't need a treatment we offer.",
    },
    {
      step: "02",
      title: "MD-supervised plan",
      body: "Medical director reviews the plan. Posted per-unit pricing — no surprises at checkout.",
    },
    {
      step: "03",
      title: "Treatment",
      body: "Conservative dosing on the first visit. We'd rather see you back than push too hard once.",
    },
    {
      step: "04",
      title: "Two-week follow-up",
      body: "Photo + virtual check at the two-week mark. Touch-ups (when needed) are part of the package.",
    },
  ],
  "junk removal": [
    {
      step: "01",
      title: "Send a photo",
      body: "Snap a quick photo of the pile. We'll text back a flat-rate quote — usually inside 15 minutes.",
    },
    {
      step: "02",
      title: "Pick a window",
      body: "Same-day or next-day. Two-hour arrival window, on-route texts on the day of.",
    },
    {
      step: "03",
      title: "We haul",
      body: "Two-person crew, big truck. We do the carrying. You stay inside if you want.",
    },
    {
      step: "04",
      title: "Donate or recycle",
      body: "Donate-able items go to local charity (with a receipt for you). Recycle-able items diverted from landfill.",
    },
  ],
  "mobile detailing": [
    {
      step: "01",
      title: "Book online",
      body: "Pick a package and a window. We confirm by text the day before with the arrival time.",
    },
    {
      step: "02",
      title: "We pull up",
      body: "Self-contained truck — water, power, lights, vacuum. We need a parking spot, that's it.",
    },
    {
      step: "03",
      title: "Detail",
      body: "Foam wash, clay if needed, paint correction, interior steam, sealant or coating. Photos as we work.",
    },
    {
      step: "04",
      title: "Walk-around",
      body: "Walk-around with you (or photo handoff). If you find a missed spot, we fix it on the spot.",
    },
  ],
  landscaping: [
    {
      step: "01",
      title: "Walk the property",
      body: "Free walk-through. We mark beds, trees, sprinklers and the bid is broken out by area.",
    },
    {
      step: "02",
      title: "Get on the route",
      body: "Pick weekly or bi-weekly. Same crew every visit, same arrival window, same time of week.",
    },
    {
      step: "03",
      title: "Cut + edge + clean",
      body: "Mow, line-trim, stick-edge hard surfaces, blow off drives and sidewalks. Beds maintained on a schedule that fits your scope.",
    },
    {
      step: "04",
      title: "Seasonal review",
      body: "Quarterly walk-through to plan mulch, overseed, pre-emergent, color swap. Nothing happens without your approval.",
    },
  ],
  painting: [
    {
      step: "01",
      title: "Free consult",
      body: "On-site walk-through. We bring sample paint chips and the most common interior whites and trim colors.",
    },
    {
      step: "02",
      title: "Color sampling",
      body: "Three samples on the wall, in the actual lighting. Live with them for a few days before you commit.",
    },
    {
      step: "03",
      title: "Prep + paint",
      body: "Patch, sand, prime, then two finish coats. Drop cloths down, daily reset, premium paint included.",
    },
    {
      step: "04",
      title: "Punch-list walk",
      body: "Walk every wall with you on the last day. Touch-up paint left for you in labeled containers.",
    },
  ],
  electrical: [
    {
      step: "01",
      title: "Service call",
      body: "Master electrician on every visit. Diagnostic up front; written quote before any work begins.",
    },
    {
      step: "02",
      title: "Permit pulled",
      body: "If the work needs a permit, we pull it (in our name) and coordinate inspection with the AHJ.",
    },
    {
      step: "03",
      title: "Install",
      body: "Panels labeled, wires dressed flat, breakers spaced for thermal load. Photos of the finished work emailed to you.",
    },
    {
      step: "04",
      title: "Inspection passed",
      body: "Inspector closes the permit. We hand off the closed permit number for your records and resale.",
    },
  ],
  "auto repair": [
    {
      step: "01",
      title: "Drop off or schedule",
      body: "Same-day appointments when bays are open. Free shuttle inside a 10-mile radius.",
    },
    {
      step: "02",
      title: "Digital inspection",
      body: "Photo + video of every issue. You see what we see — and you decide what gets fixed.",
    },
    {
      step: "03",
      title: "Repair",
      body: "OEM-grade parts, ASE-certified techs. Most diagnostics + repairs land same-day; bigger jobs in 2 days.",
    },
    {
      step: "04",
      title: "Test drive",
      body: "Road test before pickup, alignment check on lift jobs. Every repair carries a 2-year / 24K-mile warranty.",
    },
  ],
  "pest control": [
    {
      step: "01",
      title: "Free inspection",
      body: "Inside, outside, perimeter, attic. We map activity, identify species and entry points, build a plan.",
    },
    {
      step: "02",
      title: "Initial treatment",
      body: "Targeted treatment of the activity hot spots. Family-and-pet-safe products that dry inside 30 minutes.",
    },
    {
      step: "03",
      title: "Quarterly perimeter",
      body: "Same tech every 90 days. Different active ingredient each season so resistance can't build.",
    },
    {
      step: "04",
      title: "Free re-treats",
      body: "Activity between visits? We come back free of charge. Quarterly is coverage, not a counter.",
    },
  ],
};

export function getProcessForIndustry(industry: LeadIndustry): ProcessStep[] {
  return SERVICE_PROCESS[industry];
}
