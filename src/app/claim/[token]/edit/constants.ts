// Non-"use server" exports the editor and its server actions both need.

export const ACCENT_PRESET_LIST = [
  "#e8761a", // graphite_orange
  "#1e7a7d", // cream_teal
  "#b6432a", // midnight_clay
  "#f0a922", // steel_amber
  "#c97645", // navy_copper
  "#218a6f", // mint_clinical
  "#b27361", // sand_rose
  "#fcd935", // mustard_black
  "#00b6d6", // obsidian_cyan
  "#3d5a2a", // moss_earth
  "#c33a3a", // charcoal_swatch
  "#ffd400", // voltage_yellow
  "#ff5b14", // shop_orange
  "#0fa45a", // shield_green
] as const;

export type AccentPreset = (typeof ACCENT_PRESET_LIST)[number];
