# Nano Banana 2 Roofing Images Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first app-integrated, approval-gated Nano Banana 2 image pipeline for the roofing archetype, with Supabase Storage-backed files, persisted candidate metadata, and preview rendering that consumes only approved assets.

**Architecture:** Keep v1 narrow and archetype-first. Add a roofing-only image registry and slot definition layer, generate candidates through one internal command, store files in Supabase Storage, persist metadata in app storage, and resolve approved visual assets back into the existing template-system preview path. Avoid UI and lead-specific generation in this slice.

**Tech Stack:** Next.js App Router, TypeScript, Supabase Storage, Supabase Postgres, Gemini API (Nano Banana 2), Node test runner, existing template-system resolver

---

## File Structure

- Create: `supabase/migrations/20260419_create_template_image_candidates.sql`
  - Candidate metadata table for archetype image records
- Create: `src/lib/template-system/visual-slots/roofing.ts`
  - Roofing slot definitions, required/optional flags, candidate counts, prompt intents
- Create: `src/lib/template-system/images/types.ts`
  - Image-candidate and slot-rule runtime types
- Create: `src/lib/template-system/images/prompts.ts`
  - Nano Banana 2 prompt builder for roofing slots
- Create: `src/lib/template-system/images/repository.ts`
  - Minimal persistence helpers for candidate records and approval lookup
- Create: `src/lib/template-system/images/storage.ts`
  - Supabase Storage upload/path helpers
- Create: `src/lib/template-system/images/generate-roofing.ts`
  - Internal generation workflow for one roofing batch
- Create: `scripts/generate-roofing-images.mjs`
  - Developer/internal CLI entrypoint for roofing image generation
- Modify: `src/lib/template-system/types.ts`
  - Extend visual types only where needed for persisted archetype assets
- Modify: `src/lib/template-system/resolver.ts`
  - Populate `resolvedVisuals.slots` from approved roofing candidates with safe omission fallback
- Modify: `src/lib/template-system/resolver.test.ts`
  - Add slot, metadata, approval, omission, and preview integration tests
- Modify: `src/app/preview/templates/roofing-archetype/page.tsx`
  - Continue using the approved asset-aware render path

## Task 1: Add failing schema and slot-definition tests

**Files:**
- Create: `src/lib/template-system/visual-slots/roofing.ts`
- Create: `src/lib/template-system/images/types.ts`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing slot-definition and candidate-policy tests**

Add imports to `src/lib/template-system/resolver.test.ts`:

```ts
import {
  ROOFING_VISUAL_SLOTS,
  getRoofingCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/roofing";
```

Add tests:

```ts
test("roofing visual slots define required and optional coverage", () => {
  assert.deepEqual(
    ROOFING_VISUAL_SLOTS.map((slot) => ({
      key: slot.key,
      required: slot.required,
    })),
    [
      { key: "hero", required: true },
      { key: "service-action", required: true },
      { key: "detail-closeup", required: true },
      { key: "team-or-workmanship", required: false },
      { key: "workspace-or-site", required: false },
      { key: "gallery-extra", required: false },
    ]
  );
});

test("roofing visual slots use the v1 candidate policy", () => {
  assert.equal(getRoofingCandidateCountForSlot("hero"), 3);
  assert.equal(getRoofingCandidateCountForSlot("service-action"), 2);
  assert.equal(getRoofingCandidateCountForSlot("detail-closeup"), 2);
});
```

- [ ] **Step 2: Run the unit tests to verify they fail for missing slot modules**

Run:

```bash
npm run test:unit
```

Expected: FAIL with module resolution errors for `@/lib/template-system/visual-slots/roofing`.

- [ ] **Step 3: Add the minimal roofing slot definition module**

Create `src/lib/template-system/images/types.ts`:

```ts
export type ArchetypeImageCandidateStatus =
  | "generated"
  | "approved"
  | "rejected"
  | "unused";

export type ArchetypeVisualSlot = {
  key:
    | "hero"
    | "service-action"
    | "detail-closeup"
    | "team-or-workmanship"
    | "workspace-or-site"
    | "gallery-extra";
  required: boolean;
  aspectRatio: string;
  cropNotes: string;
  promptIntent: string;
  negativePrompt: string;
};
```

Create `src/lib/template-system/visual-slots/roofing.ts`:

```ts
import type { ArchetypeVisualSlot } from "@/lib/template-system/images/types";

export const ROOFING_VISUAL_SLOTS: ArchetypeVisualSlot[] = [
  {
    key: "hero",
    required: true,
    aspectRatio: "16:9",
    cropNotes: "safe center crop for desktop and mobile hero layouts",
    promptIntent: "roofing crew on active residential roof in realistic commercial-documentary style",
    negativePrompt: "embedded text, fake logo, surreal lighting, plastic skin, impossible roof geometry",
  },
  {
    key: "service-action",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "mid-range action frame safe for service cards",
    promptIntent: "roofer performing hands-on repair or installation work on a residential roof",
    negativePrompt: "embedded text, fake logo, surreal lighting, cinematic action pose",
  },
  {
    key: "detail-closeup",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "tight detail crop showing workmanship and material texture",
    promptIntent: "close-up roofing detail showing shingles, flashing, tools, and workmanship",
    negativePrompt: "embedded text, fake logo, surreal texture, impossible materials",
  },
  {
    key: "team-or-workmanship",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "group or workmanship crop that still works in masonry layouts",
    promptIntent: "small roofing crew or workmanship-focused scene in a residential setting",
    negativePrompt: "embedded text, fake logo, exaggerated smiles, staged corporate pose",
  },
  {
    key: "workspace-or-site",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "site/environment crop for supporting gallery content",
    promptIntent: "residential roofing jobsite context with ladders, roofline, and grounded working environment",
    negativePrompt: "embedded text, fake logo, impossible house proportions, surreal drama",
  },
  {
    key: "gallery-extra",
    required: false,
    aspectRatio: "1:1",
    cropNotes: "square crop for optional supporting gallery tile",
    promptIntent: "extra roofing visual showing clean completed section or supportive site detail",
    negativePrompt: "embedded text, fake logo, surreal lighting, unusable crop",
  },
];

export function getRoofingCandidateCountForSlot(
  slotKey: ArchetypeVisualSlot["key"]
) {
  return slotKey === "hero" ? 3 : 2;
}
```

- [ ] **Step 4: Run the unit tests to verify slot-definition tests pass**

Run:

```bash
npm run test:unit
```

Expected: the new roofing slot-definition tests PASS, while later image-pipeline tests still fail because the repository/generation path is not implemented yet.

- [ ] **Step 5: Commit the slot-definition layer**

```bash
git add src/lib/template-system/images/types.ts src/lib/template-system/visual-slots/roofing.ts src/lib/template-system/resolver.test.ts
git commit -m "Add roofing visual slot definitions"
```

## Task 2: Add failing metadata and approval repository tests

**Files:**
- Create: `supabase/migrations/20260419_create_template_image_candidates.sql`
- Create: `src/lib/template-system/images/repository.ts`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write failing metadata-shape and approval-selection tests**

Add imports:

```ts
import {
  pickApprovedCandidateBySlot,
  type ArchetypeImageCandidateRecord,
} from "@/lib/template-system/images/repository";
```

Add tests:

```ts
test("approved candidate selection returns exactly one renderable asset per slot", () => {
  const records: ArchetypeImageCandidateRecord[] = [
    {
      id: "hero-generated",
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
      status: "generated",
      storagePath: "template-images/roofing-v1/hero/generated.png",
      aspectRatio: "16:9",
      createdAt: "2026-04-19T00:00:00.000Z",
      createdBy: "test",
    },
    {
      id: "hero-approved",
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
      status: "approved",
      storagePath: "template-images/roofing-v1/hero/approved.png",
      aspectRatio: "16:9",
      createdAt: "2026-04-19T00:00:00.000Z",
      createdBy: "test",
    },
  ];

  const selected = pickApprovedCandidateBySlot(records);

  assert.equal(selected.hero?.id, "hero-approved");
});

test("approved candidate selection omits slots with no approved asset", () => {
  const records: ArchetypeImageCandidateRecord[] = [];
  const selected = pickApprovedCandidateBySlot(records);
  assert.equal(selected["service-action"], undefined);
});
```

- [ ] **Step 2: Run the tests to verify they fail for missing repository code**

Run:

```bash
npm run test:unit
```

Expected: FAIL with module resolution errors for `@/lib/template-system/images/repository`.

- [ ] **Step 3: Add the migration for candidate metadata**

Create `supabase/migrations/20260419_create_template_image_candidates.sql`:

```sql
create table if not exists public.template_image_candidates (
  id text primary key,
  generation_batch_id text not null,
  family_key text not null,
  template_key text not null,
  template_version text not null,
  seed_business_key text,
  lead_id uuid,
  slot text not null,
  candidate_index integer not null,
  prompt text not null,
  negative_prompt text not null,
  prompt_version text not null,
  provider text not null,
  model text not null,
  status text not null check (status in ('generated', 'approved', 'rejected', 'unused')),
  storage_path text not null,
  asset_url text,
  aspect_ratio text not null,
  crop_notes text,
  created_at timestamptz not null default now(),
  created_by text not null,
  approval_updated_at timestamptz,
  approval_updated_by text
);

create index if not exists template_image_candidates_template_slot_idx
  on public.template_image_candidates (template_key, slot, status);

create index if not exists template_image_candidates_batch_idx
  on public.template_image_candidates (generation_batch_id);
```

- [ ] **Step 4: Add the minimal repository helper**

Create `src/lib/template-system/images/repository.ts`:

```ts
import type { ArchetypeImageCandidateStatus } from "@/lib/template-system/images/types";

export type ArchetypeImageCandidateRecord = {
  id: string;
  generationBatchId: string;
  familyKey: string;
  templateKey: string;
  templateVersion: string;
  seedBusinessKey?: string;
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
  assetUrl?: string;
  aspectRatio: string;
  cropNotes?: string;
  createdAt: string;
  createdBy: string;
  approvalUpdatedAt?: string;
  approvalUpdatedBy?: string;
};

export function pickApprovedCandidateBySlot(
  records: ArchetypeImageCandidateRecord[]
) {
  return Object.fromEntries(
    records
      .filter((record) => record.status === "approved")
      .map((record) => [record.slot, record])
  ) as Record<string, ArchetypeImageCandidateRecord | undefined>;
}
```

- [ ] **Step 5: Run the tests to verify repository tests pass**

Run:

```bash
npm run test:unit
```

Expected: the approval-selection tests PASS, while generation/storage integration tests still fail.

- [ ] **Step 6: Commit the metadata registry layer**

```bash
git add supabase/migrations/20260419_create_template_image_candidates.sql src/lib/template-system/images/repository.ts src/lib/template-system/resolver.test.ts
git commit -m "Add template image candidate metadata registry"
```

## Task 3: Add failing prompt-builder and generation-batch tests

**Files:**
- Create: `src/lib/template-system/images/prompts.ts`
- Create: `src/lib/template-system/images/generate-roofing.ts`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write failing prompt-builder and batch-shape tests**

Add imports:

```ts
import {
  buildRoofingSlotPrompt,
  buildRoofingPromptBatch,
} from "@/lib/template-system/images/prompts";
import { createRoofingGenerationBatch } from "@/lib/template-system/images/generate-roofing";
```

Add tests:

```ts
test("roofing prompt batch uses 3 hero candidates and 2 for non-hero slots", () => {
  const batch = buildRoofingPromptBatch({
    familyKey: "blue-collar-service",
    templateKey: "roofing-v1",
    templateVersion: "1.0.0",
  });

  assert.equal(batch.filter((item) => item.slot === "hero").length, 3);
  assert.equal(
    batch.filter((item) => item.slot === "service-action").length,
    2
  );
});

test("roofing prompt builder includes slot intent and negative prompt", () => {
  const prompt = buildRoofingSlotPrompt({
    slot: "detail-closeup",
    familyKey: "blue-collar-service",
    templateKey: "roofing-v1",
    templateVersion: "1.0.0",
  });

  assert.ok(prompt.prompt.includes("close-up roofing detail"));
  assert.ok(prompt.negativePrompt.includes("embedded text"));
  assert.equal(prompt.promptVersion, "1.0.0");
});

test("generation batch creation assigns one batch id per run", () => {
  const run = createRoofingGenerationBatch({
    familyKey: "blue-collar-service",
    templateKey: "roofing-v1",
    templateVersion: "1.0.0",
    createdBy: "test",
  });

  assert.equal(typeof run.generationBatchId, "string");
  assert.equal(
    new Set(run.items.map((item) => item.generationBatchId)).size,
    1
  );
});
```

- [ ] **Step 2: Run the tests to verify they fail for missing prompt/generation modules**

Run:

```bash
npm run test:unit
```

Expected: FAIL with missing module errors for prompt-builder and generation-batch modules.

- [ ] **Step 3: Add the prompt-builder module**

Create `src/lib/template-system/images/prompts.ts`:

```ts
import { ROOFING_VISUAL_SLOTS, getRoofingCandidateCountForSlot } from "@/lib/template-system/visual-slots/roofing";

type RoofingPromptInput = {
  slot: (typeof ROOFING_VISUAL_SLOTS)[number]["key"];
  familyKey: string;
  templateKey: string;
  templateVersion: string;
};

export function buildRoofingSlotPrompt(input: RoofingPromptInput) {
  const slot = ROOFING_VISUAL_SLOTS.find((entry) => entry.key === input.slot);

  if (!slot) {
    throw new Error(`Unknown roofing slot: ${input.slot}`);
  }

  return {
    slot: slot.key,
    aspectRatio: slot.aspectRatio,
    cropNotes: slot.cropNotes,
    promptVersion: "1.0.0",
    prompt: `${slot.promptIntent}. Realistic local-business photography. ${slot.cropNotes}.`,
    negativePrompt: slot.negativePrompt,
    familyKey: input.familyKey,
    templateKey: input.templateKey,
    templateVersion: input.templateVersion,
  };
}

export function buildRoofingPromptBatch(input: {
  familyKey: string;
  templateKey: string;
  templateVersion: string;
}) {
  return ROOFING_VISUAL_SLOTS.flatMap((slot) =>
    Array.from({ length: getRoofingCandidateCountForSlot(slot.key) }, (_, index) => ({
      ...buildRoofingSlotPrompt({
        slot: slot.key,
        familyKey: input.familyKey,
        templateKey: input.templateKey,
        templateVersion: input.templateVersion,
      }),
      candidateIndex: index,
    }))
  );
}
```

- [ ] **Step 4: Add the batch-construction helper**

Create `src/lib/template-system/images/generate-roofing.ts`:

```ts
import crypto from "node:crypto";
import { buildRoofingPromptBatch } from "@/lib/template-system/images/prompts";

export function createRoofingGenerationBatch(input: {
  familyKey: string;
  templateKey: string;
  templateVersion: string;
  createdBy: string;
}) {
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
```

- [ ] **Step 5: Run the tests to verify prompt and batch tests pass**

Run:

```bash
npm run test:unit
```

Expected: prompt-builder and batch-shape tests PASS, while generation/upload integration is still not implemented.

- [ ] **Step 6: Commit the prompt/batch layer**

```bash
git add src/lib/template-system/images/prompts.ts src/lib/template-system/images/generate-roofing.ts src/lib/template-system/resolver.test.ts
git commit -m "Add roofing image prompt batch generation"
```

## Task 4: Add the internal command, Supabase upload path, and preview integration

**Files:**
- Create: `src/lib/template-system/images/storage.ts`
- Create: `scripts/generate-roofing-images.mjs`
- Modify: `src/lib/template-system/resolver.ts`
- Modify: `src/app/preview/templates/roofing-archetype/page.tsx`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write failing preview-integration and omission tests**

Add tests:

```ts
test("resolver uses approved roofing visual assets when present", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates: {
      hero: {
        id: "hero-approved",
        slot: "hero",
        storagePath: "template-images/roofing-v1/hero/approved.png",
        status: "approved",
      } as never,
    },
  });

  assert.equal(render.resolvedVisuals.slots[0]?.status, "rendered");
  assert.equal(
    render.resolvedVisuals.slots[0]?.assetPath,
    "template-images/roofing-v1/hero/approved.png"
  );
});

test("resolver omits optional roofing slots without approved assets", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.equal(
    render.resolvedVisuals.slots.some(
      (slot) => slot.slot === "hero" && slot.status === "omitted"
    ),
    true
  );
});
```

- [ ] **Step 2: Run the tests to verify preview integration fails before resolver changes**

Run:

```bash
npm run test:unit
```

Expected: FAIL because `resolveTemplateRender` does not yet accept approved image candidates.

- [ ] **Step 3: Add the minimal storage helper and internal command scaffold**

Create `src/lib/template-system/images/storage.ts`:

```ts
export function buildTemplateImageStoragePath(input: {
  templateKey: string;
  slot: string;
  generationBatchId: string;
  candidateIndex: number;
}) {
  return `template-images/${input.templateKey}/${input.generationBatchId}/${input.slot}-${input.candidateIndex}.png`;
}
```

Create `scripts/generate-roofing-images.mjs`:

```js
import { createRoofingGenerationBatch } from "../src/lib/template-system/images/generate-roofing.ts";

const batch = createRoofingGenerationBatch({
  familyKey: "blue-collar-service",
  templateKey: "roofing-v1",
  templateVersion: "1.0.0",
  createdBy: "internal-command",
});

console.log(JSON.stringify(batch, null, 2));
```

- [ ] **Step 4: Extend the resolver for approved archetype assets only**

Modify `src/lib/template-system/resolver.ts` so `resolveTemplateRender` accepts:

```ts
approvedImageCandidates?: Record<
  string,
  {
    id: string;
    slot: string;
    status: "approved";
    storagePath: string;
    cropNotes?: string;
  }
>;
```

Use that data only to populate `resolvedVisuals.slots`:

```ts
const heroApproved = input.approvedImageCandidates?.hero;

const visualSlots: ResolvedVisualSlot[] = [
  heroApproved
    ? {
        key: "hero-visual",
        slot: "hero",
        status: "rendered",
        source: "approved-generated",
        assetPath: heroApproved.storagePath,
        cropNotes: heroApproved.cropNotes,
      }
    : {
        key: "hero-visual",
        slot: "hero",
        status: "omitted",
        reasonCode: REASON_CODES.MISSING_APPROVED_ASSET,
      },
];
```

Do not render non-approved assets. Do not widen preview behavior beyond approval-gated slot resolution.

- [ ] **Step 5: Keep the roofing archetype route on the approved-asset-aware render path**

If needed, update `src/app/preview/templates/roofing-archetype/page.tsx` only to ensure it still resolves cleanly when no approved images exist.

- [ ] **Step 6: Run the full verification suite**

Run:

```bash
npm run test:unit
npm run typecheck
npm run build
```

Expected:

- unit tests PASS
- typecheck PASS
- build PASS

- [ ] **Step 7: Browser-verify the roofing archetype route**

Run:

```bash
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --headless=new --no-sandbox --disable-gpu --hide-scrollbars --window-size=1440,1200 --screenshot='/tmp/closehound-roofing-archetype-images.png' 'http://127.0.0.1:3000/preview/templates/roofing-archetype'
```

Expected:

- route loads successfully
- page remains stable when no approved asset exists
- hero still renders without leaking unapproved images

- [ ] **Step 8: Commit the v1 image slice**

```bash
git add supabase/migrations/20260419_create_template_image_candidates.sql src/lib/template-system/images/storage.ts src/lib/template-system/images/prompts.ts src/lib/template-system/images/generate-roofing.ts src/lib/template-system/images/repository.ts src/lib/template-system/visual-slots/roofing.ts src/lib/template-system/images/types.ts src/lib/template-system/resolver.ts src/lib/template-system/resolver.test.ts src/app/preview/templates/roofing-archetype/page.tsx scripts/generate-roofing-images.mjs
git commit -m "Add Nano Banana roofing image pipeline foundation"
```

## Spec Coverage Check

- archetype-first roofing-only scope: covered in Tasks 1-4
- candidate grouping and policy: covered in Tasks 1 and 3
- Supabase metadata/storage path foundation: covered in Tasks 2 and 4
- approval-gated rendering: covered in Task 4
- prompt/model/version traceability: covered in Tasks 2 and 3
- omission fallback for missing approvals: covered in Task 4

## Self-Review

- The plan stays within one slice: roofing-only, archetype-first, no UI.
- Tasks progress TDD-first from slot definitions to metadata registry to generation batch shape to preview integration.
- The plan avoids overbuilding the media system while still locking the durable metadata contract and approval gate.
