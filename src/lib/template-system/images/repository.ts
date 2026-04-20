import type { ArchetypeImageCandidateStatus } from "@/lib/template-system/images/types";

export type ArchetypeImageCandidateRecord = {
  id: string;
  generationBatchId: string;
  familyKey: string;
  templateKey: string;
  templateVersion: string;
  seedBusinessKey?: string | null;
  leadId?: string | null;
  slot: string;
  candidateIndex: number;
  prompt: string;
  negativePrompt: string;
  promptVersion: string;
  provider: "gemini";
  model: "nano-banana-2";
  status: ArchetypeImageCandidateStatus;
  storagePath: string;
  assetUrl?: string | null;
  aspectRatio: string;
  cropNotes?: string | null;
  createdAt: string;
  createdBy: string;
  approvalUpdatedAt?: string | null;
  approvalUpdatedBy?: string | null;
};

export type ArchetypeImageSlotDefinition = {
  key: string;
  required: boolean;
};

export type ArchetypeCandidateGroupKey = {
  templateKey: string;
  generationBatchId: string;
  slot: string;
};

export type ApprovedCandidateSelectionInput = {
  templateKey: string;
  generationBatchId: string;
  slotDefinitions?: readonly ArchetypeImageSlotDefinition[];
};

export type ApprovedCandidateSelection = Record<
  string,
  ArchetypeImageCandidateRecord | undefined
>;

export function buildCandidateGroupKey({
  templateKey,
  generationBatchId,
  slot,
}: ArchetypeCandidateGroupKey) {
  return `${templateKey}::${generationBatchId}::${slot}`;
}

function sortApprovedCandidates(
  left: ArchetypeImageCandidateRecord,
  right: ArchetypeImageCandidateRecord
) {
  if (left.candidateIndex !== right.candidateIndex) {
    return left.candidateIndex - right.candidateIndex;
  }

  if (left.createdAt !== right.createdAt) {
    return left.createdAt.localeCompare(right.createdAt);
  }

  return left.id.localeCompare(right.id);
}

function pickFirstApprovedCandidate(
  candidates: ArchetypeImageCandidateRecord[]
) {
  return candidates
    .filter((candidate) => candidate.status === "approved")
    .sort(sortApprovedCandidates)[0];
}

export function pickApprovedCandidateBySlot(
  records: readonly ArchetypeImageCandidateRecord[],
  selection: ApprovedCandidateSelectionInput
): ApprovedCandidateSelection {
  const scopedRecords = records.filter(
    (record) =>
      record.templateKey === selection.templateKey &&
      record.generationBatchId === selection.generationBatchId
  );

  const slotKeys =
    selection.slotDefinitions?.map((slot) => slot.key) ??
    Array.from(new Set(scopedRecords.map((record) => record.slot)));

  const approvedBySlot: ApprovedCandidateSelection = {};

  for (const slotKey of slotKeys) {
    const slotCandidates = scopedRecords.filter((record) => record.slot === slotKey);
    const approvedCandidate = pickFirstApprovedCandidate(slotCandidates);

    if (approvedCandidate) {
      approvedBySlot[slotKey] = approvedCandidate;
    }
  }

  return approvedBySlot;
}

export function listMissingRequiredApprovedSlots(
  records: readonly ArchetypeImageCandidateRecord[],
  selection: ApprovedCandidateSelectionInput
) {
  if (!selection.slotDefinitions?.length) {
    return [];
  }

  const approvedBySlot = pickApprovedCandidateBySlot(records, selection);

  return selection.slotDefinitions
    .filter((slot) => slot.required)
    .map((slot) => slot.key)
    .filter((slotKey) => approvedBySlot[slotKey] === undefined);
}
