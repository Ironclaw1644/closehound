export const INDUSTRY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Handyman", value: "handyman" },
  { label: "Pressure Washing", value: "pressure washing" },
  { label: "Roofing", value: "roofing" },
  { label: "HVAC", value: "HVAC" },
  { label: "Plumbing", value: "plumbing" },
  { label: "Dental", value: "dental" },
  { label: "Med Spa", value: "med spa" },
  { label: "Junk Removal", value: "junk removal" },
  { label: "Mobile Detailing", value: "mobile detailing" },
] as const;

export type IndustryOption = (typeof INDUSTRY_OPTIONS)[number];
export type IndustryValue = IndustryOption["value"];

export const TARGET_INDUSTRIES = INDUSTRY_OPTIONS.filter(
  (option) => option.value !== "all"
);

export type LeadIndustry =
  | "handyman"
  | "pressure washing"
  | "roofing"
  | "HVAC"
  | "plumbing"
  | "dental"
  | "med spa"
  | "junk removal"
  | "mobile detailing";
