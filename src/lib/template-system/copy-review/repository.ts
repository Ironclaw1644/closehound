import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import type {
  TemplateCopyInventory,
  TemplateCopyReviewDecision,
  TemplateCopyReviewStatus,
  TemplateCopySlot,
} from "@/lib/template-system/copy-review/types";

export type TemplateCopyReviewState = {
  templateKey: string;
  slotKey: string;
  status: TemplateCopyReviewStatus;
  decision?: TemplateCopyReviewDecision;
  proposedText?: string;
  reviewNotes?: string;
  updatedAt: string;
};

export type TemplateCopyReviewSummary = {
  templateKey: string;
  approvedCount: number;
  needsRevisionCount: number;
  unreviewedCount: number;
  totalCount: number;
  copyApproved: boolean;
};

const STORE_ROOT =
  process.env.CLOSEHOUND_TEMPLATE_COPY_REVIEW_STORE ??
  path.join(tmpdir(), "closehound-template-copy-review-state");

function templateDir(templateKey: string) {
  return path.join(STORE_ROOT, encodeURIComponent(templateKey));
}

function slotStatePath(templateKey: string, slotKey: string) {
  return path.join(templateDir(templateKey), `${encodeURIComponent(slotKey)}.json`);
}

async function readStateFile(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as TemplateCopyReviewState;
}

function sortReviewState(
  left: TemplateCopyReviewState,
  right: TemplateCopyReviewState
) {
  if (left.updatedAt !== right.updatedAt) {
    return left.updatedAt.localeCompare(right.updatedAt);
  }

  return left.slotKey.localeCompare(right.slotKey);
}

async function saveTemplateCopyReviewState(
  state: TemplateCopyReviewState
): Promise<TemplateCopyReviewState> {
  const filePath = slotStatePath(state.templateKey, state.slotKey);

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(state, null, 2), "utf8");

  return state;
}

export async function listTemplateCopyReviewState(templateKey: string) {
  const dirPath = templateDir(templateKey);

  try {
    const entries = await fs.readdir(dirPath);
    const states = await Promise.all(
      entries
        .filter((entry) => entry.endsWith(".json"))
        .map((entry) => readStateFile(path.join(dirPath, entry)))
    );

    return states.sort(sortReviewState);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function saveApprovedTemplateCopySlot(input: {
  templateKey: string;
  slotKey: string;
  reviewNotes?: string;
}) {
  return saveTemplateCopyReviewState({
    templateKey: input.templateKey,
    slotKey: input.slotKey,
    status: "approved",
    decision: "approved",
    proposedText: undefined,
    reviewNotes: input.reviewNotes,
    updatedAt: new Date().toISOString(),
  });
}

export async function saveRevisionTemplateCopySlot(input: {
  templateKey: string;
  slotKey: string;
  decision: Exclude<TemplateCopyReviewDecision, "approved">;
  proposedText?: string;
  reviewNotes?: string;
}) {
  return saveTemplateCopyReviewState({
    templateKey: input.templateKey,
    slotKey: input.slotKey,
    status: "needs-revision",
    decision: input.decision,
    proposedText: input.proposedText,
    reviewNotes: input.reviewNotes,
    updatedAt: new Date().toISOString(),
  });
}

export function applyTemplateCopyReviewState(input: {
  inventory: TemplateCopyInventory;
  reviewState: readonly TemplateCopyReviewState[];
}) {
  const bySlotKey = new Map(
    input.reviewState.map((state) => [state.slotKey, state] as const)
  );

  return input.inventory.map((slot) => {
    const savedState = bySlotKey.get(slot.slotKey);

    if (!savedState) {
      return slot;
    }

    const merged: TemplateCopySlot = {
      ...slot,
      status: savedState.status,
      decision: savedState.decision,
      proposedText: savedState.proposedText,
      reviewNotes: savedState.reviewNotes,
    };

    return merged;
  });
}

export function buildTemplateCopyReviewSummary(input: {
  templateKey: string;
  inventory: TemplateCopyInventory;
  reviewState: readonly TemplateCopyReviewState[];
}) {
  const mergedInventory = applyTemplateCopyReviewState({
    inventory: input.inventory,
    reviewState: input.reviewState,
  });

  let approvedCount = 0;
  let needsRevisionCount = 0;
  let unreviewedCount = 0;

  for (const slot of mergedInventory) {
    if (slot.status === "approved") {
      approvedCount += 1;
      continue;
    }

    if (slot.status === "needs-revision") {
      needsRevisionCount += 1;
      continue;
    }

    unreviewedCount += 1;
  }

  return {
    templateKey: input.templateKey,
    approvedCount,
    needsRevisionCount,
    unreviewedCount,
    totalCount: mergedInventory.length,
    copyApproved:
      mergedInventory.length > 0 &&
      approvedCount === mergedInventory.length &&
      needsRevisionCount === 0,
  } satisfies TemplateCopyReviewSummary;
}

export async function __resetTemplateCopyReviewStateForTests() {
  await fs.rm(STORE_ROOT, { recursive: true, force: true });
}
