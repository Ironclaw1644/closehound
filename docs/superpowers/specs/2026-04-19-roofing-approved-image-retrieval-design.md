# Roofing Approved Image Retrieval Design

## Goal

Feed repository-backed approved roofing archetype images into the template-system preview path without changing the existing safety contract. The roofing archetype preview should use the latest approved batch by default, while allowing an optional pinned batch for debugging and review.

## Scope

- Roofing archetype preview route only
- Approved-image retrieval only
- No lead-specific image retrieval
- No review UI
- No generation changes

## Decision

Use `latest approved by default` with an optional `?batch=<id>` override.

Reasoning:
- normal archetype previews should not require operational input
- batch pinning is still necessary for verification and regression debugging
- silent fallback from an invalid pinned batch to some other batch would hide problems

## Runtime Behavior

### Default route behavior

Route: `/preview/templates/roofing-archetype`

- query the image repository for the latest roofing generation batch that has at least one approved candidate
- load approved candidates for that batch
- feed the slot-keyed approved candidates into `resolveTemplateRender`
- render approved assets only
- if no approved batch exists, keep the current safe omission behavior

### Pinned batch behavior

Route: `/preview/templates/roofing-archetype?batch=<generationBatchId>`

- query approved candidates for the requested batch only
- do not silently swap to another batch if the requested batch has no approved assets
- if the pinned batch has no approved assets, render the same archetype safely with omitted image slots
- keep the page renderable; do not 404 on missing approved assets

## Data Retrieval Contract

Add repository-backed read helpers around `template_image_candidates`.

### Required reads

1. `getLatestApprovedTemplateImageBatch(templateKey)`
   - returns the newest `generationBatchId` for the given template that has at least one approved candidate
   - returns `null` if none exists

2. `getApprovedTemplateImageCandidates({ templateKey, generationBatchId })`
   - returns approved candidates only
   - returns slot-keyed approved candidates via the existing repository helper shape

### Query constraints

- filter by `template_key`
- filter by `status = 'approved'`
- batch selection should be deterministic
- order rows so tie-breaking is stable if needed

## Route Integration

Update the roofing archetype route to accept `searchParams`.

Resolution order:
1. if `batch` is provided, fetch approved candidates for that batch only
2. otherwise, fetch the latest approved batch for `roofing-v1`
3. pass approved candidates into `resolveTemplateRender`
4. build the blue-collar preview model as before

Failure behavior:
- if Supabase env is unavailable, render without approved images
- if the repository query fails, render without approved images
- if the pinned batch has no approved rows, render without approved images
- image absence must remain visible through the resolver’s omission audit

## Repository Placement

Keep read logic in the image repository layer, not in the route.

Recommended additions:
- `src/lib/template-system/images/repository.ts`
  - add read/query helpers alongside existing selection helpers
- optionally add a small server-only wrapper if keeping Supabase imports out of pure helpers becomes cleaner

The page layer should only ask for:
- latest approved roofing batch, or
- approved candidates for a specific roofing batch

## Safety Rules

- only approved candidates may enter `approvedImageCandidates`
- generated, rejected, and unused candidates must never render
- retrieval must not loosen the existing omission behavior
- a missing or invalid batch is not an error state for the preview; it is an image-omission state

## Testing

Add focused coverage for:

1. repository read helper behavior
- latest approved batch selection prefers the newest eligible batch
- non-approved rows do not influence latest-batch selection
- approved candidate retrieval returns only approved rows for the requested batch

2. route/helper integration
- roofing archetype preview uses latest approved batch by default
- roofing archetype preview honors a pinned batch when provided
- pinned batch with no approved assets does not fall back to a different batch
- missing Supabase env or query failure still renders the archetype path without images

3. resolver continuity
- existing approval-gated image behavior stays unchanged once approved candidates are supplied

## Files Likely Affected

- Modify: `src/app/preview/templates/roofing-archetype/page.tsx`
- Modify: `src/lib/template-system/images/repository.ts`
- Modify: `src/lib/template-system/resolver.test.ts`
- Possibly create: `src/lib/template-system/images/server.ts`

## Non-Goals

- lead preview image retrieval
- image approval UI
- image upload/generation execution
- storage upload to Supabase Storage
- plumbing or HVAC image retrieval

## Success Criteria

- `/preview/templates/roofing-archetype` uses the latest approved roofing image batch automatically
- `/preview/templates/roofing-archetype?batch=<id>` uses that batch only
- invalid or empty pinned batches omit images safely instead of silently swapping batches
- preview rendering remains stable when no approved assets exist
- retrieval logic is isolated to the image repository/server layer, not embedded in the page
