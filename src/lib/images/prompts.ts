import type { LeadIndustry } from "@/lib/industries";

const HERO_INSTRUCTIONS_BY_INDUSTRY: Record<LeadIndustry, string> = {
  handyman:
    "Wide editorial photograph of a friendly handyman in a clean denim shirt working in a bright American suburban home, natural daylight through windows, a homeowner watching from the doorway, neutral palette, no text, no logos.",
  "pressure washing":
    "Editorial photograph of a contractor in a uniform pressure-washing the lower siding of a two-story American suburban house, mid-day sun, half-clean half-dirty siding showing the dramatic before-and-after, no people on camera, no text, no logos.",
  roofing:
    "Editorial photograph of a small roofing crew installing architectural shingles on a modest American single-family home, clear blue sky, professional uniforms, ladder visible, no text or branding on shirts, no logos.",
  HVAC:
    "Editorial photograph of an HVAC technician in a clean uniform servicing a modern outdoor air conditioning condenser at a suburban American home, daylight, tools laid out neatly, no text, no logos.",
  plumbing:
    "Editorial photograph of a licensed plumber under a kitchen sink in an American home, headlamp on, wrench in hand, clean toolkit visible, neutral palette, no text, no logos.",
  dental:
    "Editorial photograph of the bright, modern reception of a small American family dental office, neutral wood, soft daylight, plants, friendly receptionist (no faces), no text, no logos.",
  "med spa":
    "Editorial photograph of the calm interior of a small American med spa treatment room, warm lighting, white linens, single succulent plant, no faces, no text, no logos.",
  "junk removal":
    "Editorial photograph of two friendly workers in matching plain T-shirts loading a cleanout pile from a garage into a large white box truck on an American suburban driveway, daylight, no text or logos visible on truck or shirts.",
  "mobile detailing":
    "Editorial photograph of a mobile auto-detailing setup in a residential American driveway, fresh foam on a clean dark sedan, microfiber towels, water tank visible on the truck, no people on camera, no text or logos.",
};

export function buildHeroPrompt(industry: LeadIndustry, businessName: string): string {
  const base = HERO_INSTRUCTIONS_BY_INDUSTRY[industry];
  return [
    base,
    `Make it feel believable for a small local business named "${businessName}". 16:9 aspect ratio. Cinematic, real photography, no AI artifacts, no logos, no text overlays.`,
  ].join(" ");
}

export function buildLogoPrompt(opts: {
  businessName: string;
  industry: LeadIndustry;
  city: string | null;
}): string {
  const initials = opts.businessName
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const niche = ((): string => {
    switch (opts.industry) {
      case "roofing":
        return "a clean iconic mark of a stylized house roof line";
      case "HVAC":
        return "a clean iconic mark of a stylized snowflake combined with a flame";
      case "plumbing":
        return "a clean iconic mark of a stylized water droplet inside a wrench";
      case "handyman":
        return "a clean iconic mark of a hammer crossed with a screwdriver";
      case "pressure washing":
        return "a clean iconic mark of a water spray fanning out";
      case "dental":
        return "a clean iconic mark of a stylized tooth with a soft smile arc";
      case "med spa":
        return "a clean iconic mark of an abstract leaf or lotus";
      case "junk removal":
        return "a clean iconic mark of a stylized box-truck silhouette";
      case "mobile detailing":
        return "a clean iconic mark of a stylized car with a polish swoosh";
      default:
        return "a clean iconic mark suitable for a local service business";
    }
  })();

  return [
    `Create a flat, modern, single-color vector-style logo for a small local business called "${opts.businessName}".`,
    opts.city ? `Based in ${opts.city}, USA.` : "",
    `It is a ${opts.industry} business.`,
    `Combine ${niche} with the initials "${initials}" beneath or beside the mark.`,
    "Use a single bold accent color on a transparent or pure white background.",
    "Output 1024x1024 PNG, centered, with generous whitespace, no extra text other than the initials, no slogans, no photographic elements.",
  ]
    .filter(Boolean)
    .join(" ");
}
