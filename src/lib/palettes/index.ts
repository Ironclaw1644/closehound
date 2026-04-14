export type Palette = {
  key: string;
  name: string;
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  accent: string;
  accentContrast: string;
  border: string;
};

export const PALETTE_PRESETS = [
  {
    key: "slate-orange",
    name: "Slate Orange",
    background: "#f5f3ef",
    surface: "#fffaf2",
    text: "#1f2937",
    mutedText: "#5b6472",
    accent: "#dd6b20",
    accentContrast: "#fff7ed",
    border: "#e7d7c7",
  },
  {
    key: "forest-gold",
    name: "Forest Gold",
    background: "#f4f6f1",
    surface: "#fbfcf8",
    text: "#1f3327",
    mutedText: "#526355",
    accent: "#b7791f",
    accentContrast: "#fff8e8",
    border: "#d9e1d4",
  },
  {
    key: "navy-cyan",
    name: "Navy Cyan",
    background: "#f3f7fb",
    surface: "#fcfdff",
    text: "#17324d",
    mutedText: "#4d6277",
    accent: "#0ea5b7",
    accentContrast: "#ecfeff",
    border: "#d7e3ef",
  },
  {
    key: "charcoal-red",
    name: "Charcoal Red",
    background: "#f7f4f4",
    surface: "#fffafa",
    text: "#2d1f23",
    mutedText: "#69585f",
    accent: "#c2410c",
    accentContrast: "#fff7ed",
    border: "#eadbdd",
  },
] as const satisfies readonly Palette[];

export type PaletteKey = (typeof PALETTE_PRESETS)[number]["key"];
