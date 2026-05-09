import type { LeadIndustry } from "@/lib/industries";

export type PricePoint = {
  label: string;
  startingAt: string; // formatted, e.g. "$189"
  unit: string; // "per visit", "per project", "starting"
  notes?: string;
};

// Per-industry, ordered by typical service-block index 0/1/2 in copy.ts.
// Hand-picked anchor pricing — realistic median ranges. Keep tight: this is shown
// on the website as transparency, not a binding quote.

export const SERVICE_PRICING: Record<LeadIndustry, PricePoint[]> = {
  handyman: [
    { label: "Drywall, doors, and trim", startingAt: "$189", unit: "per visit", notes: "2-hour minimum" },
    { label: "Mounting and installs", startingAt: "$129", unit: "per item", notes: "TV, fan, shelving, hardware" },
    { label: "Honey-do batch", startingAt: "$329", unit: "per afternoon", notes: "5–8 items typical" },
  ],
  "pressure washing": [
    { label: "House soft-wash", startingAt: "$229", unit: "per home", notes: "Single-story" },
    { label: "Driveways and walkways", startingAt: "$149", unit: "per drive", notes: "Up to 600 sq ft" },
    { label: "Decks, fences, and patios", startingAt: "$199", unit: "per deck", notes: "Up to 350 sq ft" },
  ],
  roofing: [
    { label: "Roof inspection", startingAt: "Free", unit: "per visit", notes: "Photo report included" },
    { label: "Repairs (per shingle area)", startingAt: "$389", unit: "starting", notes: "Materials + labor" },
    { label: "Full asphalt replacement", startingAt: "$8,900", unit: "starting", notes: "1500 sq ft, GAF HDZ" },
  ],
  HVAC: [
    { label: "Diagnostic + service call", startingAt: "$89", unit: "flat", notes: "Waived if work is approved" },
    { label: "Repair (parts + labor)", startingAt: "$249", unit: "starting", notes: "Common breakdowns" },
    { label: "System replacement", startingAt: "$6,400", unit: "starting", notes: "16 SEER, 3-ton" },
  ],
  plumbing: [
    { label: "Service call (drains, leaks)", startingAt: "$179", unit: "flat", notes: "Includes diagnosis" },
    { label: "Water heater install", startingAt: "$1,890", unit: "tank", notes: "40 gal · standard install" },
    { label: "Tankless install", startingAt: "$3,990", unit: "starting", notes: "Gas line as needed" },
  ],
  dental: [
    { label: "New-patient cleaning + exam", startingAt: "$229", unit: "per visit", notes: "Most insurance accepted" },
    { label: "Emergency same-day", startingAt: "$149", unit: "per visit", notes: "Triage + temporary fix" },
    { label: "Cosmetic consultation", startingAt: "Free", unit: "per visit", notes: "Whitening, veneers, Invisalign" },
  ],
  "med spa": [
    { label: "Botox / Dysport", startingAt: "$13", unit: "per unit", notes: "Posted price, no minimums" },
    { label: "Filler", startingAt: "$649", unit: "per syringe", notes: "Juvéderm or Restylane" },
    { label: "Skincare consult", startingAt: "Free", unit: "per visit", notes: "MD-supervised" },
  ],
  "junk removal": [
    { label: "Single-item haul-away", startingAt: "$99", unit: "per item", notes: "Couch, fridge, mattress" },
    { label: "Quarter truck", startingAt: "$169", unit: "per load", notes: "Closet or small garage" },
    { label: "Full truckload", startingAt: "$469", unit: "per load", notes: "Estate or full garage" },
  ],
  "mobile detailing": [
    { label: "Refresh wash", startingAt: "$89", unit: "per car", notes: "Hand wash + interior wipe" },
    { label: "Full detail", startingAt: "$259", unit: "per car", notes: "3–4 hour appointment" },
    { label: "Paint correction + ceramic", startingAt: "$899", unit: "starting", notes: "1-stage correction + 1yr coating" },
  ],
  landscaping: [
    { label: "Weekly mow & maintenance", startingAt: "$45", unit: "per visit", notes: "Up to 1/4-acre lot" },
    { label: "Bed care + seasonal color", startingAt: "$229", unit: "per quarter", notes: "Mulch + plantings" },
    { label: "Hedge shaping & pruning", startingAt: "$179", unit: "per visit", notes: "Up to 12 shrubs" },
  ],
  painting: [
    { label: "Single room repaint", startingAt: "$549", unit: "per room", notes: "Walls + ceiling + 1 accent" },
    { label: "Full-home interior", startingAt: "$3,490", unit: "starting", notes: "1500 sq ft, walls + trim" },
    { label: "Exterior repaint", startingAt: "$5,990", unit: "starting", notes: "1500 sq ft, two-coat" },
  ],
  electrical: [
    { label: "Service call diagnostic", startingAt: "$129", unit: "flat", notes: "Credited if work approved" },
    { label: "Panel upgrade (200A)", startingAt: "$3,790", unit: "starting", notes: "Permit + inspection included" },
    { label: "EV charger install", startingAt: "$1,490", unit: "starting", notes: "240V, dedicated circuit" },
  ],
  "auto repair": [
    { label: "Diagnostic + scan", startingAt: "$129", unit: "flat", notes: "Waived with approved repair" },
    { label: "Brake service (per axle)", startingAt: "$329", unit: "per axle", notes: "Rotors + pads, OEM-grade" },
    { label: "Major service (60K/90K)", startingAt: "$649", unit: "per service", notes: "Fluids + inspection + filters" },
  ],
  "pest control": [
    { label: "Initial treatment", startingAt: "$189", unit: "first visit", notes: "Includes inspection" },
    { label: "Quarterly perimeter", startingAt: "$89", unit: "per quarter", notes: "Free re-treats between visits" },
    { label: "Termite + rodent program", startingAt: "$549", unit: "per year", notes: "Liquid barrier + bait stations" },
  ],
};

export function getPricingForIndustry(industry: LeadIndustry): PricePoint[] {
  return SERVICE_PRICING[industry];
}
