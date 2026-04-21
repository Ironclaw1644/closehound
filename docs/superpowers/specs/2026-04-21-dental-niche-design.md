# Dental Niche Design

## Goal

Add the first `dental` archetype to the template system as a believable, client-preview-safe website for a local practice that likely does not already have a strong website. This template should expand the system into a new clinical-care family with a tone and conversion model that differ from both the blue-collar service templates and the med spa template.

The first dental archetype should be broad, grounded, and easy to personalize later from real lead data. It should look and sound like a real local office, not a chain franchise, cosmetic veneer brand, or generic healthcare placeholder.

## Canonical Positioning

The first canonical posture is:

- `general family dentistry`
- `single-location local practice`
- `clean clinical-modern`
- primary CTA: `Schedule Visit`

This version should present the office as a trustworthy local practice that handles routine preventive care, common restorative needs, and a practical first-visit experience. It should not lead with luxury, smile-makeover language, or high-ticket specialist positioning.

This posture is the best base because it covers the widest set of real dental leads without overfitting to pediatric, cosmetic, implant, or emergency-first positioning. It also keeps the first template believable in the absence of richer real-world proof.

## Family Direction

Dental should not live in the `health-wellness` family. It should be the first niche in a new `clinical-care` family.

That family should support:

- trust-led hero structure
- high-clarity service presentation
- patient-comfort and environment reassurance
- consultation and appointment scheduling flows
- stricter claim and credential handling than med spa

The family renderer should feel clean, modern, and clinical without looking cold or corporate. Typography should support authority and readability first, with less lifestyle styling than med spa. Font Awesome should be used for iconography throughout, never emoji.

## Conversion Model

The page should convert through calm trust and clarity rather than urgency or promotional pressure.

Primary CTA:

- `Schedule Visit`

Secondary CTA:

- `View Services`

This CTA pairing works well for a general dentistry site because it supports both patients who are ready to book and those who want to confirm the office offers the care they need before reaching out.

The page should not imply emergency availability, same-day treatment, sedation, insurance acceptance, or specialist services unless lead data or approved proof supports those claims.

## Section Strategy

Recommended section order:

- header / nav
- hero
- featured services
- about the practice
- why patients choose this office
- what to expect on your visit
- office / environment gallery
- testimonials
- FAQ
- location / contact
- footer

### Hero

The hero should lead with practical, confidence-building dental care rather than cosmetic aspiration. It should communicate:

- clear care
- modern office feel
- easy first step for new patients

The top-of-page impression should feel trustworthy, clean, and locally grounded.

### Featured Services

The first dental archetype should include a small, credible service mix rather than a long menu. The core slots should cover:

- preventive care: exams and cleanings
- restorative care: fillings, crowns, repair planning
- a flexible third slot for later adaptation, likely cosmetic-support or urgent-visit support

The initial archetype copy should stay general-practice-first and describe real dental work in plain language.

### About The Practice

This section should frame the office as a local, patient-centered practice with a modern environment and straightforward communication style. It should avoid invented history or generic “caring team” filler.

### Why Patients Choose This Office

This section should lean on safe trust themes:

- clear explanations
- comfortable visit experience
- modern, organized office
- practical treatment planning

If stronger proof is missing, the section should not compensate with inflated adjectives.

### What To Expect On Your Visit

This process section matters for dentistry because many new patients want to know what happens before they commit. It should explain the first visit in calm, concrete steps and reduce friction around booking.

### Office / Environment Gallery

This should be more important than in blue-collar templates. A clean, modern office environment helps establish trust quickly. The gallery should emphasize bright rooms, clean finishes, organized treatment spaces, and patient-provider interaction that feels real rather than staged.

### Testimonials

These stay conditional and must follow existing proof policy. No fake quote should appear as real patient testimony in a strict render.

### FAQ

The FAQ should answer practical first-patient questions:

- whether new patients are welcome
- what happens at the first visit
- whether common services are handled in-office

Questions should sound like real local-practice patient concerns, not dental-marketing boilerplate.

### Location / Contact

This should reinforce local trust and make the next step obvious. Contact presentation should feel simple and reassuring.

## Copy Direction

The copy should sound like a real local dental office:

- plainspoken
- calm
- clear
- practical

It should not sound like:

- cosmetic marketing copy
- wellness copy
- corporate healthcare filler
- internal template language

Avoid phrases like:

- “your smile journey”
- “state-of-the-art solutions”
- “compassionate care” without context
- “healthy smiles for the whole family” unless grounded in real supporting copy
- any line that could fit a med spa, dentist, optometrist, and chiropractor equally

Every service description should describe actual dental care work rather than vague outcomes.

## Proof And Claim Policy

Dental should use a strict proof model. By default, the archetype must not invent or imply:

- years in practice
- number of patients served
- doctor credentials beyond what is supplied
- emergency availability
- same-day appointments
- sedation options
- insurance acceptance
- awards
- advanced technology claims
- specialist positioning

If proof data is missing, the page should fall back to:

- clear communication
- practical first-visit expectations
- clean office environment
- measured treatment planning
- patient comfort framing

The template should never compensate for missing proof with exaggerated trust language.

## Visual Direction

The visual language should be:

- clean clinical-modern
- bright neutral palette
- warm but restrained
- high readability
- premium enough to feel current, but not boutique

This should not skew:

- pediatric
- cosmetic-glam
- overly luxurious
- cold, hospital-like

Typography should support authority and clarity, with strong headline structure and clean supporting body text. The design should feel more clinical and structured than med spa, but less institutional than a hospital brand.

## Image Direction

The dental image system should use the same app-integrated, approval-gated image pipeline already established for the current archetypes.

Core visual slots should be:

- hero consultation / patient-provider interaction
- care-in-action / exam or treatment moment
- detail close-up / tools, tray, or clean setup
- office / reception environment
- optional team or patient interaction
- optional gallery extra

Image rules:

- realistic commercial/documentary feel
- no fake ad-glam styling
- no over-retouched smiles
- no embedded text
- no fake logos
- no exaggerated whitening or cosmetic-result imagery
- culturally diverse people when people appear

The images should feel like real dental-office photography, not generic stock smiles with impossible polish.

## Lead Preview Integration Scope

The first implementation slice should follow the established archetype path:

- create a new family fixture for clinical-care
- add `dental-v1` niche template
- add dental seed business
- add resolver support
- add a dental archetype preview route
- wire supported lead-preview mapping
- verify in browser
- then add visual slots, prompt generation, Nano Banana 2 image generation, approval, and retrieval

This should be done as a proper new family, not by stretching the med spa renderer.

## Success Criteria

The first dental archetype is successful if:

- it reads like a real local dental office
- it avoids AI/internal/template language
- it feels distinct from med spa
- it stays safe under strict claim policy
- it renders credibly for client previews before heavy personalization
- it can later absorb real lead data without structural rework
