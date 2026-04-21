import {
  createArchetypeGenerationBatch,
  runArchetypeGenerationBatch,
  type ArchetypeGenerationBatch,
} from "@/lib/template-system/images/generate-archetype";
import {
  buildMedSpaPromptBatch,
  type MedSpaPromptBatchInput,
  type MedSpaPromptBatchItem,
} from "@/lib/template-system/images/prompts";

export type MedSpaGenerationBatch = ArchetypeGenerationBatch<MedSpaPromptBatchItem>;

export function createMedSpaGenerationBatch(
  input: MedSpaPromptBatchInput & { createdBy: string }
): MedSpaGenerationBatch {
  return createArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildMedSpaPromptBatch(input),
  });
}

export async function runMedSpaGenerationBatch(
  input: MedSpaPromptBatchInput & { createdBy: string }
) {
  return runArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildMedSpaPromptBatch(input),
  });
}
