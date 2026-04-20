# Plumbing Template-System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add plumbing as the third supported blue-collar niche, route supported plumbing leads through the strict template-system preview path, and preserve legacy fallback behavior for unsupported or unsafe cases.

**Architecture:** Reuse the existing `blue-collar-service` family, shared blue-collar renderer, and central lead preview helper. Add a plumbing niche overlay plus a plumbing seed business, extend supported-industry normalization and mapping to include plumbing, and make only the smallest family-safe renderer adjustment needed to show plumbing’s grouped services and dual CTA posture without inventing proof claims.

**Tech Stack:** Next.js App Router, TypeScript, Node test runner, existing template-system resolver, shared blue-collar preview component, Supabase-backed lead lookup

---

## File Structure

- Create: `src/lib/template-system/niches/plumbing.ts`
  - Canonical plumbing `NicheTemplate`
- Create: `src/lib/template-system/seeds/plumbing-seed.ts`
  - Believable plumbing `SeedBusiness`
- Modify: `src/lib/template-system/lead-preview.ts`
  - Extend supported-industry normalization and plumbing lead mapping
- Modify: `src/lib/template-system/resolver.test.ts`
  - Add plumbing fixture, suppression, normalization, helper, and preview-model tests
- Modify: `src/lib/template-system/blue-collar-preview.ts`
  - Add the smallest shared preview-model support needed for plumbing grouped services or dual CTAs
- Modify: `src/components/site-templates/blue-collar-preview.tsx`
  - Render any family-safe grouped-service or secondary-CTA data added for plumbing
- Modify: `src/app/preview/[slug]/page.tsx`
  - Only if helper return-shape changes; otherwise leave untouched

## Task 1: Add failing plumbing fixture and strict-proof suppression tests

**Files:**
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing tests for plumbing fixture validity and strict suppression**

Add imports:

```ts
import { PLUMBING_NICHE_TEMPLATE } from "@/lib/template-system/niches/plumbing";
import { PLUMBING_SEED_BUSINESS } from "@/lib/template-system/seeds/plumbing-seed";
```

Add these tests near the existing roofing and HVAC fixture coverage:

```ts
test("plumbing niche matches family and schema version", () => {
  assert.equal(PLUMBING_NICHE_TEMPLATE.familyKey, BLUE_COLLAR_SERVICE_FAMILY.key);
  assert.equal(
    PLUMBING_NICHE_TEMPLATE.expectedSchemaVersion,
    BLUE_COLLAR_SERVICE_FAMILY.schemaVersion
  );
});

test("plumbing seed business does not pre-approve fabricated urgent-service proof", () => {
  assert.equal(
    PLUMBING_SEED_BUSINESS.conditionalProof.sameDayService?.approvalStatus,
    "pending"
  );
  assert.equal(
    PLUMBING_SEED_BUSINESS.conditionalProof.emergencyAvailability?.approvalStatus,
    "pending"
  );
  assert.equal(
    PLUMBING_SEED_BUSINESS.conditionalProof.licensedAndInsured?.approvalStatus,
    "pending"
  );
});

test("strict resolver suppresses absent plumbing proof claims", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: PLUMBING_NICHE_TEMPLATE,
    seed: PLUMBING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.equal(render.status.isPreviewSafe, true);
  assert.equal(render.status.hasSuppressedClaims, true);
  assert.deepEqual(
    render.overrideAudit.suppressed.map((entry) => entry.field),
    [
      "sameDayService",
      "emergencyAvailability",
      "licensedAndInsured",
      "warrantyCopy",
      "financing",
      "sampleTestimonials",
    ]
  );
});
```

- [ ] **Step 2: Run the test file to verify it fails for missing plumbing modules**

Run:

```bash
npm run test:unit
```

Expected: FAIL with module resolution errors for `@/lib/template-system/niches/plumbing` and `@/lib/template-system/seeds/plumbing-seed`.

- [ ] **Step 3: Add the minimal plumbing niche fixture**

Create `src/lib/template-system/niches/plumbing.ts`:

```ts
import type { NicheTemplate } from "@/lib/template-system/types";

export const PLUMBING_NICHE_TEMPLATE: NicheTemplate = {
  key: "plumbing-v1",
  familyKey: "blue-collar-service",
  name: "Plumbing",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "urgent-first, homeowner-trust, scope-clear",
    typography: {
      headingFamily: "var(--font-geist-sans)",
      bodyFamily: "var(--font-geist-sans)",
      sizingNotes: ["large repair-first hero", "grouped services stay scannable"],
    },
    palette: {
      base: ["#0f172a", "#f8fafc"],
      accents: ["#0369a1", "#ea580c"],
      usageNotes: ["use blue as the stabilizing base", "reserve orange for calls to action"],
    },
    layoutNotes: [
      "hero should support urgent repair and planned work",
      "call-first CTA posture without fake emergency proof",
      "group services into immediate and planned categories",
    ],
  },
  vocabulary: {
    requiredTerms: ["plumbing repair", "clogged drain", "water heater", "leak"],
    preferredPhrases: ["diagnose the issue", "clear next step", "repair-first response"],
    bannedPhrases: ["24/7 emergency response", "trusted by the whole city"],
    disallowedProofClaims: [
      "same-day service guaranteed",
      "licensed and insured" ,
      "lifetime warranty on every job",
    ],
  },
  seo: {
    metaTitleTemplate: "{{serviceAreaLabel}} Plumbing Company | {{businessName}}",
    metaDescriptionTemplate:
      "{{businessName}} handles plumbing repair, drain issues, water heater work, and residential plumbing estimates in {{serviceAreaLabel}}.",
    headingRules: [
      "mention plumbing service and geography in hero",
      "support both urgent repair and estimate-driven work",
    ],
    keywordTargets: [
      "plumbing repair",
      "plumber near me",
      "water heater repair",
      "residential plumbing",
    ],
  },
  sections: {
    copy: {
      hero: {
        variantKey: "urgent-first",
        heading: "Plumbing help for active issues and planned work",
        body: "{{businessName}} helps homeowners in {{serviceAreaLabel}} handle leaks, clogs, water-heater trouble, and larger plumbing work with a clear next step instead of vague urgency language.",
        cta: { label: "Call Now", action: "call" },
      },
      services: {
        variantKey: "grouped",
        heading: "Plumbing services for immediate problems and planned work",
        items: [
          { title: "Immediate Needs", body: "Leaking lines, backed-up drains, running fixtures, and other active plumbing problems that need a fast diagnosis." },
          { title: "Planned Work / Installations", body: "Water-heater replacements, fixture installs, line updates, and scope-based residential plumbing work." },
        ],
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "What homeowners want from a plumbing company",
        items: [
          { title: "Fast diagnosis", body: "Explain the problem before turning every visit into a replacement pitch." },
          { title: "Clear scope", body: "Make it obvious what needs attention now and what can be planned." },
          { title: "Organized follow-through", body: "Keep the next step, estimate, and scheduling process easy to understand." },
        ],
      },
      process: {
        variantKey: "default",
        heading: "How plumbing work moves from problem to plan",
        items: [
          { title: "Inspect the issue", body: "Start with the visible symptom, likely cause, and access point." },
          { title: "Explain the scope", body: "Lay out repair or installation options in plain language." },
          { title: "Confirm the next step", body: "Move into service or estimate scheduling without vague promises." },
        ],
      },
      faq: {
        variantKey: "mixed-intent",
        heading: "Plumbing questions homeowners ask before booking",
        faqItems: [
          { question: "Should I call for this leak right away?", answer: "The template should support active-issue urgency without inventing emergency or same-day claims." },
          { question: "Do you provide estimates for larger plumbing work?", answer: "Yes. The page should support estimate-driven residential plumbing without weakening the call-first posture." },
        ],
      },
      "service-area": {
        variantKey: "regional-coverage",
        heading: "Plumbing service in {{serviceAreaLabel}}",
        body: "Use a regional coverage statement when hyperlocal proof is limited or unverified.",
      },
      contact: {
        variantKey: "dual-cta",
        heading: "Call now or request a plumbing estimate",
        body: "Use the direct call path for active plumbing issues or request an estimate for larger residential work.",
        cta: { label: "Call Now", action: "call" },
      },
    },
  },
  editableModel: {
    lockedFields: ["heroHeading", "sectionOrder", "claimPolicy"],
    editableFields: [
      "businessName",
      "serviceAreaLabel",
      "primaryPhone",
      "contactEmail",
      "services",
      "primaryCtaLabel",
      "primaryCtaHref",
      "secondaryCtaLabel",
      "secondaryCtaHref",
    ],
    conditionalFields: [
      "sameDayService",
      "emergencyAvailability",
      "licensedAndInsured",
      "warrantyCopy",
      "financing",
      "sampleTestimonials",
    ],
  },
};
```

- [ ] **Step 4: Add the minimal plumbing seed business**

Create `src/lib/template-system/seeds/plumbing-seed.ts`:

```ts
import type { SeedBusiness } from "@/lib/template-system/types";

export const PLUMBING_SEED_BUSINESS: SeedBusiness = {
  key: "steady-flow-plumbing-columbus",
  nicheTemplateKey: "plumbing-v1",
  businessProfile: {
    businessName: "Steady Flow Plumbing",
    serviceAreaLabel: "Columbus",
    primaryPhone: "(614) 555-0189",
    contactEmail: "service@steadyflowplumbing.com",
    primaryCtaLabel: "Call Now",
    primaryCtaHref: "tel:+16145550189",
    secondaryCtaLabel: "Request Estimate",
    secondaryCtaHref: "#contact",
    services: [
      "Leak Repair",
      "Drain Clearing",
      "Water Heater Service",
      "Fixture Installation",
    ],
  },
  conditionalProof: {
    sameDayService: {
      kind: "availability-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    emergencyAvailability: {
      kind: "availability-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    licensedAndInsured: {
      kind: "credential-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    warrantyCopy: {
      kind: "warranty-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    financing: {
      kind: "offer-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    sampleTestimonials: {
      kind: "testimonial-list",
      value: 0,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: true,
    },
  },
};
```

- [ ] **Step 5: Run the tests to verify the plumbing fixtures now pass**

Run:

```bash
npm run test:unit
```

Expected: the new plumbing fixture tests PASS, while later plumbing-mapping tests still fail because helper support is not implemented yet.

- [ ] **Step 6: Commit the plumbing fixtures**

```bash
git add src/lib/template-system/niches/plumbing.ts src/lib/template-system/seeds/plumbing-seed.ts src/lib/template-system/resolver.test.ts
git commit -m "Add plumbing template fixtures"
```

## Task 2: Add failing plumbing normalization and supported-mapping tests

**Files:**
- Modify: `src/lib/template-system/resolver.test.ts`
- Modify: `src/lib/template-system/lead-preview.ts`

- [ ] **Step 1: Write failing plumbing normalization and mapping tests**

Add imports:

```ts
import {
  normalizeSupportedIndustry,
  resolveLeadTemplatePreview,
  buildLeadPreviewView,
} from "@/lib/template-system/lead-preview";
```

Add tests:

```ts
test("supported-industry helper normalizes plumbing variants", () => {
  assert.equal(normalizeSupportedIndustry("Plumbing"), "plumbing");
  assert.equal(normalizeSupportedIndustry("plumber"), "plumbing");
  assert.equal(normalizeSupportedIndustry("residential plumbing"), "plumbing");
  assert.equal(normalizeSupportedIndustry("plumbing repair"), "plumbing");
  assert.equal(normalizeSupportedIndustry("water heater service"), "plumbing");
});

test("supported-industry helper returns supported results for roofing hvac and plumbing only", () => {
  const plumbingLead = createLead({
    industry: "plumbing",
    status: "generated",
    company_name: "Steady Flow Plumbing",
    city: "Columbus",
  });

  const supported = resolveLeadTemplatePreview(plumbingLead);
  const unsupported = resolveLeadTemplatePreview(
    createLead({ industry: "handyman", status: "generated" })
  );

  assert.equal(supported.supported, true);
  assert.equal(unsupported.supported, false);
  if (!unsupported.supported) {
    assert.equal(unsupported.reason, "UNSUPPORTED_INDUSTRY");
  }
});

test("lead preview view uses the shared blue-collar path for preview-safe plumbing leads", () => {
  const view = buildLeadPreviewView(
    createLead({
      industry: "plumbing",
      status: "generated",
      company_name: "Steady Flow Plumbing",
      city: "Columbus",
    })
  );

  assert.equal(view.kind, "blue-collar");
  if (view.kind === "blue-collar") {
    assert.equal(view.model.hero.heading.includes("Plumbing"), true);
  }
});
```

- [ ] **Step 2: Run the test file to verify plumbing support fails before helper changes**

Run:

```bash
npm run test:unit
```

Expected: FAIL because `normalizeSupportedIndustry` does not yet return `plumbing` and the helper does not yet map plumbing.

- [ ] **Step 3: Extend the central supported-industry helper for plumbing**

Modify `src/lib/template-system/lead-preview.ts`:

```ts
import { PLUMBING_NICHE_TEMPLATE } from "@/lib/template-system/niches/plumbing";
import { PLUMBING_SEED_BUSINESS } from "@/lib/template-system/seeds/plumbing-seed";
```

Update the supported industry type:

```ts
type SupportedIndustry = "roofing" | "hvac" | "plumbing";
```

Add plumbing aliases:

```ts
const PLUMBING_INDUSTRY_ALIASES = new Set([
  "plumbing",
  "plumber",
  "residential plumbing",
  "plumbing repair",
  "emergency plumbing",
  "drain and plumbing",
  "water heater service",
]);
```

Update plumbing normalization:

```ts
if (PLUMBING_INDUSTRY_ALIASES.has(value)) {
  return "plumbing";
}
```

Update template and seed selection:

```ts
const template =
  templateKey === "roofing"
    ? ROOFING_NICHE_TEMPLATE
    : templateKey === "hvac"
      ? HVAC_NICHE_TEMPLATE
      : PLUMBING_NICHE_TEMPLATE;

const seed =
  templateKey === "roofing"
    ? ROOFING_SEED_BUSINESS
    : templateKey === "hvac"
      ? HVAC_SEED_BUSINESS
      : PLUMBING_SEED_BUSINESS;
```

Update CTA defaults in `buildLeadRecord`:

```ts
primaryCtaLabel:
  industry === "roofing"
    ? "Request a Roofing Quote"
    : industry === "hvac"
      ? "Request HVAC Service"
      : "Call Now",
primaryCtaHref: industry === "plumbing" ? `tel:${lead.phone}` : "#contact",
secondaryCtaLabel: industry === "plumbing" ? "Request Estimate" : null,
secondaryCtaHref: industry === "plumbing" ? "#contact" : null,
```

Update resolver branching:

```ts
if (normalizedIndustry === "plumbing") {
  return resolveSupportedPreview("plumbing", lead);
}
```

- [ ] **Step 4: Run the tests to verify plumbing normalization and mapping pass**

Run:

```bash
npm run test:unit
```

Expected: plumbing normalization and supported-mapping tests PASS; shared renderer tests may still fail if grouped services or secondary CTA are not surfaced yet.

- [ ] **Step 5: Commit the helper update**

```bash
git add src/lib/template-system/lead-preview.ts src/lib/template-system/resolver.test.ts
git commit -m "Add plumbing lead preview support"
```

## Task 3: Add failing shared preview-model tests for plumbing grouped services and secondary CTA

**Files:**
- Modify: `src/lib/template-system/resolver.test.ts`
- Modify: `src/lib/template-system/blue-collar-preview.ts`
- Modify: `src/components/site-templates/blue-collar-preview.tsx`

- [ ] **Step 1: Write failing plumbing preview-model tests**

Add tests:

```ts
test("shared blue-collar preview model surfaces grouped plumbing services", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: PLUMBING_NICHE_TEMPLATE,
    seed: PLUMBING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const model = buildBlueCollarPreviewModel(render);

  assert.equal(model.services.heading, "Plumbing services for immediate problems and planned work");
  assert.deepEqual(
    model.services.items.map((item) => item.title),
    ["Immediate Needs", "Planned Work / Installations"]
  );
});

test("shared blue-collar preview model exposes plumbing secondary CTA", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: PLUMBING_NICHE_TEMPLATE,
    seed: PLUMBING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const model = buildBlueCollarPreviewModel(render);

  assert.equal(model.hero.primaryCta.label, "Call Now");
  assert.equal(model.hero.secondaryCta?.label, "Request Estimate");
});
```

- [ ] **Step 2: Run the test file to verify the preview-model tests fail**

Run:

```bash
npm run test:unit
```

Expected: FAIL because the current shared preview model does not yet expose a plumbing secondary CTA and may not surface grouped service content in the desired shape.

- [ ] **Step 3: Update the shared preview-model adapter**

Modify `src/lib/template-system/blue-collar-preview.ts` so the returned model includes a secondary CTA when present and preserves grouped service items directly from the resolved section.

Add or update the model shape:

```ts
type BlueCollarPreviewModel = {
  hero: {
    heading: string;
    body: string | null;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string } | null;
  };
  services: {
    heading: string;
    items: Array<{ title: string; body: string }>;
  };
};
```

When building CTAs:

```ts
const primaryCta = {
  label: resolvedFields.primaryCtaLabel as string,
  href: (resolvedFields.primaryCtaHref as string) || "#contact",
};

const secondaryCta =
  typeof resolvedFields.secondaryCtaLabel === "string" &&
  typeof resolvedFields.secondaryCtaHref === "string"
    ? {
        label: resolvedFields.secondaryCtaLabel,
        href: resolvedFields.secondaryCtaHref,
      }
    : null;
```

- [ ] **Step 4: Update the shared preview component**

Modify `src/components/site-templates/blue-collar-preview.tsx` so the hero renders the secondary CTA only when present:

```tsx
<div className="flex flex-wrap gap-3">
  <a href={model.hero.primaryCta.href} className="...">
    {model.hero.primaryCta.label}
  </a>
  {model.hero.secondaryCta ? (
    <a href={model.hero.secondaryCta.href} className="...">
      {model.hero.secondaryCta.label}
    </a>
  ) : null}
</div>
```

Keep the services section family-safe by rendering the existing service items without plumbing-only branching.

- [ ] **Step 5: Run the tests to verify shared plumbing preview behavior passes**

Run:

```bash
npm run test:unit
```

Expected: all plumbing preview-model tests PASS.

- [ ] **Step 6: Commit the shared preview update**

```bash
git add src/lib/template-system/blue-collar-preview.ts src/components/site-templates/blue-collar-preview.tsx src/lib/template-system/resolver.test.ts
git commit -m "Support plumbing preview content in blue-collar renderer"
```

## Task 4: Verify page integration and browser behavior

**Files:**
- Modify: `src/app/preview/[slug]/page.tsx` only if plumbing support requires a helper-shape update
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Add a plumbing lead preview integration test if the helper or page contract changed**

If `buildLeadPreviewView` behavior changed, add:

```ts
test("supported plumbing lead preview remains preview-safe through the shared page path", () => {
  const view = buildLeadPreviewView(
    createLead({
      industry: "plumbing",
      status: "generated",
      company_name: "Steady Flow Plumbing",
      city: "Columbus",
      phone: "+16145550189",
    })
  );

  assert.equal(view.kind, "blue-collar");
  if (view.kind === "blue-collar") {
    assert.equal(view.renderPackage.status.isPreviewSafe, true);
  }
});
```

- [ ] **Step 2: Run the full local verification suite**

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

- [ ] **Step 3: Browser-verify the plumbing path**

If a supported plumbing lead exists locally, capture it through `/preview/[slug]`. Otherwise verify the plumbing archetype route after adding one, or temporarily use a test-friendly lead fixture already available in the local environment.

Run one of these commands:

```bash
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --headless=new --no-sandbox --disable-gpu --hide-scrollbars --window-size=1440,1200 --screenshot='/tmp/closehound-plumbing-lead.png' 'http://127.0.0.1:3000/preview/<plumbing-lead-uuid>'
```

or

```bash
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --headless=new --no-sandbox --disable-gpu --hide-scrollbars --window-size=1440,1200 --screenshot='/tmp/closehound-plumbing-archetype.png' 'http://127.0.0.1:3000/preview/templates/plumbing-archetype'
```

Expected:

- hero is plumbing-specific
- primary CTA reads `Call Now`
- secondary CTA reads `Request Estimate`
- services read as `Immediate Needs` and `Planned Work / Installations`
- no fake emergency, warranty, or licensed/insured proof appears

- [ ] **Step 4: Commit the finished plumbing integration**

```bash
git add src/lib/template-system/resolver.test.ts src/lib/template-system/lead-preview.ts src/lib/template-system/blue-collar-preview.ts src/components/site-templates/blue-collar-preview.tsx src/app/preview/[slug]/page.tsx
git commit -m "Add plumbing template-system preview support"
```

## Spec Coverage Check

- Plumbing niche template: covered in Task 1
- Plumbing seed business: covered in Task 1
- Supported-industry mapping and normalization: covered in Task 2
- Shared renderer reuse with smallest family-safe change: covered in Task 3
- Browser verification for plumbing path: covered in Task 4
- Strict proof suppression and truthful downgrade behavior: covered in Tasks 1 and 4

## Self-Review

- No placeholders remain.
- Task order is TDD-first and keeps plumbing as a narrow extension of the current system.
- File responsibilities stay focused: niche fixture, seed, mapping helper, shared adapter, shared component, verification.
