# Plumbing Niche Design

## Goal

Add plumbing as the third supported niche in the new template-system path, using the existing `blue-collar-service` family and the shared blue-collar renderer.

The plumbing template should be urgent-first with estimate support. It must convert well for high-intent repair leads without forcing fake emergency-service positioning when proof is absent.

This is a narrow niche-expansion step. It does not introduce image generation, change preview storage, or alter operator job behavior.

## Scope

### In scope

- Add a plumbing niche template under the existing `blue-collar-service` family.
- Add one believable plumbing seed business.
- Extend the supported-industry helper so plumbing leads can resolve through the template system.
- Normalize likely plumbing industry variants centrally in the helper.
- Keep the shared blue-collar renderer and adapt it only if plumbing needs a safe, reusable surface change.
- Add tests first for plumbing fixtures, normalization, strict-mode proof suppression, and supported lead-preview behavior.
- Browser-verify the plumbing archetype route or one supported plumbing lead after implementation.

### Out of scope

- Nano Banana 2 or Gemini image generation
- Changing `src/server/operator/job-runner.ts`
- Changing `preview_sites` storage shape
- Adding a new family renderer
- Reworking the resolver contract
- Multi-niche prompt generation

## Constraints

- Keep all supported-industry logic in the central helper, not in the page layer.
- Preserve the existing legacy preview fallback for unsupported or unsafe leads.
- Do not imply 24/7, same-day, emergency availability, licensed/insured status, warranty, financing, or similar trust claims unless validated by claim policy.
- If proof is missing, fall back to process and scope reassurance rather than fake urgency language.
- Keep plumbing compatible with the existing blue-collar renderer shape unless a family-safe renderer change is clearly justified.

## Recommended Approach

Use the existing `BLUE_COLLAR_SERVICE_FAMILY`, add a plumbing niche overlay plus a plumbing seed business, and extend the supported lead preview helper to map plumbing leads into the same strict resolver path already used for roofing and HVAC.

This keeps the system architecture unchanged:

1. page loads a lead for UUID slugs
2. helper normalizes industry
3. helper selects `{ family, template, seed }`
4. helper builds a strict `RenderPackage`
5. page renders the shared family preview only when the package is preview-safe
6. unsupported or unsafe cases still use the legacy preview path

## Architecture

### 1. Plumbing niche fixture

Add:

- `src/lib/template-system/niches/plumbing.ts`
- `src/lib/template-system/seeds/plumbing-seed.ts`

The plumbing niche stays inside `BLUE_COLLAR_SERVICE_FAMILY` and follows the same schema contract as roofing and HVAC.

Its copy should reflect two intent tracks without splitting into separate templates:

- urgent plumbing and active repair needs
- general residential plumbing and estimate-driven planned work

The niche should be structurally urgent-first:

- hero speaks to active plumbing problems first
- primary CTA is `Call Now`
- secondary CTA is `Request Estimate`

But it must also support broader residential work:

- planned replacements
- fixture or water-heater installs
- repipes or scope-based plumbing work

### 2. Plumbing conversion posture

The plumbing template should use one canonical intent model:

- urgent-first
- estimate-capable

It should not become:

- pure emergency-only plumbing
- or generic full-service plumbing with weak top-of-page focus

This means:

- hero copy supports both a homeowner with an active issue and one planning work
- services are grouped into `Immediate Needs` and `Planned Work / Installations`
- FAQ includes both urgent and estimate-style questions
- contact section keeps a strong call-first posture without inventing same-day or 24/7 claims

### 3. Plumbing proof handling

Plumbing needs strict claim handling because urgent-service language can drift into fabricated trust signals very quickly.

Absent or unapproved proof must suppress:

- `24/7 availability`
- `same-day service`
- `emergency plumber`
- `licensed and insured`
- `warranty`
- `financing`
- testimonial or review proof

When these proof elements are missing, the resolver should continue to produce a coherent plumbing page using safer alternatives such as:

- clear diagnosis language
- practical scheduling language
- clean scope and next-step language
- residential problem-to-resolution framing

The niche should therefore default to process-heavy reassurance rather than proof-heavy persuasion.

### 4. Supported-industry helper

Extend `src/lib/template-system/lead-preview.ts` so plumbing is resolved the same way as roofing and HVAC.

Responsibilities:

- normalize plumbing industry variants
- map plumbing to the plumbing template and seed
- build the lead record
- call `resolveTemplateRender(...)` in `strict` mode
- reject the new path if the resolved package is not preview-safe

The page should remain thin and should not gain plumbing-specific logic.

### 5. Plumbing normalization

Plumbing normalization belongs in the helper, not in the page or the niche file.

Likely variants to support:

- `plumbing`
- `plumber`
- `residential plumbing`
- `plumbing repair`
- `emergency plumbing`
- `drain and plumbing`
- `water heater service`

Normalization should stay conservative. If an industry string is too ambiguous, it should not be coerced into plumbing.

### 6. Shared renderer expectations

The current blue-collar renderer should remain the family-level renderer.

Plumbing should fit that shared surface:

- header
- hero
- services
- why choose us
- process
- FAQ
- service area
- contact
- footer

If plumbing needs one renderer change, it should be family-safe and reusable, not plumbing-only. The likely case is supporting grouped service copy cleanly without changing overall page structure.

## Data Flow

### Supported plumbing lead path

1. page receives `slug`
2. page resolves the lead when `slug` is a lead UUID
3. helper normalizes industry to `plumbing`
4. helper selects blue-collar family, plumbing template, and plumbing seed
5. helper builds `LeadRecord`
6. helper resolves `RenderPackage` in `strict` mode
7. helper requires `renderPackage.status.isPreviewSafe === true`
8. page renders the shared blue-collar preview

### Unsupported or unsafe plumbing path

1. page receives `slug`
2. helper returns unsupported or unsafe
3. page falls back to legacy preview behavior
4. legacy preview renders unchanged

## Testing Strategy

Follow TDD strictly.

### Required failing tests first

1. Plumbing niche matches family and schema version.
2. Plumbing seed business does not pre-approve fabricated proof.
3. Plumbing strict-mode resolution suppresses absent same-day, emergency, licensed/insured, warranty, financing, and testimonial proof.
4. Supported-industry helper normalizes plumbing variants correctly.
5. Supported-industry helper returns supported results for roofing, HVAC, and plumbing only.
6. Shared blue-collar preview model renders plumbing content correctly.
7. Lead-preview branching uses the template-system path only for supported preview-safe plumbing leads and falls back otherwise.

### Browser verification

After implementation:

- verify the plumbing archetype route if added, or
- verify one supported plumbing lead preview through `/preview/[slug]`

Also confirm:

- supported plumbing renders the new template-system path
- unsupported leads still fall back cleanly

## Implementation Order

1. Write failing tests for plumbing fixture validity and strict proof suppression.
2. Add plumbing niche and seed fixtures.
3. Write failing tests for plumbing normalization and supported mapping.
4. Extend the supported lead preview helper for plumbing.
5. Write failing tests for shared renderer/model behavior if plumbing needs grouped service rendering changes.
6. Implement the smallest shared renderer adjustment needed for plumbing.
7. Run unit tests, typecheck, and build.
8. Browser-verify the plumbing path.

## Risks

- Plumbing can easily drift into fake emergency positioning if urgency language is not kept under claim policy.
- Grouped service copy could pressure the shared renderer into one-off branching if the surface is not kept family-safe.
- Real lead data may use messy industry strings, so normalization must be broad enough to be useful without becoming sloppy.

## Success Criteria

- Plumbing is the third supported niche in the template system.
- Plumbing renders through the same strict blue-collar resolver path as roofing and HVAC.
- The template is urgent-first while still supporting estimate-driven residential work.
- Missing proof downgrades to truthful operational reassurance instead of fake emergency claims.
- Legacy preview fallback remains intact for unsupported or unsafe cases.
