import {
  Familjen_Grotesk,
  Geist,
  Anton,
  DM_Sans,
  Fraunces,
  Inter_Tight,
  Sora,
  JetBrains_Mono,
  Newsreader,
  Outfit,
  Cormorant_Infant,
  Manrope,
  Italiana,
  Lora,
  Archivo_Black,
  Plus_Jakarta_Sans,
  Bebas_Neue,
  Hanken_Grotesk,
  Instrument_Serif,
  Onest,
  Instrument_Sans,
  Albert_Sans,
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  Bungee,
  Schibsted_Grotesk,
  Karla,
} from "next/font/google";

// Each industry has its own display + body pairing. Loaded as CSS variables
// scoped to the industry component, so a roofing render doesn't pull med-spa fonts.

export const familjenGrotesk = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-familjen",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const anton = Anton({
  subsets: ["latin"],
  variable: "--font-anton",
  weight: "400",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  display: "swap",
});

export const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const cormorantInfant = Cormorant_Infant({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const italiana = Italiana({
  subsets: ["latin"],
  variable: "--font-italiana",
  weight: "400",
  display: "swap",
});

export const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  style: ["normal", "italic"],
  display: "swap",
});

export const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-archivo-black",
  weight: "400",
  display: "swap",
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: "400",
  display: "swap",
});

export const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
  display: "swap",
});

export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const albertSans = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert-sans",
  display: "swap",
});

export const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const bungee = Bungee({
  subsets: ["latin"],
  variable: "--font-bungee",
  weight: "400",
  display: "swap",
});

export const schibstedGrotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

export const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  display: "swap",
});

// Helper: pre-composed className strings for each industry's wrapper.
// Use as: <div className={INDUSTRY_FONT_CLASS.handyman}>...</div>
export const INDUSTRY_FONT_CLASS = {
  handyman: `${familjenGrotesk.variable} ${geist.variable}`,
  "pressure washing": `${anton.variable} ${dmSans.variable}`,
  roofing: `${fraunces.variable} ${interTight.variable}`,
  HVAC: `${sora.variable} ${jetbrainsMono.variable}`,
  plumbing: `${newsreader.variable} ${outfit.variable}`,
  dental: `${cormorantInfant.variable} ${manrope.variable}`,
  "med spa": `${italiana.variable} ${lora.variable}`,
  "junk removal": `${archivoBlack.variable} ${plusJakartaSans.variable}`,
  "mobile detailing": `${bebasNeue.variable} ${hankenGrotesk.variable}`,
  landscaping: `${instrumentSerif.variable} ${onest.variable}`,
  painting: `${instrumentSans.variable} ${albertSans.variable}`,
  electrical: `${ibmPlexSans.variable} ${ibmPlexMono.variable}`,
  "auto repair": `${bungee.variable} ${onest.variable}`,
  "pest control": `${schibstedGrotesk.variable} ${karla.variable}`,
} as const;
