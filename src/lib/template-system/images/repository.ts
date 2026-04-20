import {
  getSupabaseAdminClient,
  hasSupabaseAdminEnv,
} from "@/lib/supabase";
import type { Database } from "@/types/supabase";
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

type TemplateImageCandidateRow = {
  id: string;
  generation_batch_id: string;
  family_key: string;
  template_key: string;
  template_version: string;
  seed_business_key?: string | null;
  lead_id?: string | null;
  slot: string;
  candidate_index: number;
  prompt: string;
  negative_prompt: string;
  prompt_version: string;
  provider: "gemini";
  model: "nano-banana-2";
  status: ArchetypeImageCandidateStatus;
  storage_path: string;
  asset_url?: string | null;
  aspect_ratio: string;
  crop_notes?: string | null;
  created_at: string;
  created_by: string;
  approval_updated_at?: string | null;
  approval_updated_by?: string | null;
};

type TemplateImageCandidateInsert =
  Database["closehound"]["Tables"]["template_image_candidates"]["Insert"];

export function buildCandidateGroupKey({
  templateKey,
  generationBatchId,
  slot,
}: ArchetypeCandidateGroupKey) {
  return `${templateKey}::${generationBatchId}::${slot}`;
}

function mapRecordToInsert(
  record: ArchetypeImageCandidateRecord
): TemplateImageCandidateInsert {
  return {
    id: record.id,
    generation_batch_id: record.generationBatchId,
    family_key: record.familyKey,
    template_key: record.templateKey,
    template_version: record.templateVersion,
    seed_business_key: record.seedBusinessKey ?? null,
    lead_id: record.leadId ?? null,
    slot: record.slot,
    candidate_index: record.candidateIndex,
    prompt: record.prompt,
    negative_prompt: record.negativePrompt,
    prompt_version: record.promptVersion,
    provider: record.provider,
    model: record.model,
    status: record.status,
    storage_path: record.storagePath,
    asset_url: record.assetUrl ?? null,
    aspect_ratio: record.aspectRatio,
    crop_notes: record.cropNotes ?? null,
    created_at: record.createdAt,
    created_by: record.createdBy,
    approval_updated_at: record.approvalUpdatedAt ?? null,
    approval_updated_by: record.approvalUpdatedBy ?? null,
  };
}

function mapTemplateImageCandidateRow(
  row: TemplateImageCandidateRow
): ArchetypeImageCandidateRecord {
  return {
    id: row.id,
    generationBatchId: row.generation_batch_id,
    familyKey: row.family_key,
    templateKey: row.template_key,
    templateVersion: row.template_version,
    seedBusinessKey: row.seed_business_key ?? null,
    leadId: row.lead_id ?? null,
    slot: row.slot,
    candidateIndex: row.candidate_index,
    prompt: row.prompt,
    negativePrompt: row.negative_prompt,
    promptVersion: row.prompt_version,
    provider: row.provider,
    model: row.model,
    status: row.status,
    storagePath: row.storage_path,
    assetUrl: row.asset_url ?? null,
    aspectRatio: row.aspect_ratio,
    cropNotes: row.crop_notes ?? null,
    createdAt: row.created_at,
    createdBy: row.created_by,
    approvalUpdatedAt: row.approval_updated_at ?? null,
    approvalUpdatedBy: row.approval_updated_by ?? null,
  };
}

export function selectMostRecentlyApprovedTemplateImageBatch(
  records: readonly ArchetypeImageCandidateRecord[],
  templateKey: string
) {
  const latestByBatch = new Map<string, ArchetypeImageCandidateRecord>();

  for (const record of records) {
    if (record.templateKey !== templateKey || record.status !== "approved") {
      continue;
    }

    const existing = latestByBatch.get(record.generationBatchId);

    if (
      !existing ||
      record.createdAt > existing.createdAt ||
      (record.createdAt === existing.createdAt &&
        record.id.localeCompare(existing.id) > 0)
    ) {
      latestByBatch.set(record.generationBatchId, record);
    }
  }

  const latestBatch = Array.from(latestByBatch.values()).sort((left, right) => {
    if (left.createdAt !== right.createdAt) {
      return right.createdAt.localeCompare(left.createdAt);
    }

    return right.id.localeCompare(left.id);
  })[0];

  return latestBatch?.generationBatchId ?? null;
}

export function getApprovedTemplateImageCandidatesFromRecords(
  records: readonly ArchetypeImageCandidateRecord[],
  selection: {
    templateKey: string;
    generationBatchId: string;
    slotDefinitions: readonly ArchetypeImageSlotDefinition[];
  }
) {
  return pickApprovedCandidateBySlot(records, {
    templateKey: selection.templateKey,
    generationBatchId: selection.generationBatchId,
    slotDefinitions: selection.slotDefinitions,
  });
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

export async function getMostRecentlyApprovedTemplateImageBatch(
  templateKey: string
) {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  const closehound = getSupabaseAdminClient().schema("closehound") as any;
  const { data, error } = await closehound
    .from("template_image_candidates")
    .select("id, generation_batch_id, created_at, approval_updated_at")
    .eq("template_key", templateKey)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return null;
  }

  return selectMostRecentlyApprovedTemplateImageBatch(
    data.map(
      (
        row: {
          id: string;
          generation_batch_id: string;
          created_at: string;
          approval_updated_at?: string | null;
        },
      ) => ({
        id: row.id,
        generationBatchId: row.generation_batch_id,
        familyKey: "",
        templateKey,
        templateVersion: "",
        slot: "",
        candidateIndex: 0,
        prompt: "",
        negativePrompt: "",
        promptVersion: "",
        provider: "gemini" as const,
        model: "nano-banana-2" as const,
        status: "approved" as const,
        storagePath: "",
        aspectRatio: "",
        createdAt: row.created_at,
        createdBy: "",
        approvalUpdatedAt: row.approval_updated_at ?? null,
      })
    ),
    templateKey
  );
}

export async function getApprovedTemplateImageCandidates(selection: {
  templateKey: string;
  generationBatchId: string;
  slotDefinitions: readonly ArchetypeImageSlotDefinition[];
}) {
  if (!hasSupabaseAdminEnv()) {
    return {};
  }

  const closehound = getSupabaseAdminClient().schema("closehound") as any;
  const { data, error } = await closehound
    .from("template_image_candidates")
    .select("*")
    .eq("template_key", selection.templateKey)
    .eq("generation_batch_id", selection.generationBatchId)
    .eq("status", "approved")
    .order("candidate_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return {};
  }

  return pickApprovedCandidateBySlot(
    (data as TemplateImageCandidateRow[]).map(mapTemplateImageCandidateRow),
    {
      templateKey: selection.templateKey,
      generationBatchId: selection.generationBatchId,
      slotDefinitions: selection.slotDefinitions,
    }
  );
}

export async function insertTemplateImageCandidates(
  records: readonly ArchetypeImageCandidateRecord[]
) {
  if (!records.length) {
    return [];
  }

  const closehound = getSupabaseAdminClient().schema("closehound") as any;
  const { data, error } = await closehound
    .from("template_image_candidates")
    .insert(records.map(mapRecordToInsert))
    .select("*");

  if (error) {
    throw error;
  }

  return ((data ?? []) as TemplateImageCandidateRow[]).map(mapTemplateImageCandidateRow);
}

export async function listTemplateImageCandidatesByBatch(selection: {
  templateKey: string;
  generationBatchId: string;
}) {
  if (!hasSupabaseAdminEnv()) {
    return [];
  }

  const closehound = getSupabaseAdminClient().schema("closehound") as any;
  const { data, error } = await closehound
    .from("template_image_candidates")
    .select("*")
    .eq("template_key", selection.templateKey)
    .eq("generation_batch_id", selection.generationBatchId)
    .order("slot", { ascending: true })
    .order("candidate_index", { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as TemplateImageCandidateRow[]).map(mapTemplateImageCandidateRow);
}

export async function approveTemplateImageCandidate(input: {
  candidateId: string;
  approvedBy: string;
}) {
  const closehound = getSupabaseAdminClient().schema("closehound") as any;
  const { data: found, error: findError } = await closehound
    .from("template_image_candidates")
    .select("*")
    .eq("id", input.candidateId)
    .limit(1)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (!found) {
    throw new Error(`Template image candidate not found: ${input.candidateId}`);
  }

  const approvalUpdatedAt = new Date().toISOString();

  const { error: demoteError } = await closehound
    .from("template_image_candidates")
    .update({
      status: "unused",
      approval_updated_at: approvalUpdatedAt,
      approval_updated_by: input.approvedBy,
    })
    .eq("template_key", found.template_key)
    .eq("generation_batch_id", found.generation_batch_id)
    .eq("slot", found.slot)
    .eq("status", "approved");

  if (demoteError) {
    throw demoteError;
  }

  const { data: approved, error: approveError } = await closehound
    .from("template_image_candidates")
    .update({
      status: "approved",
      approval_updated_at: approvalUpdatedAt,
      approval_updated_by: input.approvedBy,
    })
    .eq("id", input.candidateId)
    .select("*")
    .limit(1)
    .single();

  if (approveError) {
    throw approveError;
  }

  return mapTemplateImageCandidateRow(approved as TemplateImageCandidateRow);
}
