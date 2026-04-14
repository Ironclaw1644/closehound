import type { TypographyPairing } from "@/lib/site-generator/types";

export const TYPOGRAPHY_PAIRINGS = [
  {
    key: "publico-source-sans",
    headingFamily: "Publico",
    bodyFamily: "Source Sans 3",
  },
  {
    key: "space-grotesk-inter",
    headingFamily: "Space Grotesk",
    bodyFamily: "Inter",
  },
  {
    key: "newsreader-work-sans",
    headingFamily: "Newsreader",
    bodyFamily: "Work Sans",
  },
] as const satisfies readonly TypographyPairing[];
