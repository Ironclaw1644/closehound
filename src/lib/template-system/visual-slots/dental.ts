import type { ArchetypeVisualSlot } from "@/lib/template-system/images/types";

export const DENTAL_VISUAL_SLOTS: ArchetypeVisualSlot[] = [
  {
    key: "hero",
    required: true,
    aspectRatio: "16:9",
    cropNotes: "safe center crop for desktop and mobile hero layouts",
    promptIntent:
      "culturally diverse dental consultation scene in a clean clinical-modern office",
    negativePrompt:
      "embedded text, fake logo, over-retouched smile, glam ad look, surreal lighting",
  },
  {
    key: "service-action",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "mid-range treatment frame safe for service cards",
    promptIntent:
      "dentist or hygienist performing a realistic exam or treatment moment in a modern local practice",
    negativePrompt:
      "embedded text, fake logo, exaggerated whitening, theatrical smile pose",
  },
  {
    key: "detail-closeup",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "tight detail crop showing clean tools, tray setup, or exam detail",
    promptIntent:
      "close-up dental detail with clean instruments, tray setup, or modern exam-room texture",
    negativePrompt:
      "embedded text, fake logo, gore, unsettling medical detail, glossy ad polish",
  },
  {
    key: "team-or-workmanship",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "provider or patient interaction crop for supporting gallery content",
    promptIntent:
      "dentist or hygienist in a patient-comfort or consultation moment with culturally diverse subjects",
    negativePrompt:
      "embedded text, fake logo, cartoon smile, glam campaign look",
  },
  {
    key: "workspace-or-site",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "environment crop for office or reception support content",
    promptIntent:
      "clean modern dental reception or treatment room with bright neutral atmosphere",
    negativePrompt:
      "embedded text, fake logo, hospital-like coldness, impossible room proportions",
  },
  {
    key: "gallery-extra",
    required: false,
    aspectRatio: "1:1",
    cropNotes: "square crop for optional supporting gallery tile",
    promptIntent:
      "extra dental visual showing a calm provider-patient interaction or refined office detail",
    negativePrompt:
      "embedded text, fake logo, over-retouched smile, stock-photo stiffness",
  },
];

const DENTAL_CANDIDATE_COUNTS: Record<ArchetypeVisualSlot["key"], number> = {
  hero: 3,
  "service-action": 2,
  "detail-closeup": 2,
  "team-or-workmanship": 2,
  "workspace-or-site": 2,
  "gallery-extra": 2,
};

export function getDentalCandidateCountForSlot(
  slotKey: ArchetypeVisualSlot["key"]
) {
  return DENTAL_CANDIDATE_COUNTS[slotKey];
}
