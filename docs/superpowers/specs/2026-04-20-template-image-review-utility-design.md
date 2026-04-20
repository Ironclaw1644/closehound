# Template Image Review Utility Design

## Goal

Add a small internal review utility for archetype image candidates so approved assets can be inspected, promoted, and rejected from the app instead of the terminal. The utility must preserve the existing preview contract: exactly one approved asset per `templateKey + slot`, with normal preview routes rendering approved assets only.

## Scope

This v1 utility covers:

- archetype candidates only
- server-rendered internal pages in this app
- template list page plus template detail page
- batch inspection with latest batch preselected
- approve and reject actions
- live preview link for the selected batch

This v1 utility does **not** cover:

- lead-specific candidates
- image generation triggers
- bulk actions
- auth redesign
- storage-health scanning beyond metadata-backed availability

## Why This Exists

The current image pipeline works, but candidate approval is still terminal-driven. That is good enough for proof-of-concept, but too slow for routine batch review. The next useful step is not a larger media platform. It is a narrow internal UI that makes the existing review loop faster while preserving the same storage, approval, and preview rules.

## Current Constraints

- archetype images are persisted in `closehound.template_image_candidates`
- generated assets live in Supabase Storage
- exactly one approved asset per slot should render for a template
- normal archetype previews use approved assets only
- `?batch=` already exists as an inspection path on archetype preview routes

## Key Decision

Approval scope is **global per template slot**, not per batch.

That means:

- approving a candidate promotes it for `templateKey + slot`
- any previously approved candidate for the same `templateKey + slot` is demoted back to `generated`
- batch history remains intact, but only one active candidate per slot exists at a time

This keeps preview behavior deterministic across batches and avoids “multiple approved candidates” ambiguity.

## Routes

### `GET /internal/template-images`

Internal index page for archetype image review.

It should list the supported template-system archetypes:

- `roofing-v1`
- `hvac-v1`
- `plumbing-v1`

For each template, show:

- display label
- latest batch id if present, otherwise `No batches yet`
- required approved count
- optional approved count
- preview-safe yes/no
- link to the template detail page

Templates with no batches must render explicitly as inactive or unseeded, not as if they are equally populated.

### `GET /internal/template-images/[templateKey]`

Internal detail page for one archetype template.

Behavior:

- load all batches for that template, newest first
- latest batch is selected by default
- `?batch=<generationBatchId>` switches the inspected batch
- if the requested batch does not exist, render a safe inline empty/missing state instead of crashing

The page must show:

- template label and template key
- selected batch id
- batch selector
- completeness summary
- live preview link for the selected batch
- candidate groups by slot

### Live Preview Link

The detail page should provide a `Live Preview` link to:

- `/preview/templates/roofing-archetype?batch=<id>`
- `/preview/templates/hvac-archetype?batch=<id>`
- `/preview/templates/plumbing-archetype?batch=<id>`

This link is for inspection/debugging.

Preview semantics remain:

- standard archetype preview resolves approved assets only
- `?batch=` is an explicit inspection mode surfaced by the internal utility

## Detail Page Summary

The detail page should compute and render:

- required slots approved `X/Y`
- optional slots approved `A/B`
- preview-safe `yes/no`

For v1, `preview-safe` here means every required slot for the template currently has an approved candidate somewhere in that template’s slot history.

## Candidate Presentation

Candidates should be shown grouped by slot for the selected batch.

Each candidate card should show:

- image thumbnail
- slot key
- candidate index
- batch id
- status
- created time
- prompt version
- storage availability state

### Storage Availability State

For v1, derive availability from stored metadata instead of live storage probing.

States:

- `available`
  - candidate has usable `assetUrl` or `storagePath`
- `missing`
  - metadata exists but neither usable asset reference is present

If metadata exists but the asset is missing or broken, the card should still render with a visible missing-asset note.

## Actions

### Approve

Approving a candidate:

1. sets that candidate to `approved`
2. finds any existing approved candidate for the same `templateKey + slot`
3. demotes that previously approved candidate to `generated`
4. revalidates the internal review page
5. revalidates the affected archetype preview path

This action is global across batches for that template slot.

### Reject

Rejecting a candidate:

1. sets only that candidate to `rejected`
2. does not alter other candidates automatically
3. if the rejected candidate was the currently approved slot asset, that slot becomes unapproved until another candidate is approved
4. revalidates the internal review page
5. revalidates the affected archetype preview path

## Data Model Expectations

The existing `template_image_candidates` table remains the system of record.

The review utility requires repository helpers for:

- listing template summaries
- listing batches for one template, newest first
- listing candidates for one template batch
- listing currently approved candidates for one template across all slots
- approving one candidate across `templateKey + slot`
- rejecting one candidate

No schema redesign is required for this slice.

## Template Registry

Add one internal registry that maps each reviewable template to:

- display label
- preview route
- slot definitions

This registry should be the single source used by:

- the internal index page
- the internal detail page
- completeness summary logic
- live preview link generation

That avoids scattering template labels and route paths across multiple files.

## UI Shape

### Index Page

The index page should be plain and fast:

- one card or row per template
- status summary
- direct link to review

The page is not a dashboard. It is a navigation and status surface.

### Detail Page

The detail page should prioritize speed of review:

- batch selector at the top
- completeness summary near the header
- live preview link near the header
- slot groups below
- candidate cards in each slot group

The currently approved candidate must be visibly marked even if it belongs to an older batch than the selected one.

## Error Handling

- if Supabase env is unavailable, render an internal error state instead of throwing an unhandled page error
- if a template has no batches, show an empty state with no candidate groups
- if a selected batch has no candidates, show a batch-empty state
- if a preview route exists but no required slots are approved, the detail page should clearly show `preview-safe: no`

## Server/Client Boundaries

Use server-rendered pages and server actions.

Why:

- the data already lives on the server
- the mutation rules are simple and authoritative
- it keeps the first version small and reliable

Avoid a client-heavy moderation panel in v1.

## File Structure

Expected additions and modifications:

- `src/app/internal/template-images/page.tsx`
- `src/app/internal/template-images/[templateKey]/page.tsx`
- `src/app/internal/template-images/actions.ts` or colocated action modules
- `src/components/template-images/template-image-index.tsx`
- `src/components/template-images/template-image-detail.tsx`
- `src/components/template-images/template-image-card.tsx`
- `src/lib/template-system/images/repository.ts`
- `src/lib/template-system/images/review-registry.ts`

The repository remains the only place that talks to Supabase for this feature.

## Testing

Add tests for:

- template summary derivation
- newest-first batch ordering
- approve action demotes previously approved candidate across batches for the same `templateKey + slot`
- reject action clears active approval when rejecting the approved candidate
- completeness summary calculation
- detail-page selection behavior for missing or invalid batch ids

Verification should also include browser checks for:

- index page renders all three templates
- detail page renders latest batch by default
- live preview link points to the right archetype route with `?batch=`
- approval changes affect the preview path after revalidation

## Success Criteria

This slice is done when:

1. internal reviewers can inspect batches for roofing, HVAC, and plumbing inside the app
2. they can approve or reject candidates without CLI commands
3. approval is enforced globally per `templateKey + slot`
4. the live preview link opens the correct archetype route in batch inspection mode
5. standard preview behavior still uses approved assets only
6. no generation controls or lead-specific workflows are introduced

## Recommended Implementation Approach

Use server-rendered pages plus server actions plus repository helpers.

This is the smallest approach that still gives a real review workflow. It fits the current architecture, preserves the approval contract, and avoids overbuilding a media admin system before the next family is ready.
