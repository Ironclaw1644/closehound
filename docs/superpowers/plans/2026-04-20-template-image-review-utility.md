# Template Image Review Utility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small internal review utility for archetype image candidates so roofing, HVAC, and plumbing image batches can be inspected and approved from the app instead of the CLI.

**Architecture:** Keep Supabase reads and mutations in the existing repository layer, add one small template review registry, and build two server-rendered internal routes backed by server actions. Approval stays global per `templateKey + slot`, while the detail page remains batch-focused for inspection and links directly into the existing `?batch=` preview flow.

**Tech Stack:** Next.js App Router, React Server Components, Next.js Server Actions, Supabase admin client, TypeScript, Node test runner, existing template-system resolver/preview stack

---

## File Structure

- Create: `src/lib/template-system/images/review-registry.ts`
  - Internal registry for reviewable templates, their labels, preview routes, and slot definitions.
- Modify: `src/lib/template-system/images/repository.ts`
  - Add review-focused read helpers and approval/rejection mutations.
- Create: `src/components/template-images/template-image-index.tsx`
  - Server component for the internal index page.
- Create: `src/components/template-images/template-image-detail.tsx`
  - Server component for the template detail page.
- Create: `src/components/template-images/template-image-card.tsx`
  - Presentational candidate card with status and action form controls.
- Create: `src/app/internal/template-images/page.tsx`
  - Internal index route.
- Create: `src/app/internal/template-images/[templateKey]/page.tsx`
  - Internal detail route.
- Create: `src/app/internal/template-images/actions.ts`
  - Server actions for approve/reject and revalidation.
- Modify: `src/lib/template-system/resolver.test.ts`
  - Add repository-level and summary logic tests if keeping image review tests colocated here.
- Create: `src/lib/template-system/images/review.test.ts`
  - Prefer this for review utility logic instead of bloating `resolver.test.ts`.

## Task 1: Add review registry and repository helpers

**Files:**
- Create: `src/lib/template-system/images/review-registry.ts`
- Modify: `src/lib/template-system/images/repository.ts`
- Test: `src/lib/template-system/images/review.test.ts`

- [ ] **Step 1: Write the failing tests for template registry and review summaries**

Create `src/lib/template-system/images/review.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";

import {
  TEMPLATE_IMAGE_REVIEW_TEMPLATES,
  getTemplateImageReviewConfig,
} from "@/lib/template-system/images/review-registry";
import {
  buildTemplateReviewSummaryFromRecords,
  sortTemplateBatchesNewestFirst,
  type ArchetypeImageCandidateRecord,
} from "@/lib/template-system/images/repository";

function makeRecord(
  overrides: Partial<ArchetypeImageCandidateRecord>
): ArchetypeImageCandidateRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    generationBatchId: overrides.generationBatchId ?? "batch-1",
    familyKey: overrides.familyKey ?? "blue-collar-service",
    templateKey: overrides.templateKey ?? "roofing-v1",
    templateVersion: overrides.templateVersion ?? "1.0.0",
    seedBusinessKey: overrides.seedBusinessKey ?? null,
    leadId: overrides.leadId ?? null,
    slot: overrides.slot ?? "hero",
    candidateIndex: overrides.candidateIndex ?? 0,
    prompt: overrides.prompt ?? "prompt",
    negativePrompt: overrides.negativePrompt ?? "negative",
    promptVersion: overrides.promptVersion ?? "v1",
    provider: overrides.provider ?? "gemini",
    model: overrides.model ?? "nano-banana-2",
    status: overrides.status ?? "generated",
    storagePath: overrides.storagePath ?? "template-images/roofing-v1/batch-1/hero-0.png",
    assetUrl: overrides.assetUrl ?? "https://example.com/hero-0.png",
    aspectRatio: overrides.aspectRatio ?? "16:9",
    cropNotes: overrides.cropNotes ?? null,
    createdAt: overrides.createdAt ?? "2026-04-20T12:00:00.000Z",
    createdBy: overrides.createdBy ?? "codex",
    approvalUpdatedAt: overrides.approvalUpdatedAt ?? null,
    approvalUpdatedBy: overrides.approvalUpdatedBy ?? null,
  };
}

test("review registry exposes supported template configs", () => {
  assert.equal(TEMPLATE_IMAGE_REVIEW_TEMPLATES.length, 3);
  assert.equal(getTemplateImageReviewConfig("roofing-v1")?.previewPath, "/preview/templates/roofing-archetype");
  assert.equal(getTemplateImageReviewConfig("hvac-v1")?.previewPath, "/preview/templates/hvac-archetype");
  assert.equal(getTemplateImageReviewConfig("plumbing-v1")?.previewPath, "/preview/templates/plumbing-archetype");
});

test("template review summary reports required and optional approval counts", () => {
  const summary = buildTemplateReviewSummaryFromRecords({
    templateKey: "roofing-v1",
    slotDefinitions: [
      { key: "hero", required: true },
      { key: "service-action", required: true },
      { key: "gallery-extra", required: false },
    ],
    records: [
      makeRecord({ templateKey: "roofing-v1", slot: "hero", status: "approved" }),
      makeRecord({ templateKey: "roofing-v1", slot: "service-action", status: "approved", id: "two" }),
    ],
  });

  assert.equal(summary.requiredApprovedCount, 2);
  assert.equal(summary.requiredTotalCount, 2);
  assert.equal(summary.optionalApprovedCount, 0);
  assert.equal(summary.optionalTotalCount, 1);
  assert.equal(summary.isPreviewSafe, true);
});

test("batch sorting prefers newest created timestamp first", () => {
  const batches = sortTemplateBatchesNewestFirst([
    { generationBatchId: "batch-old", createdAt: "2026-04-19T10:00:00.000Z" },
    { generationBatchId: "batch-new", createdAt: "2026-04-20T10:00:00.000Z" },
  ]);

  assert.deepEqual(
    batches.map((batch) => batch.generationBatchId),
    ["batch-new", "batch-old"]
  );
});
```

- [ ] **Step 2: Run the new test file to verify it fails**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/images/review.test.ts
```

Expected: FAIL with missing exports from `review-registry.ts` and `repository.ts`.

- [ ] **Step 3: Add the review template registry**

Create `src/lib/template-system/images/review-registry.ts`:

```ts
import { HVAC_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/hvac";
import { PLUMBING_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/plumbing";
import { ROOFING_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/roofing";
import type { ArchetypeImageSlotDefinition } from "@/lib/template-system/images/repository";

export type TemplateImageReviewConfig = {
  templateKey: "roofing-v1" | "hvac-v1" | "plumbing-v1";
  label: string;
  previewPath: string;
  slotDefinitions: readonly ArchetypeImageSlotDefinition[];
};

export const TEMPLATE_IMAGE_REVIEW_TEMPLATES: readonly TemplateImageReviewConfig[] = [
  {
    templateKey: "roofing-v1",
    label: "Roofing",
    previewPath: "/preview/templates/roofing-archetype",
    slotDefinitions: ROOFING_VISUAL_SLOTS,
  },
  {
    templateKey: "hvac-v1",
    label: "HVAC",
    previewPath: "/preview/templates/hvac-archetype",
    slotDefinitions: HVAC_VISUAL_SLOTS,
  },
  {
    templateKey: "plumbing-v1",
    label: "Plumbing",
    previewPath: "/preview/templates/plumbing-archetype",
    slotDefinitions: PLUMBING_VISUAL_SLOTS,
  },
] as const;

export function getTemplateImageReviewConfig(templateKey: string) {
  return TEMPLATE_IMAGE_REVIEW_TEMPLATES.find(
    (config) => config.templateKey === templateKey
  );
}
```

- [ ] **Step 4: Add pure repository-side summary and batch helpers**

Modify `src/lib/template-system/images/repository.ts` with these additions near the existing helper exports:

```ts
export type TemplateImageBatchSummary = {
  generationBatchId: string;
  createdAt: string;
};

export type TemplateReviewSummary = {
  templateKey: string;
  latestBatchId: string | null;
  requiredApprovedCount: number;
  requiredTotalCount: number;
  optionalApprovedCount: number;
  optionalTotalCount: number;
  isPreviewSafe: boolean;
};

export function sortTemplateBatchesNewestFirst(
  batches: readonly TemplateImageBatchSummary[]
) {
  return [...batches].sort((left, right) => {
    if (left.createdAt !== right.createdAt) {
      return right.createdAt.localeCompare(left.createdAt);
    }

    return right.generationBatchId.localeCompare(left.generationBatchId);
  });
}

export function buildTemplateReviewSummaryFromRecords(input: {
  templateKey: string;
  slotDefinitions: readonly ArchetypeImageSlotDefinition[];
  records: readonly ArchetypeImageCandidateRecord[];
}): TemplateReviewSummary {
  const scoped = input.records.filter(
    (record) =>
      record.templateKey === input.templateKey && record.status === "approved"
  );

  const latestBatchId = selectMostRecentlyApprovedTemplateImageBatch(
    scoped,
    input.templateKey
  );

  let requiredApprovedCount = 0;
  let optionalApprovedCount = 0;
  let requiredTotalCount = 0;
  let optionalTotalCount = 0;

  for (const slot of input.slotDefinitions) {
    const hasApproved = scoped.some((record) => record.slot === slot.key);

    if (slot.required) {
      requiredTotalCount += 1;
      if (hasApproved) requiredApprovedCount += 1;
    } else {
      optionalTotalCount += 1;
      if (hasApproved) optionalApprovedCount += 1;
    }
  }

  return {
    templateKey: input.templateKey,
    latestBatchId,
    requiredApprovedCount,
    requiredTotalCount,
    optionalApprovedCount,
    optionalTotalCount,
    isPreviewSafe:
      requiredTotalCount === 0 || requiredApprovedCount === requiredTotalCount,
  };
}
```

- [ ] **Step 5: Add Supabase-backed review read helpers**

Modify `src/lib/template-system/images/repository.ts` to add these functions:

```ts
export async function listTemplateImageCandidatesByTemplate(templateKey: string) {
  if (!hasSupabaseAdminEnv()) {
    return [];
  }

  const client = getSupabaseAdminClient().schema("closehound");
  const { data, error } = await client
    .from("template_image_candidates")
    .select("*")
    .eq("template_key", templateKey)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list template image candidates: ${error.message}`);
  }

  return (data ?? []).map((row) =>
    mapTemplateImageCandidateRow(row as TemplateImageCandidateRow)
  );
}

export async function listTemplateImageBatchSummaries(templateKey: string) {
  const records = await listTemplateImageCandidatesByTemplate(templateKey);
  const byBatch = new Map<string, TemplateImageBatchSummary>();

  for (const record of records) {
    const existing = byBatch.get(record.generationBatchId);

    if (!existing || record.createdAt > existing.createdAt) {
      byBatch.set(record.generationBatchId, {
        generationBatchId: record.generationBatchId,
        createdAt: record.createdAt,
      });
    }
  }

  return sortTemplateBatchesNewestFirst(Array.from(byBatch.values()));
}

export async function listTemplateImageCandidatesForBatch(input: {
  templateKey: string;
  generationBatchId: string;
}) {
  const records = await listTemplateImageCandidatesByTemplate(input.templateKey);
  return records.filter(
    (record) => record.generationBatchId === input.generationBatchId
  );
}

export async function listApprovedTemplateImageCandidates(templateKey: string) {
  const records = await listTemplateImageCandidatesByTemplate(templateKey);
  return records.filter((record) => record.status === "approved");
}
```

- [ ] **Step 6: Run the targeted test file to verify it passes**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/images/review.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit Task 1**

Run:

```bash
git add src/lib/template-system/images/review-registry.ts src/lib/template-system/images/repository.ts src/lib/template-system/images/review.test.ts
git commit -m "Add template image review registry and summaries"
```

## Task 2: Add approval and rejection mutations with cross-batch slot enforcement

**Files:**
- Modify: `src/lib/template-system/images/repository.ts`
- Test: `src/lib/template-system/images/review.test.ts`

- [ ] **Step 1: Write the failing tests for approve/reject behavior**

Append to `src/lib/template-system/images/review.test.ts`:

```ts
test("approving a candidate demotes existing approved candidate for the same template slot", () => {
  const records = [
    makeRecord({
      id: "old-approved",
      templateKey: "roofing-v1",
      generationBatchId: "batch-old",
      slot: "hero",
      status: "approved",
    }),
    makeRecord({
      id: "new-generated",
      templateKey: "roofing-v1",
      generationBatchId: "batch-new",
      slot: "hero",
      status: "generated",
    }),
  ];

  const next = applyApprovalMutation(records, {
    candidateId: "new-generated",
    approvedBy: "codex",
  });

  assert.equal(next.find((record) => record.id === "new-generated")?.status, "approved");
  assert.equal(next.find((record) => record.id === "old-approved")?.status, "generated");
});

test("rejecting the active approved candidate clears the slot", () => {
  const records = [
    makeRecord({
      id: "approved-hero",
      templateKey: "roofing-v1",
      slot: "hero",
      status: "approved",
    }),
  ];

  const next = applyRejectMutation(records, {
    candidateId: "approved-hero",
  });

  assert.equal(next[0]?.status, "rejected");
  assert.equal(
    next.some((record) => record.slot === "hero" && record.status === "approved"),
    false
  );
});
```

- [ ] **Step 2: Run the test file to verify it fails**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/images/review.test.ts
```

Expected: FAIL with missing `applyApprovalMutation` and `applyRejectMutation`.

- [ ] **Step 3: Add pure mutation helpers**

Modify `src/lib/template-system/images/repository.ts`:

```ts
export function applyApprovalMutation(
  records: readonly ArchetypeImageCandidateRecord[],
  input: { candidateId: string; approvedBy: string; approvedAt?: string }
) {
  const approvedAt = input.approvedAt ?? new Date().toISOString();
  const target = records.find((record) => record.id === input.candidateId);

  if (!target) {
    throw new Error(`Unknown candidate id: ${input.candidateId}`);
  }

  return records.map((record) => {
    if (record.id === target.id) {
      return {
        ...record,
        status: "approved" as const,
        approvalUpdatedAt: approvedAt,
        approvalUpdatedBy: input.approvedBy,
      };
    }

    if (
      record.templateKey === target.templateKey &&
      record.slot === target.slot &&
      record.status === "approved"
    ) {
      return {
        ...record,
        status: "generated" as const,
        approvalUpdatedAt: approvedAt,
        approvalUpdatedBy: input.approvedBy,
      };
    }

    return record;
  });
}

export function applyRejectMutation(
  records: readonly ArchetypeImageCandidateRecord[],
  input: { candidateId: string; rejectedAt?: string; rejectedBy?: string }
) {
  const rejectedAt = input.rejectedAt ?? new Date().toISOString();

  return records.map((record) =>
    record.id === input.candidateId
      ? {
          ...record,
          status: "rejected" as const,
          approvalUpdatedAt: rejectedAt,
          approvalUpdatedBy: input.rejectedBy ?? record.approvalUpdatedBy ?? "internal-review",
        }
      : record
  );
}
```

- [ ] **Step 4: Add Supabase-backed mutation functions**

Modify `src/lib/template-system/images/repository.ts`:

```ts
export async function approveTemplateImageCandidate(input: {
  candidateId: string;
  approvedBy: string;
}) {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Supabase admin environment is not configured.");
  }

  const client = getSupabaseAdminClient().schema("closehound");
  const { data: targetRow, error: targetError } = await client
    .from("template_image_candidates")
    .select("*")
    .eq("id", input.candidateId)
    .single();

  if (targetError || !targetRow) {
    throw new Error(`Failed to load candidate for approval: ${targetError?.message ?? "not found"}`);
  }

  const target = mapTemplateImageCandidateRow(targetRow as TemplateImageCandidateRow);
  const approvalUpdatedAt = new Date().toISOString();

  const { error: demoteError } = await client
    .from("template_image_candidates")
    .update({
      status: "generated",
      approval_updated_at: approvalUpdatedAt,
      approval_updated_by: input.approvedBy,
    })
    .eq("template_key", target.templateKey)
    .eq("slot", target.slot)
    .eq("status", "approved");

  if (demoteError) {
    throw new Error(`Failed to demote prior approved candidate: ${demoteError.message}`);
  }

  const { data: approvedRow, error: approveError } = await client
    .from("template_image_candidates")
    .update({
      status: "approved",
      approval_updated_at: approvalUpdatedAt,
      approval_updated_by: input.approvedBy,
    })
    .eq("id", target.id)
    .select("*")
    .single();

  if (approveError || !approvedRow) {
    throw new Error(`Failed to approve candidate: ${approveError?.message ?? "unknown error"}`);
  }

  return mapTemplateImageCandidateRow(approvedRow as TemplateImageCandidateRow);
}

export async function rejectTemplateImageCandidate(input: {
  candidateId: string;
  rejectedBy: string;
}) {
  if (!hasSupabaseAdminEnv()) {
    throw new Error("Supabase admin environment is not configured.");
  }

  const client = getSupabaseAdminClient().schema("closehound");
  const rejectionUpdatedAt = new Date().toISOString();
  const { data, error } = await client
    .from("template_image_candidates")
    .update({
      status: "rejected",
      approval_updated_at: rejectionUpdatedAt,
      approval_updated_by: input.rejectedBy,
    })
    .eq("id", input.candidateId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to reject candidate: ${error?.message ?? "unknown error"}`);
  }

  return mapTemplateImageCandidateRow(data as TemplateImageCandidateRow);
}
```

- [ ] **Step 5: Re-run the test file**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/images/review.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add src/lib/template-system/images/repository.ts src/lib/template-system/images/review.test.ts
git commit -m "Add template image review mutations"
```

## Task 3: Build internal pages and UI components

**Files:**
- Create: `src/components/template-images/template-image-index.tsx`
- Create: `src/components/template-images/template-image-detail.tsx`
- Create: `src/components/template-images/template-image-card.tsx`
- Create: `src/app/internal/template-images/page.tsx`
- Create: `src/app/internal/template-images/[templateKey]/page.tsx`
- Test: `src/lib/template-system/images/review.test.ts`

- [ ] **Step 1: Write the failing tests for detail-page selection logic**

Append to `src/lib/template-system/images/review.test.ts`:

```ts
import { resolveSelectedTemplateBatchId } from "@/lib/template-system/images/review-registry";

test("selected batch falls back to latest batch when query param is absent", () => {
  assert.equal(
    resolveSelectedTemplateBatchId({
      requestedBatch: null,
      batches: [
        { generationBatchId: "batch-new", createdAt: "2026-04-20T10:00:00.000Z" },
        { generationBatchId: "batch-old", createdAt: "2026-04-19T10:00:00.000Z" },
      ],
    }),
    "batch-new"
  );
});

test("selected batch returns null when a requested batch does not exist", () => {
  assert.equal(
    resolveSelectedTemplateBatchId({
      requestedBatch: "missing-batch",
      batches: [{ generationBatchId: "batch-new", createdAt: "2026-04-20T10:00:00.000Z" }],
    }),
    null
  );
});
```

- [ ] **Step 2: Run the test file to verify it fails**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/images/review.test.ts
```

Expected: FAIL with missing `resolveSelectedTemplateBatchId`.

- [ ] **Step 3: Add small registry helpers for selection and preview links**

Modify `src/lib/template-system/images/review-registry.ts`:

```ts
import type { TemplateImageBatchSummary } from "@/lib/template-system/images/repository";

export function resolveSelectedTemplateBatchId(input: {
  requestedBatch: string | null;
  batches: readonly TemplateImageBatchSummary[];
}) {
  if (!input.batches.length) {
    return null;
  }

  if (!input.requestedBatch) {
    return input.batches[0]?.generationBatchId ?? null;
  }

  return input.batches.some(
    (batch) => batch.generationBatchId === input.requestedBatch
  )
    ? input.requestedBatch
    : null;
}

export function buildTemplatePreviewInspectionHref(input: {
  previewPath: string;
  generationBatchId: string | null;
}) {
  if (!input.generationBatchId) {
    return input.previewPath;
  }

  return `${input.previewPath}?batch=${encodeURIComponent(input.generationBatchId)}`;
}
```

- [ ] **Step 4: Create the candidate card component**

Create `src/components/template-images/template-image-card.tsx`:

```tsx
import type { ArchetypeImageCandidateRecord } from "@/lib/template-system/images/repository";

type TemplateImageCardProps = {
  candidate: ArchetypeImageCandidateRecord;
  storageState: "available" | "missing";
  isCurrentlyApproved: boolean;
  approveAction: (formData: FormData) => Promise<void>;
  rejectAction: (formData: FormData) => Promise<void>;
};

export function TemplateImageCard({
  candidate,
  storageState,
  isCurrentlyApproved,
  approveAction,
  rejectAction,
}: TemplateImageCardProps) {
  return (
    <article className="rounded-2xl border border-black/10 bg-white p-4">
      {candidate.assetUrl ? (
        <img
          src={candidate.assetUrl}
          alt={`${candidate.templateKey} ${candidate.slot} candidate ${candidate.candidateIndex}`}
          className="h-48 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500">
          Missing asset
        </div>
      )}
      <div className="mt-4 space-y-1 text-sm text-slate-600">
        <p><strong>Slot:</strong> {candidate.slot}</p>
        <p><strong>Candidate:</strong> {candidate.candidateIndex}</p>
        <p><strong>Status:</strong> {candidate.status}</p>
        <p><strong>Prompt:</strong> {candidate.promptVersion}</p>
        <p><strong>Storage:</strong> {storageState}</p>
      </div>
      {isCurrentlyApproved ? (
        <p className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          Currently approved
        </p>
      ) : null}
      <div className="mt-4 flex gap-3">
        <form action={approveAction}>
          <input type="hidden" name="candidateId" value={candidate.id} />
          <button className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
            Approve
          </button>
        </form>
        <form action={rejectAction}>
          <input type="hidden" name="candidateId" value={candidate.id} />
          <button className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-900">
            Reject
          </button>
        </form>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Create the index and detail view components**

Create `src/components/template-images/template-image-index.tsx`:

```tsx
import Link from "next/link";
import type { TemplateReviewSummary } from "@/lib/template-system/images/repository";
import type { TemplateImageReviewConfig } from "@/lib/template-system/images/review-registry";

export function TemplateImageIndex(props: {
  templates: Array<TemplateImageReviewConfig & { summary: TemplateReviewSummary }>;
}) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-4xl font-semibold tracking-tight">Template Image Review</h1>
      <div className="mt-8 grid gap-4">
        {props.templates.map((template) => (
          <Link
            key={template.templateKey}
            href={`/internal/template-images/${template.templateKey}`}
            className="rounded-2xl border border-black/10 bg-white p-6"
          >
            <h2 className="text-2xl font-semibold">{template.label}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Latest batch: {template.summary.latestBatchId ?? "No batches yet"}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Required approved: {template.summary.requiredApprovedCount}/{template.summary.requiredTotalCount}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Optional approved: {template.summary.optionalApprovedCount}/{template.summary.optionalTotalCount}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Preview-safe: {template.summary.isPreviewSafe ? "yes" : "no"}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

Create `src/components/template-images/template-image-detail.tsx`:

```tsx
import Link from "next/link";
import type {
  ArchetypeImageCandidateRecord,
  TemplateImageBatchSummary,
  TemplateReviewSummary,
} from "@/lib/template-system/images/repository";
import type { TemplateImageReviewConfig } from "@/lib/template-system/images/review-registry";
import { TemplateImageCard } from "@/components/template-images/template-image-card";

export function TemplateImageDetail(props: {
  config: TemplateImageReviewConfig;
  summary: TemplateReviewSummary;
  batches: readonly TemplateImageBatchSummary[];
  selectedBatchId: string | null;
  candidatesBySlot: Record<string, ArchetypeImageCandidateRecord[]>;
  approvedBySlot: Record<string, ArchetypeImageCandidateRecord | undefined>;
  livePreviewHref: string;
  approveAction: (formData: FormData) => Promise<void>;
  rejectAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{props.config.templateKey}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{props.config.label} Image Review</h1>
          <p className="mt-4 text-sm text-slate-600">
            Required approved: {props.summary.requiredApprovedCount}/{props.summary.requiredTotalCount}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Optional approved: {props.summary.optionalApprovedCount}/{props.summary.optionalTotalCount}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Preview-safe: {props.summary.isPreviewSafe ? "yes" : "no"}
          </p>
        </div>
        <Link href={props.livePreviewHref} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          Live Preview
        </Link>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        {props.batches.map((batch) => (
          <Link
            key={batch.generationBatchId}
            href={`/internal/template-images/${props.config.templateKey}?batch=${batch.generationBatchId}`}
            className="rounded-full border border-black/10 px-4 py-2 text-sm"
          >
            {batch.generationBatchId}
          </Link>
        ))}
      </div>
      <div className="mt-10 space-y-10">
        {props.config.slotDefinitions.map((slot) => {
          const candidates = props.candidatesBySlot[slot.key] ?? [];
          return (
            <section key={slot.key}>
              <div className="mb-4">
                <h2 className="text-2xl font-semibold">{slot.key}</h2>
                <p className="text-sm text-slate-600">{slot.required ? "Required slot" : "Optional slot"}</p>
              </div>
              {candidates.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {candidates.map((candidate) => (
                    <TemplateImageCard
                      key={candidate.id}
                      candidate={candidate}
                      storageState={candidate.assetUrl || candidate.storagePath ? "available" : "missing"}
                      isCurrentlyApproved={props.approvedBySlot[slot.key]?.id === candidate.id}
                      approveAction={props.approveAction}
                      rejectAction={props.rejectAction}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-black/10 bg-slate-50 p-6 text-sm text-slate-500">
                  No candidates in this batch for {slot.key}.
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Create the internal routes**

Create `src/app/internal/template-images/page.tsx`:

```tsx
import { TemplateImageIndex } from "@/components/template-images/template-image-index";
import {
  TEMPLATE_IMAGE_REVIEW_TEMPLATES,
} from "@/lib/template-system/images/review-registry";
import {
  buildTemplateReviewSummaryFromRecords,
  listApprovedTemplateImageCandidates,
} from "@/lib/template-system/images/repository";

export default async function TemplateImageIndexPage() {
  const templates = await Promise.all(
    TEMPLATE_IMAGE_REVIEW_TEMPLATES.map(async (config) => {
      const approved = await listApprovedTemplateImageCandidates(config.templateKey);
      return {
        ...config,
        summary: buildTemplateReviewSummaryFromRecords({
          templateKey: config.templateKey,
          slotDefinitions: config.slotDefinitions,
          records: approved,
        }),
      };
    })
  );

  return <TemplateImageIndex templates={templates} />;
}
```

Create `src/app/internal/template-images/[templateKey]/page.tsx`:

```tsx
import { notFound } from "next/navigation";

import { TemplateImageDetail } from "@/components/template-images/template-image-detail";
import {
  buildTemplatePreviewInspectionHref,
  getTemplateImageReviewConfig,
  resolveSelectedTemplateBatchId,
} from "@/lib/template-system/images/review-registry";
import {
  buildTemplateReviewSummaryFromRecords,
  listApprovedTemplateImageCandidates,
  listTemplateImageBatchSummaries,
  listTemplateImageCandidatesForBatch,
} from "@/lib/template-system/images/repository";
import { approveTemplateImageAction, rejectTemplateImageAction } from "@/app/internal/template-images/actions";

export default async function TemplateImageDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ templateKey: string }>;
  searchParams?: Promise<{ batch?: string }>;
}) {
  const routeParams = await params;
  const config = getTemplateImageReviewConfig(routeParams.templateKey);

  if (!config) {
    notFound();
  }

  const query = (await searchParams) ?? {};
  const batches = await listTemplateImageBatchSummaries(config.templateKey);
  const selectedBatchId = resolveSelectedTemplateBatchId({
    requestedBatch: query.batch?.trim() || null,
    batches,
  });
  const candidates = selectedBatchId
    ? await listTemplateImageCandidatesForBatch({
        templateKey: config.templateKey,
        generationBatchId: selectedBatchId,
      })
    : [];
  const approved = await listApprovedTemplateImageCandidates(config.templateKey);
  const approvedBySlot = Object.fromEntries(
    config.slotDefinitions.map((slot) => [
      slot.key,
      approved.find((candidate) => candidate.slot === slot.key),
    ])
  );
  const candidatesBySlot = Object.groupBy(candidates, (candidate) => candidate.slot);

  return (
    <TemplateImageDetail
      config={config}
      summary={buildTemplateReviewSummaryFromRecords({
        templateKey: config.templateKey,
        slotDefinitions: config.slotDefinitions,
        records: approved,
      })}
      batches={batches}
      selectedBatchId={selectedBatchId}
      candidatesBySlot={candidatesBySlot}
      approvedBySlot={approvedBySlot}
      livePreviewHref={buildTemplatePreviewInspectionHref({
        previewPath: config.previewPath,
        generationBatchId: selectedBatchId,
      })}
      approveAction={approveTemplateImageAction}
      rejectAction={rejectTemplateImageAction}
    />
  );
}
```

- [ ] **Step 7: Re-run the test file**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/images/review.test.ts
```

Expected: PASS

- [ ] **Step 8: Commit Task 3**

Run:

```bash
git add src/lib/template-system/images/review-registry.ts src/components/template-images/template-image-index.tsx src/components/template-images/template-image-detail.tsx src/components/template-images/template-image-card.tsx src/app/internal/template-images/page.tsx src/app/internal/template-images/[templateKey]/page.tsx src/lib/template-system/images/review.test.ts
git commit -m "Add template image review pages"
```

## Task 4: Add server actions and route revalidation

**Files:**
- Create: `src/app/internal/template-images/actions.ts`
- Modify: `src/app/internal/template-images/[templateKey]/page.tsx`
- Test: `src/lib/template-system/images/review.test.ts`

- [ ] **Step 1: Add the server actions**

Create `src/app/internal/template-images/actions.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";

import {
  approveTemplateImageCandidate,
  rejectTemplateImageCandidate,
} from "@/lib/template-system/images/repository";
import {
  getTemplateImageReviewConfig,
} from "@/lib/template-system/images/review-registry";

function extractCandidateId(formData: FormData) {
  const candidateId = formData.get("candidateId");

  if (typeof candidateId !== "string" || !candidateId.trim()) {
    throw new Error("Missing candidate id.");
  }

  return candidateId.trim();
}

function revalidateTemplatePaths(templateKey: string) {
  const config = getTemplateImageReviewConfig(templateKey);

  if (!config) {
    return;
  }

  revalidatePath("/internal/template-images");
  revalidatePath(`/internal/template-images/${templateKey}`);
  revalidatePath(config.previewPath);
}

export async function approveTemplateImageAction(formData: FormData) {
  const candidateId = extractCandidateId(formData);
  const approved = await approveTemplateImageCandidate({
    candidateId,
    approvedBy: "internal-review",
  });
  revalidateTemplatePaths(approved.templateKey);
}

export async function rejectTemplateImageAction(formData: FormData) {
  const candidateId = extractCandidateId(formData);
  const rejected = await rejectTemplateImageCandidate({
    candidateId,
    rejectedBy: "internal-review",
  });
  revalidateTemplatePaths(rejected.templateKey);
}
```

- [ ] **Step 2: Tighten the detail page empty-state behavior**

Modify `src/app/internal/template-images/[templateKey]/page.tsx`:

```tsx
  if (!batches.length) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-semibold tracking-tight">{config.label} Image Review</h1>
        <p className="mt-4 text-slate-600">No batches yet for {config.templateKey}.</p>
      </main>
    );
  }
```

And after `selectedBatchId` resolution:

```tsx
  if (query.batch && !selectedBatchId) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-semibold tracking-tight">{config.label} Image Review</h1>
        <p className="mt-4 text-slate-600">
          Requested batch <code>{query.batch}</code> does not exist for {config.templateKey}.
        </p>
      </main>
    );
  }
```

- [ ] **Step 3: Run typecheck and build**

Run:

```bash
npm run typecheck
npm run build
```

Expected: both PASS

- [ ] **Step 4: Browser verification**

Run:

```bash
OPENPAW_SHARED_ROOT=/Users/ironclaw/.openclaw/shared npm run dev -- --port 3002
```

Then verify:

```bash
curl -s http://127.0.0.1:3002/internal/template-images
curl -s http://127.0.0.1:3002/internal/template-images/roofing-v1
curl -s http://127.0.0.1:3002/internal/template-images/hvac-v1
curl -s http://127.0.0.1:3002/internal/template-images/plumbing-v1
```

Expected:

- index renders all three templates
- detail pages render latest batch by default
- live preview links contain the matching `?batch=...`
- approved candidates are visibly marked

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add src/app/internal/template-images/actions.ts src/app/internal/template-images/[templateKey]/page.tsx src/app/internal/template-images/page.tsx src/components/template-images/template-image-detail.tsx src/components/template-images/template-image-card.tsx
git commit -m "Add template image review actions"
```

## Task 5: Final verification and cleanup

**Files:**
- Verify: `src/lib/template-system/images/repository.ts`
- Verify: `src/lib/template-system/images/review-registry.ts`
- Verify: `src/app/internal/template-images/page.tsx`
- Verify: `src/app/internal/template-images/[templateKey]/page.tsx`
- Verify: `src/components/template-images/template-image-*.tsx`
- Test: `src/lib/template-system/images/review.test.ts`

- [ ] **Step 1: Run unit verification**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/images/review.test.ts
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/resolver.test.ts
```

Expected: both PASS

- [ ] **Step 2: Run typecheck and production build**

Run:

```bash
npm run typecheck
npm run build
```

Expected: both PASS

- [ ] **Step 3: Inspect worktree for accidental files**

Run:

```bash
git status --short
```

Expected: only intended review-utility files are modified or added. Leave unrelated files such as `tsconfig.tsbuildinfo` out of commits if they are incidental.

- [ ] **Step 4: Commit final verification pass**

Run:

```bash
git add src/lib/template-system/images/repository.ts src/lib/template-system/images/review-registry.ts src/lib/template-system/images/review.test.ts src/app/internal/template-images/page.tsx src/app/internal/template-images/[templateKey]/page.tsx src/app/internal/template-images/actions.ts src/components/template-images/template-image-index.tsx src/components/template-images/template-image-detail.tsx src/components/template-images/template-image-card.tsx
git commit -m "Finish template image review utility"
```

## Self-Review

- Spec coverage:
  - internal index page: covered in Task 3
  - detail page with batches and preview link: covered in Task 3
  - global slot approval behavior: covered in Task 2
  - server actions and revalidation: covered in Task 4
  - verification and browser checks: covered in Task 4 and Task 5
- Placeholder scan:
  - no `TODO`, `TBD`, or vague “handle appropriately” steps remain
- Type consistency:
  - review registry, summary helpers, mutation helpers, routes, and actions all use `templateKey`, `generationBatchId`, and slot definitions consistently
