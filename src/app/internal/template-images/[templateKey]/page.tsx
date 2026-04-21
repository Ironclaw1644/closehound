import { notFound } from "next/navigation";

import { TemplateImageDetail } from "@/components/template-images/template-image-detail";
import {
  buildTemplateReviewSummaryFromRecords,
  hasRenderableTemplateImageAsset,
  listTemplateImageBatchSummaries,
  listTemplateImageCandidatesByTemplate,
  listTemplateImageCandidatesForBatch,
  type ArchetypeImageCandidateRecord,
} from "@/lib/template-system/images/repository";
import {
  buildTemplatePreviewInspectionHref,
  getTemplateImageReviewConfig,
  resolveSelectedTemplateBatchId,
} from "@/lib/template-system/images/review-registry";
import { hasSupabaseAdminEnv } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function getRequestedBatchId(batch: string | string[] | undefined) {
  if (Array.isArray(batch)) {
    const firstBatch = batch[0]?.trim();
    return firstBatch ? firstBatch : null;
  }

  const normalizedBatch = batch?.trim();
  return normalizedBatch ? normalizedBatch : null;
}

function compareApprovedCandidates(
  left: ArchetypeImageCandidateRecord,
  right: ArchetypeImageCandidateRecord
) {
  const leftKey = left.approvalUpdatedAt ?? left.createdAt;
  const rightKey = right.approvalUpdatedAt ?? right.createdAt;

  if (leftKey !== rightKey) {
    return rightKey.localeCompare(leftKey);
  }

  if (left.candidateIndex !== right.candidateIndex) {
    return left.candidateIndex - right.candidateIndex;
  }

  return right.id.localeCompare(left.id);
}

function pickCurrentApprovedBySlot(records: readonly ArchetypeImageCandidateRecord[]) {
  const approvedBySlot = new Map<string, ArchetypeImageCandidateRecord>();

  for (const record of records) {
    if (record.status !== "approved" || !hasRenderableTemplateImageAsset(record)) {
      continue;
    }

    const existing = approvedBySlot.get(record.slot);

    if (!existing || compareApprovedCandidates(record, existing) < 0) {
      approvedBySlot.set(record.slot, record);
    }
  }

  return approvedBySlot;
}

export default async function TemplateImageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateKey: string }>;
  searchParams: Promise<{ batch?: string | string[] }>;
}) {
  const { templateKey } = await params;
  const { batch } = await searchParams;
  const config = getTemplateImageReviewConfig(templateKey);

  if (!config) {
    notFound();
  }

  const requestedBatchId = getRequestedBatchId(batch);
  const [records, batches] = await Promise.all([
    listTemplateImageCandidatesByTemplate(templateKey),
    listTemplateImageBatchSummaries(templateKey),
  ]);

  const selectedBatchId = resolveSelectedTemplateBatchId({
    batches,
    requestedBatchId,
  });
  const selectedBatchMissing = requestedBatchId !== null && selectedBatchId === null;
  const approvedBySlot = pickCurrentApprovedBySlot(records);
  const selectedBatchRecords = selectedBatchId
    ? await listTemplateImageCandidatesForBatch({
        templateKey,
        generationBatchId: selectedBatchId,
      })
    : [];
  const selectedBatchRecordsBySlot = new Map<string, ArchetypeImageCandidateRecord[]>();

  for (const record of selectedBatchRecords) {
    const existing = selectedBatchRecordsBySlot.get(record.slot) ?? [];
    existing.push(record);
    selectedBatchRecordsBySlot.set(record.slot, existing);
  }

  const summary = buildTemplateReviewSummaryFromRecords({
    templateKey,
    slotDefinitions: config.slotDefinitions,
    records,
  });

  const slotStates = config.slotDefinitions.map((slot) => ({
    slotKey: slot.key,
    required: slot.required,
    candidates: selectedBatchRecordsBySlot.get(slot.key) ?? [],
    approvedCandidate: approvedBySlot.get(slot.key),
  }));

  const notice = hasSupabaseAdminEnv()
    ? null
    : "Template image review is read-only in this environment until the Supabase admin variables are configured.";

  return (
    <TemplateImageDetail
      batches={batches}
      config={config}
      canMutate={hasSupabaseAdminEnv()}
      inspectionPreviewHref={
        selectedBatchId
          ? buildTemplatePreviewInspectionHref({
              previewPath: config.previewPath,
              generationBatchId: selectedBatchId,
            })
          : null
      }
      notice={notice}
      livePreviewHref={config.previewPath}
      requestedBatchId={requestedBatchId}
      selectedBatchId={selectedBatchId}
      selectedBatchMissing={selectedBatchMissing}
      slotStates={slotStates}
      summary={summary}
    />
  );
}
