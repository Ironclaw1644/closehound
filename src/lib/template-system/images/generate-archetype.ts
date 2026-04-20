import crypto from "node:crypto";

import { generateGeminiImage } from "@/lib/template-system/images/gemini";
import {
  insertTemplateImageCandidates,
  type ArchetypeImageCandidateRecord,
} from "@/lib/template-system/images/repository";
import {
  buildTemplateImageStoragePath,
  uploadTemplateImage,
} from "@/lib/template-system/images/storage";

type PromptBatchItem = {
  slot: string;
  aspectRatio: string;
  cropNotes: string;
  promptVersion: string;
  provider: "gemini";
  model: "nano-banana-2";
  prompt: string;
  negativePrompt: string;
  familyKey: string;
  templateKey: string;
  templateVersion: string;
  candidateIndex: number;
};

export type ArchetypeGenerationBatch<TItem extends PromptBatchItem> = {
  generationBatchId: string;
  createdAt: string;
  createdBy: string;
  items: Array<
    TItem & {
      generationBatchId: string;
      createdAt: string;
      createdBy: string;
    }
  >;
};

export function createArchetypeGenerationBatch<TItem extends PromptBatchItem>(input: {
  createdBy: string;
  items: TItem[];
}): ArchetypeGenerationBatch<TItem> {
  const generationBatchId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  return {
    generationBatchId,
    createdAt,
    createdBy: input.createdBy,
    items: input.items.map((item) => ({
      ...item,
      generationBatchId,
      createdAt,
      createdBy: input.createdBy,
    })),
  };
}

export async function runArchetypeGenerationBatch<TItem extends PromptBatchItem>(input: {
  createdBy: string;
  items: TItem[];
}) {
  const batch = createArchetypeGenerationBatch(input);
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
