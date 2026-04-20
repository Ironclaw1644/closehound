# HVAC Lead Preview Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add HVAC as the second blue-collar template-system niche and route supported lead previews through the new strict template-system path while preserving the legacy preview flow for unsupported or unsafe cases.

**Architecture:** Keep the blast radius narrow. Add HVAC fixtures on top of the existing `blue-collar-service` family, replace the roofing-specific preview adapter/component with a shared blue-collar renderer, and introduce one central helper that normalizes supported lead industries and returns a preview-safe `RenderPackage` for lead previews. The `/preview/[slug]` page remains thin and falls back to the legacy preview path whenever the helper cannot safely produce a template-system render.

**Tech Stack:** Next.js App Router, TypeScript, Node test runner, existing template-system resolver, existing Supabase-backed lead lookup

---

## File Structure

- Create: `src/lib/template-system/niches/hvac.ts`
  - Canonical HVAC `NicheTemplate`
- Create: `src/lib/template-system/seeds/hvac-seed.ts`
  - Believable HVAC `SeedBusiness`
- Create: `src/lib/template-system/lead-preview.ts`
  - Supported-industry normalization and lead-to-template-system resolver helper
- Create: `src/lib/template-system/blue-collar-preview.ts`
  - Shared `RenderPackage` -> family-level preview model adapter
- Create: `src/components/site-templates/blue-collar-preview.tsx`
  - Shared family-level preview component
- Modify: `src/lib/template-system/resolver.ts`
  - Make section resolution less roofing-named where needed and support HVAC-safe strict output
- Modify: `src/lib/template-system/resolver.test.ts`
  - Add HVAC fixture, suppression, normalization, helper, and shared renderer tests
- Modify: `src/app/preview/templates/roofing-archetype/page.tsx`
  - Switch to family-level shared preview adapter/component
- Modify: `src/app/preview/[slug]/page.tsx`
  - Branch through the central helper for supported lead IDs and safe template-system renders
- Delete: `src/lib/template-system/roofing-preview.ts`
  - Replaced by family-level adapter
- Delete: `src/components/site-templates/roofing-preview.tsx`
  - Replaced by family-level shared component

## Task 1: Add failing HVAC fixture and strict-proof suppression tests

**Files:**
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing tests for HVAC fixture validity and strict proof suppression**

```ts
import { HVAC_NICHE_TEMPLATE } from "@/lib/template-system/niches/hvac";
import { HVAC_SEED_BUSINESS } from "@/lib/template-system/seeds/hvac-seed";
```

Add these tests near the existing roofing fixture tests:

```ts
test("hvac niche matches family and schema version", () => {
  assert.equal(HVAC_NICHE_TEMPLATE.familyKey, BLUE_COLLAR_SERVICE_FAMILY.key);
  assert.equal(
    HVAC_NICHE_TEMPLATE.expectedSchemaVersion,
    BLUE_COLLAR_SERVICE_FAMILY.schemaVersion
  );
});

test("hvac seed business does not pre-approve fabricated proof", () => {
  assert.equal(
    HVAC_SEED_BUSINESS.conditionalProof.emergencyService?.approvalStatus,
    "pending"
  );
  assert.equal(
    HVAC_SEED_BUSINESS.conditionalProof.financing?.approvalStatus,
    "pending"
  );
  assert.equal(
    HVAC_SEED_BUSINESS.conditionalProof.licensedAndInsured?.approvalStatus,
    "pending"
  );
});

test("strict resolver suppresses absent hvac proof claims", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: HVAC_NICHE_TEMPLATE,
    seed: HVAC_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.equal(render.status.isPreviewSafe, true);
  assert.equal(render.status.hasSuppressedClaims, true);
  assert.deepEqual(
    render.overrideAudit.suppressed.map((entry) => entry.field),
    [
      "emergencyService",
      "financing",
      "warrantyCopy",
      "certifications",
      "licensedAndInsured",
      "sampleTestimonials",
    ]
  );
});
```

- [ ] **Step 2: Run the test file to verify it fails for missing HVAC modules**

Run:

```bash
npm run test:unit
```

Expected: FAIL with module resolution errors for `@/lib/template-system/niches/hvac` and `@/lib/template-system/seeds/hvac-seed`.

- [ ] **Step 3: Add the minimal HVAC niche fixture**

Create `src/lib/template-system/niches/hvac.ts`:

```ts
import type { NicheTemplate } from "@/lib/template-system/types";

export const HVAC_NICHE_TEMPLATE: NicheTemplate = {
  key: "hvac-v1",
  familyKey: "blue-collar-service",
  name: "HVAC",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "direct, comfort-focused, homeowner-trust",
    typography: {
      headingFamily: "var(--font-geist-sans)",
      bodyFamily: "var(--font-geist-sans)",
      sizingNotes: ["large hero headline", "clean service cards"],
    },
    palette: {
      base: ["#0f172a", "#f8fafc"],
      accents: ["#0f766e", "#f97316"],
      usageNotes: ["use orange for CTA emphasis", "keep HVAC layouts bright and grounded"],
    },
    layoutNotes: ["strong hero CTA", "comfort-language stays factual", "no proof bars without evidence"],
  },
  vocabulary: {
    requiredTerms: ["air conditioning repair", "heating service", "system replacement", "maintenance"],
    preferredPhrases: ["restore comfort", "diagnose the issue", "keep the system running"],
    bannedPhrases: ["cutting-edge solutions", "passionate team"],
    disallowedProofClaims: ["24/7 emergency service" ,"top-rated in every neighborhood"],
  },
  seo: {
    metaTitleTemplate: "{{serviceAreaLabel}} HVAC Company | {{businessName}}",
    metaDescriptionTemplate:
      "{{businessName}} handles air conditioning repair, heating service, and HVAC replacement in {{serviceAreaLabel}}.",
    headingRules: ["mention HVAC service and geography in hero", "use homeowner comfort search language"],
    keywordTargets: ["air conditioning repair", "heating repair", "HVAC replacement", "seasonal maintenance"],
  },
  sections: {
    copy: {
      hero: {
        variantKey: "default",
        heading: "Heating and cooling service without the vague upsell",
        body: "{{businessName}} helps homeowners in {{serviceAreaLabel}} diagnose comfort problems, plan repairs, and compare replacement options with a clear next step.",
        cta: { label: "Request HVAC Service", action: "quote" },
      },
      services: {
        variantKey: "default",
        heading: "HVAC services for repair, replacement, and seasonal upkeep",
        items: [
          { title: "AC Repair", body: "Find the cooling issue, explain what failed, and restore performance without padding the scope." },
          { title: "Heating Service", body: "Diagnose furnace and heating problems before they turn into no-heat calls." },
          { title: "System Replacement", body: "Compare replacement paths with a clear explanation of system fit, timing, and next steps." },
        ],
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "What homeowners want from an HVAC company",
        items: [
          { title: "Straight diagnostics", body: "Explain the issue clearly before jumping to replacement language." },
          { title: "Comfort-focused service", body: "Keep the visit centered on restoring reliable heating or cooling." },
          { title: "Organized follow-through", body: "Make scheduling, scope, and next steps easy to track." },
        ],
      },
      process: {
        variantKey: "default",
        heading: "How service moves from diagnosis to resolution",
        items: [
          { title: "Inspect the system", body: "Start with the symptom, the equipment condition, and the likely failure point." },
          { title: "Review the options", body: "Lay out repair or replacement paths in plain language." },
          { title: "Schedule the work", body: "Confirm timing, equipment plan, and the next homeowner touchpoint." },
        ],
      },
      faq: {
        variantKey: "default",
        heading: "HVAC questions homeowners ask before booking service",
        faqItems: [
          { question: "Should I repair or replace the system?", answer: "That depends on the age of the equipment, the nature of the failure, and whether repeated repairs are stacking up." },
          { question: "Do you handle both heating and cooling service?", answer: "The template should support full-service positioning without inventing proof claims that the business has not supplied." },
        ],
      },
      "service-area": {
        variantKey: "regional-coverage",
        heading: "HVAC service in {{serviceAreaLabel}}",
        body: "Use a regional coverage statement when hyperlocal proof is weak or incomplete.",
      },
      contact: {
        variantKey: "default",
        heading: "Talk through the comfort issue",
        body: "Call or request service to get the next step for air conditioning repair, heating service, or system replacement.",
        cta: { label: "Book HVAC Service", action: "quote" },
      },
    },
  },
  editableModel: {
    lockedFields: ["heroHeading", "sectionOrder", "claimPolicy"],
    editableFields: ["businessName", "serviceAreaLabel", "primaryPhone", "contactEmail", "services", "primaryCtaLabel", "primaryCtaHref"],
    conditionalFields: ["emergencyService", "financing", "warrantyCopy", "certifications", "licensedAndInsured", "sampleTestimonials"],
  },
};
```

- [ ] **Step 4: Add the minimal HVAC seed business**

Create `src/lib/template-system/seeds/hvac-seed.ts`:

```ts
import type { SeedBusiness } from "@/lib/template-system/types";

export const HVAC_SEED_BUSINESS: SeedBusiness = {
  key: "summit-comfort-columbus",
  nicheTemplateKey: "hvac-v1",
  businessProfile: {
    businessName: "Summit Comfort Heating & Air",
    serviceAreaLabel: "Columbus, OH",
    primaryPhone: "(614) 555-0126",
    contactEmail: "service@summitcomfortair.com",
    primaryCtaLabel: "Request HVAC Service",
    primaryCtaHref: "#contact",
    services: ["AC Repair", "Heating Service", "System Replacement"],
  },
  conditionalProof: {
    emergencyService: {
      kind: "availability-claim",
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
    warrantyCopy: {
      kind: "warranty-claim",
      value: false,
      evidenceSource: "seed",
      approvalStatus: "pending",
      sample: false,
    },
    certifications: {
      kind: "credential-claim",
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

- [ ] **Step 5: Extend the resolver minimally so absent HVAC proof is audited and suppressed**

Modify `src/lib/template-system/resolver.ts` by replacing the single testimonial suppression branch with a small proof-suppression helper:

```ts
function collectStrictProofSuppressions(
  template: NicheTemplate,
  seed: SeedBusiness,
  sampleMode: SampleMode
) {
  const suppressed: RenderPackage["overrideAudit"]["suppressed"] = [];

  for (const field of template.editableModel.conditionalFields) {
    const proof = seed.conditionalProof[field];

    if (!proof || proof.approvalStatus !== "approved" || (proof.sample && sampleMode === "strict")) {
      suppressed.push({
        field,
        reasonCode: REASON_CODES.MISSING_EVIDENCE,
        reason: `${field} is not approved for strict rendering.`,
      });
    }
  }

  return suppressed;
}
```

Then use it in `resolveTemplateRender(...)`:

```ts
  const suppressedAudit = collectStrictProofSuppressions(template, seed, sampleMode);
  const testimonialsVisible = false;
```

Keep the existing testimonial section hidden behavior in place, but let the suppressed audit include the broader HVAC conditional proof set.

- [ ] **Step 6: Run the tests to verify they pass**

Run:

```bash
npm run test:unit
```

Expected: PASS for the new HVAC fixture tests and the existing roofing suite.

- [ ] **Step 7: Commit the HVAC fixtures**

```bash
git add src/lib/template-system/niches/hvac.ts src/lib/template-system/seeds/hvac-seed.ts src/lib/template-system/resolver.ts src/lib/template-system/resolver.test.ts
git commit -m "Add HVAC template-system fixtures"
```

## Task 2: Add central supported-industry lead preview helper

**Files:**
- Create: `src/lib/template-system/lead-preview.ts`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing tests for industry normalization and supported lead mapping**

Add to `src/lib/template-system/resolver.test.ts`:

```ts
import { resolveLeadTemplatePreview, normalizeSupportedIndustry } from "@/lib/template-system/lead-preview";
```

Add these tests:

```ts
test("supported-industry helper normalizes HVAC variants", () => {
  assert.equal(normalizeSupportedIndustry("HVAC"), "hvac");
  assert.equal(normalizeSupportedIndustry("hvac"), "hvac");
  assert.equal(normalizeSupportedIndustry("heating and air"), "hvac");
  assert.equal(normalizeSupportedIndustry("heating & air"), "hvac");
  assert.equal(normalizeSupportedIndustry("heating and cooling"), "hvac");
  assert.equal(normalizeSupportedIndustry("air conditioning"), "hvac");
});

test("supported-industry helper only supports roofing and hvac", () => {
  const roofing = resolveLeadTemplatePreview({
    id: "lead-1",
    industry: "roofing",
    company_name: "Summit Peak Roofing",
    city: "Columbus",
    state: "OH",
    phone: "(614) 555-0184",
    email: "office@summitpeakroofing.com",
  } as never);

  const hvac = resolveLeadTemplatePreview({
    id: "lead-2",
    industry: "HVAC",
    company_name: "Summit Comfort Heating & Air",
    city: "Columbus",
    state: "OH",
    phone: "(614) 555-0126",
    email: "service@summitcomfortair.com",
  } as never);

  const unsupported = resolveLeadTemplatePreview({
    id: "lead-3",
    industry: "plumbing",
    company_name: "River City Plumbing",
    city: "Columbus",
    state: "OH",
    phone: "(614) 555-0101",
  } as never);

  assert.equal(roofing.supported, true);
  assert.equal(hvac.supported, true);
  assert.deepEqual(unsupported, {
    supported: false,
    reason: "UNSUPPORTED_INDUSTRY",
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail for the missing helper**

Run:

```bash
npm run test:unit
```

Expected: FAIL with module resolution errors for `@/lib/template-system/lead-preview`.

- [ ] **Step 3: Implement the central supported-industry helper**

Create `src/lib/template-system/lead-preview.ts`:

```ts
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { HVAC_NICHE_TEMPLATE } from "@/lib/template-system/niches/hvac";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { HVAC_SEED_BUSINESS } from "@/lib/template-system/seeds/hvac-seed";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";
import type { Lead } from "@/types/lead";

export function normalizeSupportedIndustry(industry: string | null | undefined) {
  const value = industry?.trim().toLowerCase();

  if (!value) {
    return null;
  }

  if (value === "roofing") {
    return "roofing";
  }

  if (
    value === "hvac" ||
    value === "heating and air" ||
    value === "heating & air" ||
    value === "heating and cooling" ||
    value === "air conditioning"
  ) {
    return "hvac";
  }

  return null;
}

export function resolveLeadTemplatePreview(lead: Lead) {
  const normalizedIndustry = normalizeSupportedIndustry(lead.industry);

  if (normalizedIndustry === "roofing") {
    const renderPackage = resolveTemplateRender({
      family: BLUE_COLLAR_SERVICE_FAMILY,
      template: ROOFING_NICHE_TEMPLATE,
      seed: ROOFING_SEED_BUSINESS,
      lead: {
        source: "closehound-lead",
        normalizedFields: {
          businessName: lead.company_name,
          serviceAreaLabel: [lead.city, lead.state].filter(Boolean).join(", "),
          primaryPhone: lead.phone,
          contactEmail: lead.email,
          primaryCtaLabel: "Request a Roofing Quote",
          primaryCtaHref: "#contact",
        },
      },
      sampleMode: "strict",
    });

    return renderPackage.status.isPreviewSafe
      ? { supported: true as const, familyKey: BLUE_COLLAR_SERVICE_FAMILY.key, templateKey: ROOFING_NICHE_TEMPLATE.key, renderPackage }
      : { supported: false as const, reason: "UNSAFE_RENDER" as const };
  }

  if (normalizedIndustry === "hvac") {
    const renderPackage = resolveTemplateRender({
      family: BLUE_COLLAR_SERVICE_FAMILY,
      template: HVAC_NICHE_TEMPLATE,
      seed: HVAC_SEED_BUSINESS,
      lead: {
        source: "closehound-lead",
        normalizedFields: {
          businessName: lead.company_name,
          serviceAreaLabel: [lead.city, lead.state].filter(Boolean).join(", "),
          primaryPhone: lead.phone,
          contactEmail: lead.email,
          primaryCtaLabel: "Request HVAC Service",
          primaryCtaHref: "#contact",
        },
      },
      sampleMode: "strict",
    });

    return renderPackage.status.isPreviewSafe
      ? { supported: true as const, familyKey: BLUE_COLLAR_SERVICE_FAMILY.key, templateKey: HVAC_NICHE_TEMPLATE.key, renderPackage }
      : { supported: false as const, reason: "UNSAFE_RENDER" as const };
  }

  return { supported: false as const, reason: "UNSUPPORTED_INDUSTRY" as const };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:

```bash
npm run test:unit
```

Expected: PASS for the supported-industry helper tests.

- [ ] **Step 5: Commit the helper**

```bash
git add src/lib/template-system/lead-preview.ts src/lib/template-system/resolver.test.ts
git commit -m "Add lead template preview resolver"
```

## Task 3: Replace roofing-specific preview adapter/component with family-level blue-collar renderer

**Files:**
- Create: `src/lib/template-system/blue-collar-preview.ts`
- Create: `src/components/site-templates/blue-collar-preview.tsx`
- Modify: `src/lib/template-system/resolver.test.ts`
- Modify: `src/app/preview/templates/roofing-archetype/page.tsx`
- Delete: `src/lib/template-system/roofing-preview.ts`
- Delete: `src/components/site-templates/roofing-preview.tsx`

- [ ] **Step 1: Write the failing tests for the shared preview model**

Modify `src/lib/template-system/resolver.test.ts` imports:

```ts
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
```

Replace the roofing-only preview assertion with:

```ts
test("blue-collar preview model exposes roofing and hvac section content", () => {
  const roofingRender = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const hvacRender = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: HVAC_NICHE_TEMPLATE,
    seed: HVAC_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const roofingModel = buildBlueCollarPreviewModel(roofingRender);
  const hvacModel = buildBlueCollarPreviewModel(hvacRender);

  assert.equal(roofingModel.hero.heading, "Roofing work that protects the home and the timeline");
  assert.equal(hvacModel.hero.heading, "Heating and cooling service without the vague upsell");
  assert.equal(roofingModel.contact.ctaLabel, "Request a Roofing Quote");
  assert.equal(hvacModel.contact.ctaLabel, "Request HVAC Service");
});
```

- [ ] **Step 2: Run the tests to verify they fail for the missing shared adapter**

Run:

```bash
npm run test:unit
```

Expected: FAIL with module resolution errors for `@/lib/template-system/blue-collar-preview`.

- [ ] **Step 3: Implement the shared blue-collar preview adapter**

Create `src/lib/template-system/blue-collar-preview.ts`:

```ts
import type { RenderPackage } from "@/lib/template-system/types";

export type BlueCollarPreviewModel = {
  businessName: string;
  hero: {
    heading: string;
    body: string;
    ctaLabel: string;
  };
  services: {
    heading: string;
    items: Array<{ title?: string; body: string }>;
  };
  whyChooseUs: {
    heading: string;
    items: Array<{ title?: string; body: string }>;
  };
  process: {
    heading: string;
    items: Array<{ title?: string; body: string }>;
  };
  faq: {
    heading: string;
    items: Array<{ question: string; answer: string }>;
  };
  serviceArea: {
    heading: string;
    body: string;
  };
  contact: {
    heading: string;
    body: string;
    ctaLabel: string;
    phone?: string;
    email?: string;
  };
  status: RenderPackage["status"];
};

export function buildBlueCollarPreviewModel(render: RenderPackage): BlueCollarPreviewModel {
  return {
    businessName: String(render.resolvedFields.businessName ?? ""),
    hero: {
      heading: render.resolvedSections.hero.heading ?? "",
      body: render.resolvedSections.hero.body ?? "",
      ctaLabel: render.resolvedSections.hero.cta?.label ?? "Request Service",
    },
    services: {
      heading: render.resolvedSections.services.heading ?? "",
      items: render.resolvedSections.services.items ?? [],
    },
    whyChooseUs: {
      heading: render.resolvedSections["why-choose-us"].heading ?? "",
      items: render.resolvedSections["why-choose-us"].items ?? [],
    },
    process: {
      heading: render.resolvedSections.process.heading ?? "",
      items: render.resolvedSections.process.items ?? [],
    },
    faq: {
      heading: render.resolvedSections.faq.heading ?? "",
      items: render.resolvedSections.faq.faqItems ?? [],
    },
    serviceArea: {
      heading: render.resolvedSections["service-area"].heading ?? "",
      body: render.resolvedSections["service-area"].body ?? "",
    },
    contact: {
      heading: render.resolvedSections.contact.heading ?? "",
      body: render.resolvedSections.contact.body ?? "",
      ctaLabel: render.resolvedSections.contact.cta?.label ?? "Request Service",
      phone: render.resolvedFields.primaryPhone as string | undefined,
      email: render.resolvedFields.contactEmail as string | undefined,
    },
    status: render.status,
  };
}
```

- [ ] **Step 4: Implement the shared family-level preview component**

Create `src/components/site-templates/blue-collar-preview.tsx`:

```tsx
import type { BlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";

export function BlueCollarPreviewTemplate({ model }: { model: BlueCollarPreviewModel }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <section className="rounded-[32px] bg-slate-950 px-8 py-12 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
            Blue-Collar Archetype
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">{model.hero.heading}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{model.hero.body}</p>
          <a href="#contact" className="mt-8 inline-flex rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white">
            {model.hero.ctaLabel}
          </a>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-3xl font-semibold">{model.services.heading}</h2>
            <div className="mt-6 grid gap-4">
              {model.services.items.map((item, index) => (
                <article key={`${item.title ?? "service"}-${index}`} className="rounded-2xl border border-black/8 p-5">
                  {item.title ? <h3 className="text-lg font-semibold">{item.title}</h3> : null}
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-3xl font-semibold">{model.whyChooseUs.heading}</h2>
            <div className="mt-6 grid gap-4">
              {model.whyChooseUs.items.map((item, index) => (
                <article key={`${item.title ?? "proof"}-${index}`} className="rounded-2xl border border-black/8 p-5">
                  {item.title ? <h3 className="text-lg font-semibold">{item.title}</h3> : null}
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-8">
          <h2 className="text-3xl font-semibold">{model.process.heading}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {model.process.items.map((item, index) => (
              <article key={`${item.title ?? "step"}-${index}`} className="rounded-2xl border border-black/8 p-5">
                {item.title ? <h3 className="text-lg font-semibold">{item.title}</h3> : null}
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-3xl font-semibold">{model.faq.heading}</h2>
            <div className="mt-6 grid gap-4">
              {model.faq.items.map((item, index) => (
                <article key={`${item.question}-${index}`} className="rounded-2xl border border-black/8 p-5">
                  <h3 className="text-lg font-semibold">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-3xl font-semibold">{model.serviceArea.heading}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">{model.serviceArea.body}</p>
          </div>
        </section>

        <section id="contact" className="mt-8 rounded-[28px] bg-slate-950 px-8 py-10 text-white">
          <h2 className="text-3xl font-semibold">{model.contact.heading}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{model.contact.body}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
            {model.contact.phone ? <span>{model.contact.phone}</span> : null}
            {model.contact.email ? <span>{model.contact.email}</span> : null}
          </div>
          <a href="#contact" className="mt-8 inline-flex rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white">
            {model.contact.ctaLabel}
          </a>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Update the roofing archetype route to use the new shared preview path**

Modify `src/app/preview/templates/roofing-archetype/page.tsx`:

```ts
import { notFound } from "next/navigation";

import { BlueCollarPreviewTemplate } from "@/components/site-templates/blue-collar-preview";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";

export default function RoofingArchetypePreviewPage() {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  if (!render.status.isPreviewSafe) {
    notFound();
  }

  return <BlueCollarPreviewTemplate model={buildBlueCollarPreviewModel(render)} />;
}
```

- [ ] **Step 6: Remove the roofing-specific adapter and component**

Run:

```bash
rm src/lib/template-system/roofing-preview.ts
rm src/components/site-templates/roofing-preview.tsx
```

Expected: both roofing-specific files are removed because the family-level replacements exist.

- [ ] **Step 7: Run the tests to verify the shared preview passes**

Run:

```bash
npm run test:unit
```

Expected: PASS with the new shared preview model assertions and no imports left for the deleted roofing-only files.

- [ ] **Step 8: Commit the shared renderer**

```bash
git add src/lib/template-system/blue-collar-preview.ts src/components/site-templates/blue-collar-preview.tsx src/app/preview/templates/roofing-archetype/page.tsx src/lib/template-system/resolver.test.ts
git rm src/lib/template-system/roofing-preview.ts src/components/site-templates/roofing-preview.tsx
git commit -m "Share blue-collar preview renderer"
```

## Task 4: Branch supported lead previews through the template-system path

**Files:**
- Modify: `src/app/preview/[slug]/page.tsx`

- [ ] **Step 1: Write the failing helper-level test for unsafe fallback behavior**

Add to `src/lib/template-system/resolver.test.ts`:

```ts
test("supported-industry helper rejects unsafe renders", () => {
  const result = resolveLeadTemplatePreview({
    id: "lead-unsafe",
    industry: "HVAC",
    company_name: "",
    city: "Columbus",
    state: "OH",
    phone: "(614) 555-0126",
    email: "service@summitcomfortair.com",
  } as never);

  assert.deepEqual(result, {
    supported: false,
    reason: "UNSAFE_RENDER",
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail if unsafe fallback is not handled**

Run:

```bash
npm run test:unit
```

Expected: FAIL because the helper still allows an unsafe render with missing critical fields.

- [ ] **Step 3: Tighten the helper to reject unsafe renders**

Adjust both roofing and HVAC branches in `src/lib/template-system/lead-preview.ts` to return `UNSAFE_RENDER` when the resolved package is not preview-safe:

```ts
    if (!renderPackage.status.isPreviewSafe) {
      return { supported: false as const, reason: "UNSAFE_RENDER" as const };
    }
```

Keep that check before returning the supported result.

- [ ] **Step 4: Update the preview page to branch through the helper**

Modify `src/app/preview/[slug]/page.tsx`:

```ts
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { BlueCollarPreviewTemplate } from "@/components/site-templates/blue-collar-preview";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { resolveLeadTemplatePreview } from "@/lib/template-system/lead-preview";
import { getLeadById, requirePreviewSiteBySlug } from "@/lib/preview-sites";
```

Then branch at the top of the page function:

```ts
  const lead = await getLeadById(slug);

  if (lead) {
    const templatePreview = resolveLeadTemplatePreview(lead);

    if (templatePreview.supported) {
      return <BlueCollarPreviewTemplate model={buildBlueCollarPreviewModel(templatePreview.renderPackage)} />;
    }
  }
```

Leave the existing legacy `requirePreviewSiteBySlug(slug)` flow untouched after that branch.

- [ ] **Step 5: Run full verification**

Run:

```bash
npm run test:unit
npm run typecheck
npm run build
```

Expected:

- `npm run test:unit` -> PASS
- `npm run typecheck` -> PASS
- `npm run build` -> PASS

- [ ] **Step 6: Verify the result locally in web format**

Run:

```bash
npm run dev
```

Then verify in a browser:

- `/preview/templates/roofing-archetype` renders through the shared blue-collar preview
- a supported roofing lead ID route renders the new path
- a supported HVAC lead ID route renders the new path
- an unsupported lead preview still falls back to the legacy layout

Expected: the web output confirms the architecture behaves correctly beyond test-level verification.

- [ ] **Step 7: Commit the lead preview integration**

```bash
git add src/lib/template-system/lead-preview.ts src/app/preview/[slug]/page.tsx src/lib/template-system/resolver.test.ts
git commit -m "Route supported lead previews through template system"
```

## Self-Review

- Spec coverage:
  - HVAC niche and seed: covered by Task 1
  - centralized supported-industry helper and HVAC normalization: covered by Task 2
  - family-level shared renderer: covered by Task 3
  - `/preview/[slug]` narrow branch with preview-safe gating and legacy fallback: covered by Task 4
  - local web verification: covered by Task 4 step 6
- Placeholder scan:
  - No `TODO`, `TBD`, or deferred implementation markers remain
  - Every code step includes concrete code or exact commands
- Type consistency:
  - Shared renderer uses `buildBlueCollarPreviewModel`
  - lead helper uses `resolveLeadTemplatePreview`
  - HVAC fixtures consistently use `HVAC_NICHE_TEMPLATE` and `HVAC_SEED_BUSINESS`
