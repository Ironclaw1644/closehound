import crypto from "node:crypto";

import {
  buildRoofingPromptBatch,
  type RoofingPromptBatchInput,
  type RoofingPromptBatchItem,
} from "@/lib/template-system/images/prompts";

export type RoofingGenerationBatch = {
  generationBatchId: string;
  createdAt: string;
  createdBy: string;
  items: Array<
    RoofingPromptBatchItem & {
      generationBatchId: string;
      createdAt: string;
      createdBy: string;
    }
  >;
};

export function createRoofingGenerationBatch(
  input: RoofingPromptBatchInput & { createdBy: string }
): RoofingGenerationBatch {
  const generationBatchId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  return {
    generationBatchId,
    createdAt,
    createdBy: input.createdBy,
    items: buildRoofingPromptBatch(input).map((item) => ({
      ...item,
      generationBatchId,
      createdAt,
      createdBy: input.createdBy,
    })),
  };
}
