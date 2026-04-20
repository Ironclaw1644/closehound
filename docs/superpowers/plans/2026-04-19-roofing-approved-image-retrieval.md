# Roofing Approved Image Retrieval Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Load approved roofing archetype images from Supabase-backed metadata and feed them into the roofing archetype preview path, using the latest approved batch by default and an optional pinned batch for debugging.

**Architecture:** Keep retrieval logic in the image repository layer and keep the route thin. The roofing archetype page should ask for either the latest approved batch or a specific batch, pass the approved slot map into `resolveTemplateRender`, and otherwise preserve today’s safe omission behavior when retrieval fails or no approved assets exist.

**Tech Stack:** Next.js App Router, TypeScript, Supabase client/admin client, Node test runner, existing template-system resolver

---

## File Structure

- Modify: `src/lib/template-system/images/repository.ts`
  - Add server-backed read helpers for latest approved batch lookup and approved candidate retrieval.
- Modify: `src/app/preview/templates/roofing-archetype/page.tsx`
  - Accept `searchParams`, resolve latest or pinned approved batch, and pass approved candidates into the template-system resolver.
- Modify: `src/lib/template-system/resolver.test.ts`
  - Add focused coverage for latest-batch selection, pinned batch behavior, and safe omission when retrieval is unavailable.
- Possibly create: `src/lib/template-system/images/server.ts`
  - Only if keeping Supabase imports out of `repository.ts` makes the read helpers cleaner. Do not create this file unless needed during implementation.

### Task 1: Add Repository Read Helpers

**Files:**
- Modify: `src/lib/template-system/images/repository.ts`
- Test: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing tests for approved batch lookup**

Add tests that define the new read-helper behavior in `src/lib/template-system/resolver.test.ts`:

```ts
test("latest approved template image batch prefers the newest approved batch", async () => {
  const rows: ArchetypeImageCandidateRecord[] = [
    {
      id: "old-approved",
      generationBatchId: "batch-1",
      familyKey: "blue-collar-service",
      templateKey: "roofing-v1",
      templateVersion: "1.0.0",
      slot: "hero",
      candidateIndex: 0,
      prompt: "prompt",
      negativePrompt: "negative",
      promptVersion: "1.0.0",
      provider: "gemini",
      model: "nano-banana-2",
      status: "approved",
      storagePath: "template-images/roofing-v1/batch-1/hero-0.png",
      aspectRatio: "16:9",
      createdAt: "2026-04-19T00:00:00.000Z",
      createdBy: "test",
    },
    {
      id: "new-approved",
      generationBatchId: "batch-2",
      familyKey: "blue-collar-service",
      templateKey: "roofing-v1",
      templateVersion: "1.0.0",
      slot: "hero",
      candidateIndex: 0,
      prompt: "prompt",
      negativePrompt: "negative",
      promptVersion: "1.0.0",
      provider: "gemini",
      model: "nano-banana-2",
      status: "approved",
      storagePath: "template-images/roofing-v1/batch-2/hero-0.png",
      aspectRatio: "16:9",
      createdAt: "2026-04-20T00:00:00.000Z",
      createdBy: "test",
    },
  ];

  assert.equal(selectLatestApprovedTemplateImageBatch(rows, "roofing-v1"), "batch-2");
});

test("approved candidate retrieval returns only approved rows for the requested batch", async () => {
  const rows: ArchetypeImageCandidateRecord[] = [
    {
      id: "approved-hero",
      generationBatchId: "batch-1",
      familyKey: "blue-collar-service",
      templateKey: "roofing-v1",
      templateVersion: "1.0.0",
      slot: "hero",
      candidateIndex: 0,
      prompt: "prompt",
      negativePrompt: "negative",
      promptVersion: "1.0.0",
      provider: "gemini",
      model: "nano-banana-2",
      status: "approved",
      storagePath: "template-images/roofing-v1/batch-1/hero-0.png",
      aspectRatio: "16:9",
      createdAt: "2026-04-20T00:00:00.000Z",
      createdBy: "test",
    },
    {
      id: "generated-hero",
      generationBatchId: "batch-1",
      familyKey: "blue-collar-service",
      templateKey: "roofing-v1",
      templateVersion: "1.0.0",
      slot: "hero",
      candidateIndex: 1,
      prompt: "prompt",
      negativePrompt: "negative",
      promptVersion: "1.0.0",
      provider: "gemini",
      model: "nano-banana-2",
      status: "generated",
      storagePath: "template-images/roofing-v1/batch-1/hero-1.png",
      aspectRatio: "16:9",
      createdAt: "2026-04-20T00:01:00.000Z",
      createdBy: "test",
    },
  ];

  const approved = pickApprovedCandidateBySlot(rows, {
    templateKey: "roofing-v1",
    generationBatchId: "batch-1",
    slotDefinitions: ROOFING_VISUAL_SLOTS,
  });

  assert.equal(approved.hero?.id, "approved-hero");
});
```

- [ ] **Step 2: Run the focused test slice to verify failure**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/resolver.test.ts
```

Expected: FAIL because `selectLatestApprovedTemplateImageBatch` does not exist yet.

- [ ] **Step 3: Implement the pure selection helpers in the repository**

Add the helper signatures and minimal implementation in `src/lib/template-system/images/repository.ts`:

```ts
export function selectLatestApprovedTemplateImageBatch(
  records: readonly ArchetypeImageCandidateRecord[],
  templateKey: string
) {
  const approved = records
    .filter(
      (record) =>
        record.templateKey === templateKey && record.status === "approved"
    )
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return approved[0]?.generationBatchId ?? null;
}

export function getApprovedTemplateImageCandidatesFromRecords(
  records: readonly ArchetypeImageCandidateRecord[],
  selection: { templateKey: string; generationBatchId: string }
) {
  return pickApprovedCandidateBySlot(records, {
    templateKey: selection.templateKey,
    generationBatchId: selection.generationBatchId,
    slotDefinitions: ROOFING_VISUAL_SLOTS,
  });
}
```

- [ ] **Step 4: Add the server-backed repository reads**

Extend `src/lib/template-system/images/repository.ts` with Supabase-backed helpers using the existing admin client:

```ts
import { getSupabaseAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase";

export async function getLatestApprovedTemplateImageBatch(templateKey: string) {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  const closehound = getSupabaseAdminClient().schema("closehound");
  const { data, error } = await closehound
    .from("template_image_candidates")
    .select("generation_batch_id, created_at")
    .eq("template_key", templateKey)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.generation_batch_id as string;
}

export async function getApprovedTemplateImageCandidates(selection: {
  templateKey: string;
  generationBatchId: string;
}) {
  if (!hasSupabaseAdminEnv()) {
    return {};
  }

  const closehound = getSupabaseAdminClient().schema("closehound");
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

  return pickApprovedCandidateBySlot(data as ArchetypeImageCandidateRecord[], {
    templateKey: selection.templateKey,
    generationBatchId: selection.generationBatchId,
    slotDefinitions: ROOFING_VISUAL_SLOTS,
  });
}
```

- [ ] **Step 5: Run the focused tests and typecheck**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/resolver.test.ts
npm run typecheck
```

Expected: PASS for both commands.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/lib/template-system/images/repository.ts src/lib/template-system/resolver.test.ts
git commit -m "Add approved roofing image retrieval helpers"
```

### Task 2: Wire the Roofing Archetype Route to Latest or Pinned Approved Batches

**Files:**
- Modify: `src/app/preview/templates/roofing-archetype/page.tsx`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write failing route-level tests for latest and pinned batch behavior**

Add tests in `src/lib/template-system/resolver.test.ts` that define the retrieval decision logic as a pure helper:

```ts
test("roofing archetype image selection uses pinned batch when provided", async () => {
  const batch = await resolveRoofingArchetypeBatchSelection({
    requestedBatch: "batch-2",
    getLatestApprovedBatch: async () => "batch-3",
  });

  assert.equal(batch, "batch-2");
});

test("roofing archetype image selection uses latest approved batch by default", async () => {
  const batch = await resolveRoofingArchetypeBatchSelection({
    requestedBatch: null,
    getLatestApprovedBatch: async () => "batch-3",
  });

  assert.equal(batch, "batch-3");
});

test("roofing archetype image selection leaves batch null when none are approved", async () => {
  const batch = await resolveRoofingArchetypeBatchSelection({
    requestedBatch: null,
    getLatestApprovedBatch: async () => null,
  });

  assert.equal(batch, null);
});
```

- [ ] **Step 2: Run the focused test slice to verify failure**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/resolver.test.ts
```

Expected: FAIL because `resolveRoofingArchetypeBatchSelection` does not exist yet.

- [ ] **Step 3: Add a thin batch-selection helper and wire the route**

Modify `src/app/preview/templates/roofing-archetype/page.tsx`:

```ts
import { notFound } from "next/navigation";
import { BlueCollarPreviewTemplate } from "@/components/site-templates/blue-collar-preview";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import {
  getApprovedTemplateImageCandidates,
  getLatestApprovedTemplateImageBatch,
} from "@/lib/template-system/images/repository";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";

export async function resolveRoofingArchetypeBatchSelection(input: {
  requestedBatch: string | null;
  getLatestApprovedBatch: () => Promise<string | null>;
}) {
  if (input.requestedBatch) {
    return input.requestedBatch;
  }

  return input.getLatestApprovedBatch();
}

export default async function RoofingArchetypePreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ batch?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const generationBatchId = await resolveRoofingArchetypeBatchSelection({
    requestedBatch: params.batch?.trim() || null,
    getLatestApprovedBatch: () =>
      getLatestApprovedTemplateImageBatch(ROOFING_NICHE_TEMPLATE.key),
  });

  const approvedImageCandidates = generationBatchId
    ? await getApprovedTemplateImageCandidates({
        templateKey: ROOFING_NICHE_TEMPLATE.key,
        generationBatchId,
      })
    : {};

  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates,
  });

  if (!render.status.isPreviewSafe) {
    notFound();
  }

  return (
    <BlueCollarPreviewTemplate model={buildBlueCollarPreviewModel(render)} />
  );
}
```

- [ ] **Step 4: Add a regression test for invalid pinned batches preserving omission behavior**

Add:

```ts
test("pinned roofing batch with no approved assets does not fall back to another batch", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates: {},
  });

  assert.equal(render.resolvedVisuals.slots[0]?.status, "omitted");
  assert.equal(render.resolvedVisuals.slots[0]?.reasonCode, "MISSING_APPROVED_ASSET");
});
```

- [ ] **Step 5: Run route-focused verification**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/resolver.test.ts
npm run test:unit
npm run typecheck
```

Expected: PASS for all commands.

- [ ] **Step 6: Commit Task 2**

```bash
git add src/app/preview/templates/roofing-archetype/page.tsx src/lib/template-system/resolver.test.ts
git commit -m "Wire approved roofing image retrieval into archetype preview"
```

### Task 3: Final Verification and Browser Check

**Files:**
- Modify: none expected
- Verify: `src/app/preview/templates/roofing-archetype/page.tsx`

- [ ] **Step 1: Run the full verification suite**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/resolver.test.ts
npm run test:unit
npm run typecheck
npm run build
node scripts/generate-roofing-images.mjs
```

Expected:
- `resolver.test.ts` passes
- `npm run test:unit` passes
- `npm run typecheck` passes
- `npm run build` passes
- generator command prints a JSON batch with storage paths

- [ ] **Step 2: Run a local browser check on the roofing archetype route**

Run the dev server if needed, then verify:

```bash
npm run dev
curl -s http://127.0.0.1:3000/preview/templates/roofing-archetype
curl -s "http://127.0.0.1:3000/preview/templates/roofing-archetype?batch=test-batch"
```

Expected:
- both routes return HTML
- no 404 on missing or invalid batch pin
- route remains renderable even when there are no approved assets

- [ ] **Step 3: Commit Task 3**

```bash
git add src/app/preview/templates/roofing-archetype/page.tsx src/lib/template-system/images/repository.ts src/lib/template-system/resolver.test.ts
git commit -m "Verify roofing approved image retrieval flow"
```

## Self-Review

- Spec coverage:
  - latest-approved default: covered in Task 2
  - optional pinned batch: covered in Task 2
  - repository-backed reads: covered in Task 1
  - safe omission on failure/no approved assets: covered in Task 2 and Task 3
- Placeholder scan: no `TBD`, `TODO`, or omitted implementation seams remain
- Type consistency:
  - uses `approvedImageCandidates`, `generationBatchId`, and `ROOFING_NICHE_TEMPLATE.key` consistently

