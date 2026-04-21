import type {
  ArchetypeImageSlotDefinition,
  TemplateImageBatchSummary,
} from "@/lib/template-system/images/repository";
import { sortTemplateBatchesNewestFirst } from "@/lib/template-system/images/repository";
import { HVAC_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/hvac";
import { PLUMBING_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/plumbing";
import { ROOFING_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/roofing";

export type TemplateImageReviewConfig = {
  templateKey: "roofing-v1" | "hvac-v1" | "plumbing-v1";
  label: string;
  previewPath: string;
  slotDefinitions: readonly ArchetypeImageSlotDefinition[];
};

function toSlotDefinitions(
  slots: readonly { key: string; required: boolean }[]
): readonly ArchetypeImageSlotDefinition[] {
  return slots.map((slot) => ({
    key: slot.key,
    required: slot.required,
  }));
}

export const TEMPLATE_IMAGE_REVIEW_TEMPLATES = [
  {
    templateKey: "roofing-v1",
    label: "Roofing",
    previewPath: "/preview/templates/roofing-archetype",
    slotDefinitions: toSlotDefinitions(ROOFING_VISUAL_SLOTS),
  },
  {
    templateKey: "hvac-v1",
    label: "HVAC",
    previewPath: "/preview/templates/hvac-archetype",
    slotDefinitions: toSlotDefinitions(HVAC_VISUAL_SLOTS),
  },
  {
    templateKey: "plumbing-v1",
    label: "Plumbing",
    previewPath: "/preview/templates/plumbing-archetype",
    slotDefinitions: toSlotDefinitions(PLUMBING_VISUAL_SLOTS),
  },
] as const satisfies readonly TemplateImageReviewConfig[];

export function getTemplateImageReviewConfig(templateKey: string) {
  return TEMPLATE_IMAGE_REVIEW_TEMPLATES.find(
    (config) => config.templateKey === templateKey
  );
}

export function resolveSelectedTemplateBatchId(input: {
  batches: readonly TemplateImageBatchSummary[];
  requestedBatchId?: string | null;
}) {
  const sortedBatches = sortTemplateBatchesNewestFirst(input.batches);

  if (input.requestedBatchId) {
    const requestedBatch = sortedBatches.find(
      (batch) => batch.generationBatchId === input.requestedBatchId
    );

    if (requestedBatch) {
      return requestedBatch.generationBatchId;
    }

    return null;
  }

  return sortedBatches[0]?.generationBatchId ?? null;
}

export function buildTemplatePreviewInspectionHref(input: {
  previewPath: string;
  generationBatchId: string | null;
}) {
  if (!input.generationBatchId) {
    return input.previewPath;
  }

  return `${input.previewPath}?batch=${encodeURIComponent(input.generationBatchId)}`;
}
