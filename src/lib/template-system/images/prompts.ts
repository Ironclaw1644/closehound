import {
  ROOFING_VISUAL_SLOTS,
  getRoofingCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/roofing";

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

function buildRoofingPromptText(slotIntent: string, cropNotes: string) {
  return `${slotIntent}. Realistic local-business photography. ${cropNotes}.`;
}

export function buildRoofingSlotPrompt(
  input: RoofingPromptInput
): RoofingPrompt {
  const slot = ROOFING_VISUAL_SLOTS.find((entry) => entry.key === input.slot);

  if (!slot) {
    throw new Error(`Unknown roofing slot: ${input.slot}`);
  }

  return {
    slot: slot.key,
    aspectRatio: slot.aspectRatio,
    cropNotes: slot.cropNotes,
    promptVersion: PROMPT_VERSION,
    provider: PROVIDER,
    model: MODEL,
    prompt: buildRoofingPromptText(slot.promptIntent, slot.cropNotes),
    negativePrompt: slot.negativePrompt,
    familyKey: input.familyKey,
    templateKey: input.templateKey,
    templateVersion: input.templateVersion,
  };
}

export function buildRoofingPromptBatch(
  input: RoofingPromptBatchInput
): RoofingPromptBatchItem[] {
  return ROOFING_VISUAL_SLOTS.flatMap((slot) =>
    Array.from({ length: getRoofingCandidateCountForSlot(slot.key) }, (_, candidateIndex) => ({
      ...buildRoofingSlotPrompt({
        slot: slot.key,
        familyKey: input.familyKey,
        templateKey: input.templateKey,
        templateVersion: input.templateVersion,
      }),
      candidateIndex,
    }))
  );
}
