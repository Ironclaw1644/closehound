# Med Spa Template System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `med-spa-v1` as the first niche in a new `health-wellness` family, route supported med spa previews through the strict template-system path, and verify the new archetype preview end to end.

**Architecture:** Build a new family rather than stretching the blue-collar renderer. Add the `health-wellness` family fixture, a `med-spa-v1` niche overlay, and one believable seed business, then wire supported lead previews through the existing strict resolver contract with a family-specific preview adapter and archetype route. Keep the blast radius narrow: no job-runner changes, no storage changes, and no med spa image generation yet.

**Tech Stack:** Next.js App Router, TypeScript, Node test runner, existing template-system resolver, existing lead preview helper, existing Supabase-backed lead lookup

---

## File Structure

- Create: `src/lib/template-system/families/health-wellness.ts`
  - Family-level `TemplateFamily` for med spa and later health/wellness niches.
- Create: `src/lib/template-system/niches/med-spa.ts`
  - Canonical `med-spa-v1` niche template.
- Create: `src/lib/template-system/seeds/med-spa-seed.ts`
  - Believable single-location med spa seed business with no fabricated proof.
- Create: `src/lib/template-system/med-spa-preview.ts`
  - Family-level `RenderPackage` -> preview model adapter for health/wellness.
- Create: `src/components/site-templates/med-spa-preview.tsx`
  - Family-level med spa preview component.
- Create: `src/app/preview/templates/med-spa-archetype/page.tsx`
  - Archetype route for the med spa template.
- Modify: `src/lib/template-system/lead-preview.ts`
  - Supported-industry normalization and family/template selection for med spa.
- Modify: `src/lib/template-system/resolver.ts`
  - Small family-safe resolver changes if med spa sections or defaults need them.
- Modify: `src/lib/template-system/resolver.test.ts`
  - Add family, niche, seed, suppression, lead mapping, and preview-model tests.
- Modify: `src/app/preview/[slug]/page.tsx`
  - Route supported med spa leads through the template-system helper.

## Task 1: Add failing family, niche, and strict-proof tests

**Files:**
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing tests for the new family, med spa niche, and strict proof suppression**

Add these imports near the top of `src/lib/template-system/resolver.test.ts`:

```ts
import { HEALTH_WELLNESS_FAMILY } from "@/lib/template-system/families/health-wellness";
import { MED_SPA_NICHE_TEMPLATE } from "@/lib/template-system/niches/med-spa";
import { MED_SPA_SEED_BUSINESS } from "@/lib/template-system/seeds/med-spa-seed";
```

Add these tests near the existing family/niche tests:

```ts
test("med spa niche matches health-wellness family and schema version", () => {
  assert.equal(MED_SPA_NICHE_TEMPLATE.familyKey, HEALTH_WELLNESS_FAMILY.key);
  assert.equal(
    MED_SPA_NICHE_TEMPLATE.expectedSchemaVersion,
    HEALTH_WELLNESS_FAMILY.schemaVersion
  );
});

test("med spa seed business does not pre-approve fabricated proof", () => {
  assert.equal(
    MED_SPA_SEED_BUSINESS.conditionalProof.boardCertification?.approvalStatus,
    "pending"
  );
  assert.equal(
    MED_SPA_SEED_BUSINESS.conditionalProof.reviewCount?.approvalStatus,
    "pending"
  );
  assert.equal(
    MED_SPA_SEED_BUSINESS.conditionalProof.promotionalOffer?.approvalStatus,
    "pending"
  );
});

test("strict resolver suppresses absent med spa proof claims", () => {
  const render = resolveTemplateRender({
    family: HEALTH_WELLNESS_FAMILY,
    template: MED_SPA_NICHE_TEMPLATE,
    seed: MED_SPA_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.equal(render.status.isPreviewSafe, true);
  assert.equal(render.status.hasSuppressedClaims, true);
  assert.deepEqual(
    render.overrideAudit.suppressed.map((entry) => entry.field),
    [
      "boardCertification",
      "medicalDirector",
      "yearsInBusiness",
      "reviewCount",
      "namedAwards",
      "namedTechnologies",
      "financing",
      "guarantees",
      "clinicalOutcomeClaims",
      "sampleTestimonials",
      "promotionalOffer",
    ]
  );
});
```

- [ ] **Step 2: Run the unit tests to verify they fail for missing med spa modules**

Run:

```bash
npm run test:unit
```

Expected: FAIL with module resolution errors for `@/lib/template-system/families/health-wellness`, `@/lib/template-system/niches/med-spa`, and `@/lib/template-system/seeds/med-spa-seed`.

- [ ] **Step 3: Add the minimal `health-wellness` family fixture**

Create `src/lib/template-system/families/health-wellness.ts`:

```ts
import type { TemplateFamily } from "@/lib/template-system/types";

export const HEALTH_WELLNESS_FAMILY: TemplateFamily = {
  key: "health-wellness",
  name: "Health & Wellness",
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
      "featured-treatments",
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
      "featured-treatments",
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
    ctaStyle: "consultation-led",
    proofStyle: "process-heavy",
    contactPriority: ["consultation", "treatments", "phone"],
    primaryGoal: "consult",
  },
  guardrails: {
    bannedPhrases: [
      "cutting-edge",
      "tailored solutions",
      "transform your look",
      "luxury experience unlike any other",
    ],
    bannedClaimTypes: [
      "board-certification",
      "medical-director",
      "guaranteed-results",
      "clinical-outcome",
    ],
    visualGuardrails: [
      "no glossy AI glamour",
      "no text embedded in images",
      "people imagery must be culturally diverse",
    ],
    vocabularyRules: [
      "consultation-led",
      "no urgency theater",
      "no promo-led default copy",
    ],
  },
  fieldPolicies: {},
  claimPolicies: {},
};
```

- [ ] **Step 4: Add the minimal `med-spa-v1` niche fixture**

Create `src/lib/template-system/niches/med-spa.ts`:

```ts
import type { NicheTemplate } from "@/lib/template-system/types";

export const MED_SPA_NICHE_TEMPLATE: NicheTemplate = {
  key: "med-spa-v1",
  familyKey: "health-wellness",
  name: "Med Spa",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "gender-neutral clinical-premium",
    typography: {
      headingFamily: "var(--font-geist-sans)",
      bodyFamily: "var(--font-geist-sans)",
      sizingNotes: ["refined hero", "calm section rhythm"],
    },
    palette: {
      base: ["#f7f3ef", "#ffffff", "#1f2937"],
      accents: ["#b08968", "#8aa29e"],
      usageNotes: ["keep contrast high", "avoid pink-coded defaults"],
    },
    layoutNotes: ["consultation-led", "clean spacing", "premium without luxury-theater"],
  },
  vocabulary: {
    requiredTerms: [
      "consultation",
      "treatment plan",
      "injectables",
      "skin rejuvenation",
      "facial aesthetics",
    ],
    preferredPhrases: [
      "thoughtful treatment planning",
      "natural-looking goals",
      "comfortable, refined setting",
    ],
    bannedPhrases: [
      "ageless beauty",
      "perfect results",
      "transform your face",
      "pamper yourself",
    ],
    disallowedProofClaims: [
      "board certified",
      "medical director on site",
      "guaranteed results",
      "award-winning technology",
    ],
  },
  seo: {
    metaTitleTemplate: "{{serviceAreaLabel}} Med Spa | {{businessName}}",
    metaDescriptionTemplate:
      "{{businessName}} offers consultation-led injectables, skin rejuvenation, and aesthetic treatments in {{serviceAreaLabel}}.",
    headingRules: ["mention med spa and geography in hero", "keep treatment language specific"],
    keywordTargets: [
      "med spa",
      "injectables",
      "skin rejuvenation",
      "aesthetic consultation",
    ],
  },
  sections: {
    copy: {
      hero: {
        variantKey: "default",
        heading: "Refined aesthetic care that starts with a thoughtful consultation",
        body: "{{businessName}} helps clients in {{serviceAreaLabel}} explore injectables, skin treatments, and rejuvenation services in a calm, polished setting.",
        cta: { label: "Book Consultation", action: "consult" },
      },
      "featured-treatments": {
        variantKey: "default",
        heading: "Featured treatments",
        items: [
          { title: "Injectables", body: "Consultation-led injectable treatments focused on balanced, natural-looking results." },
          { title: "Skin Rejuvenation", body: "Treatment plans centered on tone, texture, and long-term skin goals." },
          { title: "Facial Aesthetics", body: "Curated services designed to support confidence through a refined, individualized approach." },
        ],
      },
      about: {
        variantKey: "default",
        heading: "A med spa experience built around clarity and comfort",
        body: "The template should emphasize treatment planning, discretion, and a polished environment rather than hype or discount language.",
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "Why clients choose this practice",
        items: [
          { title: "Consultation-first approach", body: "Start with goals, timing, and suitability before selecting a treatment path." },
          { title: "Refined treatment planning", body: "Keep recommendations measured and centered on natural-looking outcomes." },
          { title: "Comfortable environment", body: "Use environment, discretion, and care experience as trust signals when hard proof is absent." },
        ],
      },
      process: {
        variantKey: "default",
        heading: "What the consultation process looks like",
        items: [
          { title: "Start with your goals", body: "Review priorities, comfort level, and where you want to begin." },
          { title: "Build a treatment plan", body: "Talk through suitable treatment categories and what to expect next." },
          { title: "Schedule with clarity", body: "Confirm the next visit, follow-up expectations, and how the plan moves forward." },
        ],
      },
      faq: {
        variantKey: "default",
        heading: "Questions clients ask before booking",
        faqItems: [
          { question: "Do I need a consultation before treatment?", answer: "The template should default to consultation-led positioning so first-time visitors know what to expect before booking." },
          { question: "How do I know which treatment is right for me?", answer: "The practice should be framed around treatment planning rather than one-size-fits-all beauty language." },
        ],
      },
      contact: {
        variantKey: "default",
        heading: "Book your consultation",
        body: "Reach out to talk through treatment goals, timing, and the best first step for your visit.",
        cta: { label: "Book Consultation", action: "consult" },
      },
    },
  },
  editableModel: {
    lockedFields: ["sectionOrder", "claimPolicy", "imageStyleRules"],
    editableFields: [
      "businessName",
      "serviceAreaLabel",
      "contactPhone",
      "contactEmail",
      "primaryCtaLabel",
      "primaryCtaHref",
      "secondaryCtaLabel",
      "secondaryCtaHref",
    ],
    conditionalFields: [
      "boardCertification",
      "medicalDirector",
      "yearsInBusiness",
      "reviewCount",
      "namedAwards",
      "namedTechnologies",
      "financing",
      "guarantees",
      "clinicalOutcomeClaims",
      "sampleTestimonials",
      "promotionalOffer",
    ],
  },
};
```

- [ ] **Step 5: Add the minimal med spa seed business**

Create `src/lib/template-system/seeds/med-spa-seed.ts`:

```ts
import type { SeedBusiness } from "@/lib/template-system/types";

export const MED_SPA_SEED_BUSINESS: SeedBusiness = {
  key: "lumen-aesthetics-raleigh",
  nicheTemplateKey: "med-spa-v1",
  businessProfile: {
    businessName: "Lumen Aesthetics Studio",
    serviceAreaLabel: "Raleigh, NC",
    contactPhone: "(919) 555-0142",
    contactEmail: "hello@lumenaesthetics.com",
    primaryCtaLabel: "Book Consultation",
    primaryCtaHref: "#contact",
    secondaryCtaLabel: "View Treatments",
    secondaryCtaHref: "#featured-treatments",
  },
  conditionalProof: {
    boardCertification: {
      kind: "credential-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    medicalDirector: {
      kind: "medical-oversight-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    yearsInBusiness: {
      kind: "years-in-business",
      value: 0,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    reviewCount: {
      kind: "review-count",
      value: 0,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    promotionalOffer: {
      kind: "promo-offer",
      value: "",
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
  },
};
```

- [ ] **Step 6: Run the unit tests to verify the new family and fixtures pass**

Run:

```bash
npm run test:unit
```

Expected: PASS for the new family/niche/seed tests, with no regression in the existing template-system tests.

- [ ] **Step 7: Commit the family and med spa fixture base**

```bash
git add src/lib/template-system/families/health-wellness.ts src/lib/template-system/niches/med-spa.ts src/lib/template-system/seeds/med-spa-seed.ts src/lib/template-system/resolver.test.ts
git commit -m "Add health-wellness family and med spa fixtures"
```

## Task 2: Add failing supported-lead mapping tests for med spa

**Files:**
- Modify: `src/lib/template-system/resolver.test.ts`
- Modify: `src/lib/template-system/lead-preview.ts`

- [ ] **Step 1: Write the failing tests for med spa lead normalization and supported mapping**

Add these tests to `src/lib/template-system/resolver.test.ts` near the existing lead-preview helper tests:

```ts
test("supported lead preview helper normalizes med spa variants", async () => {
  assert.equal(normalizeSupportedIndustry("med spa"), "med-spa");
  assert.equal(normalizeSupportedIndustry("medspa"), "med-spa");
  assert.equal(normalizeSupportedIndustry("medical spa"), "med-spa");
  assert.equal(normalizeSupportedIndustry("aesthetic med spa"), "med-spa");
});

test("supported lead preview helper resolves med spa leads through template system", async () => {
  const result = await resolveSupportedLeadTemplatePreview({
    lead: {
      id: crypto.randomUUID(),
      business_name: "Sample Med Spa",
      industry: "medical spa",
      city: "Raleigh",
      state: "NC",
      phone: "(919) 555-0199",
      email: "hello@example.com",
    },
  });

  assert.equal(result.supported, true);
  assert.equal(result.templateKey, "med-spa-v1");
  assert.equal(result.familyKey, "health-wellness");
  assert.equal(result.renderPackage?.status.isPreviewSafe, true);
});
```

- [ ] **Step 2: Run the unit tests to verify they fail for missing med spa mapping**

Run:

```bash
npm run test:unit
```

Expected: FAIL because med spa normalization and family selection are not implemented in the supported lead-preview helper yet.

- [ ] **Step 3: Extend the supported lead-preview helper for med spa**

Modify `src/lib/template-system/lead-preview.ts` by:

1. extending `normalizeSupportedIndustry(...)`
2. extending the supported family/template mapping

Use this med spa normalization branch:

```ts
if (
  normalized === "med spa" ||
  normalized === "medspa" ||
  normalized === "medical spa" ||
  normalized === "aesthetic med spa"
) {
  return "med-spa";
}
```

Use this family/template/seed selection branch in the main helper:

```ts
if (normalizedIndustry === "med-spa") {
  return {
    supported: true,
    familyKey: HEALTH_WELLNESS_FAMILY.key,
    templateKey: MED_SPA_NICHE_TEMPLATE.key,
    renderPackage: resolveTemplateRender({
      family: HEALTH_WELLNESS_FAMILY,
      template: MED_SPA_NICHE_TEMPLATE,
      seed: MED_SPA_SEED_BUSINESS,
      leadRecord,
      sampleMode: "strict",
    }),
  };
}
```

Keep the current rule intact: if the resolved package is not preview-safe, the helper must return unsupported so `/preview/[slug]` can fall back cleanly.

- [ ] **Step 4: Run the unit tests to verify med spa mapping passes**

Run:

```bash
npm run test:unit
```

Expected: PASS for the med spa mapping tests and all prior supported-niche tests.

- [ ] **Step 5: Commit the med spa lead-preview mapping**

```bash
git add src/lib/template-system/lead-preview.ts src/lib/template-system/resolver.test.ts
git commit -m "Add med spa lead preview mapping"
```

## Task 3: Add failing med spa preview adapter and component tests

**Files:**
- Modify: `src/lib/template-system/resolver.test.ts`
- Create: `src/lib/template-system/med-spa-preview.ts`
- Create: `src/components/site-templates/med-spa-preview.tsx`

- [ ] **Step 1: Write the failing tests for med spa preview model behavior**

Add this test to `src/lib/template-system/resolver.test.ts`:

```ts
import { buildMedSpaPreviewModel } from "@/lib/template-system/med-spa-preview";
```

```ts
test("med spa preview model is consultation-led and treatment-curated", () => {
  const render = resolveTemplateRender({
    family: HEALTH_WELLNESS_FAMILY,
    template: MED_SPA_NICHE_TEMPLATE,
    seed: MED_SPA_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const preview = buildMedSpaPreviewModel(render);

  assert.equal(preview.primaryCtaLabel, "Book Consultation");
  assert.equal(preview.secondaryCtaLabel, "View Treatments");
  assert.equal(preview.sectionKeys.includes("featured-treatments"), true);
  assert.equal(preview.sectionKeys.includes("process"), true);
  assert.equal(preview.sectionKeys.includes("gallery"), true);
});
```

- [ ] **Step 2: Run the unit tests to verify they fail for the missing preview adapter**

Run:

```bash
npm run test:unit
```

Expected: FAIL with a missing module error for `@/lib/template-system/med-spa-preview`.

- [ ] **Step 3: Add the minimal med spa preview adapter**

Create `src/lib/template-system/med-spa-preview.ts`:

```ts
import type { RenderPackage } from "@/lib/template-system/types";

export function buildMedSpaPreviewModel(render: RenderPackage) {
  return {
    businessName: String(render.resolvedFields.businessName ?? ""),
    serviceAreaLabel: String(render.resolvedFields.serviceAreaLabel ?? ""),
    primaryCtaLabel: String(render.resolvedFields.primaryCtaLabel ?? "Book Consultation"),
    primaryCtaHref: String(render.resolvedFields.primaryCtaHref ?? "#contact"),
    secondaryCtaLabel: String(render.resolvedFields.secondaryCtaLabel ?? "View Treatments"),
    secondaryCtaHref: String(render.resolvedFields.secondaryCtaHref ?? "#featured-treatments"),
    sectionKeys: Object.keys(render.resolvedSections),
    sections: render.resolvedSections,
    visuals: render.resolvedVisuals,
  };
}
```

- [ ] **Step 4: Add the minimal med spa preview component**

Create `src/components/site-templates/med-spa-preview.tsx`:

```tsx
type MedSpaPreviewModel = ReturnType<typeof import("@/lib/template-system/med-spa-preview").buildMedSpaPreviewModel>;

export function MedSpaPreview({ model }: { model: MedSpaPreviewModel }) {
  const hero = model.sections.hero;
  const treatments = model.sections["featured-treatments"];
  const process = model.sections.process;
  const faq = model.sections.faq;
  const contact = model.sections.contact;

  return (
    <main className="min-h-screen bg-[#f7f3ef] text-slate-900">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
          {model.serviceAreaLabel}
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight">
          {hero?.heading}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          {hero?.body}
        </p>
        <div className="mt-8 flex gap-4">
          <a href={model.primaryCtaHref} className="rounded-full bg-slate-950 px-6 py-3 font-semibold text-white">
            {model.primaryCtaLabel}
          </a>
          <a href={model.secondaryCtaHref} className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-800">
            {model.secondaryCtaLabel}
          </a>
        </div>
      </section>

      <section id="featured-treatments" className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-3xl font-semibold tracking-tight">{treatments?.heading}</h2>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-3xl font-semibold tracking-tight">{process?.heading}</h2>
      </section>

      <section id="contact" className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="text-3xl font-semibold tracking-tight">{contact?.heading}</h2>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Run the unit tests to verify the preview adapter test passes**

Run:

```bash
npm run test:unit
```

Expected: PASS for the new med spa preview-model test.

- [ ] **Step 6: Commit the med spa preview adapter and component**

```bash
git add src/lib/template-system/med-spa-preview.ts src/components/site-templates/med-spa-preview.tsx src/lib/template-system/resolver.test.ts
git commit -m "Add med spa preview adapter"
```

## Task 4: Wire archetype route and `/preview/[slug]` integration

**Files:**
- Create: `src/app/preview/templates/med-spa-archetype/page.tsx`
- Modify: `src/app/preview/[slug]/page.tsx`

- [ ] **Step 1: Write the failing route-level tests or helper assertions for med spa archetype usage**

If `resolver.test.ts` already covers the helper behavior, add one more assertion:

```ts
test("supported med spa renders the health-wellness preview path only when preview-safe", async () => {
  const result = await resolveSupportedLeadTemplatePreview({
    lead: {
      id: crypto.randomUUID(),
      business_name: "Calm Studio Med Spa",
      industry: "med spa",
      city: "Raleigh",
      state: "NC",
      phone: "(919) 555-0111",
      email: "hello@calmstudio.com",
    },
  });

  assert.equal(result.supported, true);
  assert.equal(result.renderPackage?.status.isPreviewSafe, true);
});
```

- [ ] **Step 2: Add the med spa archetype route**

Create `src/app/preview/templates/med-spa-archetype/page.tsx`:

```tsx
import { MedSpaPreview } from "@/components/site-templates/med-spa-preview";
import { HEALTH_WELLNESS_FAMILY } from "@/lib/template-system/families/health-wellness";
import { buildMedSpaPreviewModel } from "@/lib/template-system/med-spa-preview";
import { MED_SPA_NICHE_TEMPLATE } from "@/lib/template-system/niches/med-spa";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { MED_SPA_SEED_BUSINESS } from "@/lib/template-system/seeds/med-spa-seed";

export const dynamic = "force-dynamic";

export default function MedSpaArchetypePage() {
  const render = resolveTemplateRender({
    family: HEALTH_WELLNESS_FAMILY,
    template: MED_SPA_NICHE_TEMPLATE,
    seed: MED_SPA_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const model = buildMedSpaPreviewModel(render);
  return <MedSpaPreview model={model} />;
}
```

- [ ] **Step 3: Wire the med spa family path into `/preview/[slug]`**

Modify `src/app/preview/[slug]/page.tsx` so the supported template-system branch can render the med spa family component when `resolveSupportedLeadTemplatePreview(...)` returns `familyKey === "health-wellness"`.

Use this branch shape:

```tsx
if (templatePreview.supported && templatePreview.renderPackage) {
  if (templatePreview.familyKey === "blue-collar-service") {
    const model = buildBlueCollarPreviewModel(templatePreview.renderPackage);
    return <BlueCollarPreview model={model} />;
  }

  if (templatePreview.familyKey === "health-wellness") {
    const model = buildMedSpaPreviewModel(templatePreview.renderPackage);
    return <MedSpaPreview model={model} />;
  }
}
```

Do not change the legacy fallback path.

- [ ] **Step 4: Run unit tests, typecheck, and build**

Run:

```bash
npm run test:unit
npm run typecheck
npm run build
```

Expected:

- unit tests PASS
- typecheck PASS
- build PASS

- [ ] **Step 5: Commit the med spa route integration**

```bash
git add src/app/preview/templates/med-spa-archetype/page.tsx src/app/preview/[slug]/page.tsx
git commit -m "Add med spa preview routes"
```

## Task 5: Browser verification and closeout

**Files:**
- No new files unless verification exposes a real issue.

- [ ] **Step 1: Start the local dev server**

Run:

```bash
OPENPAW_SHARED_ROOT=/Users/ironclaw/.openclaw/shared npm run dev -- --port 3003
```

Expected: Next.js dev server starts and reports `http://localhost:3003`.

- [ ] **Step 2: Verify the archetype route**

Run:

```bash
curl -s http://127.0.0.1:3003/preview/templates/med-spa-archetype
```

Expected HTML contains:

- `Book Consultation`
- `View Treatments`
- med spa hero copy
- no framework error output

- [ ] **Step 3: Verify one supported med spa lead if a suitable lead exists**

Use an existing med spa lead UUID if one is available. If there is no suitable lead yet, skip this step and note that the archetype route was verified instead.

Example command shape:

```bash
curl -s http://127.0.0.1:3003/preview/<lead-uuid>
```

Expected:

- supported med spa lead uses the new template-system path
- unsupported or unsafe lead still falls back cleanly

- [ ] **Step 4: Stop the dev server and re-run final verification**

Run:

```bash
npm run test:unit
npm run typecheck
npm run build
```

Expected: all PASS after browser verification.

- [ ] **Step 5: Commit the verified med spa slice**

```bash
git add src/lib/template-system/families/health-wellness.ts src/lib/template-system/niches/med-spa.ts src/lib/template-system/seeds/med-spa-seed.ts src/lib/template-system/med-spa-preview.ts src/components/site-templates/med-spa-preview.tsx src/app/preview/templates/med-spa-archetype/page.tsx src/lib/template-system/lead-preview.ts src/lib/template-system/resolver.ts src/lib/template-system/resolver.test.ts src/app/preview/[slug]/page.tsx
git commit -m "Add med spa template system"
```

## Self-Review

### Spec coverage

- New `health-wellness` family: covered in Task 1.
- `med-spa-v1` niche and seed business: covered in Task 1.
- Consultation-led CTA and section posture: covered in Tasks 1 and 3.
- Strict proof suppression: covered in Tasks 1 and 2.
- Supported lead-preview routing: covered in Tasks 2 and 4.
- Archetype preview route: covered in Task 4.
- Browser verification: covered in Task 5.
- Image direction and culturally diverse imagery: intentionally deferred to the later med spa image-pipeline slice, matching the spec’s implementation order.

### Placeholder scan

- No `TBD`, `TODO`, or deferred implementation placeholders remain inside the tasks.
- All code-edit tasks include concrete file paths and concrete code blocks.
- All verification steps include actual commands and expected outcomes.

### Type consistency

- Family key: `health-wellness`
- Niche key: `med-spa-v1`
- Preview component: `MedSpaPreview`
- Preview adapter: `buildMedSpaPreviewModel`
- Seed business: `MED_SPA_SEED_BUSINESS`
- Family fixture: `HEALTH_WELLNESS_FAMILY`

These names are consistent across all tasks.
