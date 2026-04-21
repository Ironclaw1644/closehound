import type { ArchetypeVisualSlot } from "@/lib/template-system/images/types";

export const MED_SPA_VISUAL_SLOTS: ArchetypeVisualSlot[] = [
  {
    key: "hero",
    required: true,
    aspectRatio: "16:9",
    cropNotes: "safe center crop for desktop and mobile hero layouts",
    promptIntent:
      "culturally diverse med spa consultation scene in a refined, realistic commercial-documentary style",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, plastic skin, exaggerated glam, over-retouched faces",
  },
  {
    key: "service-action",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "mid-range treatment frame safe for service cards",
    promptIntent:
      "med spa provider performing a realistic aesthetic treatment in a calm clinical-premium setting",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, theatrical pose, exaggerated before-after styling",
  },
  {
    key: "detail-closeup",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "tight detail crop showing treatment tools, skincare setup, or refined environment texture",
    promptIntent:
      "close-up med spa detail showing treatment tools, skincare elements, or polished room detail",
    negativePrompt:
      "embedded text, fake logo, surreal texture, impossible anatomy, glossy fake-AI skin",
  },
  {
    key: "team-or-workmanship",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "provider or consultation crop that still works in masonry layouts",
    promptIntent:
      "med spa provider-client consultation or provider-focused workmanship moment with culturally diverse subjects",
    negativePrompt:
      "embedded text, fake logo, exaggerated smiles, influencer-style pose, glam campaign look",
  },
  {
    key: "workspace-or-site",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "environment crop for supporting gallery content",
    promptIntent:
      "refined med spa reception or treatment-room environment with realistic, welcoming atmosphere",
    negativePrompt:
      "embedded text, fake logo, impossible room proportions, surreal luxury staging",
  },
  {
    key: "gallery-extra",
    required: false,
    aspectRatio: "1:1",
    cropNotes: "square crop for optional supporting gallery tile",
    promptIntent:
      "extra med spa visual showing a polished consultation detail or calm treatment environment",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, unusable crop, narrow beauty stereotype",
  },
];

const MED_SPA_CANDIDATE_COUNTS: Record<ArchetypeVisualSlot["key"], number> = {
  hero: 3,
  "service-action": 2,
  "detail-closeup": 2,
  "team-or-workmanship": 2,
  "workspace-or-site": 2,
  "gallery-extra": 2,
};

export function getMedSpaCandidateCountForSlot(
  slotKey: ArchetypeVisualSlot["key"]
) {
  return MED_SPA_CANDIDATE_COUNTS[slotKey];
}
