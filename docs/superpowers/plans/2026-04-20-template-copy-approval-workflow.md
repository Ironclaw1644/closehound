# Template Copy Approval Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a rendered, page-ordered copy approval workflow for archetype templates so every visible string can be reviewed, revised for tone or fit, and approved before a base template is considered complete.

**Architecture:** Reuse the existing template-system and internal-review approach. Derive visible copy slots from the rendered archetype preview model, expose an internal review surface, persist review decisions separately from the niche source, and support applying approved edits back into the source after review is complete. Keep v1 narrow: base templates only, no WYSIWYG editor, no lead-specific review.

**Tech Stack:** Next.js App Router, TypeScript, Node test runner, existing template-system renderers, existing internal review route patterns

---

## File Structure

- Create: `src/lib/template-system/copy-review/types.ts`
  - Shared slot, decision, and summary types.
- Create: `src/lib/template-system/copy-review/inventory.ts`
  - Build visible copy inventories from rendered archetype preview models in page order.
- Create: `src/lib/template-system/copy-review/repository.ts`
  - File-backed or in-memory V1 persistence helpers for slot decisions and summary state.
- Create: `src/lib/template-system/copy-review/review.test.ts`
  - Focused tests for slot extraction, ordering, and review-state behavior.
- Create: `src/components/template-copy/template-copy-index.tsx`
  - Internal index UI listing templates and review completeness.
- Create: `src/components/template-copy/template-copy-detail.tsx`
  - Internal detail UI showing slot-by-slot review in page order.
- Create: `src/components/template-copy/template-copy-slot-card.tsx`
  - Slot display and approve/revise controls.
- Create: `src/app/internal/template-copy/page.tsx`
  - Index route.
- Create: `src/app/internal/template-copy/[templateKey]/page.tsx`
  - Detail route.
- Create: `src/app/internal/template-copy/actions.ts`
  - Server actions for approve / revise decisions.
- Modify: `src/lib/template-system/resolver.test.ts`
  - Add a small top-level regression around blue-collar/med-spa inventory cleanliness only if needed.
- Modify: `src/lib/template-system/*preview*.ts`
  - Only if needed to expose missing rendered text surfaces to the inventory builder.

---

## Task 1: Add failing tests for visible copy inventory extraction

**Files:**
- Create: `src/lib/template-system/copy-review/review.test.ts`

- [ ] **Step 1: Write failing tests for page-order slot extraction**

Add tests that:

1. build a roofing render and extract visible copy slots
2. build a med spa render and extract visible copy slots
3. assert slots are returned in page order
4. assert slot roles include:
   - hero heading
   - hero body
   - primary CTA label
   - section heading
   - card title
   - FAQ answer
5. assert internal/meta text is inventory-visible if it renders

Example test shape:

```ts
test("copy inventory extracts visible roofing slots in page order", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const inventory = buildTemplateCopyInventory({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    familyKey: BLUE_COLLAR_SERVICE_FAMILY.key,
    renderPackage: render,
    renderer: "blue-collar",
  });

  assert.equal(inventory[0]?.slotRole, "hero-heading");
  assert.equal(inventory.some((slot) => slot.slotRole === "faq-answer"), true);
  assert.equal(inventory.some((slot) => slot.currentText.includes("Roofing work")), true);
});
```

- [ ] **Step 2: Run the test file and confirm it fails for missing inventory modules**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/copy-review/review.test.ts
```

Expected: FAIL because the copy-review modules do not exist yet.

---

## Task 2: Build inventory types and page-order extraction

**Files:**
- Create: `src/lib/template-system/copy-review/types.ts`
- Create: `src/lib/template-system/copy-review/inventory.ts`
- Modify: `src/lib/template-system/copy-review/review.test.ts`

- [ ] **Step 1: Add the copy-review types**

Define:

- `TemplateCopyReviewStatus`
- `TemplateCopyReviewDecision`
- `TemplateCopySlot`
- `TemplateCopyInventory`
- `TemplateCopyReviewSummary`

Minimal shape:

```ts
export type TemplateCopyReviewStatus = "unreviewed" | "approved" | "needs-revision";

export type TemplateCopyReviewDecision =
  | "approved"
  | "revise_tone"
  | "revise_fit"
  | "replace";

export type TemplateCopySlot = {
  templateKey: string;
  familyKey: string;
  sectionKey: string;
  slotKey: string;
  slotRole: string;
  pageOrder: number;
  currentText: string;
  proposedText?: string;
  status: TemplateCopyReviewStatus;
  decision?: TemplateCopyReviewDecision;
  reviewNotes?: string;
};
```

- [ ] **Step 2: Implement visible slot extraction for the current renderers**

`inventory.ts` should support:

- blue-collar render package -> slot list
- health-wellness render package -> slot list

Rules:

- only visible sections produce slots
- page order must match rendered page order
- CTA labels are separate slots
- item titles and item bodies are separate slots
- FAQ questions and answers are separate slots
- slot keys must be stable enough for review persistence

- [ ] **Step 3: Make the tests pass**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/copy-review/review.test.ts
npm run typecheck
```

Commit checkpoint:

```bash
git add src/lib/template-system/copy-review/types.ts src/lib/template-system/copy-review/inventory.ts src/lib/template-system/copy-review/review.test.ts
git commit -m "Add template copy inventory extraction"
```

---

## Task 3: Add review-state repository helpers

**Files:**
- Create: `src/lib/template-system/copy-review/repository.ts`
- Modify: `src/lib/template-system/copy-review/review.test.ts`

- [ ] **Step 1: Write failing tests for review-state behavior**

Add tests for:

- unreviewed default state
- approve mutation for one slot
- revise mutation for one slot
- summary counts:
  - approved count
  - needs revision count
  - unreviewed count
  - copyApproved boolean

- [ ] **Step 2: Implement minimal V1 persistence helpers**

The repository should provide:

- `listTemplateCopyReviewState(templateKey)`
- `saveApprovedTemplateCopySlot(...)`
- `saveRevisionTemplateCopySlot(...)`
- `buildTemplateCopyReviewSummary(...)`

V1 can be file-backed under the workspace or use a small local JSON store; keep it narrow and explicit.

- [ ] **Step 3: Make the tests pass**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/copy-review/review.test.ts
npm run typecheck
```

Commit checkpoint:

```bash
git add src/lib/template-system/copy-review/repository.ts src/lib/template-system/copy-review/review.test.ts
git commit -m "Add template copy review state helpers"
```

---

## Task 4: Build internal review routes and server-rendered UI

**Files:**
- Create: `src/components/template-copy/template-copy-index.tsx`
- Create: `src/components/template-copy/template-copy-detail.tsx`
- Create: `src/components/template-copy/template-copy-slot-card.tsx`
- Create: `src/app/internal/template-copy/page.tsx`
- Create: `src/app/internal/template-copy/[templateKey]/page.tsx`

- [ ] **Step 1: Build the index page**

Show at least:

- template key
- family key
- approved / unreviewed / needs-revision counts
- `copyApproved` yes/no
- link to detail page
- link to archetype preview route

Templates to include in v1:

- `roofing-v1`
- `hvac-v1`
- `plumbing-v1`
- `med-spa-v1`

- [ ] **Step 2: Build the detail page**

Show:

- preview link
- template summary
- slot list in page order
- section grouping
- current text
- slot role label
- current review status

- [ ] **Step 3: Build the slot card**

Each slot card should support:

- current text display
- optional proposed text field
- optional reviewer notes field
- approve button
- revise tone button
- revise fit button
- replace button

Do not build a full editor; just support review decisions and proposed replacement text.

- [ ] **Step 4: Run a local render check**

Run:

```bash
npm run typecheck
npm run build
```

Commit checkpoint:

```bash
git add src/components/template-copy src/app/internal/template-copy
git commit -m "Add template copy review routes"
```

---

## Task 5: Add server actions and complete the approval loop

**Files:**
- Create: `src/app/internal/template-copy/actions.ts`
- Modify: `src/app/internal/template-copy/[templateKey]/page.tsx`

- [ ] **Step 1: Add server actions**

Add:

- `approveTemplateCopySlotAction`
- `reviseTemplateCopySlotAction`

Actions should:

- save the slot decision
- revalidate:
  - `/internal/template-copy`
  - `/internal/template-copy/[templateKey]`

- [ ] **Step 2: Wire actions into the detail UI**

The detail page should become interactive enough to:

- approve a slot
- mark a slot for revision
- store proposed replacement text and notes

- [ ] **Step 3: Run local verification**

Start the dev server and verify:

- `/internal/template-copy`
- `/internal/template-copy/roofing-v1`
- `/internal/template-copy/hvac-v1`
- `/internal/template-copy/plumbing-v1`
- `/internal/template-copy/med-spa-v1`

Also verify that:

- slots appear in page order
- section grouping is readable
- review status changes persist

Run:

```bash
npm run typecheck
npm run build
```

Commit checkpoint:

```bash
git add src/app/internal/template-copy/actions.ts src/app/internal/template-copy/[templateKey]/page.tsx
git commit -m "Finish template copy approval workflow"
```

---

## Task 6: Use the new workflow to audit existing templates

**Files:**
- Modify archetype niche files as needed

- [ ] **Step 1: Run the workflow against all current templates**

Audit:

- `roofing-v1`
- `hvac-v1`
- `plumbing-v1`
- `med-spa-v1`

- [ ] **Step 2: Apply approved revisions**

Use the workflow to identify:

- tone issues
- fit/length issues
- any remaining AI/internal/meta copy

Apply the resulting approved edits to the niche source files.

- [ ] **Step 3: Final verification**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/copy-review/review.test.ts
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/resolver.test.ts
npm run typecheck
npm run build
```

---

## Notes

- This workflow is mandatory for new base templates after this lands.
- Copy must be reviewed in rendered context, not source-file order.
- Approval should distinguish tone revisions from fit/length revisions.
- Lead previews remain out of scope for now; this is strictly for archetype template copy.
