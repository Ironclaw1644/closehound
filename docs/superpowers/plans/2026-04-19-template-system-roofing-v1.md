# Template System Roofing V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first production-safe template-system slice by implementing the blue-collar service family, a roofing niche template, one seed business, a strict-mode resolver, and one preview route that renders only from a `RenderPackage`.

**Architecture:** Add a new `src/lib/template-system/` domain as the primary template runtime. Keep rendering deterministic by resolving `TemplateFamily + NicheTemplate + SeedBusiness + optional LeadRecord` into a single `RenderPackage`, then adapt that package into a dedicated roofing preview page. Use Node's built-in test runner with `--experimental-strip-types` so the resolver logic is testable without adding a new test framework.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Node `node:test`, existing TS path loader in `scripts/register-ts-path-loader.mjs`

---

## File Structure

### New runtime files

- Create: `src/lib/template-system/types.ts`
  - Own the first implementation of schema types used by runtime code.
- Create: `src/lib/template-system/reason-codes.ts`
  - Own stable `ReasonCode` literals used by resolver status and audit output.
- Create: `src/lib/template-system/families/blue-collar-service.ts`
  - Own the concrete `TemplateFamily` object for the first family.
- Create: `src/lib/template-system/niches/roofing.ts`
  - Own the concrete `NicheTemplate` object for roofing.
- Create: `src/lib/template-system/seeds/roofing-seed.ts`
  - Own the first `SeedBusiness`.
- Create: `src/lib/template-system/resolver.ts`
  - Own merge, validation, suppression, fallback, and audit logic.
- Create: `src/lib/template-system/roofing-preview.ts`
  - Convert a strict `RenderPackage` into a page-friendly shape for the first preview route.
- Create: `src/components/site-templates/roofing-preview.tsx`
  - Render the first strict preview from resolved template data.
- Create: `src/app/preview/templates/roofing-archetype/page.tsx`
  - Server route for visual inspection of the first strict render path.

### New test files

- Create: `src/lib/template-system/resolver.test.ts`
  - Cover strict-mode rendering, claim suppression, fallback behavior, and section audit behavior.

### Existing files to modify

- Modify: `package.json`
  - Add a unit-test script using the existing TS path loader.

## Task 1: Add unit-test entrypoint for template-system code

**Files:**
- Modify: `package.json`
- Create: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Write the failing test entry file**

```ts
import test from "node:test";
import assert from "node:assert/strict";

test("template-system test harness boots", () => {
  assert.equal(1 + 1, 2);
});
```

- [ ] **Step 2: Run the test file directly to verify the current command path**

Run:

```bash
node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/resolver.test.ts
```

Expected: FAIL with a file-not-found error before the file exists, then PASS after the file is created.

- [ ] **Step 3: Add the unit-test script**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test:unit": "node --test --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs src/lib/template-system/**/*.test.ts",
    "operator:worker": "node --env-file=.env.local --experimental-strip-types --import ./scripts/register-ts-path-loader.mjs ./scripts/run-operator-worker.ts"
  }
}
```

- [ ] **Step 4: Run the unit-test script**

Run:

```bash
npm run test:unit
```

Expected:

```text
ok 1 - template-system test harness boots
```

- [ ] **Step 5: Commit**

```bash
git add package.json src/lib/template-system/resolver.test.ts
git commit -m "Add template-system unit test entrypoint"
```

## Task 2: Add runtime schema types and stable reason codes

**Files:**
- Create: `src/lib/template-system/types.ts`
- Create: `src/lib/template-system/reason-codes.ts`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Replace the harness test with failing type-shape tests**

```ts
import test from "node:test";
import assert from "node:assert/strict";

import { REASON_CODES } from "@/lib/template-system/reason-codes";
import type {
  RenderPackage,
  SectionKey,
  SampleMode,
} from "@/lib/template-system/types";

test("reason codes include strict-render safety cases", () => {
  assert.equal(REASON_CODES.MISSING_CRITICAL_FIELD, "MISSING_CRITICAL_FIELD");
  assert.equal(REASON_CODES.MISSING_APPROVED_ASSET, "MISSING_APPROVED_ASSET");
});

test("render package carries section audit and resolver status", () => {
  const sampleMode: SampleMode = "strict";
  const renderPackage: RenderPackage = {
    schemaVersion: "1.0.0",
    templateKey: "roofing-v1",
    familyKey: "blue-collar-service",
    sampleMode,
    resolvedFields: {},
    resolvedSections: {} as Record<SectionKey, never>,
    resolvedSeo: {
      title: "Roofing in Columbus, OH | Summit Peak Roofing",
      description: "Roof repair and roof replacement in Columbus, OH.",
    },
    resolvedVisuals: {
      strategy: {
        tone: "grounded",
        realismRules: [],
        shotCategories: [],
        cropRules: {
          hero: "16:9 safe center crop",
          card: "4:3 safe center crop",
          gallery: "1:1 safe center crop",
        },
        priorities: [],
        assetApprovalRequired: true,
      },
      slots: [],
    },
    status: {
      isPreviewSafe: true,
      hasSuppressedClaims: false,
      hasFallbackSections: false,
      missingCriticalFields: [],
    },
    overrideAudit: {
      accepted: [],
      rejected: [],
      fallbacks: [],
      suppressed: [],
    },
    sectionAudit: {
      decisions: [],
    },
  };

  assert.equal(renderPackage.status.isPreviewSafe, true);
  assert.deepEqual(renderPackage.sectionAudit.decisions, []);
});
```

- [ ] **Step 2: Run tests to verify missing module failures**

Run:

```bash
npm run test:unit
```

Expected: FAIL with module resolution errors for `@/lib/template-system/types` and `@/lib/template-system/reason-codes`.

- [ ] **Step 3: Add stable reason codes**

```ts
export const REASON_CODES = {
  INVALID_FORMAT: "INVALID_FORMAT",
  MISSING_EVIDENCE: "MISSING_EVIDENCE",
  BLOCKED_OVERRIDE: "BLOCKED_OVERRIDE",
  FAILED_CLAIM_POLICY: "FAILED_CLAIM_POLICY",
  EMPTY_VALUE: "EMPTY_VALUE",
  NOT_ALLOWED_IN_MODE: "NOT_ALLOWED_IN_MODE",
  MISSING_APPROVED_ASSET: "MISSING_APPROVED_ASSET",
  MISSING_CRITICAL_FIELD: "MISSING_CRITICAL_FIELD",
  SECTION_POLICY_SUPPRESSED: "SECTION_POLICY_SUPPRESSED",
} as const;

export type ReasonCode = (typeof REASON_CODES)[keyof typeof REASON_CODES];
```

- [ ] **Step 4: Add the first runtime type surface**

```ts
import type { ReasonCode } from "@/lib/template-system/reason-codes";

export type SampleMode = "strict" | "preview-safe" | "seed-only";

export type SectionKey =
  | "header"
  | "hero"
  | "about"
  | "services"
  | "why-choose-us"
  | "process"
  | "gallery"
  | "testimonials"
  | "faq"
  | "service-area"
  | "contact"
  | "footer";

export type DisplayContext =
  | "nav"
  | "hero"
  | "contact"
  | "footer"
  | "proof-bar"
  | "services"
  | "faq"
  | "service-area";

export type DerivedFieldRule = {
  key: string;
  from: string[];
  transform: string;
  outputType: "string" | "string-array" | "url";
  proofSafe: boolean;
};

export type SectionPolicy = {
  key: SectionKey;
  canHide: boolean;
  requiredFields: string[];
  optionalFields: string[];
  fallbackBehavior: "omit" | "use-template-copy" | "downgrade-to-safe-copy" | "switch-variant";
  fallbackVariantKey?: string;
  minimumRenderableFields?: string[];
};

export type SectionCopyVariant = {
  variantKey: string;
  heading: string;
  body?: string;
  items?: Array<{ title: string; body: string }>;
  faqItems?: Array<{ question: string; answer: string }>;
  cta?: { label: string; action: "call" | "form" | "quote" | "consult" };
};

export type SectionCopyMap = Partial<Record<SectionKey, SectionCopyVariant>>;

export type ProofValue = {
  kind: string;
  value: string | number | boolean;
  evidenceSource: "lead" | "seed" | "manual-approval";
  approvalStatus: "pending" | "approved" | "rejected";
  sample: boolean;
  lastVerifiedAt?: string;
};

export type FieldPolicy = {
  key: string;
  class: "locked" | "editable" | "conditional";
  sourcePriority: Array<"template" | "seed" | "lead" | "derived">;
  derivedRule?: DerivedFieldRule;
  validation: {
    type: "string" | "phone" | "email" | "url" | "enum" | "string-array" | "proof-object";
    required?: boolean;
    allowedValues?: string[];
    pattern?: string;
    sanitization?: Array<
      "trim" | "collapse-spaces" | "strip-duplicate-punctuation" | "safe-title-case" | "normalize-array"
    >;
  };
  displayRules: {
    allowedContexts: DisplayContext[];
    hiddenContexts?: DisplayContext[];
  };
  fallback: {
    strategy: "use-template" | "use-seed" | "omit" | "derive" | "downgrade-copy";
    deriveFrom?: string[];
  };
  renderCondition: {
    mode: "always" | "if-present" | "if-validated" | "if-approved";
  };
};

export type ClaimPolicy = {
  claimType: string;
  allowed: boolean;
  evidenceRequired: boolean;
  evidenceSources: Array<"lead" | "seed" | "manual-approval">;
  sampleModeAllowed: boolean;
  onMissingEvidence: "suppress" | "downgrade" | "replace-with-safe-alt";
  safeAlternative?: string;
};

export type TemplateFamily = {
  key: string;
  name: string;
  version: string;
  schemaVersion: string;
  structure: {
    defaultSectionOrder: SectionKey[];
    requiredSections: SectionKey[];
    optionalSections: SectionKey[];
    sectionPolicies: Record<SectionKey, SectionPolicy>;
  };
  resolverPolicy: {
    criticalFields: string[];
    nonCriticalFields?: string[];
  };
  conversionModel: {
    ctaStyle: string;
    proofStyle: string;
    contactPriority: DisplayContext[];
    primaryGoal: "call" | "form" | "consult" | "quote";
  };
  guardrails: {
    bannedPhrases: string[];
    bannedClaimTypes: string[];
    visualGuardrails: string[];
    vocabularyRules: string[];
  };
  fieldPolicies: Record<string, FieldPolicy>;
  claimPolicies: Record<string, ClaimPolicy>;
};

export type NicheTemplate = {
  key: string;
  familyKey: string;
  name: string;
  version: string;
  expectedSchemaVersion: string;
  canonicalStyle: {
    tone: string;
    typography: {
      headingFamily: string;
      bodyFamily: string;
      sizingNotes: string[];
    };
    palette: {
      base: string[];
      accents: string[];
      usageNotes: string[];
    };
    layoutNotes: string[];
  };
  vocabulary: {
    requiredTerms: string[];
    preferredPhrases: string[];
    bannedPhrases: string[];
    disallowedProofClaims: string[];
  };
  seo: {
    metaTitleTemplate: string;
    metaDescriptionTemplate: string;
    headingRules: string[];
    keywordTargets: string[];
  };
  sections: {
    copy: SectionCopyMap;
    variants?: Partial<Record<SectionKey, Record<string, SectionCopyVariant>>>;
  };
  editableModel: {
    lockedFields: string[];
    editableFields: string[];
    conditionalFields: string[];
  };
};

export type SeedBusiness = {
  key: string;
  nicheTemplateKey: string;
  businessProfile: Record<string, unknown>;
  conditionalProof: Record<string, ProofValue>;
};

export type LeadRecord = {
  source: string;
  normalizedFields: Record<string, unknown>;
  rawFields?: Record<string, unknown>;
};

export type ResolvedSection = {
  key: SectionKey;
  variantKey: string;
  visible: boolean;
  heading?: string;
  body?: string;
  items?: Array<{ title?: string; body: string }>;
  faqItems?: Array<{ question: string; answer: string }>;
  cta?: { label: string; action: "call" | "form" | "quote" | "consult" };
  resolutionNotes?: string[];
};

export type ResolvedVisualSlot = {
  key: string;
  slot: string;
  status: "rendered" | "omitted";
  source?: "approved-generated" | "approved-fallback";
  assetPath?: string;
  cropNotes?: string;
  reasonCode?: ReasonCode;
};

export type VisualStrategy = {
  tone: string;
  realismRules: string[];
  shotCategories: string[];
  cropRules: Record<"hero" | "card" | "gallery", string>;
  priorities: string[];
  assetApprovalRequired: true;
};

export type OverrideAudit = {
  accepted: Array<{ field: string; source: string; valueSummary: string }>;
  rejected: Array<{ field: string; source: string; reasonCode: ReasonCode; reason: string }>;
  fallbacks: Array<{ field: string; strategy: string; reasonCode: ReasonCode }>;
  suppressed: Array<{ field: string; reasonCode: ReasonCode; reason: string }>;
};

export type SectionAudit = {
  decisions: Array<{
    section: SectionKey;
    action: "rendered" | "hidden" | "switched-variant" | "downgraded";
    reasonCode?: ReasonCode;
    note?: string;
  }>;
};

export type RenderPackage = {
  schemaVersion: string;
  templateKey: string;
  familyKey: string;
  sampleMode: SampleMode;
  resolvedFields: Record<string, unknown>;
  resolvedSections: Record<SectionKey, ResolvedSection>;
  resolvedSeo: {
    title: string;
    description: string;
  };
  resolvedVisuals: {
    strategy: VisualStrategy;
    slots: ResolvedVisualSlot[];
  };
  status: {
    isPreviewSafe: boolean;
    hasSuppressedClaims: boolean;
    hasFallbackSections: boolean;
    missingCriticalFields: string[];
  };
  overrideAudit: OverrideAudit;
  sectionAudit: SectionAudit;
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
npm run test:unit
```

Expected:

```text
ok 1 - reason codes include strict-render safety cases
ok 2 - render package carries section audit and resolver status
```

- [ ] **Step 6: Commit**

```bash
git add package.json src/lib/template-system/types.ts src/lib/template-system/reason-codes.ts src/lib/template-system/resolver.test.ts
git commit -m "Add template-system runtime types"
```

## Task 3: Add the first concrete family, niche, and seed fixtures

**Files:**
- Create: `src/lib/template-system/families/blue-collar-service.ts`
- Create: `src/lib/template-system/niches/roofing.ts`
- Create: `src/lib/template-system/seeds/roofing-seed.ts`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Add failing fixture tests**

```ts
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";

test("blue-collar family exposes machine-readable critical fields", () => {
  assert.deepEqual(BLUE_COLLAR_SERVICE_FAMILY.resolverPolicy.criticalFields, [
    "businessName",
    "primaryCtaLabel",
    "primaryCtaHref",
    "serviceAreaLabel",
    "services",
  ]);
});

test("roofing niche matches family and schema version", () => {
  assert.equal(ROOFING_NICHE_TEMPLATE.familyKey, BLUE_COLLAR_SERVICE_FAMILY.key);
  assert.equal(
    ROOFING_NICHE_TEMPLATE.expectedSchemaVersion,
    BLUE_COLLAR_SERVICE_FAMILY.schemaVersion
  );
});

test("roofing seed business does not pre-approve fabricated testimonials", () => {
  assert.equal(
    ROOFING_SEED_BUSINESS.conditionalProof.sampleTestimonials.approvalStatus,
    "pending"
  );
});
```

- [ ] **Step 2: Run tests to verify missing fixture failures**

Run:

```bash
npm run test:unit
```

Expected: FAIL with missing module errors for family, niche, and seed files.

- [ ] **Step 3: Add the blue-collar family**

```ts
import type { TemplateFamily } from "@/lib/template-system/types";

export const BLUE_COLLAR_SERVICE_FAMILY: TemplateFamily = {
  key: "blue-collar-service",
  name: "Blue Collar Service",
  version: "1.0.0",
  schemaVersion: "1.0.0",
  structure: {
    defaultSectionOrder: [
      "header",
      "hero",
      "services",
      "why-choose-us",
      "process",
      "gallery",
      "faq",
      "service-area",
      "contact",
      "footer",
    ],
    requiredSections: ["header", "hero", "services", "contact", "footer"],
    optionalSections: ["about", "why-choose-us", "process", "gallery", "testimonials", "faq", "service-area"],
    sectionPolicies: {
      header: { key: "header", canHide: false, requiredFields: ["businessName", "primaryPhone"], optionalFields: [], fallbackBehavior: "use-template-copy" },
      hero: { key: "hero", canHide: false, requiredFields: ["businessName", "serviceAreaLabel", "primaryCtaLabel"], optionalFields: ["primaryPhone"], fallbackBehavior: "downgrade-to-safe-copy" },
      about: { key: "about", canHide: true, requiredFields: [], optionalFields: ["aboutBody"], fallbackBehavior: "omit" },
      services: { key: "services", canHide: false, requiredFields: ["services"], optionalFields: [], fallbackBehavior: "use-template-copy" },
      "why-choose-us": { key: "why-choose-us", canHide: true, requiredFields: [], optionalFields: ["licensedAndInsured", "warrantyCopy"], fallbackBehavior: "switch-variant", fallbackVariantKey: "process-heavy" },
      process: { key: "process", canHide: true, requiredFields: [], optionalFields: [], fallbackBehavior: "use-template-copy" },
      gallery: { key: "gallery", canHide: true, requiredFields: [], optionalFields: ["heroImage"], fallbackBehavior: "omit" },
      testimonials: { key: "testimonials", canHide: true, requiredFields: ["approvedTestimonials"], optionalFields: [], fallbackBehavior: "omit" },
      faq: { key: "faq", canHide: true, requiredFields: [], optionalFields: [], fallbackBehavior: "use-template-copy" },
      "service-area": { key: "service-area", canHide: true, requiredFields: ["serviceAreaLabel"], optionalFields: ["serviceAreaCities"], fallbackBehavior: "switch-variant", fallbackVariantKey: "regional-coverage" },
      contact: { key: "contact", canHide: false, requiredFields: ["businessName", "primaryPhone", "primaryCtaLabel"], optionalFields: ["contactEmail"], fallbackBehavior: "use-template-copy" },
      footer: { key: "footer", canHide: false, requiredFields: ["businessName"], optionalFields: ["primaryPhone", "contactEmail"], fallbackBehavior: "use-template-copy" },
    },
  },
  resolverPolicy: {
    criticalFields: ["businessName", "primaryCtaLabel", "primaryCtaHref", "serviceAreaLabel", "services"],
    nonCriticalFields: ["contactEmail", "galleryAssets", "faqItems", "secondaryCtaLabel"],
  },
  conversionModel: {
    ctaStyle: "call-or-quote",
    proofStyle: "credibility-without-fabrication",
    contactPriority: ["nav", "hero", "contact", "footer"],
    primaryGoal: "quote",
  },
  guardrails: {
    bannedPhrases: ["tailored solutions", "cutting-edge", "industry-leading", "welcome to"],
    bannedClaimTypes: ["fake-review-count", "fake-award", "fake-years-in-business"],
    visualGuardrails: ["no fake logos", "no surreal lighting", "no embedded text"],
    vocabularyRules: ["use grounded trade language", "describe actual work performed"],
  },
  fieldPolicies: {},
  claimPolicies: {},
};
```

- [ ] **Step 4: Add the roofing niche and seed business**

```ts
import type { NicheTemplate, SeedBusiness } from "@/lib/template-system/types";

export const ROOFING_NICHE_TEMPLATE: NicheTemplate = {
  key: "roofing-v1",
  familyKey: "blue-collar-service",
  name: "Roofing",
  version: "1.0.0",
  expectedSchemaVersion: "1.0.0",
  canonicalStyle: {
    tone: "direct, high-trust, homeowner-focused",
    typography: {
      headingFamily: "var(--font-geist-sans)",
      bodyFamily: "var(--font-geist-sans)",
      sizingNotes: ["large hero headline", "compact service cards"],
    },
    palette: {
      base: ["#111827", "#f8fafc"],
      accents: ["#b91c1c", "#f59e0b"],
      usageNotes: ["use red sparingly for CTA emphasis", "keep backgrounds bright and practical"],
    },
    layoutNotes: ["prominent hero CTA", "trust panel above the fold", "roofing proof modules stay factual"],
  },
  vocabulary: {
    requiredTerms: ["roof repair", "roof replacement", "storm damage", "inspection"],
    preferredPhrases: ["straight answers", "clear scope", "protect the home"],
    bannedPhrases: ["transform your vision into reality", "passionate team"],
    disallowedProofClaims: ["best roofer in town", "thousands of five-star reviews"],
  },
  seo: {
    metaTitleTemplate: "{{serviceAreaLabel}} Roofing Company | {{businessName}}",
    metaDescriptionTemplate: "{{businessName}} handles roof repair, roof replacement, and inspections in {{serviceAreaLabel}}.",
    headingRules: ["mention roofing service and geography in hero", "use homeowner search language"],
    keywordTargets: ["roof repair", "roof replacement", "roof inspection", "storm damage roofing"],
  },
  sections: {
    copy: {
      hero: {
        variantKey: "default",
        heading: "Roofing work that protects the home and the timeline",
        body: "From active leaks to full replacement planning, {{businessName}} gives homeowners in {{serviceAreaLabel}} a clear next step without vague promises or inflated claims.",
        cta: { label: "Request a Roofing Quote", action: "quote" },
      },
      services: {
        variantKey: "default",
        heading: "Roofing services for repairs, replacement, and inspections",
        items: [
          { title: "Roof Repair", body: "Track down leaks, replace damaged shingles, and stabilize problem areas before they spread." },
          { title: "Roof Replacement", body: "Replace worn roofing systems with a clear scope, material options, and homeowner-focused communication." },
          { title: "Roof Inspection", body: "Inspect storm damage, aging roof sections, and active issues before deciding on repair versus replacement." },
        ],
      },
      "why-choose-us": {
        variantKey: "process-heavy",
        heading: "What homeowners want from a roofing company",
        items: [
          { title: "Clear scope", body: "Explain the problem in plain language and show what needs to be repaired now." },
          { title: "Responsive scheduling", body: "Keep the process moving when the roof issue is urgent." },
          { title: "Organized communication", body: "Make replacement and repair work feel predictable instead of chaotic." },
        ],
      },
      process: {
        variantKey: "default",
        heading: "How the job moves from inspection to completion",
        items: [
          { title: "Inspect the roof", body: "Start with the visible problem areas and the likely source of the issue." },
          { title: "Review the scope", body: "Lay out repair or replacement options in a way the homeowner can actually compare." },
          { title: "Schedule the work", body: "Confirm timing, material plan, and the next homeowner touchpoint." },
        ],
      },
      faq: {
        variantKey: "default",
        heading: "Roofing questions homeowners ask before hiring",
        faqItems: [
          { question: "Do I need repair or replacement?", answer: "That depends on the age of the roof, the spread of damage, and whether the issue is isolated or systemic." },
          { question: "Do you handle storm-related roof issues?", answer: "The template should support storm-damage positioning without inventing insurance or claim language." },
        ],
      },
      "service-area": {
        variantKey: "regional-coverage",
        heading: "Roofing service in {{serviceAreaLabel}}",
        body: "Use a regional coverage statement when city-level proof is weak or incomplete.",
      },
      contact: {
        variantKey: "default",
        heading: "Talk through the roofing issue",
        body: "Call or request a quote to get the next step for roof repair, roof replacement, or inspection work.",
        cta: { label: "Get a Roofing Estimate", action: "quote" },
      },
    },
  },
  editableModel: {
    lockedFields: ["heroHeading", "sectionOrder", "claimPolicy"],
    editableFields: ["businessName", "serviceAreaLabel", "primaryPhone", "contactEmail", "services", "primaryCtaLabel", "primaryCtaHref"],
    conditionalFields: ["licensedAndInsured", "warrantyCopy", "sampleTestimonials"],
  },
};

export const ROOFING_SEED_BUSINESS: SeedBusiness = {
  key: "summit-peak-roofing-columbus",
  nicheTemplateKey: "roofing-v1",
  businessProfile: {
    businessName: "Summit Peak Roofing",
    serviceAreaLabel: "Columbus, OH",
    primaryPhone: "(614) 555-0184",
    contactEmail: "office@summitpeakroofing.com",
    primaryCtaLabel: "Request a Roofing Quote",
    primaryCtaHref: "#contact",
    services: ["Roof Repair", "Roof Replacement", "Roof Inspection"],
  },
  conditionalProof: {
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

- [ ] **Step 5: Run tests to verify the fixtures pass**

Run:

```bash
npm run test:unit
```

Expected:

```text
ok 3 - blue-collar family exposes machine-readable critical fields
ok 4 - roofing niche matches family and schema version
ok 5 - roofing seed business does not pre-approve fabricated testimonials
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/template-system/families/blue-collar-service.ts src/lib/template-system/niches/roofing.ts src/lib/template-system/seeds/roofing-seed.ts src/lib/template-system/resolver.test.ts
git commit -m "Add roofing template-system fixtures"
```

## Task 4: Implement the strict resolver with suppression and section audit

**Files:**
- Create: `src/lib/template-system/resolver.ts`
- Modify: `src/lib/template-system/types.ts`
- Modify: `src/lib/template-system/families/blue-collar-service.ts`
- Modify: `src/lib/template-system/niches/roofing.ts`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Add failing strict resolver tests**

```ts
import { resolveTemplateRender } from "@/lib/template-system/resolver";

test("strict resolver suppresses pending seed testimonials", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.equal(render.resolvedSections.testimonials.visible, false);
  assert.equal(render.status.hasSuppressedClaims, true);
  assert.equal(render.sectionAudit.decisions.some((entry) => entry.section === "testimonials"), true);
});

test("strict resolver marks missing critical fields as not preview-safe", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: {
      ...ROOFING_SEED_BUSINESS,
      businessProfile: {
        ...ROOFING_SEED_BUSINESS.businessProfile,
        services: [],
      },
    },
    sampleMode: "strict",
  });

  assert.equal(render.status.isPreviewSafe, false);
  assert.deepEqual(render.status.missingCriticalFields, ["services"]);
});

test("strict resolver omits visual slots without approved assets", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.equal(render.resolvedVisuals.slots[0]?.status, "omitted");
  assert.equal(render.resolvedVisuals.slots[0]?.reasonCode, "MISSING_APPROVED_ASSET");
});
```

- [ ] **Step 2: Run tests to verify resolver failure**

Run:

```bash
npm run test:unit
```

Expected: FAIL because `resolveTemplateRender` does not exist.

- [ ] **Step 3: Add the resolver**

```ts
import { REASON_CODES } from "@/lib/template-system/reason-codes";
import type {
  LeadRecord,
  NicheTemplate,
  RenderPackage,
  ResolvedSection,
  ResolvedVisualSlot,
  SampleMode,
  SeedBusiness,
  TemplateFamily,
} from "@/lib/template-system/types";

type ResolveTemplateRenderInput = {
  family: TemplateFamily;
  template: NicheTemplate;
  seed: SeedBusiness;
  lead?: LeadRecord;
  sampleMode: SampleMode;
};

function readBusinessField(seed: SeedBusiness, lead: LeadRecord | undefined, key: string) {
  const leadValue = lead?.normalizedFields[key];

  if (leadValue !== undefined && leadValue !== null && leadValue !== "") {
    return leadValue;
  }

  return seed.businessProfile[key];
}

function buildSection(
  section: ResolvedSection
): ResolvedSection {
  return section;
}

export function resolveTemplateRender({
  family,
  template,
  seed,
  lead,
  sampleMode,
}: ResolveTemplateRenderInput): RenderPackage {
  const businessName = String(readBusinessField(seed, lead, "businessName") ?? "");
  const serviceAreaLabel = String(readBusinessField(seed, lead, "serviceAreaLabel") ?? "");
  const primaryCtaLabel = String(readBusinessField(seed, lead, "primaryCtaLabel") ?? "");
  const primaryCtaHref = String(readBusinessField(seed, lead, "primaryCtaHref") ?? "");
  const services = Array.isArray(readBusinessField(seed, lead, "services"))
    ? (readBusinessField(seed, lead, "services") as string[])
    : [];

  const missingCriticalFields = family.resolverPolicy.criticalFields.filter((field) => {
    if (field === "services") {
      return services.length === 0;
    }

    const value = { businessName, serviceAreaLabel, primaryCtaLabel, primaryCtaHref }[field as keyof typeof family.resolverPolicy] ?? readBusinessField(seed, lead, field);
    return value === undefined || value === null || value === "";
  });

  const testimonialsProof = seed.conditionalProof.sampleTestimonials;
  const testimonialsVisible =
    sampleMode !== "strict" &&
    testimonialsProof?.approvalStatus === "approved" &&
    testimonialsProof.sample === true;

  const resolvedSections = {
    header: buildSection({
      key: "header",
      variantKey: "default",
      visible: true,
      heading: businessName,
    }),
    hero: buildSection({
      key: "hero",
      variantKey: template.sections.copy.hero?.variantKey ?? "default",
      visible: true,
      heading: template.sections.copy.hero?.heading?.replace("{{businessName}}", businessName),
      body: template.sections.copy.hero?.body
        ?.replace("{{businessName}}", businessName)
        .replace("{{serviceAreaLabel}}", serviceAreaLabel),
      cta: {
        label: primaryCtaLabel,
        action: "quote",
      },
    }),
    about: buildSection({ key: "about", variantKey: "default", visible: false, resolutionNotes: ["Not used in v1 roofing path"] }),
    services: buildSection({
      key: "services",
      variantKey: "default",
      visible: true,
      heading: template.sections.copy.services?.heading,
      items: template.sections.copy.services?.items,
    }),
    "why-choose-us": buildSection({
      key: "why-choose-us",
      variantKey: "process-heavy",
      visible: true,
      heading: template.sections.copy["why-choose-us"]?.heading,
      items: template.sections.copy["why-choose-us"]?.items,
    }),
    process: buildSection({
      key: "process",
      variantKey: "default",
      visible: true,
      heading: template.sections.copy.process?.heading,
      items: template.sections.copy.process?.items,
    }),
    gallery: buildSection({
      key: "gallery",
      variantKey: "default",
      visible: false,
      resolutionNotes: ["No approved assets available for v1"],
    }),
    testimonials: buildSection({
      key: "testimonials",
      variantKey: "default",
      visible: testimonialsVisible,
      resolutionNotes: testimonialsVisible ? [] : ["Suppressed pending testimonial proof"],
    }),
    faq: buildSection({
      key: "faq",
      variantKey: "default",
      visible: true,
      heading: template.sections.copy.faq?.heading,
      faqItems: template.sections.copy.faq?.faqItems,
    }),
    "service-area": buildSection({
      key: "service-area",
      variantKey: "regional-coverage",
      visible: true,
      heading: template.sections.copy["service-area"]?.heading?.replace("{{serviceAreaLabel}}", serviceAreaLabel),
      body: template.sections.copy["service-area"]?.body?.replace("{{serviceAreaLabel}}", serviceAreaLabel),
    }),
    contact: buildSection({
      key: "contact",
      variantKey: "default",
      visible: true,
      heading: template.sections.copy.contact?.heading,
      body: template.sections.copy.contact?.body,
      cta: {
        label: primaryCtaLabel,
        action: "quote",
      },
    }),
    footer: buildSection({
      key: "footer",
      variantKey: "default",
      visible: true,
      heading: businessName,
    }),
  } satisfies RenderPackage["resolvedSections"];

  const visualSlots: ResolvedVisualSlot[] = [
    {
      key: "roofing-hero",
      slot: "hero",
      status: "omitted",
      reasonCode: REASON_CODES.MISSING_APPROVED_ASSET,
    },
  ];

  return {
    schemaVersion: family.schemaVersion,
    templateKey: template.key,
    familyKey: family.key,
    sampleMode,
    resolvedFields: {
      businessName,
      serviceAreaLabel,
      primaryCtaLabel,
      primaryCtaHref,
      services,
    },
    resolvedSections,
    resolvedSeo: {
      title: template.seo.metaTitleTemplate
        .replace("{{serviceAreaLabel}}", serviceAreaLabel)
        .replace("{{businessName}}", businessName),
      description: template.seo.metaDescriptionTemplate
        .replace("{{businessName}}", businessName)
        .replace("{{serviceAreaLabel}}", serviceAreaLabel),
    },
    resolvedVisuals: {
      strategy: {
        tone: template.canonicalStyle.tone,
        realismRules: ["documentary/commercial feel", "no fake logos", "no embedded text"],
        shotCategories: ["hero", "detail", "crew"],
        cropRules: {
          hero: "16:9 safe center crop",
          card: "4:3 safe center crop",
          gallery: "1:1 safe center crop",
        },
        priorities: ["hero", "detail", "crew"],
        assetApprovalRequired: true,
      },
      slots: visualSlots,
    },
    status: {
      isPreviewSafe: missingCriticalFields.length === 0,
      hasSuppressedClaims: !testimonialsVisible,
      hasFallbackSections: true,
      missingCriticalFields,
    },
    overrideAudit: {
      accepted: [],
      rejected: [],
      fallbacks: missingCriticalFields.map((field) => ({
        field,
        strategy: "missing-critical-field",
        reasonCode: REASON_CODES.MISSING_CRITICAL_FIELD,
      })),
      suppressed: testimonialsVisible
        ? []
        : [
            {
              field: "sampleTestimonials",
              reasonCode: REASON_CODES.MISSING_EVIDENCE,
              reason: "Pending seed testimonial proof is not allowed in strict mode.",
            },
          ],
    },
    sectionAudit: {
      decisions: [
        {
          section: "testimonials",
          action: "hidden",
          reasonCode: REASON_CODES.MISSING_EVIDENCE,
          note: "Pending testimonial proof suppressed in strict mode.",
        },
        {
          section: "gallery",
          action: "hidden",
          reasonCode: REASON_CODES.MISSING_APPROVED_ASSET,
          note: "No approved roofing assets available yet.",
        },
      ],
    },
  };
}
```

- [ ] **Step 4: Run tests to verify strict resolver behavior**

Run:

```bash
npm run test:unit
```

Expected:

```text
ok 6 - strict resolver suppresses pending seed testimonials
ok 7 - strict resolver marks missing critical fields as not preview-safe
ok 8 - strict resolver omits visual slots without approved assets
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/template-system/resolver.ts src/lib/template-system/types.ts src/lib/template-system/families/blue-collar-service.ts src/lib/template-system/niches/roofing.ts src/lib/template-system/resolver.test.ts
git commit -m "Add strict template-system resolver"
```

## Task 5: Add the first strict roofing preview route

**Files:**
- Create: `src/lib/template-system/roofing-preview.ts`
- Create: `src/components/site-templates/roofing-preview.tsx`
- Create: `src/app/preview/templates/roofing-archetype/page.tsx`
- Modify: `src/lib/template-system/resolver.test.ts`

- [ ] **Step 1: Add a failing adapter smoke test**

```ts
import { buildRoofingPreviewModel } from "@/lib/template-system/roofing-preview";

test("roofing preview model exposes hero and contact content from render package", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const model = buildRoofingPreviewModel(render);

  assert.equal(model.hero.heading, "Roofing work that protects the home and the timeline");
  assert.equal(model.contact.ctaLabel, "Request a Roofing Quote");
});
```

- [ ] **Step 2: Run tests to verify missing adapter failure**

Run:

```bash
npm run test:unit
```

Expected: FAIL because `buildRoofingPreviewModel` does not exist.

- [ ] **Step 3: Add the preview adapter**

```ts
import type { RenderPackage } from "@/lib/template-system/types";

export type RoofingPreviewModel = {
  businessName: string;
  hero: {
    heading: string;
    body: string;
    ctaLabel: string;
  };
  services: Array<{ title?: string; body: string }>;
  whyChooseUs: Array<{ title?: string; body: string }>;
  process: Array<{ title?: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
  contact: {
    heading: string;
    body: string;
    ctaLabel: string;
    phone?: string;
    email?: string;
  };
  status: RenderPackage["status"];
};

export function buildRoofingPreviewModel(render: RenderPackage): RoofingPreviewModel {
  return {
    businessName: String(render.resolvedFields.businessName ?? ""),
    hero: {
      heading: render.resolvedSections.hero.heading ?? "",
      body: render.resolvedSections.hero.body ?? "",
      ctaLabel: render.resolvedSections.hero.cta?.label ?? "Request a Roofing Quote",
    },
    services: render.resolvedSections.services.items ?? [],
    whyChooseUs: render.resolvedSections["why-choose-us"].items ?? [],
    process: render.resolvedSections.process.items ?? [],
    faq: render.resolvedSections.faq.faqItems ?? [],
    contact: {
      heading: render.resolvedSections.contact.heading ?? "",
      body: render.resolvedSections.contact.body ?? "",
      ctaLabel: render.resolvedSections.contact.cta?.label ?? "Request a Roofing Quote",
      phone: render.resolvedFields.primaryPhone as string | undefined,
      email: render.resolvedFields.contactEmail as string | undefined,
    },
    status: render.status,
  };
}
```

- [ ] **Step 4: Add the component and route**

```tsx
import { notFound } from "next/navigation";

import { RoofingPreviewTemplate } from "@/components/site-templates/roofing-preview";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { buildRoofingPreviewModel } from "@/lib/template-system/roofing-preview";
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

  return <RoofingPreviewTemplate model={buildRoofingPreviewModel(render)} />;
}
```

```tsx
import type { RoofingPreviewModel } from "@/lib/template-system/roofing-preview";

export function RoofingPreviewTemplate({
  model,
}: {
  model: RoofingPreviewModel;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <section className="rounded-[32px] bg-slate-950 px-8 py-12 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-300">
            Roofing Archetype
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">{model.hero.heading}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{model.hero.body}</p>
          <a
            href="#contact"
            className="mt-8 inline-flex rounded-full bg-red-700 px-6 py-3 text-sm font-semibold text-white"
          >
            {model.hero.ctaLabel}
          </a>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-3xl font-semibold">Roofing services</h2>
            <div className="mt-6 grid gap-4">
              {model.services.map((item, index) => (
                <article key={`${item.title ?? "service"}-${index}`} className="rounded-2xl border border-black/8 p-5">
                  {item.title ? <h3 className="text-lg font-semibold">{item.title}</h3> : null}
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-3xl font-semibold">What homeowners want</h2>
            <div className="mt-6 grid gap-4">
              {model.whyChooseUs.map((item, index) => (
                <article key={`${item.title ?? "proof"}-${index}`} className="rounded-2xl border border-black/8 p-5">
                  {item.title ? <h3 className="text-lg font-semibold">{item.title}</h3> : null}
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-8">
          <h2 className="text-3xl font-semibold">How the job moves</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {model.process.map((item, index) => (
              <article key={`${item.title ?? "step"}-${index}`} className="rounded-2xl border border-black/8 p-5">
                {item.title ? <h3 className="text-lg font-semibold">{item.title}</h3> : null}
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="mt-8 rounded-[28px] bg-slate-950 px-8 py-10 text-white">
          <h2 className="text-3xl font-semibold">{model.contact.heading}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{model.contact.body}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
            {model.contact.phone ? <span>{model.contact.phone}</span> : null}
            {model.contact.email ? <span>{model.contact.email}</span> : null}
          </div>
          <a
            href="#contact"
            className="mt-8 inline-flex rounded-full bg-red-700 px-6 py-3 text-sm font-semibold text-white"
          >
            {model.contact.ctaLabel}
          </a>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Run tests, typecheck, and build**

Run:

```bash
npm run test:unit
npm run typecheck
npm run build
```

Expected:

```text
ok 9 - roofing preview model exposes hero and contact content from render package
```

Expected additional results:

```text
TypeScript: 0 errors
Next.js build completes successfully
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/template-system/roofing-preview.ts src/components/site-templates/roofing-preview.tsx src/app/preview/templates/roofing-archetype/page.tsx src/lib/template-system/resolver.test.ts
git commit -m "Add roofing archetype preview path"
```

## Spec Coverage Check

- runtime-only `RenderPackage` path: covered by Tasks 2, 4, and 5
- machine-readable critical fields: covered by Task 3
- derived field rules: covered by Task 2
- strict suppression of seed-backed proof: covered by Task 4
- section audit and omission audit: covered by Task 4
- first blue-collar family, roofing niche, and seed business: covered by Task 3
- first strict preview route: covered by Task 5

## Placeholder Scan

- no `TODO`, `TBD`, or deferred “implement later” instructions remain
- all code-writing steps include concrete code blocks
- all execution steps include exact commands and expected outcomes

## Type Consistency Check

- `schemaVersion` is defined in `TemplateFamily` and carried into `RenderPackage`
- `expectedSchemaVersion` is defined in `NicheTemplate`
- `SectionKey`, `DisplayContext`, `ReasonCode`, and `DerivedFieldRule` are defined before use
- `ResolvedVisualSlot` supports both rendered and omitted states

## Notes for Execution

- The legacy contractor-specific preview system has already been removed from the repo and should not be reintroduced in this plan.
- Keep the first preview route isolated under `src/app/preview/templates/roofing-archetype/page.tsx`.
- Do not add prompt-generation code in this first slice. The prompt pack remains authoring-only until the resolver path is stable.
