import {
  ROOFING_VISUAL_SLOTS,
  getRoofingCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/roofing";
import {
  HVAC_VISUAL_SLOTS,
  getHvacCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/hvac";
import {
  PLUMBING_VISUAL_SLOTS,
  getPlumbingCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/plumbing";
import {
  MED_SPA_VISUAL_SLOTS,
  getMedSpaCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/med-spa";
import {
  DENTAL_VISUAL_SLOTS,
  getDentalCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/dental";
import {
  JUNK_REMOVAL_VISUAL_SLOTS,
  getJunkRemovalCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/junk-removal";
import type { ArchetypeVisualSlot } from "@/lib/template-system/images/types";

const PROMPT_VERSION = "1.0.0";
const PROVIDER = "gemini";
const MODEL = "nano-banana-2";

type RoofingSlotKey = (typeof ROOFING_VISUAL_SLOTS)[number]["key"];

export type RoofingPromptInput = {
  slot: RoofingSlotKey;
  familyKey: string;
  templateKey: string;
  templateVersion: string;
};

export type RoofingPrompt = {
  slot: RoofingSlotKey;
  aspectRatio: string;
  cropNotes: string;
  promptVersion: string;
  provider: typeof PROVIDER;
  model: typeof MODEL;
  prompt: string;
  negativePrompt: string;
  familyKey: string;
  templateKey: string;
  templateVersion: string;
};

export type RoofingPromptBatchInput = {
  familyKey: string;
  templateKey: string;
  templateVersion: string;
};

export type RoofingPromptBatchItem = RoofingPrompt & {
  candidateIndex: number;
};

function buildPromptText(slotIntent: string, cropNotes: string) {
  return `${slotIntent}. Realistic local-business photography. ${cropNotes}.`;
}

type GenericPromptInput = {
  slot: ArchetypeVisualSlot["key"];
  familyKey: string;
  templateKey: string;
  templateVersion: string;
};

type GenericPrompt = RoofingPrompt;
type GenericPromptBatchItem = RoofingPromptBatchItem;

function buildSlotPrompt(
  slots: readonly ArchetypeVisualSlot[],
  input: GenericPromptInput
): GenericPrompt {
  const slot = slots.find((entry) => entry.key === input.slot);

  if (!slot) {
    throw new Error(`Unknown slot: ${input.slot}`);
  }

  return {
    slot: slot.key,
    aspectRatio: slot.aspectRatio,
    cropNotes: slot.cropNotes,
    promptVersion: PROMPT_VERSION,
    provider: PROVIDER,
    model: MODEL,
    prompt: buildPromptText(slot.promptIntent, slot.cropNotes),
    negativePrompt: slot.negativePrompt,
    familyKey: input.familyKey,
    templateKey: input.templateKey,
    templateVersion: input.templateVersion,
  };
}

function buildPromptBatch(input: {
  familyKey: string;
  templateKey: string;
  templateVersion: string;
  slots: readonly ArchetypeVisualSlot[];
  getCandidateCountForSlot: (slotKey: ArchetypeVisualSlot["key"]) => number;
}) {
  return input.slots.flatMap((slot) =>
    Array.from(
      { length: input.getCandidateCountForSlot(slot.key) },
      (_, candidateIndex): GenericPromptBatchItem => ({
        ...buildSlotPrompt(input.slots, {
          slot: slot.key,
          familyKey: input.familyKey,
          templateKey: input.templateKey,
          templateVersion: input.templateVersion,
        }),
        candidateIndex,
      })
    )
  );
}

export function buildRoofingSlotPrompt(
  input: RoofingPromptInput
): RoofingPrompt {
  return buildSlotPrompt(ROOFING_VISUAL_SLOTS, input);
}

export function buildRoofingPromptBatch(
  input: RoofingPromptBatchInput
): RoofingPromptBatchItem[] {
  return buildPromptBatch({
    ...input,
    slots: ROOFING_VISUAL_SLOTS,
    getCandidateCountForSlot: getRoofingCandidateCountForSlot,
  });
}

export type HvacPromptBatchInput = RoofingPromptBatchInput;
export type HvacPromptBatchItem = RoofingPromptBatchItem;

export function buildHvacPromptBatch(
  input: HvacPromptBatchInput
): HvacPromptBatchItem[] {
  return buildPromptBatch({
    ...input,
    slots: HVAC_VISUAL_SLOTS,
    getCandidateCountForSlot: getHvacCandidateCountForSlot,
  });
}

export type PlumbingPromptBatchInput = RoofingPromptBatchInput;
export type PlumbingPromptBatchItem = RoofingPromptBatchItem;

export function buildPlumbingPromptBatch(
  input: PlumbingPromptBatchInput
): PlumbingPromptBatchItem[] {
  return buildPromptBatch({
    ...input,
    slots: PLUMBING_VISUAL_SLOTS,
    getCandidateCountForSlot: getPlumbingCandidateCountForSlot,
  });
}

export type MedSpaPromptBatchInput = RoofingPromptBatchInput;
export type MedSpaPromptBatchItem = RoofingPromptBatchItem;

export function buildMedSpaPromptBatch(
  input: MedSpaPromptBatchInput
): MedSpaPromptBatchItem[] {
  return buildPromptBatch({
    ...input,
    slots: MED_SPA_VISUAL_SLOTS,
    getCandidateCountForSlot: getMedSpaCandidateCountForSlot,
  });
}

export type DentalPromptBatchInput = RoofingPromptBatchInput;
export type DentalPromptBatchItem = RoofingPromptBatchItem;

export function buildDentalPromptBatch(
  input: DentalPromptBatchInput
): DentalPromptBatchItem[] {
  return buildPromptBatch({
    ...input,
    slots: DENTAL_VISUAL_SLOTS,
    getCandidateCountForSlot: getDentalCandidateCountForSlot,
  });
}

export type JunkRemovalPromptBatchInput = RoofingPromptBatchInput;
export type JunkRemovalPromptBatchItem = RoofingPromptBatchItem;

export function buildJunkRemovalPromptBatch(
  input: JunkRemovalPromptBatchInput
): JunkRemovalPromptBatchItem[] {
  return buildPromptBatch({
    ...input,
    slots: JUNK_REMOVAL_VISUAL_SLOTS,
    getCandidateCountForSlot: getJunkRemovalCandidateCountForSlot,
  });
}
