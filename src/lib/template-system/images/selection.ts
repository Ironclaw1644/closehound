import {
  getApprovedTemplateImageCandidates,
  getCurrentApprovedTemplateImageCandidates,
  getMostRecentlyApprovedTemplateImageBatch,
  hasRenderableTemplateImageAsset,
} from "@/lib/template-system/images/repository";
import type { ArchetypeVisualSlot } from "@/lib/template-system/images/types";

export async function resolveArchetypeBatchSelection(input: {
  requestedBatch: string | null;
  hasRequestedBatch: boolean;
  getLatestApprovedBatch: () => Promise<string | null>;
}) {
  if (input.hasRequestedBatch) {
    return input.requestedBatch;
  }

  return input.getLatestApprovedBatch();
}

export async function resolveApprovedArchetypeImageCandidates(input: {
  templateKey: string;
  requestedBatch: string | null;
  hasRequestedBatch: boolean;
  slotDefinitions: readonly ArchetypeVisualSlot[];
}) {
  const generationBatchId = await resolveArchetypeBatchSelection({
    requestedBatch: input.requestedBatch,
    hasRequestedBatch: input.hasRequestedBatch,
    getLatestApprovedBatch: () =>
      getMostRecentlyApprovedTemplateImageBatch(input.templateKey),
  });

  const approvedImageCandidates = input.hasRequestedBatch
    ? generationBatchId
      ? await getApprovedTemplateImageCandidates({
          templateKey: input.templateKey,
          generationBatchId,
          slotDefinitions: input.slotDefinitions,
        })
      : {}
    : await getCurrentApprovedTemplateImageCandidates({
        templateKey: input.templateKey,
        slotDefinitions: input.slotDefinitions,
      });

  const approvedImageCandidatesForRender = Object.fromEntries(
    Object.entries(approvedImageCandidates).filter(
      ([, candidate]) =>
        candidate !== undefined && hasRenderableTemplateImageAsset(candidate)
    )
  ) as Record<
    string,
    {
      id: string;
      slot: string;
      status: "approved";
      storagePath: string;
      assetUrl?: string | null;
      cropNotes?: string;
    }
  >;

  return {
    generationBatchId,
    approvedImageCandidates: approvedImageCandidatesForRender,
  };
}
