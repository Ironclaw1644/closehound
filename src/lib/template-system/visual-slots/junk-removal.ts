import type { ArchetypeVisualSlot } from "@/lib/template-system/images/types";

export const JUNK_REMOVAL_VISUAL_SLOTS: ArchetypeVisualSlot[] = [
  {
    key: "hero",
    required: true,
    aspectRatio: "16:9",
    cropNotes: "safe center crop for desktop and mobile hero layouts",
    promptIntent:
      "junk removal crew at a residential property in realistic commercial-documentary style",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, plastic skin, impossible truck proportions",
  },
  {
    key: "service-action",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "mid-range action frame safe for service cards",
    promptIntent:
      "junk removal crew loading bulky household items or cleanout debris in a grounded residential setting",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, theatrical action pose",
  },
  {
    key: "detail-closeup",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "tight detail crop showing tools, loading workflow, and workmanship",
    promptIntent:
      "close-up junk removal detail showing loading straps, work gloves, moving equipment, or orderly haul-away workflow",
    negativePrompt:
      "embedded text, fake logo, surreal texture, impossible materials",
  },
  {
    key: "team-or-workmanship",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "group or workmanship crop that still works in masonry layouts",
    promptIntent:
      "small junk removal crew or workmanship-focused service moment with grounded local-business realism",
    negativePrompt:
      "embedded text, fake logo, exaggerated smiles, staged corporate pose",
  },
  {
    key: "workspace-or-site",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "site/environment crop for supporting gallery content",
    promptIntent:
      "garage, curbside, storage, or property cleanout environment with realistic junk removal context",
    negativePrompt:
      "embedded text, fake logo, impossible room proportions, surreal drama",
  },
  {
    key: "gallery-extra",
    required: false,
    aspectRatio: "1:1",
    cropNotes: "square crop for optional supporting gallery tile",
    promptIntent:
      "extra junk removal visual showing organized haul-away, clean loading workflow, or cleared-space context",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, unusable crop",
  },
];

const JUNK_REMOVAL_CANDIDATE_COUNTS: Record<
  ArchetypeVisualSlot["key"],
  number
> = {
  hero: 3,
  "service-action": 2,
  "detail-closeup": 2,
  "team-or-workmanship": 2,
  "workspace-or-site": 2,
  "gallery-extra": 2,
};

export function getJunkRemovalCandidateCountForSlot(
  slotKey: ArchetypeVisualSlot["key"]
) {
  return JUNK_REMOVAL_CANDIDATE_COUNTS[slotKey];
}
