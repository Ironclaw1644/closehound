# HVAC Lead Preview Integration Design

## Goal

Extend the new template-system path beyond roofing by adding HVAC as the second blue-collar niche and wiring supported live lead previews through the new resolver path inside `/preview/[slug]`, while preserving the legacy preview flow for all unsupported industries and all unsafe template-system resolutions.

This is a narrow integration step. It does not change preview generation storage, job-runner payloads, or operator job semantics.

## Scope

### In scope

- Add an HVAC niche template under the existing `blue-collar-service` family.
- Add one believable HVAC seed business.
- Generalize the current roofing-only template-system preview adapter and component into a family-level blue-collar preview renderer.
- Add one central helper that maps live leads to supported template-system configs.
- Normalize HVAC industry variants inside that helper.
- Update `/preview/[slug]` so supported lead IDs can render through the new template-system path.
- Require preview-safe resolver output before using the new path.
- Fall back to the legacy preview path if the lead is unsupported, the mapping fails, or the resolved package is not preview-safe.
- Add tests first for HVAC fixtures, industry normalization, safe-path selection, and HVAC strict-mode proof suppression behavior.

### Out of scope

- Changing `src/server/operator/job-runner.ts`
- Changing `preview_sites` storage shape
- Migrating all existing industries to the template system
- Lead-personalization prompt generation
- Multi-family shared rendering beyond the blue-collar family

## Constraints

- Keep all supported-industry logic out of the page layer.
- Do not treat seed proof as valid client-facing proof in `strict` mode.
- Do not infer proof claims from lead fields that do not explicitly support them.
- Do not break the existing legacy preview path.
- Do not widen the blast radius into operator jobs or database writes.

## Recommended Approach

Use a central template-system lead preview resolver that accepts a `Lead` and returns either:

- a supported template-system config plus a preview-safe `RenderPackage`, or
- a structured null result indicating the legacy path should be used

`/preview/[slug]` should remain thin. It should:

1. detect whether `slug` is a lead ID
2. fetch the lead when applicable
3. ask the central helper whether this lead supports the template-system path
4. render the new blue-collar template preview only when the helper returns a preview-safe package
5. otherwise fall back to the legacy preview-site flow

This keeps routing logic simple and keeps support decisions, normalization, and safety gates in one place.

## Architecture

### 1. HVAC niche fixture

Add:

- `src/lib/template-system/niches/hvac.ts`
- `src/lib/template-system/seeds/hvac-seed.ts`

The HVAC niche should remain within `BLUE_COLLAR_SERVICE_FAMILY` and follow the same schema and resolver contract as roofing.

Its copy and SEO should be HVAC-specific:

- heating and cooling repair
- system replacement
- tune-ups and diagnostics
- indoor comfort language
- emergency-service language only where policy allows it

Conditional proof fields should remain conservative. If the seed or lead does not explicitly provide verified emergency service, financing, certifications, licensed/insured claims, or warranty support, those items must not appear in strict renders.

### 2. Family-level preview renderer

Replace the roofing-named presentation path with a family-level blue-collar renderer:

- adapter: `src/lib/template-system/blue-collar-preview.ts`
- component: `src/components/site-templates/blue-collar-preview.tsx`

This renderer should consume a `RenderPackage` and expose the same visible surface for both roofing and HVAC:

- header
- hero
- services
- why choose us
- process
- FAQ
- service area
- contact
- footer

The renderer should remain deterministic. It should not invent content or perform fallback logic beyond what the resolver has already decided.

The current roofing archetype route should be updated to use this shared blue-collar renderer so there is only one active renderer for this family.

### 3. Supported lead preview resolver

Add a central helper, for example:

- `src/lib/template-system/lead-preview.ts`

Responsibilities:

- normalize a lead’s industry value
- determine whether the lead maps to a supported template-system niche
- select `{ family, template, seed }`
- build a `LeadRecord` from normalized lead fields
- call `resolveTemplateRender(...)` in `strict` mode
- reject the new path if the result is not preview-safe

Suggested return shape:

```ts
type TemplateSystemLeadPreviewResult =
  | {
      supported: true;
      familyKey: string;
      templateKey: string;
      renderPackage: RenderPackage;
    }
  | {
      supported: false;
      reason:
        | "UNSUPPORTED_INDUSTRY"
        | "UNSAFE_RENDER"
        | "MAPPING_FAILED";
    };
```

This helper should be the single source of truth for supported-industry behavior.

### 4. HVAC normalization

HVAC normalization belongs in the helper, not the page.

The normalization pass should handle likely variants now, such as:

- `HVAC`
- `hvac`
- `heating and air`
- `heating & air`
- `heating and cooling`
- `air conditioning`

The normalized output should map these to the canonical template-system niche key, for example `hvac`.

Normalization should be conservative. If a value is ambiguous or not confidently HVAC, it should not be forced into the HVAC template path.

### 5. Preview page branching

Update `src/app/preview/[slug]/page.tsx` to use the helper, but keep routing logic minimal.

Behavior:

- if `slug` is not a lead UUID, use the legacy preview-site flow
- if `slug` is a lead UUID but the lead does not exist, preserve existing not-found behavior
- if `slug` is a lead UUID and the lead maps to a supported, preview-safe template-system render, render the new family-level preview
- otherwise, use the legacy preview-site flow

The page should not know how industries normalize or how templates are selected.

## Data Flow

### Supported lead path

1. page receives `slug`
2. page loads lead for UUID slugs
3. page calls template-system lead preview helper
4. helper normalizes industry and selects family/template/seed
5. helper builds `LeadRecord`
6. helper resolves `RenderPackage` in `strict` mode
7. helper checks `renderPackage.status.isPreviewSafe`
8. page renders `BlueCollarTemplatePreview`

### Unsupported or unsafe path

1. page receives `slug`
2. page either does not resolve a lead or receives an unsupported/unsafe helper result
3. page falls back to `requirePreviewSiteBySlug(slug)`
4. legacy preview renders unchanged

## Safety Rules

### Strict-mode proof suppression

HVAC-specific proof must be suppressed unless explicit, valid evidence exists.

This includes:

- emergency service availability
- financing
- warranty claims
- certifications
- licensed/insured claims
- testimonial or review proof

If such fields are absent or unapproved:

- they must not render
- they should produce suppression or fallback audit entries where applicable
- the shared preview should still render a coherent page using safe operational copy

### Preview-safe gate

The new path may only render when:

- `renderPackage.status.isPreviewSafe === true`
- critical fields are present
- no unsafe proof leaks through strict mode

If any of those conditions fail, the helper must return an unsupported result and the page must use the legacy path.

## Testing Strategy

Follow TDD strictly.

### Required failing tests first

1. HVAC niche matches family and schema version.
2. HVAC seed business does not pre-approve fabricated proof.
3. HVAC strict-mode resolution suppresses absent emergency service, financing, warranty, certification, and licensed/insured proof.
4. Supported-industry helper normalizes HVAC variants correctly.
5. Supported-industry helper returns supported results for roofing and HVAC only.
6. Supported-industry helper rejects unsafe renders.
7. Shared blue-collar preview model renders both roofing and HVAC section content correctly.
8. `/preview/[slug]` helper-level branching uses template-system render only for supported preview-safe lead IDs and falls back otherwise.

Tests should focus on helpers and resolver outputs rather than full page rendering when possible.

## Implementation Order

1. Write failing tests for HVAC fixtures and strict-mode proof suppression.
2. Add HVAC niche and seed fixtures.
3. Write failing tests for supported lead preview mapping and HVAC normalization.
4. Add the central lead preview helper.
5. Write failing tests for shared preview model behavior.
6. Rename/generalize the roofing preview adapter and component into the family-level blue-collar preview path.
7. Update the roofing archetype route to use the family-level renderer.
8. Update `/preview/[slug]` to branch through the helper and preserve legacy fallback.
9. Run `npm run test:unit`, `npm run typecheck`, and `npm run build`.

## Risks

### Risk: preview divergence between old and new blue-collar paths

Mitigation:

- keep the new renderer deterministic and schema-driven
- limit new-path use to supported industries only

### Risk: brittle industry matching

Mitigation:

- centralize normalization
- keep normalization conservative
- test likely HVAC variants explicitly

### Risk: unsafe proof leakage in strict mode

Mitigation:

- add explicit HVAC suppression tests
- gate new rendering on preview-safe status only

### Risk: duplicated renderer logic

Mitigation:

- move immediately to a family-level renderer rather than cloning the roofing renderer for HVAC

## Success Criteria

- Roofing and HVAC both resolve through the template-system path when accessed as supported lead previews.
- Unsupported or unsafe lead previews still render through the legacy path.
- `/preview/[slug]` remains thin and routing-only.
- All supported-industry mapping lives in one helper.
- HVAC proof claims stay suppressed in strict mode when evidence is absent.
- Tests, typecheck, and build all pass.
