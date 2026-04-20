import type { ArchetypeVisualSlot } from "@/lib/template-system/images/types";

export const HVAC_VISUAL_SLOTS: ArchetypeVisualSlot[] = [
  {
    key: "hero",
    required: true,
    aspectRatio: "16:9",
    cropNotes: "safe center crop for desktop and mobile hero layouts",
    promptIntent:
      "HVAC technician at a residential home in realistic commercial-documentary style",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, plastic skin, impossible equipment proportions",
  },
  {
    key: "service-action",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "mid-range action frame safe for service cards",
    promptIntent:
      "HVAC technician performing air conditioning or heating service inside or outside a home",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, theatrical action pose",
  },
  {
    key: "detail-closeup",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "tight detail crop showing equipment, tools, and workmanship",
    promptIntent:
      "close-up HVAC detail showing gauges, venting, condenser, or furnace workmanship",
    negativePrompt:
      "embedded text, fake logo, surreal texture, impossible machinery",
  },
  {
    key: "team-or-workmanship",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "group or workmanship crop that still works in masonry layouts",
    promptIntent:
      "small HVAC crew or workmanship-focused service moment in a residential setting",
    negativePrompt:
      "embedded text, fake logo, exaggerated smiles, staged corporate pose",
  },
  {
    key: "workspace-or-site",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "site/environment crop for supporting gallery content",
    promptIntent:
      "residential HVAC jobsite or mechanical environment with grounded working context",
    negativePrompt:
      "embedded text, fake logo, impossible house proportions, surreal drama",
  },
  {
    key: "gallery-extra",
    required: false,
    aspectRatio: "1:1",
    cropNotes: "square crop for optional supporting gallery tile",
    promptIntent:
      "extra HVAC visual showing clean installed equipment or supportive service detail",
    negativePrompt:
      "embedded text, fake logo, surreal lighting, unusable crop",
  },
];
