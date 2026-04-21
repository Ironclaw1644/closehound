# Dental Template System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `dental-v1` as the first niche in a new `clinical-care` family, route supported dental previews through the strict template-system path, and finish the archetype through copy-safe rendering and approved archetype imagery.

**Architecture:** Build a new family rather than stretching `health-wellness` or blue-collar. Add a `clinical-care` family fixture, a `dental-v1` niche overlay, one believable seed practice, a family-specific preview adapter, and a clean clinical-modern preview component built with the `frontend-design` skill. Then wire supported dental lead previews through the existing strict resolver path, add dental image slots and Nano Banana 2 generation support, and finish with approval-gated image retrieval.

**Tech Stack:** Next.js App Router, TypeScript, Node test runner, existing template-system resolver, existing lead preview helper, existing Supabase-backed image registry/storage, Gemini Nano Banana 2 image generation, Font Awesome

---

## File Structure

- Create: `src/lib/template-system/families/clinical-care.ts`
  - Family-level `TemplateFamily` for dental and future healthcare-style niches.
- Create: `src/lib/template-system/niches/dental.ts`
  - Canonical `dental-v1` niche template.
- Create: `src/lib/template-system/seeds/dental-seed.ts`
  - Believable single-location dental seed business with no fabricated proof.
- Create: `src/lib/template-system/dental-preview.ts`
  - Family-level `RenderPackage` -> preview model adapter for clinical-care.
- Create: `src/components/site-templates/dental-preview.tsx`
  - Dental preview component using the `frontend-design` skill direction: clean clinical-modern typography, strong visual hierarchy, Font Awesome only.
- Create: `src/app/preview/templates/dental-archetype/page.tsx`
  - Archetype route for `dental-v1` with approved-image retrieval parity.
- Create: `src/lib/template-system/visual-slots/dental.ts`
  - Slot matrix and candidate counts for dental archetype imagery.
- Create: `src/lib/template-system/images/generate-dental.ts`
  - Dental prompt batching and archetype image generation runner.
- Create: `scripts/generate-dental-images.mjs`
  - Internal command for dental Nano Banana 2 generation.
- Modify: `src/lib/template-system/lead-preview.ts`
  - Supported-industry normalization and family/template selection for dental.
- Modify: `src/lib/template-system/resolver.ts`
  - Small family-safe resolver adjustments if dental sections need them.
- Modify: `src/lib/template-system/resolver.test.ts`
  - Add family, niche, seed, suppression, prompt-batch, and route-contract tests.
- Modify: `src/lib/template-system/images/prompts.ts`
  - Add dental prompt batch support.
- Modify: `src/lib/template-system/images/review-registry.ts`
  - Add dental review entry and route metadata.
- Modify: `src/lib/template-system/images/selection.ts`
  - Keep dental archetype aligned with approved-image retrieval helpers if needed.
- Modify: `src/app/preview/[slug]/page.tsx`
  - Route supported dental leads through the template-system helper.

## Task 1: Add failing family, niche, seed, and strict-claim tests

**Files:**
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing tests for the new clinical-care family and dental niche**

Add these imports near the existing family and niche imports in `src/lib/template-system/resolver.test.ts`:

```ts
import { CLINICAL_CARE_FAMILY } from "@/lib/template-system/families/clinical-care";
import { DENTAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/dental";
import { DENTAL_SEED_BUSINESS } from "@/lib/template-system/seeds/dental-seed";
```

Add these tests near the existing family/niche tests:

```ts
test("dental niche matches clinical-care family and schema version", () => {
  assert.equal(DENTAL_NICHE_TEMPLATE.familyKey, CLINICAL_CARE_FAMILY.key);
  assert.equal(
    DENTAL_NICHE_TEMPLATE.expectedSchemaVersion,
    CLINICAL_CARE_FAMILY.schemaVersion
  );
});

test("dental seed business keeps unsupported proof in pending state", () => {
  assert.equal(
    DENTAL_SEED_BUSINESS.conditionalProof.insuranceAccepted?.approvalStatus,
    "pending"
  );
  assert.equal(
    DENTAL_SEED_BUSINESS.conditionalProof.sedationAvailable?.approvalStatus,
    "pending"
  );
  assert.equal(
    DENTAL_SEED_BUSINESS.conditionalProof.emergencyAvailability?.approvalStatus,
    "pending"
  );
});

test("strict resolver suppresses unsupported dental proof claims", () => {
  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.equal(render.status.isPreviewSafe, true);
  assert.equal(render.status.hasSuppressedClaims, true);
  assert.deepEqual(
    render.overrideAudit.suppressed.map((entry) => entry.field),
    [
      "yearsInPractice",
      "doctorCredentials",
      "insuranceAccepted",
      "emergencyAvailability",
      "sameDayAppointments",
      "sedationAvailable",
      "awards",
      "advancedTechnology",
      "specialistPositioning",
      "sampleTestimonials",
    ]
  );
});
```

- [ ] **Step 2: Run the unit tests to verify they fail for missing dental modules**

Run:

```bash
npm run test:unit
```

Expected: FAIL with module resolution errors for `@/lib/template-system/families/clinical-care`, `@/lib/template-system/niches/dental`, and `@/lib/template-system/seeds/dental-seed`.

- [ ] **Step 3: Add the minimal `clinical-care` family fixture**

Create `src/lib/template-system/families/clinical-care.ts`:

```ts
import type { TemplateFamily } from "@/lib/template-system/types";

export const CLINICAL_CARE_FAMILY: TemplateFamily = {
  key: "clinical-care",
  name: "Clinical Care",
  schemaVersion: "1.0.0",
  sampleModePolicy: {
    allowedModes: ["strict", "preview-safe", "seed-only"],
    sectionBehaviorByMode: {
      strict: { testimonials: "hide-unapproved", proofBar: "hide-unapproved" },
      "preview-safe": { testimonials: "hide-unapproved", proofBar: "hide-unapproved" },
      "seed-only": { testimonials: "allow-seed-labeled", proofBar: "allow-seed-labeled" },
    },
    claimBehaviorByMode: {
      strict: { requiresApprovedEvidence: true },
      "preview-safe": { requiresApprovedEvidence: true },
      "seed-only": { requiresApprovedEvidence: false },
    },
    visualBehaviorByMode: {
      strict: { approvedAssetsOnly: true },
      "preview-safe": { approvedAssetsOnly: true },
      "seed-only": { approvedAssetsOnly: false },
    },
  },
  resolverPolicy: {
    criticalFields: ["businessName", "primaryCtaLabel", "primaryCtaHref", "serviceAreaLabel"],
    nonCriticalFields: ["secondaryCtaLabel", "secondaryCtaHref", "contactPhone", "contactEmail"],
  },
  structure: {
    defaultSectionOrder: [
      "hero",
      "featured-services",
      "about",
      "why-choose-us",
      "process",
      "gallery",
      "testimonials",
      "faq",
      "contact",
    ],
    requiredSections: [
      "hero",
      "featured-services",
      "about",
      "why-choose-us",
      "process",
      "faq",
      "contact",
    ],
    optionalSections: ["gallery", "testimonials"],
    sectionPolicies: {},
  },
  conversionModel: {
    ctaStyle: "appointment-led",
    proofStyle: "clarity-heavy",
    contactPriority: ["schedule", "services", "phone"],
    primaryGoal: "consult",
  },
  guardrails: {
    bannedPhrases: [
      "your smile journey",
      "state-of-the-art solutions",
      "healthy smiles for the whole family",
      "compassionate care",
    ],
    bannedClaimTypes: [
      "emergency-availability",
      "sedation",
      "insurance-acceptance",
      "specialist-positioning",
    ],
    visualGuardrails: [
      "no over-retouched smiles",
      "no text embedded in images",
      "people imagery must be culturally diverse",
    ],
    vocabularyRules: [
      "plainspoken dental language",
      "no cosmetic-glam defaults",
      "no corporate healthcare filler",
    ],
  },
  fieldPolicies: {},
  claimPolicies: {},
};
```

- [ ] **Step 4: Add the minimal `dental-v1` niche template and seed business**

Create `src/lib/template-system/niches/dental.ts`:

```ts
import type { NicheTemplate } from "@/lib/template-system/types";

export const DENTAL_NICHE_TEMPLATE: NicheTemplate = {
  key: "dental-v1",
  familyKey: "clinical-care",
  name: "Dental",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "clean clinical-modern",
    typography: {
      headingFamily: "\"Instrument Serif\", Georgia, serif",
      bodyFamily: "\"Manrope\", \"Helvetica Neue\", sans-serif",
      sizingNotes: ["clean hierarchy", "high readability", "clinical-modern restraint"],
    },
    palette: {
      base: ["#f4f7f7", "#ffffff", "#16333b"],
      accents: ["#5e8d96", "#8bb7bc"],
      usageNotes: ["bright neutral base", "keep trust contrast high", "no luxury-gold drift"],
    },
    layoutNotes: ["trust-led", "clean rhythm", "modern local-practice feel"],
  },
  vocabulary: {
    requiredTerms: [
      "cleanings",
      "exams",
      "fillings",
      "crowns",
      "treatment plan",
    ],
    preferredPhrases: [
      "clear explanations",
      "comfortable visits",
      "modern office environment",
    ],
    bannedPhrases: [
      "your smile journey",
      "state-of-the-art solutions",
      "transform your smile",
      "healthy smiles for the whole family",
    ],
    disallowedProofClaims: [
      "same-day care",
      "emergency dentist",
      "sedation available",
      "insurance accepted",
    ],
  },
  seo: {
    metaTitleTemplate: "General Dentistry in {{serviceAreaLabel}} | {{businessName}}",
    metaDescriptionTemplate:
      "Modern general dentistry in {{serviceAreaLabel}} with cleanings, exams, restorative care, and a clear first step for new patients.",
    headingRules: ["trust-led", "plainspoken", "general-practice-first"],
    keywordTargets: ["general dentistry", "cleanings and exams", "restorative dental care"],
  },
  icons: {
    sectionIcons: {
      hero: "stethoscope",
      "featured-services": "tooth",
      about: "building",
      "why-choose-us": "shield-heart",
      process: "clipboard-check",
      gallery: "camera",
      testimonials: "comment-medical",
      faq: "circle-question",
      contact: "calendar-check",
    },
    library: "font-awesome",
  },
  sections: {
    copy: {},
  },
  visuals: {
    strategy: {
      tone: "clean clinical-modern",
      realismRules: ["documentary realism", "no glam smiles", "no embedded text"],
      shotCategories: ["consultation", "care-action", "detail", "office", "team", "gallery"],
      cropRules: {
        hero: "safe center crop for desktop and mobile hero layouts",
        card: "mid-range crop safe for feature cards",
        gallery: "balanced crop for masonry and grid layouts",
      },
      priorities: ["hero", "service", "detail", "workspace", "team", "gallery"],
      assetApprovalRequired: true,
    },
    assets: {
      prompts: [],
    },
  },
  editableModel: {
    lockedFields: [],
    editableFields: [],
    conditionalFields: [],
  },
  leadMapping: {
    directMap: {},
    conditionalMap: {},
    blockedOverrides: [],
  },
  fallbackRules: {
    missingDataRules: [],
    safeRewriteRules: [],
  },
};
```

Create `src/lib/template-system/seeds/dental-seed.ts`:

```ts
import type { SeedBusiness } from "@/lib/template-system/types";

export const DENTAL_SEED_BUSINESS: SeedBusiness = {
  key: "dental-seed-v1",
  nicheTemplateKey: "dental-v1",
  businessProfile: {
    businessName: "Harbor Point Dental",
    serviceAreaLabel: "Raleigh, NC",
    primaryCtaLabel: "Schedule Visit",
    primaryCtaHref: "#contact",
    secondaryCtaLabel: "View Services",
    secondaryCtaHref: "#services",
    contactPhone: "(919) 555-0133",
    contactEmail: "hello@harborpointdental.com",
  },
  conditionalProof: {
    insuranceAccepted: {
      kind: "insuranceAccepted",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    sedationAvailable: {
      kind: "sedationAvailable",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    emergencyAvailability: {
      kind: "emergencyAvailability",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
  },
};
```

- [ ] **Step 5: Run the unit tests to verify the new family and seed pass**

Run:

```bash
npm run test:unit
```

Expected: PASS for the new family/niche/seed tests, with remaining failures only for still-missing dental rendering and lead-preview coverage.

- [ ] **Step 6: Commit the family and niche groundwork**

```bash
git add src/lib/template-system/families/clinical-care.ts src/lib/template-system/niches/dental.ts src/lib/template-system/seeds/dental-seed.ts src/lib/template-system/resolver.test.ts
git commit -m "Add clinical-care family and dental fixtures"
```

## Task 2: Add failing lead-preview mapping tests, then support dental lead routing

**Files:**
- Modify: `src/lib/template-system/resolver.test.ts`
- Modify: `src/lib/template-system/lead-preview.ts`
- Modify: `src/app/preview/[slug]/page.tsx`

- [ ] **Step 1: Write the failing tests for dental industry normalization and support mapping**

Add these tests to `src/lib/template-system/resolver.test.ts` near the existing lead-preview helper coverage:

```ts
test("supported lead preview maps dental industry variants to dental-v1", () => {
  const match = resolveSupportedTemplatePreview({
    leadId: "lead-1",
    industry: "General Dentist",
  });

  assert.equal(match?.template.key, "dental-v1");
  assert.equal(match?.family.key, "clinical-care");
});

test("supported lead preview rejects unsupported dental specialist variants", () => {
  const match = resolveSupportedTemplatePreview({
    leadId: "lead-2",
    industry: "Orthodontist",
  });

  assert.equal(match, null);
});
```

- [ ] **Step 2: Run the unit tests to verify dental lead mapping fails before implementation**

Run:

```bash
npm run test:unit
```

Expected: FAIL because `resolveSupportedTemplatePreview` does not yet normalize dental variants or return `dental-v1`.

- [ ] **Step 3: Implement dental support in the lead-preview helper**

Modify `src/lib/template-system/lead-preview.ts` to add dental normalization alongside the existing supported-industry branches:

```ts
import { CLINICAL_CARE_FAMILY } from "@/lib/template-system/families/clinical-care";
import { DENTAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/dental";
import { DENTAL_SEED_BUSINESS } from "@/lib/template-system/seeds/dental-seed";
```

Add a normalized matcher:

```ts
function isSupportedDentalIndustry(industry: string) {
  const normalized = industry.trim().toLowerCase();

  return [
    "dentist",
    "dental",
    "general dentist",
    "family dentist",
    "family dentistry",
    "general dentistry",
  ].includes(normalized);
}
```

Add the dental branch in `resolveSupportedTemplatePreview(...)`:

```ts
if (isSupportedDentalIndustry(input.industry)) {
  return {
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
  };
}
```

- [ ] **Step 4: Keep the preview route narrow and dental-safe**

Modify `src/app/preview/[slug]/page.tsx` so the existing supported-template path naturally accepts the new dental branch without broadening fallback behavior:

```ts
const templatePreview = resolveSupportedTemplatePreview({
  leadId: lead.id,
  industry: lead.industry ?? "",
});
```

Do not add dental-specific logic to the page layer beyond using the helper result.

- [ ] **Step 5: Run the tests to verify dental lead mapping now passes**

Run:

```bash
npm run test:unit
```

Expected: PASS for dental lead-preview helper tests.

- [ ] **Step 6: Commit the dental lead-preview support**

```bash
git add src/lib/template-system/lead-preview.ts src/app/preview/[slug]/page.tsx src/lib/template-system/resolver.test.ts
git commit -m "Add dental preview mapping"
```

## Task 3: Build the dental preview adapter and component with frontend-design

**Files:**
- Create: `src/lib/template-system/dental-preview.ts`
- Create: `src/components/site-templates/dental-preview.tsx`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing tests for dental preview model output**

Add these imports in `src/lib/template-system/resolver.test.ts`:

```ts
import { buildDentalPreviewModel } from "@/lib/template-system/dental-preview";
```

Add tests:

```ts
test("dental preview model exposes schedule-first CTA labels", () => {
  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const preview = buildDentalPreviewModel(render);

  assert.equal(preview.hero.primaryCta.label, "Schedule Visit");
  assert.equal(preview.hero.secondaryCta?.label, "View Services");
  assert.equal(preview.gallery.heading, "A clean, modern office designed for comfortable visits");
});

test("dental preview model uses Font Awesome icon ids, not emoji", () => {
  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const preview = buildDentalPreviewModel(render);

  assert.equal(preview.hero.badgeIcon, "tooth");
  assert.equal(preview.featuredServices[0]?.icon, "shield-heart");
});
```

- [ ] **Step 2: Run the unit tests to verify the preview adapter is missing**

Run:

```bash
npm run test:unit
```

Expected: FAIL with module resolution error for `@/lib/template-system/dental-preview`.

- [ ] **Step 3: Add the dental preview adapter**

Create `src/lib/template-system/dental-preview.ts`:

```ts
import type { RenderPackage } from "@/lib/template-system/types";

export function buildDentalPreviewModel(render: RenderPackage) {
  return {
    businessName: String(render.resolvedFields.businessName),
    serviceAreaLabel: String(render.resolvedFields.serviceAreaLabel),
    hero: {
      badgeIcon: "tooth",
      primaryCta: {
        label: String(render.resolvedFields.primaryCtaLabel),
        href: String(render.resolvedFields.primaryCtaHref),
      },
      secondaryCta: {
        label: String(render.resolvedFields.secondaryCtaLabel),
        href: String(render.resolvedFields.secondaryCtaHref),
      },
    },
    featuredServices: [
      { icon: "shield-heart" },
      { icon: "tooth" },
      { icon: "calendar-check" },
    ],
    gallery: {
      heading: "A clean, modern office designed for comfortable visits",
    },
  };
}
```

- [ ] **Step 4: Build the dental preview component using frontend-design constraints**

Create `src/components/site-templates/dental-preview.tsx` with:

- clean clinical-modern typography
- no emoji
- Font Awesome icons only
- bright neutral palette
- clear hero, services, process, gallery, FAQ, and contact sections

Use this component shell:

```tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faClipboardCheck,
  faLocationDot,
  faShieldHeart,
  faTooth,
} from "@fortawesome/free-solid-svg-icons";

export function DentalPreview() {
  return <main>...</main>;
}
```

Ensure the typography and spacing fit the niche:

- serif headline support only where it sharpens trust
- clean sans-serif body for readability
- no med-spa lifestyle styling
- no blue-collar visual carryover

- [ ] **Step 5: Run tests and typecheck**

Run:

```bash
npm run test:unit
npm run typecheck
```

Expected: PASS for dental preview model tests and no TS errors.

- [ ] **Step 6: Commit the dental preview adapter and component**

```bash
git add src/lib/template-system/dental-preview.ts src/components/site-templates/dental-preview.tsx src/lib/template-system/resolver.test.ts
git commit -m "Add dental preview component"
```

## Task 4: Add the dental archetype route and browser-safe archetype rendering

**Files:**
- Create: `src/app/preview/templates/dental-archetype/page.tsx`
- Modify: `src/lib/template-system/images/review-registry.ts`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing route-contract tests for the dental archetype**

Add tests to `src/lib/template-system/resolver.test.ts`:

```ts
test("dental review registry exposes the dental archetype route", () => {
  const config = TEMPLATE_IMAGE_REVIEW_REGISTRY.find(
    (entry) => entry.templateKey === "dental-v1"
  );

  assert.equal(config?.previewPath, "/preview/templates/dental-archetype");
});
```

- [ ] **Step 2: Run the unit tests to verify the dental review route metadata is missing**

Run:

```bash
npm run test:unit
```

Expected: FAIL because `dental-v1` is not yet in the image review registry and there is no dental archetype route.

- [ ] **Step 3: Add the dental archetype route**

Create `src/app/preview/templates/dental-archetype/page.tsx` based on the med spa route pattern:

```tsx
import { CLINICAL_CARE_FAMILY } from "@/lib/template-system/families/clinical-care";
import { DENTAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/dental";
import { DENTAL_SEED_BUSINESS } from "@/lib/template-system/seeds/dental-seed";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { DentalPreview } from "@/components/site-templates/dental-preview";

export default async function DentalArchetypePage() {
  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  return <DentalPreview />;
}
```

- [ ] **Step 4: Add dental to the image review registry**

Modify `src/lib/template-system/images/review-registry.ts` to include:

```ts
{
  templateKey: "dental-v1",
  label: "Dental",
  previewPath: "/preview/templates/dental-archetype",
  slotDefinitions: DENTAL_VISUAL_SLOTS,
}
```

- [ ] **Step 5: Run build and verify the dental route compiles**

Run:

```bash
npm run build
```

Expected: PASS with `/preview/templates/dental-archetype` present in the route list.

- [ ] **Step 6: Commit the dental archetype route**

```bash
git add src/app/preview/templates/dental-archetype/page.tsx src/lib/template-system/images/review-registry.ts src/lib/template-system/resolver.test.ts
git commit -m "Add dental archetype route"
```

## Task 5: Add dental visual slots and Nano Banana 2 generation support

**Files:**
- Create: `src/lib/template-system/visual-slots/dental.ts`
- Create: `src/lib/template-system/images/generate-dental.ts`
- Create: `scripts/generate-dental-images.mjs`
- Modify: `src/lib/template-system/images/prompts.ts`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing dental visual-slot and prompt-batch tests**

Add imports to `src/lib/template-system/resolver.test.ts`:

```ts
import { buildDentalPromptBatch } from "@/lib/template-system/images/prompts";
import {
  DENTAL_VISUAL_SLOTS,
  getDentalCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/dental";
```

Add tests:

```ts
test("dental prompt batch uses 3 hero candidates and 2 for non-hero slots", () => {
  const batch = buildDentalPromptBatch({
    familyKey: "clinical-care",
    templateKey: "dental-v1",
    templateVersion: "1.0.0",
  });

  assert.equal(batch.filter((item) => item.slot === "hero").length, 3);
  assert.equal(batch.filter((item) => item.slot === "service-action").length, 2);
});

test("dental visual slots match the 6-slot archetype matrix", () => {
  assert.deepEqual(
    DENTAL_VISUAL_SLOTS.map((slot) => slot.key),
    [
      "hero",
      "service-action",
      "detail-closeup",
      "team-or-workmanship",
      "workspace-or-site",
      "gallery-extra",
    ]
  );

  assert.equal(getDentalCandidateCountForSlot("hero"), 3);
  assert.equal(getDentalCandidateCountForSlot("gallery-extra"), 2);
});
```

- [ ] **Step 2: Run the unit tests to verify dental image helpers are missing**

Run:

```bash
npm run test:unit
```

Expected: FAIL with missing module errors for dental visual-slot and prompt-batch support.

- [ ] **Step 3: Add dental visual slots**

Create `src/lib/template-system/visual-slots/dental.ts` with a slot matrix matching the existing six-slot contract and dental-specific prompt intents:

```ts
import type { ArchetypeVisualSlot } from "@/lib/template-system/images/types";

export const DENTAL_VISUAL_SLOTS: ArchetypeVisualSlot[] = [
  {
    key: "hero",
    required: true,
    aspectRatio: "16:9",
    cropNotes: "safe center crop for desktop and mobile hero layouts",
    promptIntent:
      "culturally diverse dental consultation scene in a clean clinical-modern office",
    negativePrompt:
      "embedded text, fake logo, over-retouched smile, glam ad look, surreal lighting",
  },
  {
    key: "service-action",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "mid-range treatment frame safe for service cards",
    promptIntent:
      "dentist or hygienist performing a realistic exam or treatment moment in a modern local practice",
    negativePrompt:
      "embedded text, fake logo, exaggerated whitening, theatrical smile pose",
  },
  {
    key: "detail-closeup",
    required: true,
    aspectRatio: "4:3",
    cropNotes: "tight detail crop showing clean tools, tray setup, or exam detail",
    promptIntent:
      "close-up dental detail with clean instruments, tray setup, or modern exam-room texture",
    negativePrompt:
      "embedded text, fake logo, gore, unsettling medical detail, glossy ad polish",
  },
  {
    key: "team-or-workmanship",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "provider or patient interaction crop for supporting gallery content",
    promptIntent:
      "dentist or hygienist in a patient-comfort or consultation moment with culturally diverse subjects",
    negativePrompt:
      "embedded text, fake logo, cartoon smile, glam campaign look",
  },
  {
    key: "workspace-or-site",
    required: false,
    aspectRatio: "4:3",
    cropNotes: "environment crop for office or reception support content",
    promptIntent:
      "clean modern dental reception or treatment room with bright neutral atmosphere",
    negativePrompt:
      "embedded text, fake logo, hospital-like coldness, impossible room proportions",
  },
  {
    key: "gallery-extra",
    required: false,
    aspectRatio: "1:1",
    cropNotes: "square crop for optional supporting gallery tile",
    promptIntent:
      "extra dental visual showing a calm provider-patient interaction or refined office detail",
    negativePrompt:
      "embedded text, fake logo, over-retouched smile, stock-photo stiffness",
  },
];

const DENTAL_CANDIDATE_COUNTS: Record<ArchetypeVisualSlot[\"key\"], number> = {
  hero: 3,
  "service-action": 2,
  "detail-closeup": 2,
  "team-or-workmanship": 2,
  "workspace-or-site": 2,
  "gallery-extra": 2,
};

export function getDentalCandidateCountForSlot(
  slotKey: ArchetypeVisualSlot["key"]
) {
  return DENTAL_CANDIDATE_COUNTS[slotKey];
}
```

- [ ] **Step 4: Add dental prompt-batch and generation support**

Modify `src/lib/template-system/images/prompts.ts` to import dental slots and add:

```ts
export type DentalPromptBatchInput = RoofingPromptBatchInput;
export type DentalPromptBatchItem = RoofingPromptBatchItem;

export function buildDentalPromptBatch(
  input: DentalPromptBatchInput
): DentalPromptBatchItem[] {
  return buildPromptBatch({
    ...input,
    slots: DENTAL_VISUAL_SLOTS,
    getCandidateCountForSlot: getDentalCandidateCountForSlot,
  });
}
```

Create `src/lib/template-system/images/generate-dental.ts`:

```ts
import {
  createArchetypeGenerationBatch,
  runArchetypeGenerationBatch,
  type ArchetypeGenerationBatch,
} from "@/lib/template-system/images/generate-archetype";
import {
  buildDentalPromptBatch,
  type DentalPromptBatchInput,
  type DentalPromptBatchItem,
} from "@/lib/template-system/images/prompts";

export type DentalGenerationBatch = ArchetypeGenerationBatch<DentalPromptBatchItem>;

export function createDentalGenerationBatch(
  input: DentalPromptBatchInput & { createdBy: string }
): DentalGenerationBatch {
  return createArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildDentalPromptBatch(input),
  });
}

export async function runDentalGenerationBatch(
  input: DentalPromptBatchInput & { createdBy: string }
) {
  return runArchetypeGenerationBatch({
    createdBy: input.createdBy,
    items: buildDentalPromptBatch(input),
  });
}
```

Create `scripts/generate-dental-images.mjs`:

```js
import "./register-ts-path-loader.mjs";

const [{ runDentalGenerationBatch }] = await Promise.all([
  import("../src/lib/template-system/images/generate-dental.ts"),
]);

const result = await runDentalGenerationBatch({
  familyKey: "clinical-care",
  templateKey: "dental-v1",
  templateVersion: "1.0.0",
  createdBy: process.env.USER || "internal-command",
});

console.log(JSON.stringify(result, null, 2));
```

- [ ] **Step 5: Run the unit tests and typecheck**

Run:

```bash
npm run test:unit
npm run typecheck
```

Expected: PASS for the dental prompt-batch and visual-slot contract tests.

- [ ] **Step 6: Commit the dental image-generation groundwork**

```bash
git add src/lib/template-system/visual-slots/dental.ts src/lib/template-system/images/prompts.ts src/lib/template-system/images/generate-dental.ts scripts/generate-dental-images.mjs src/lib/template-system/resolver.test.ts
git commit -m "Add dental image generation support"
```

## Task 6: Generate dental images, approve one per slot, and verify archetype rendering

**Files:**
- Modify: `src/app/preview/templates/dental-archetype/page.tsx`
- Modify: `src/lib/template-system/images/review-registry.ts`
- Runtime only: Supabase image records and storage assets

- [ ] **Step 1: Update the dental archetype route to consume approved candidates**

Modify `src/app/preview/templates/dental-archetype/page.tsx` to mirror the approved-image retrieval path used by med spa:

```tsx
import { resolveApprovedArchetypeImageCandidates } from "@/lib/template-system/images/selection";
import { DENTAL_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/dental";
```

Use:

```tsx
const approvedImageCandidates = await resolveApprovedArchetypeImageCandidates({
  templateKey: "dental-v1",
  requestedBatch,
  hasRequestedBatch,
  slotDefinitions: DENTAL_VISUAL_SLOTS,
});
```

Pass `approvedImageCandidates` into `resolveTemplateRender(...)`.

- [ ] **Step 2: Run dental generation**

Run:

```bash
node --env-file=.env.local scripts/generate-dental-images.mjs
```

Expected: JSON output with one `generationBatchId` and 13 generated candidates across the 6-slot matrix.

- [ ] **Step 3: Review and approve one candidate per slot**

Inspect:

```bash
curl -s http://127.0.0.1:3003/internal/template-images/dental-v1
```

Approve the selected candidates:

```bash
node --env-file=.env.local scripts/approve-template-image.mjs <hero-id>
node --env-file=.env.local scripts/approve-template-image.mjs <service-id>
node --env-file=.env.local scripts/approve-template-image.mjs <detail-id>
node --env-file=.env.local scripts/approve-template-image.mjs <team-id>
node --env-file=.env.local scripts/approve-template-image.mjs <workspace-id>
node --env-file=.env.local scripts/approve-template-image.mjs <gallery-id>
```

Expected: each command returns `status: "approved"` with the matching `assetUrl`.

- [ ] **Step 4: Verify the dental archetype route renders the approved hero asset**

Run:

```bash
curl -s http://127.0.0.1:3003/preview/templates/dental-archetype
```

Expected: HTML containing a preload or `<img>` URL under `template-images/dental-v1/<generationBatchId>/hero-`.

- [ ] **Step 5: Run the final typecheck and build**

Run:

```bash
npm run typecheck
npm run build
```

Expected: PASS with `/preview/templates/dental-archetype` in the build route output.

- [ ] **Step 6: Commit the finished dental archetype slice**

```bash
git add src/app/preview/templates/dental-archetype/page.tsx src/lib/template-system/images/review-registry.ts
git commit -m "Finish dental archetype"
```

## Self-Review

- Spec coverage:
  - canonical family split: Task 1
  - dental lead-preview integration: Task 2
  - clean clinical-modern renderer with `frontend-design`: Task 3
  - Font Awesome-only iconography: Task 3
  - dental archetype route: Task 4
  - dental image slots and Nano Banana 2 support: Task 5
  - approved-image rendering and end-to-end verification: Task 6
- Placeholder scan:
  - No `TODO`, `TBD`, or deferred “implement later” language remains in task steps.
- Type consistency:
  - Uses `clinical-care`, `dental-v1`, `DENTAL_SEED_BUSINESS`, `DENTAL_VISUAL_SLOTS`, and `buildDentalPromptBatch` consistently across all tasks.
