import {
  createArchetypeGenerationBatch,
  runArchetypeGenerationBatch,
  type ArchetypeGenerationBatch,
} from "@/lib/template-system/images/generate-archetype";
import {
  buildPlumbingPromptBatch,
  type PlumbingPromptBatchInput,
  type PlumbingPromptBatchItem,
} from "@/lib/template-system/images/prompts";

export type PlumbingGenerationBatch = ArchetypeGenerationBatch<PlumbingPromptBatchItem>;

export function createPlumbingGenerationBatch(
  input: PlumbingPromptBatchInput & { createdBy: string }
): PlumbingGenerationBatch {
  return createArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildPlumbingPromptBatch(input),
  });
}

export async function runPlumbingGenerationBatch(
  input: PlumbingPromptBatchInput & { createdBy: string }
) {
  return runArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildPlumbingPromptBatch(input),
  });
}
