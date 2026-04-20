# Nano Banana 2 Roofing Images Design

## Goal

Add the first approval-gated image generation slice to the template system using Nano Banana 2 via Gemini API.

This first slice should prove the full archetype-image contract for one niche:

- prompt generation
- slot-based candidate generation
- asset storage in Supabase Storage
- metadata persistence in app storage
- approval-gated rendering
- preview consumption of approved assets only

The first end-to-end niche is `roofing`.

## Scope

### In scope

- archetype-first image generation for `roofing`
- full roofing slot set with `3-6` slots
- candidate-based generation per slot
- Supabase-backed asset storage
- persisted metadata records for every candidate
- one internal generation command
- approval state persisted in app storage
- preview rendering from approved assets only
- slot-level fallback/omission behavior
- versioned prompt/model traceability

### Out of scope

- lead-specific image generation
- in-app review UI
- multi-niche batch generation
- public media library UX
- generalized media management platform
- full admin tooling around approval workflows

## Constraints

- generated images must never render unless approved
- one approved asset per slot may render at a time
- non-approved candidates must remain persisted but excluded from preview rendering
- storage should use Supabase Storage from day one
- metadata should be app-integrated from day one
- command flow should be internal/developer-triggered first
- generation should run one niche at a time in v1

## Recommended Approach

Use a metadata-first image registry persisted in the app, with generated files stored in Supabase Storage and referenced by stable storage paths.

The first slice should operate at the `niche archetype` level only:

- `roofing` template
- full slot set
- prompt builder derived from the existing template-system contract
- candidate generation grouped by `generationBatchId`
- approval-gated preview resolution

This gives the preview system a real, durable image contract without requiring a full media subsystem yet.

## Architecture

### 1. Archetype-first image model

The v1 image system should bind assets to archetypes, not leads.

Each candidate record should be associated with:

- `familyKey`
- `templateKey`
- `slot`
- `generationBatchId`
- `templateVersion`

Optional future field:

- `leadId`

But `leadId` is not used in v1.

Design principle:

- archetype visuals are the base layer
- lead visuals are future overrides

### 2. Storage model

Use `Supabase Storage` for generated image files.

Use app-integrated metadata persistence for image records.

The physical file storage implementation should stay minimal in v1:

- generated image uploaded to a stable Supabase Storage path
- storage path or URL written to the metadata record
- preview renderer reads approved asset metadata and then resolves the asset URL/path

The storage layout should remain flexible enough for future backend changes, but v1 should not add abstraction for abstraction’s sake.

### 3. Metadata registry

Each generated candidate must persist metadata sufficient for:

- approval gating
- prompt traceability
- slot resolution
- regeneration history

Required candidate metadata fields:

- `id`
- `generationBatchId`
- `familyKey`
- `templateKey`
- `templateVersion`
- `slot`
- `candidateIndex`
- `prompt`
- `negativePrompt`
- `promptVersion`
- `provider`
- `model`
- `status`
- `storagePath` or `assetUrl`
- `aspectRatio`
- `cropNotes`
- `createdAt`
- `createdBy`

Optional but useful in v1:

- `seedBusinessKey`
- `renderOrder`
- `approvalUpdatedAt`
- `approvalUpdatedBy`

### 4. Candidate grouping

Candidate groups should be explicit.

Every generation run must group candidates by:

- `templateKey`
- `slot`
- `generationBatchId`

This keeps approvals, retries, and future regenerations tractable.

For v1:

- one command invocation creates one `generationBatchId`
- all generated candidates for that roofing run share that batch ID
- candidates remain individually approvable/rejectable

### 5. Candidate policy

For v1:

- hero slot: `3` candidates
- every other slot: `2` candidates
- exactly `1` approved asset per slot may render

Other candidates remain persisted with non-rendering statuses such as:

- `generated`
- `approved`
- `rejected`
- `unused`

Approval semantics:

- multiple candidates may exist for a slot
- only one may be marked renderable for that slot at a time
- approving one candidate for a slot should make any previously approved candidate for the same slot non-rendering

That state transition can stay simple in v1 as long as it is deterministic.

### 6. Roofing slot set

The first slice should cover the full roofing `3-6` slot set.

Proposed roofing slots:

- `hero`
- `service-action`
- `detail-closeup`
- `team-or-workmanship`
- `workspace-or-site`
- `gallery-extra`

Required slots:

- `hero`
- `service-action`
- `detail-closeup`

Optional slots:

- `team-or-workmanship`
- `workspace-or-site`
- `gallery-extra`

This lets the preview system fail safely while still supporting richer galleries later.

### 7. Render fallback rules

Each slot should have explicit render behavior.

If no approved asset exists:

- use an approved fallback asset if one is defined for that slot
- otherwise omit the slot if omission is allowed
- never render unapproved generated output

For v1, omission should be the default fallback unless a niche explicitly defines an approved fallback asset.

### 8. Prompt generation

Prompt generation should be derived from the template-system niche contract, not hand-authored ad hoc each time.

Each roofing slot should have:

- a slot-specific subject intent
- realism rules
- composition rules
- crop notes
- negative prompt language

Nano Banana 2 prompt direction should stay grounded:

- documentary/commercial feel
- realistic lighting
- no embedded text
- no fake logos
- no surreal polish
- safe desktop/mobile crop assumptions

Each candidate record must store:

- `prompt`
- `negativePrompt`
- `promptVersion`
- `templateVersion`
- `model`

That gives future prompt improvements a usable audit trail.

### 9. Generation workflow

The first generation workflow should be an internal command, not an in-app action.

Flow:

1. operator runs one internal roofing image-generation command
2. command creates a `generationBatchId`
3. command builds slot prompts from the roofing template
4. command generates candidates via Gemini API using Nano Banana 2
5. command uploads returned image files to Supabase Storage
6. command persists one metadata row per candidate
7. all new rows start as non-rendering until approved

This keeps the first slice testable and debuggable before any UI is added.

### 10. Idempotency and reruns

The command should be safe to run multiple times.

For v1, that does not require full deduplication logic, but it does require predictable grouping.

Minimum rule:

- every command invocation gets a new `generationBatchId`
- previous approved assets remain active until a new asset is explicitly approved
- new generated candidates do not implicitly replace existing approved assets

This is sufficient for v1 and avoids accidental preview churn.

## Data Model Direction

### Archetype asset record

Suggested shape:

```ts
type ArchetypeImageCandidate = {
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
  status: "generated" | "approved" | "rejected" | "unused";
  storagePath: string;
  assetUrl?: string;
  aspectRatio: string;
  cropNotes?: string;
  createdAt: string;
  createdBy: string;
  approvalUpdatedAt?: string;
  approvalUpdatedBy?: string;
};
```

### Slot render rule

Suggested shape:

```ts
type ArchetypeSlotRenderRule = {
  slot: string;
  required: boolean;
  fallbackAssetId?: string;
  omitWhenUnapproved: boolean;
};
```

## Preview Integration

The preview renderer should continue to consume only approved assets.

Integration rule:

- resolver or render assembly step queries approved candidates for the active template and slot
- only one approved candidate per slot is eligible
- if no approved candidate exists, apply slot fallback rules

For v1:

- image metadata integration should support the existing `ResolvedVisualSlot` model
- approved storage path or URL should populate renderable visual slots
- missing approvals should continue to produce omitted visual slots

## Testing Strategy

Follow TDD strictly.

### Required failing tests first

1. roofing image slot definitions exist and distinguish required vs optional slots
2. generation command creates a single `generationBatchId` per run
3. hero slots request `3` candidates, non-hero slots request `2`
4. persisted metadata rows include prompt/model/version/storage fields
5. exactly one approved asset per slot is returned to the preview path
6. unapproved assets never render
7. optional slots omit safely when no approved asset exists
8. rerunning generation creates a new batch without replacing prior approved assets

### Browser verification

After implementation:

- verify roofing archetype preview with approved assets
- verify missing-approval behavior still omits image slots safely

## Risks

- prompt quality may be good enough for hero but weak for supporting slots if slot intent is underspecified
- approval semantics can become messy if slot uniqueness is not enforced cleanly
- file uploads can succeed while metadata persistence fails, or vice versa, so basic failure handling matters
- adding UI too early would slow down the core asset contract work

## Success Criteria

- roofing archetype images can be generated via an internal command
- generated files are uploaded to Supabase Storage
- candidate metadata persists in app storage
- candidates are grouped by generation batch and slot
- only approved assets render
- exactly one approved asset per slot is renderable at a time
- preview rendering remains safe when approvals are missing
- the system is ready to add HVAC and plumbing after roofing is proven
