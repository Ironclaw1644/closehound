import {
  createArchetypeGenerationBatch,
  runArchetypeGenerationBatch,
  type ArchetypeGenerationBatch,
} from "@/lib/template-system/images/generate-archetype";
import {
  buildRoofingPromptBatch,
  type RoofingPromptBatchInput,
  type RoofingPromptBatchItem,
} from "@/lib/template-system/images/prompts";

export type RoofingGenerationBatch = ArchetypeGenerationBatch<RoofingPromptBatchItem>;

export function createRoofingGenerationBatch(
  input: RoofingPromptBatchInput & { createdBy: string }
): RoofingGenerationBatch {
  return createArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildRoofingPromptBatch(input),
  });
}

export async function runRoofingGenerationBatch(
  input: RoofingPromptBatchInput & { createdBy: string }
) {
  return runArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildRoofingPromptBatch(input),
  });
}
