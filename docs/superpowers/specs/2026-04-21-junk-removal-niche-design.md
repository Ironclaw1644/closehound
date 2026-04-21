# Junk Removal Niche Design

## Goal

Add junk removal as the next supported niche in the template-system path, using the existing `blue-collar-service` family and the shared blue-collar renderer.

The junk removal template should target businesses that serve both residential and light commercial jobs. It should convert well for local quote-driven removal work without leaning on fake urgency, fake disposal promises, or unsupported trust claims.

This is a narrow niche-expansion step. It does not introduce a new family, replace the renderer architecture, or change operator/job-runner storage behavior.

## Scope

### In scope

- Add a junk removal niche template under the existing `blue-collar-service` family.
- Add one believable junk removal seed business.
- Extend the supported-industry helper so junk removal leads can resolve through the template system.
- Normalize likely junk removal industry variants centrally in the helper.
- Reuse the shared blue-collar renderer and only make renderer changes if they are safe and reusable at the family level.
- Add tests first for niche validity, normalization, strict-mode proof suppression, and supported lead-preview behavior.
- Browser-verify the junk removal archetype route or one supported junk removal lead after implementation.

### Out of scope

- New family renderer work
- Job-runner changes
- Preview storage changes
- Lead-specific image generation
- New prompt-pack architecture
- Multi-niche batch work

## Constraints

- Keep all supported-industry logic in the central helper, not in the page layer.
- Preserve the existing legacy preview fallback for unsupported or unsafe leads.
- Do not imply same-day pickup, licensed/insured status, eco-friendly disposal, donation guarantees, recycling promises, volume claims, or pricing guarantees unless validated by claim policy.
- Keep the template broad enough for residential and light commercial work without turning it into generic “we haul everything” filler.
- Keep junk removal compatible with the existing blue-collar renderer shape unless a family-safe renderer adjustment is clearly justified.

## Recommended Approach

Use the existing `BLUE_COLLAR_SERVICE_FAMILY`, add a junk removal niche overlay plus a junk removal seed business, and extend the supported lead preview helper to map junk removal leads into the same strict resolver path already used for roofing, HVAC, and plumbing.

This keeps the architecture stable:

1. page loads a lead for UUID slugs
2. helper normalizes industry
3. helper selects `{ family, template, seed }`
4. helper builds a strict `RenderPackage`
5. page renders the shared family preview only when the package is preview-safe
6. unsupported or unsafe cases still use the legacy preview path

## Architecture

### 1. Junk removal niche fixture

Add:

- `src/lib/template-system/niches/junk-removal.ts`
- `src/lib/template-system/seeds/junk-removal-seed.ts`

The junk removal niche stays inside `BLUE_COLLAR_SERVICE_FAMILY` and follows the same schema contract as the other blue-collar niches.

Its canonical posture should be:

- residential + light commercial
- quote-led
- modern fast-moving crew

Primary CTA:

- `Get a Quote`

Secondary CTA:

- likely `Call Now`

The page should feel operational, capable, and local without overstating urgency.

### 2. Conversion posture

The junk removal template should not narrow itself to:

- curbside-only local pickup
- or large cleanout specialist work only

Instead it should support the broader real-world local operator shape:

- furniture and appliance removal
- garage, attic, storage, or move-out cleanouts
- light commercial or office junk removal
- renovation debris or general haul-away work when appropriate

The hero should speak to clutter, unwanted items, and cleanout work in a way that supports both fast-turn local jobs and more planned estimate-based work.

### 3. Service grouping

Junk removal should organize services by `types of jobs`, not by an endless list of removable item categories.

Recommended service groups:

- `Home Pickups`
- `Garage / Storage Cleanouts`
- `Move-Out / Property Cleanups`

This keeps the cards more reusable across real leads and avoids turning the page into a thin inventory checklist.

### 4. Proof handling

Junk removal needs strict claim handling because local operators often drift into generic promises very quickly.

Absent or unapproved proof must suppress:

- `same-day pickup`
- `licensed and insured`
- `eco-friendly disposal`
- `recycling first`
- `donation drop-off`
- `up-front pricing guarantee`
- review-count or testimonial proof

When those proof elements are missing, the template should stay strong using safer alternatives such as:

- clear quote process language
- arrival-window clarity
- responsible, organized removal process
- local job-type framing

The niche should default to operational clarity rather than hype.

### 5. Supported-industry helper

Extend `src/lib/template-system/lead-preview.ts` so junk removal resolves the same way as the other supported blue-collar niches.

Responsibilities:

- normalize junk removal industry variants
- map junk removal to the junk removal template and seed
- build the lead record
- call `resolveTemplateRender(...)` in `strict` mode
- reject the new path if the resolved package is not preview-safe

The page should remain thin and should not gain niche-specific branching.

### 6. Junk removal normalization

Normalization belongs in the central helper, not in the page or niche file.

Likely variants to support:

- `junk removal`
- `junk hauling`
- `junk hauling service`
- `junk pickup`
- `haul away`
- `cleanout service`
- `property cleanout`

Normalization should stay conservative. Strings that are too broad or ambiguous should not be coerced into junk removal.

### 7. Shared renderer expectations

The current blue-collar renderer should remain the family-level renderer.

Junk removal should fit the existing surface:

- header
- hero
- services
- why choose us
- process
- FAQ
- service area
- contact
- footer

If one renderer change is needed, it should be family-safe and reusable, not junk-removal-only.

## Data Flow

### Supported junk removal lead path

1. page receives `slug`
2. page resolves the lead when `slug` is a lead UUID
3. helper normalizes industry to `junk removal`
4. helper selects blue-collar family, junk removal template, and junk removal seed
5. helper builds `LeadRecord`
6. helper resolves `RenderPackage` in `strict` mode
7. helper requires `renderPackage.status.isPreviewSafe === true`
8. page renders the shared blue-collar preview

### Unsupported or unsafe path

1. page receives `slug`
2. helper returns unsupported or unsafe
3. page falls back to legacy preview behavior
4. legacy preview renders unchanged

## Testing Strategy

Follow TDD strictly.

### Required failing tests first

1. Junk removal niche matches family and schema version.
2. Junk removal seed business does not pre-approve fabricated proof.
3. Junk removal strict-mode resolution suppresses absent same-day, licensed/insured, recycling, donation, price-guarantee, and testimonial proof.
4. Supported-industry helper normalizes junk removal variants correctly.
5. Supported-industry helper returns supported results for existing niches plus junk removal only where appropriate.
6. Shared blue-collar preview model renders junk removal content correctly.
7. Lead-preview branching uses the template-system path only for supported preview-safe junk removal leads and falls back otherwise.

### Browser verification

After implementation:

- verify the junk removal archetype route if added, or
- verify one supported junk removal lead preview through `/preview/[slug]`

Also confirm:

- supported junk removal renders the new template-system path
- unsupported leads still fall back cleanly

## Implementation Order

1. Write failing tests for junk removal fixture validity and strict proof suppression.
2. Add junk removal niche and seed fixtures.
3. Write failing tests for normalization and supported mapping.
4. Extend the supported lead preview helper for junk removal.
5. Write failing tests for shared renderer/model behavior if small family-safe copy-surface adjustments are needed.
6. Implement the smallest renderer/model change required.
7. Run unit tests, typecheck, and build.
8. Browser-verify the junk removal path.

## Risks

- Junk removal can drift into generic “we take anything” copy if service cards are not kept grounded in real job types.
- Quote language can accidentally imply pricing promises if copy is not kept under claim policy.
- Recycling and donation language can become fake trust copy very quickly if not proof-gated.
- Light commercial coverage can get too broad if the template starts sounding like a large-scale commercial hauler.

## Success Criteria

- Junk removal becomes the next supported niche in the template system.
- Junk removal resolves through the same strict blue-collar path as the other service niches.
- The template supports both residential and light commercial work.
- Missing proof downgrades to truthful operational clarity instead of hype or fake disposal promises.
- Legacy preview fallback remains intact for unsupported or unsafe cases.
