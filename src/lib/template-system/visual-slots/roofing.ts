import type { ArchetypeVisualSlot } from "@/lib/template-system/images/types";

export const ROOFING_VISUAL_SLOTS: ArchetypeVisualSlot[] = [
  {
    key: "hero",
    required: true,
    aspectRatio: "16:9",
    cropNotes: "safe center crop for desktop and mobile hero layouts",
    promptIntent:
      "roofing crew on active residential roof in realistic commercial-documentary style",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, plastic skin, impossible roof geometry",
  },
  {
    key: "service-action",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "mid-range action frame safe for service cards",
    promptIntent:
      "roofer performing hands-on repair or installation work on a residential roof",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, cinematic action pose",
  },
  {
    key: "detail-closeup",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "tight detail crop showing workmanship and material texture",
    promptIntent:
      "close-up roofing detail showing shingles, flashing, tools, and workmanship",
    negativePrompt:
      "embedded text, fake logo, surreal texture, impossible materials",
  },
  {
    key: "team-or-workmanship",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "group or workmanship crop that still works in masonry layouts",
    promptIntent:
      "small roofing crew or workmanship-focused scene in a residential setting",
    negativePrompt:
      "embedded text, fake logo, exaggerated smiles, staged corporate pose",
  },
  {
    key: "workspace-or-site",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "site/environment crop for supporting gallery content",
    promptIntent:
      "residential roofing jobsite context with ladders, roofline, and grounded working environment",
    negativePrompt:
      "embedded text, fake logo, impossible house proportions, surreal drama",
  },
  {
    key: "gallery-extra",
    required: false,
    aspectRatio: "1:1",
    cropNotes: "square crop for optional supporting gallery tile",
    promptIntent:
      "extra roofing visual showing clean completed section or supportive site detail",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, unusable crop",
  },
];

const ROOFING_CANDIDATE_COUNTS: Record<ArchetypeVisualSlot["key"], number> = {
  hero: 3,
  "service-action": 2,
  "detail-closeup": 2,
  "team-or-workmanship": 2,
  "workspace-or-site": 2,
  "gallery-extra": 2,
};

export function getRoofingCandidateCountForSlot(
  slotKey: ArchetypeVisualSlot["key"]
) {
  return ROOFING_CANDIDATE_COUNTS[slotKey];
}
