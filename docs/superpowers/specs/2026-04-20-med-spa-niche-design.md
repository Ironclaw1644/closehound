# Med Spa Niche Design

## Goal

Add `med-spa-v1` as the first niche in a new `health-wellness` template family.

The first med spa template should be designed for a single-location local business that likely does not have a strong existing website. It should feel premium, clean, and credible without drifting into influencer-style beauty branding or overly sterile medical-office aesthetics.

This is a new-family expansion step. It should prove that the template system can support a materially different family with different conversion behavior, proof rules, and image direction than the existing blue-collar templates.

## Scope

### In scope

- Add a new `health-wellness` family fixture.
- Add a `med-spa-v1` niche template under that family.
- Add one believable med spa seed business.
- Define the canonical CTA posture, section strategy, proof rules, and image direction for med spa.
- Add the first med spa archetype preview path.
- Wire supported lead-preview routing for med spa leads using the same strict template-system contract used by the current supported niches.
- Add med spa image-slot guidance with culturally diverse people represented in gallery and lifestyle imagery.

### Out of scope

- Multi-location med spa support
- Promo-heavy offer systems
- Financing or package logic
- Multi-provider staff directories
- Lead-specific image overrides
- Review UI redesign
- Job-runner or `preview_sites` storage changes

## Constraints

- The med spa template must not be forced into the existing blue-collar family or renderer.
- The first med spa archetype should be `single-location`, `offer-light`, and consultation-led.
- The canonical tone should be `gender-neutral clinical-premium`.
- The primary CTA should be `Book Consultation`.
- The template must not fabricate medical or trust claims.
- Gallery and supporting images must intentionally represent culturally diverse people when people are shown.
- The template should remain broad enough to cover a typical local med spa service mix without becoming vague filler copy.

## Recommended Approach

Add a new `health-wellness` family with `med-spa-v1` as the first niche, then implement the med spa archetype through the same strict template-system path already proven with roofing, HVAC, and plumbing:

1. define the new family contract
2. define the med spa niche overlay
3. define one believable seed business
4. resolve through the strict template-system pipeline
5. render through a family-specific archetype preview
6. later add med spa image generation and approvals through the existing image infrastructure

This keeps the architecture coherent while still allowing med spa to have its own conversion model and visuals.

## Positioning

The first med spa template should use a `full-service luxury med spa` posture.

It should not be:

- injectables-only
- overly clinical and treatment-room sterile
- feminine-coded to the point that it narrows the usable lead pool
- promo-led or discount-led

It should be:

- full-service but curated
- premium without sounding fake-luxury
- gender-neutral clinical-premium
- consultation-led
- local and approachable

This gives the best default for a company that most likely does not already have a real website while still leaving room to personalize later.

## Conversion Model

The med spa template should be consultation-led instead of urgency-led.

### Primary CTA

- `Book Consultation`

### Secondary CTA

- `View Treatments`

This CTA model fits med spa buying behavior better than `Call Now` while still allowing phone contact to appear early in the header and contact blocks if lead data includes it.

The page should move users toward:

- learning about treatments
- trusting the practice
- understanding what happens first
- booking a consultation

## Section Strategy

Recommended section order:

1. Header / Nav
2. Hero
3. Featured Treatments
4. About / Philosophy
5. Why Clients Choose This Practice
6. Consultation Process
7. Gallery / Environment
8. Testimonials
9. FAQ
10. Location / Contact
11. Footer

### Hero

The hero should lead with polished, high-trust outcome framing and a calm consultation CTA.

It should not use:

- aggressive urgency
- hard-sell beauty language
- discount framing
- overblown aesthetic promises

### Featured Treatments

This section should feel curated, not exhaustive. The default treatment mix should support a broad full-service med spa posture such as:

- injectables
- facials
- skin rejuvenation
- laser or resurfacing
- body contouring or wellness-oriented treatment categories if appropriate

Treatment copy should describe what the treatment category is for and how clients typically begin, without inventing technology names or performance claims.

### About / Philosophy

This section should establish tone and trust. It should emphasize consultation quality, aesthetic restraint, comfort, and individualized treatment planning without leaning on fake medical authority.

### Why Clients Choose This Practice

This should be process-heavy by default, not proof-heavy. It should emphasize:

- thoughtful consultation
- natural-looking goals
- treatment planning
- comfort and discretion
- a polished environment

### Consultation Process

This section is important for this niche. The first-time buyer often wants to understand what happens before booking treatment. The section should clearly explain:

- consultation
- treatment planning
- timeline or next steps
- follow-up expectations in a generic, truthful way

### Gallery / Environment

This section should carry more weight than it does in blue-collar templates. It should show:

- clean treatment rooms
- reception or spa environment
- tasteful client-provider interactions
- realistic treatment-adjacent detail shots

When people appear, the image set must intentionally represent culturally diverse people.

### Testimonials

Testimonials are conditional. They should not render as factual client quotes unless approved data exists. If absent, the section can be hidden or replaced by another trust-supporting section based on resolver rules.

### FAQ

The FAQ should cover:

- consultation questions
- what to expect on first visit
- treatment planning cadence
- downtime or suitability questions in broad, safe terms

It should not fabricate treatment claims, medical guidance, or guarantees.

## Proof And Claim Policy

This niche needs stricter proof handling than many local-service sites because fake trust signals are especially damaging here.

Absent approved evidence, the template must suppress:

- board certification claims
- physician or medical-director claims
- years in business
- review counts
- named awards
- named technologies or devices
- financing claims
- guarantees
- clinical outcome claims
- promotional offers framed as live business offers

If proof is missing, the template should fall back to safer trust framing:

- consultation quality
- treatment planning clarity
- comfort and discretion
- clean environment
- clear next steps

## Copy Direction

The copy should feel polished and real, not influencer-style and not generic spa filler.

It should avoid:

- fluffy beauty clichés
- generic self-care slogans
- exaggerated transformation language
- broad “luxury experience” claims with no grounding
- interchangeable wording that could fit a salon, dentist, or law firm

It should sound like:

- a credible local med spa
- premium but not theatrical
- calm, informative, refined
- consultation-first

## Image Direction

The med spa image plan should be archetype-first and compatible with the existing image pipeline.

### Visual tone

- clean
- bright but not blown out
- modern
- premium
- realistic
- not glossy AI glamour

### People and representation

When people appear, images should intentionally represent culturally diverse clients and providers. The archetype should avoid a narrow beauty-aesthetic default and instead reflect a broader, realistic local med spa audience.

This includes diversity across:

- skin tones
- facial features
- presentation styles
- age range within the niche-appropriate band

### Content mix

The image set should favor:

- reception or spa environment
- treatment-room atmosphere
- consultation scenes
- treatment-adjacent closeups
- refined lifestyle or confidence imagery used sparingly

It should avoid:

- over-retouched faces
- exaggerated before/after drama
- text embedded in images
- influencer-style social poses
- surreal perfection or glossy beauty-campaign styling

## Family Architecture

`med-spa-v1` should be the first niche in a new `health-wellness` family.

That family should own:

- med-spa-relevant section defaults
- consultation-led CTA model
- health/wellness proof boundaries
- health/wellness visual guardrails
- family-level render structure

The med spa niche should own:

- med spa vocabulary
- treatment framing
- section copy
- niche proof constraints
- image slot strategy
- seed business values

## Data Flow

The supported lead-preview flow should mirror the existing template-system path:

1. page receives `slug`
2. page resolves a lead when `slug` is a lead UUID
3. helper normalizes the lead industry to `med-spa` or an accepted equivalent
4. helper selects `{ family, template, seed }`
5. helper builds a strict `RenderPackage`
6. page renders the new med spa archetype only when the package is preview-safe
7. unsupported or unsafe leads still fall back to the legacy preview path

The page layer should remain thin. Supported-industry logic belongs in the central helper.

## Testing Strategy

Follow TDD strictly.

### Required failing tests first

1. `health-wellness` family fixture matches schema expectations.
2. `med-spa-v1` niche matches the new family and schema version.
3. med spa seed business does not inject fake proof by default.
4. strict resolver suppresses absent certifications, review counts, awards, financing, guarantees, and testimonial proof.
5. supported-industry helper normalizes med spa variants correctly.
6. lead-preview branching takes the template-system path only for supported preview-safe med spa leads.
7. med spa archetype preview renders through the new family path without affecting blue-collar templates.

### Browser verification

After implementation:

- verify the med spa archetype route
- verify at least one supported med spa lead preview if a suitable lead exists
- confirm unsupported or unsafe leads still fall back cleanly

## Implementation Order

1. Write failing tests for the new family and med spa niche fixture.
2. Add the `health-wellness` family.
3. Add `med-spa-v1` niche and med spa seed business.
4. Write failing tests for strict proof suppression and supported lead mapping.
5. Wire med spa into the supported lead-preview helper.
6. Add the med spa archetype preview route and family renderer path.
7. Run tests, typecheck, and build.
8. Browser-verify the archetype and preview route.
9. After the core template path is stable, define med spa image slots and prompt pack for the image pipeline.

## Risks

- Med spa copy can easily drift into generic beauty filler if the niche vocabulary is too loose.
- The family may be tempted to overfit to med spa in a way that makes later health/wellness niches harder to add.
- Visual direction can become too feminine-coded or too clinical if the canonical tone is not held tightly.
- Proof drift is a serious risk in this niche because fabricated credentials or aesthetic-result claims will make previews feel fake immediately.

## Success Criteria

- `med-spa-v1` exists as the first niche in a new `health-wellness` family.
- The med spa template is consultation-led, premium, and believable.
- The canonical med spa posture is broad enough for local med spa leads without becoming generic.
- Unsupported medical or trust claims are suppressed cleanly in strict mode.
- The archetype preview path works alongside the existing blue-collar templates.
- The image direction includes culturally diverse people when people appear.
