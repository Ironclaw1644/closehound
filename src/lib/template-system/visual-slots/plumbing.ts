import type { ArchetypeVisualSlot } from "@/lib/template-system/images/types";

export const PLUMBING_VISUAL_SLOTS: ArchetypeVisualSlot[] = [
  {
    key: "hero",
    required: true,
    aspectRatio: "16:9",
    cropNotes: "safe center crop for desktop and mobile hero layouts",
    promptIntent:
      "plumber at a residential property in realistic commercial-documentary style",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, plastic skin, impossible plumbing geometry",
  },
  {
    key: "service-action",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "mid-range action frame safe for service cards",
    promptIntent:
      "plumber performing hands-on residential repair or installation work",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, theatrical action pose",
  },
  {
    key: "detail-closeup",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "tight detail crop showing fittings, tools, and workmanship",
    promptIntent:
      "close-up plumbing detail showing pipework, fixtures, tools, and workmanship",
    negativePrompt:
      "embedded text, fake logo, surreal texture, impossible materials",
  },
  {
    key: "team-or-workmanship",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "group or workmanship crop that still works in masonry layouts",
    promptIntent:
      "small plumbing crew or workmanship-focused residential service scene",
    negativePrompt:
      "embedded text, fake logo, exaggerated smiles, staged corporate pose",
  },
  {
    key: "workspace-or-site",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "site/environment crop for supporting gallery content",
    promptIntent:
      "residential plumbing jobsite or interior workspace with grounded working context",
    negativePrompt:
      "embedded text, fake logo, impossible room proportions, surreal drama",
  },
  {
    key: "gallery-extra",
    required: false,
    aspectRatio: "1:1",
    cropNotes: "square crop for optional supporting gallery tile",
    promptIntent:
      "extra plumbing visual showing finished fixture detail or supportive service context",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, unusable crop",
  },
];

const PLUMBING_CANDIDATE_COUNTS: Record<ArchetypeVisualSlot["key"], number> = {
  hero: 3,
  "service-action": 2,
  "detail-closeup": 2,
  "team-or-workmanship": 2,
  "workspace-or-site": 2,
  "gallery-extra": 2,
};

export function getPlumbingCandidateCountForSlot(
  slotKey: ArchetypeVisualSlot["key"]
) {
  return PLUMBING_CANDIDATE_COUNTS[slotKey];
}
