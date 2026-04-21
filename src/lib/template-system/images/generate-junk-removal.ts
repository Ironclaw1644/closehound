import {
  createArchetypeGenerationBatch,
  runArchetypeGenerationBatch,
  type ArchetypeGenerationBatch,
} from "@/lib/template-system/images/generate-archetype";
import {
  buildJunkRemovalPromptBatch,
  type JunkRemovalPromptBatchInput,
  type JunkRemovalPromptBatchItem,
} from "@/lib/template-system/images/prompts";

export type JunkRemovalGenerationBatch =
  ArchetypeGenerationBatch<JunkRemovalPromptBatchItem>;

export function createJunkRemovalGenerationBatch(
  input: JunkRemovalPromptBatchInput & { createdBy: string }
): JunkRemovalGenerationBatch {
  return createArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildJunkRemovalPromptBatch(input),
  });
}

export async function runJunkRemovalGenerationBatch(
  input: JunkRemovalPromptBatchInput & { createdBy: string }
) {
  return runArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildJunkRemovalPromptBatch(input),
  });
}
