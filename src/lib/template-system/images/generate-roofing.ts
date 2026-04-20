import crypto from "node:crypto";

import { generateGeminiImage } from "@/lib/template-system/images/gemini";
import { insertTemplateImageCandidates, type ArchetypeImageCandidateRecord } from "@/lib/template-system/images/repository";
import { buildTemplateImageStoragePath, uploadTemplateImage } from "@/lib/template-system/images/storage";
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

export async function runRoofingGenerationBatch(
  input: RoofingPromptBatchInput & { createdBy: string }
) {
  const batch = createRoofingGenerationBatch(input);
  const records: ArchetypeImageCandidateRecord[] = [];

  for (const item of batch.items) {
    const generated = await generateGeminiImage({
      prompt: item.prompt,
      negativePrompt: item.negativePrompt,
    });
    const storagePath = buildTemplateImageStoragePath({
      templateKey: item.templateKey,
      generationBatchId: item.generationBatchId,
      slot: item.slot,
      candidateIndex: item.candidateIndex,
    });
    const uploaded = await uploadTemplateImage({
      storagePath,
      data: generated.bytes,
      contentType: generated.contentType,
    });

    records.push({
      id: crypto.randomUUID(),
      generationBatchId: item.generationBatchId,
      familyKey: item.familyKey,
      templateKey: item.templateKey,
      templateVersion: item.templateVersion,
      slot: item.slot,
      candidateIndex: item.candidateIndex,
      prompt: item.prompt,
      negativePrompt: item.negativePrompt,
      promptVersion: item.promptVersion,
      provider: item.provider,
      model: item.model,
      status: "generated",
      storagePath: uploaded.storagePath,
      assetUrl: uploaded.assetUrl,
      aspectRatio: item.aspectRatio,
      cropNotes: item.cropNotes,
      createdAt: item.createdAt,
      createdBy: item.createdBy,
    });
  }

  const persisted = await insertTemplateImageCandidates(records);

  return {
    generationBatchId: batch.generationBatchId,
    createdAt: batch.createdAt,
    createdBy: batch.createdBy,
    records: persisted,
  };
}
