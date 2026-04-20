import {
  createArchetypeGenerationBatch,
  runArchetypeGenerationBatch,
  type ArchetypeGenerationBatch,
} from "@/lib/template-system/images/generate-archetype";
import {
  buildHvacPromptBatch,
  type HvacPromptBatchInput,
  type HvacPromptBatchItem,
} from "@/lib/template-system/images/prompts";

export type HvacGenerationBatch = ArchetypeGenerationBatch<HvacPromptBatchItem>;

export function createHvacGenerationBatch(
  input: HvacPromptBatchInput & { createdBy: string }
): HvacGenerationBatch {
  return createArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildHvacPromptBatch(input),
  });
}

export async function runHvacGenerationBatch(
  input: HvacPromptBatchInput & { createdBy: string }
) {
  return runArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildHvacPromptBatch(input),
  });
}
