// The Section 8 execution playbook (/guide). Chapters are generated + adversarially
// fact-checked once and stored in content.generated.json; this module gives them a
// typed shape + ordering for the routes. Educational content — not legal advice.
import GENERATED from "./content.generated.json";
import { MARKETS_FY } from "@/lib/markets/seo";

export interface GuideSection {
  heading: string;
  body: string[];
}
export interface ChecklistItem {
  item: string;
  detail: string;
}
export interface GuideChapter {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  summary: string;
  intro: string[];
  sections: GuideSection[];
  checklist?: ChecklistItem[];
  faqs: Array<{ q: string; a: string }>;
}

/** Canonical chapter order — drives routing + the hub. Slugs must match the
 *  keys in content.generated.json. */
export const CHAPTER_SLUGS = [
  "how-section-8-pays",
  "hqs-inspection-checklist",
  "section-8-financing",
  "finding-voucher-tenants",
  "managing-section-8-rentals",
] as const;

const CONTENT = GENERATED as Record<string, GuideChapter>;

export const GUIDE_CHAPTERS: GuideChapter[] = CHAPTER_SLUGS.map((s) => CONTENT[s]).filter(
  (c): c is GuideChapter => !!c && !!c.title
);

export function guideChapter(slug: string): GuideChapter | undefined {
  const c = CONTENT[slug];
  return c && c.title ? c : undefined;
}

/** Hub metadata + intro (the /guide landing — a simple index, no generation). */
export const GUIDE_HUB = {
  metaTitle: `Section 8 Investing Playbook: PHA, Inspections & More (${MARKETS_FY})`,
  metaDescription:
    "The step-by-step Section 8 landlord playbook: how the voucher pays you, passing the HQS/NSPIRE inspection, financing, finding voucher tenants, and managing the rental.",
  h1: "The Section 8 Investor's Playbook",
  intro: [
    "Finding a deal that cash-flows is half the battle — closing it and getting a voucher tenant in is the other half. This playbook walks the whole Section 8 (HUD Housing Choice Voucher) process end to end, in plain English, so you know exactly what happens after you find the property.",
    "Start with how the voucher actually pays you, then work through the inspection, financing, finding tenants, and ongoing management.",
  ],
};
