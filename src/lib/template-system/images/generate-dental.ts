import {
  createArchetypeGenerationBatch,
  runArchetypeGenerationBatch,
  type ArchetypeGenerationBatch,
} from "@/lib/template-system/images/generate-archetype";
import {
  buildDentalPromptBatch,
  type DentalPromptBatchInput,
  type DentalPromptBatchItem,
} from "@/lib/template-system/images/prompts";

export type DentalGenerationBatch = ArchetypeGenerationBatch<DentalPromptBatchItem>;

export function createDentalGenerationBatch(
  input: DentalPromptBatchInput & { createdBy: string }
): DentalGenerationBatch {
  return createArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildDentalPromptBatch(input),
  });
}

export async function runDentalGenerationBatch(
  input: DentalPromptBatchInput & { createdBy: string }
) {
  return runArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildDentalPromptBatch(input),
  });
}
