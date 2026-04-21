# Template Copy Approval Workflow Design

## Goal

Add a first-class copy approval workflow for base templates so every visible text string is reviewed in rendered page order before a template is considered complete.

This workflow is specifically for archetype templates, not live lead previews. Its job is to stop:

- internal AI/meta language
- generic filler copy
- phrases that are too long or too short for their position on the page
- visually awkward headlines, CTA labels, or card copy
- tone drift between sections

The workflow must work for existing templates (`roofing`, `hvac`, `plumbing`, `med-spa`) and for every new template family going forward.

## Why This Needs Its Own Workflow

Reviewing JSON or raw authored copy is not enough. Copy must be judged in context:

- where it appears on the page
- how much space it has
- how it breaks across lines
- how it sounds relative to the sections before and after it
- whether it feels like a real business website instead of generated scaffolding

The approval contract should therefore be:

1. generate the first draft template
2. render it in page form
3. inventory every visible text slot in top-to-bottom order
4. review every slot in rendered context
5. revise or approve each slot
6. persist the approved copy back into the archetype source

## Scope

### In Scope

- base/archetype templates only
- page-order copy inventory
- slot-level approval or revision
- visible text surfaces only
- approval history for current template copy
- support for existing template families
- support for future family renderers

### Out of Scope for V1

- lead-specific copy approval
- WYSIWYG editing
- collaborative multi-user review
- branching/version trees for copy candidates
- automatic AI rewrite without user review

## Core Principles

1. Every visible string must be reviewable.
2. Review must happen in page order.
3. Each string must carry section context and slot context.
4. Copy quality is judged both on tone and fit.
5. Base templates are not complete until all visible strings are approved.
6. Approved copy should become the archetype source of truth.

## Review Model

Each visible text block should be represented as a review slot.

Example slot categories:

- hero eyebrow
- hero heading
- hero body
- primary CTA label
- secondary CTA label
- section heading
- section intro/body
- card title
- card body
- FAQ question
- FAQ answer
- contact heading
- contact body

Each slot needs:

- `templateKey`
- `familyKey`
- `sectionKey`
- `slotKey`
- `slotRole`
- `pageOrder`
- `currentText`
- `renderContext`
- `status`
- `reviewDecision`
- `reviewNotes`

## Required Review Decisions

Each slot must support one of these outcomes:

- `approved`
- `revise_tone`
- `revise_fit`
- `replace`

### Meaning

- `approved`
  - text is acceptable as-is
- `revise_tone`
  - wording fits the slot length but not the niche/site voice
- `revise_fit`
  - wording is acceptable conceptually but too long, too short, or awkward for the layout
- `replace`
  - text is wrong for both tone and purpose and should be rewritten entirely

## Render Context Requirements

Every slot must be reviewed against enough context to make a real decision.

Minimum context:

- section title
- slot role
- current rendered text
- neighboring section titles
- rendered preview link for the archetype

Helpful additional context:

- whether the slot is tight, medium, or roomy
- whether the slot is a high-prominence surface
- whether the slot commonly wraps to multiple lines

## Position/Fit Guidance

The workflow must explicitly support copy-length judgments.

Examples:

- hero headings should usually be short and decisive
- card titles should be compact and scannable
- FAQ answers can be slightly longer, but should still stay natural
- CTA labels should be concise and action-oriented
- section intros should not become mini essays

This means the review UI or report must help evaluate:

- too long for the slot
- too short / vague for the slot
- visually awkward wrap
- semantically fine but badly weighted for the page

## Data Model

V1 can be file-backed or derived at runtime, but the workflow needs a stable shape.

```ts
type TemplateCopyReviewStatus =
  | "unreviewed"
  | "approved"
  | "needs-revision";

type TemplateCopyReviewDecision =
  | "approved"
  | "revise_tone"
  | "revise_fit"
  | "replace";

type TemplateCopySlot = {
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

## Inventory Generation

The system should be able to derive copy slots from the resolved archetype preview model.

Reason:

- inventory should reflect what actually renders
- page-order should come from rendered structure, not just source-file order
- if a renderer introduces local copy, it must also become reviewable

This also gives us an enforcement benefit:

- if text appears in a renderer but not in the inventory, that is a bug

## Review Surface

Recommended V1: server-rendered internal review route, similar in spirit to the image review utility.

Suggested routes:

- `GET /internal/template-copy`
- `GET /internal/template-copy/[templateKey]`

### Index page should show

- template key
- family
- current approval completeness
- number of approved slots
- number of slots needing revision
- direct link to the archetype preview

### Detail page should show

- preview link
- visible copy inventory in page order
- section grouping
- slot role labels
- current text
- proposed replacement if edited
- approval/revision controls

## Approval Contract

Base template completion should require:

- all visible slots reviewed
- no unreviewed visible text remaining
- no unresolved `needs-revision` slots

Optional status flags:

- `copyApproved: boolean`
- `unreviewedSlotCount: number`
- `revisionRequiredCount: number`

## Persistence Strategy

V1 should keep this minimal.

Recommended approach:

- derive slot inventory from the archetype render
- persist review decisions separately
- apply final approved edits back into the niche template source once the review pass is complete

This avoids overbuilding a full CMS while still making the workflow durable.

## Existing Template Cleanup Requirement

The workflow must be able to run against existing templates immediately.

Initial rollout set:

- `roofing-v1`
- `hvac-v1`
- `plumbing-v1`
- `med-spa-v1`

This is important because the current system already surfaced real leakage:

- internal instruction phrasing in FAQs
- internal instruction phrasing in service-area sections
- renderer-level archetype labels that should never appear to clients

## Success Criteria

The workflow is successful when:

1. every visible string in a template can be reviewed in page order
2. the reviewer can approve or request revision per slot
3. revision decisions distinguish tone issues from fit/length issues
4. existing templates can be audited through the same system
5. no template is considered complete until every visible slot is approved
6. copy changes are reflected in the actual archetype source and re-render cleanly

## Recommended Rollout

1. Build copy slot inventory generation for rendered archetypes
2. Build internal review routes
3. Build slot approval/revision state
4. Run audit on roofing, HVAC, plumbing, and med spa
5. Make this workflow mandatory for every new template
