import type { LeadIndustry } from "@/lib/industries";

export type PalettePreset = {
  key: string;
  // Page background, top half / bottom half (gradient).
  background: string;
  // Surface for cards / hero panel.
  surface: string;
  // Body text on light surfaces.
  text: string;
  textMuted: string;
  // Accent (primary CTAs, eyebrows, icons).
  accent: string;
  // Foreground color for text on top of accent.
  accentInk: string;
  // Hairline border on light surfaces.
  border: string;
  // Dark sticky footer / contact band.
  inkBg: string;
  inkText: string;
};

const PALETTES: Record<string, PalettePreset> = {
  // Blue-collar trades: graphite + signal orange. Reads "field crew, no-nonsense".
  graphite_orange: {
    key: "graphite_orange",
    background: "#f4f1ec",
    surface: "#ffffff",
    text: "#101418",
    textMuted: "#525a63",
    accent: "#e8761a",
    accentInk: "#0f1216",
    border: "#dfd8cc",
    inkBg: "#0f1216",
    inkText: "#f5f0e6",
  },
  // Roofing: deep midnight + slate roof red, photography-friendly.
  midnight_clay: {
    key: "midnight_clay",
    background: "#f6f3ee",
    surface: "#ffffff",
    text: "#13171c",
    textMuted: "#4f5862",
    accent: "#b6432a",
    accentInk: "#fff8ee",
    border: "#e1dbd2",
    inkBg: "#13171c",
    inkText: "#f5e9d8",
  },
  // HVAC: cool steel + heating amber.
  steel_amber: {
    key: "steel_amber",
    background: "#eef2f4",
    surface: "#ffffff",
    text: "#0f1822",
    textMuted: "#4b5563",
    accent: "#f0a922",
    accentInk: "#1a1206",
    border: "#d8dee5",
    inkBg: "#0f1822",
    inkText: "#e8eef3",
  },
  // Plumbing: navy + copper. Trustworthy, residential, premium.
  navy_copper: {
    key: "navy_copper",
    background: "#eef2f6",
    surface: "#ffffff",
    text: "#0e1d2c",
    textMuted: "#475569",
    accent: "#c97645",
    accentInk: "#1a0f06",
    border: "#d6dde6",
    inkBg: "#0e1d2c",
    inkText: "#eef2f6",
  },
  // Pressure washing & junk: vivid teal + fresh cream. Before/after vibe.
  cream_teal: {
    key: "cream_teal",
    background: "#f7f3ea",
    surface: "#ffffff",
    text: "#10242a",
    textMuted: "#4a5d62",
    accent: "#1e7a7d",
    accentInk: "#f4fbfa",
    border: "#e2dccf",
    inkBg: "#10242a",
    inkText: "#f7f3ea",
  },
  // Dental: soft mint + clinical white.
  mint_clinical: {
    key: "mint_clinical",
    background: "#f4f9f7",
    surface: "#ffffff",
    text: "#0f2a26",
    textMuted: "#4a615b",
    accent: "#218a6f",
    accentInk: "#f1faf6",
    border: "#d8e6e0",
    inkBg: "#0f2a26",
    inkText: "#e9f4ef",
  },
  // Med spa: warm sand + rose gold.
  sand_rose: {
    key: "sand_rose",
    background: "#faf5f0",
    surface: "#ffffff",
    text: "#251918",
    textMuted: "#6b5751",
    accent: "#b27361",
    accentInk: "#fff7f1",
    border: "#ece1d6",
    inkBg: "#251918",
    inkText: "#f7eee5",
  },
  // Mobile detailing: glossy black + electric cyan.
  obsidian_cyan: {
    key: "obsidian_cyan",
    background: "#eef2f5",
    surface: "#ffffff",
    text: "#0a0f15",
    textMuted: "#4a5762",
    accent: "#00b6d6",
    accentInk: "#04161b",
    border: "#d6dde4",
    inkBg: "#0a0f15",
    inkText: "#e6f5fa",
  },
};

const INDUSTRY_PALETTE: Record<LeadIndustry, string> = {
  handyman: "graphite_orange",
  "pressure washing": "cream_teal",
  roofing: "midnight_clay",
  HVAC: "steel_amber",
  plumbing: "navy_copper",
  dental: "mint_clinical",
  "med spa": "sand_rose",
  "junk removal": "cream_teal",
  "mobile detailing": "obsidian_cyan",
};

export function getPaletteForIndustry(industry: LeadIndustry): PalettePreset {
  const key = INDUSTRY_PALETTE[industry] ?? "graphite_orange";
  return PALETTES[key] ?? PALETTES.graphite_orange;
}

export function getPaletteByKey(key: string | null | undefined): PalettePreset {
  if (!key) {
    return PALETTES.graphite_orange;
  }
  return PALETTES[key] ?? PALETTES.graphite_orange;
}
