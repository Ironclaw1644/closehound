# Template System Spec

## Status

- Schema status: proposed and locked for first implementation
- Schema version: `1.0.0`
- Scope: archetype-driven website template library for client-safe preview generation
- Runtime target: preview rendering inside the existing CloseHound Next.js app
- Authoring target: deterministic niche-template generation from schema-derived prompt packs

## Goal

Build a two-stage website template system:

1. Create a reusable template library from controlled niche archetypes.
2. Personalize those finished templates with real lead data without letting raw lead data mutate the template unsafely.

The system must optimize for:

- fast preview generation
- realistic niche-specific copy
- low AI-filler risk
- controlled claim rendering
- predictable lead overrides
- scalable rollout by industry family

## Non-Goals

- fully freeform site generation at runtime
- inventing trust claims from weak or missing data
- letting prompts become the source of truth
- rendering unapproved generated visuals automatically
- building every niche as a fully bespoke system from day one

## Core Principles

- Family base plus niche overlay is the primary architecture.
- The preview engine consumes only resolved render data.
- Prompts are derived artifacts for authoring and QA, not runtime dependencies.
- Lead data may normalize values but may not infer, embellish, or synthesize missing proof.
- Conditional claims require explicit policy checks before rendering.
- Missing proof should suppress or downgrade content rather than force filler.

## Object Model

The system consists of these top-level objects:

- `TemplateFamily`
- `NicheTemplate`
- `SeedBusiness`
- `LeadRecord`
- `RenderPackage`
- `PromptPack`

### Shared Mode Types

```ts
type SectionKey =
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

type DisplayContext =
  | "nav"
  | "hero"
  | "contact"
  | "footer"
  | "proof-bar"
  | "services"
  | "faq"
  | "service-area";

type SectionModePolicy = {
  allowedSections?: SectionKey[];
  suppressedSections?: SectionKey[];
  fallbackVariantBySection?: Partial<Record<SectionKey, string>>;
};

type ClaimModePolicy = {
  allowedClaimTypes?: string[];
  suppressedClaimTypes?: string[];
  allowSampleClaims: boolean;
};

type VisualModePolicy = {
  allowGeneratedFallbacks: boolean;
  requireApprovedAssets: boolean;
  suppressSlots?: string[];
};
```

### Relationships

- A `NicheTemplate` must reference one `TemplateFamily`.
- A `SeedBusiness` must reference one `NicheTemplate`.
- A `LeadRecord` is optional input during personalization.
- A `RenderPackage` is the only object the preview engine may consume.
- A `PromptPack` is derived from schema and is never required by the live renderer.

## Resolution Order

The resolver must process data in this order:

1. `TemplateFamily`
2. `NicheTemplate`
3. `SeedBusiness`
4. `LeadRecord`
5. resolver fallback and suppression rules
6. `RenderPackage`

Later layers may only override earlier layers when earlier layers explicitly allow it.

Compatibility rule:

- a `NicheTemplate` is valid only if its expected schema version is compatible with the active resolver schema version

## Sample Modes

Supported modes:

- `strict`
- `preview-safe`
- `seed-only`

Future mode:

- `internal-demo`

Mode behavior must be centrally controlled at the family level and affect:

- which sections may render
- whether sample testimonials are allowed
- whether proof/stat modules are suppressed
- whether generated fallback visuals are allowed
- whether certain claim types can appear at all

Default client-facing mode is `strict`.

## TemplateFamily

`TemplateFamily` is the base contract for a family of niches such as blue-collar service, health and wellness, or professional trust.

```ts
type TemplateFamily = {
  key: string;
  name: string;
  version: string;
  schemaVersion: string;
  sampleModePolicy: {
    allowedModes: SampleMode[];
    sectionBehaviorByMode: Record<SampleMode, SectionModePolicy>;
    claimBehaviorByMode: Record<SampleMode, ClaimModePolicy>;
    visualBehaviorByMode: Record<SampleMode, VisualModePolicy>;
  };
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
```

### Family Responsibilities

- own section structure and ordering defaults
- define family-wide conversion logic
- define baseline banned-language rules
- define family-wide field behavior
- define claim rendering rules
- define sample-mode policy
- define visual safety rules

## NicheTemplate

`NicheTemplate` is the canonical niche overlay. It contains the specificity that makes the site feel real and niche-native.

```ts
type NicheTemplate = {
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
  icons: {
    sectionIcons: Record<string, string>;
    itemIcons?: Record<string, string>;
    library: "font-awesome";
  };
  sections: {
    copy: SectionCopyMap;
    variants?: Record<string, Record<string, SectionCopyVariant>>;
  };
  visuals: {
    strategy: VisualStrategy;
    assets: VisualAssets;
  };
  editableModel: {
    lockedFields: string[];
    editableFields: string[];
    conditionalFields: string[];
  };
  leadMapping: LeadMappingRules;
  fallbackRules: {
    missingDataRules: string[];
    safeRewriteRules: string[];
  };
};
```

### Niche Responsibilities

- own niche-specific copy
- own niche vocabulary and banned phrasing
- own SEO wording
- own icon mapping
- own visual direction and prompt slots
- own lead override rules
- define fallback copy behavior for missing lead data

Compatibility rule:

- each `NicheTemplate` must fail validation if `expectedSchemaVersion` is incompatible with the active resolver

## SeedBusiness

`SeedBusiness` is a believable sample business used to author and QA the niche archetype. It is not runtime truth.

```ts
type SeedBusiness = {
  key: string;
  nicheTemplateKey: string;
  businessProfile: Record<string, unknown>;
  conditionalProof: Record<string, ProofValue>;
  seedAssets?: {
    logo?: string;
    photos?: string[];
  };
  notes?: string[];
};
```

### SeedBusiness Rules

- must be believable and niche-appropriate
- must not use random junk sample data
- may include approved sample proof only where explicitly allowed
- must support archetype QA without becoming the live source of truth
- seed-backed proof may not appear in client-facing `strict` renders unless explicitly re-approved through the allowed proof workflow

## LeadRecord

`LeadRecord` is normalized lead input used only after the template is already built.

```ts
type LeadRecord = {
  source: string;
  normalizedFields: Record<string, unknown>;
  rawFields?: Record<string, unknown>;
};
```

### LeadRecord Rules

- raw data may be stored separately from normalized data
- only normalized fields participate in mapping
- lead ingestion does not directly control runtime rendering

## RenderPackage

`RenderPackage` is the only object the preview engine may consume.

```ts
type RenderPackage = {
  schemaVersion: string;
  templateKey: string;
  familyKey: string;
  sampleMode: SampleMode;
  resolvedFields: Record<string, unknown>;
  resolvedSections: Record<string, ResolvedSection>;
  resolvedSeo: {
    title: string;
    description: string;
  };
  resolvedVisuals: {
    strategy: VisualStrategy;
    slots: Array<ResolvedVisualSlot>;
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

### RenderPackage Rules

- must be fully resolved before reaching the preview layer
- must carry resolver status metadata
- must carry an override audit trail
- must not require runtime prompt generation

## PromptPack

`PromptPack` exists for authoring, QA, and generation workflows only.

```ts
type PromptPack = {
  generatedFrom: {
    schemaVersion: string;
    familyVersion: string;
    templateVersion: string;
  };
  masterGeneratorPrompt: string;
  imagePromptBuilder: string;
  qaPrompt: string;
  personalizationPrompt?: string;
};
```

### PromptPack Rules

- generated deterministically from schema
- never edited as primary source of truth
- never required by the live preview renderer
- safe to regenerate whenever schema changes

## FieldPolicy

Every renderable field must be governed by a `FieldPolicy`.

```ts
type FieldPolicy = {
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
```

### Field Classes

- `locked`
  - structure and behavior owned by family or niche template
- `editable`
  - safe business details that may be overridden directly
- `conditional`
  - high-risk fields that require policy checks before rendering

### Field Source Semantics

- `locked` fields may not accept `lead` as an effective source even if `lead` appears in `sourcePriority`
- `conditional` fields require both source eligibility and `ClaimPolicy` approval
- `derived` values must declare derivation inputs and may not create proof claims

Criticality is machine-readable in `TemplateFamily.resolverPolicy`.

Missing critical fields must populate `status.missingCriticalFields` and may make `isPreviewSafe` false.

## DerivedFieldRule

```ts
type DerivedFieldRule = {
  key: string;
  from: string[];
  transform: string;
  outputType: "string" | "string-array" | "url";
  proofSafe: boolean;
};
```

### DerivedFieldRule Rules

- derived fields must be deterministic and declared up front
- derived fields may normalize or combine existing values
- derived fields may not infer missing proof or synthesize trust claims

## ClaimPolicy

Claims require explicit rules so the system does not fabricate trust signals.

```ts
type ClaimPolicy = {
  claimType: string;
  allowed: boolean;
  evidenceRequired: boolean;
  evidenceSources: Array<"lead" | "seed" | "manual-approval">;
  sampleModeAllowed: boolean;
  onMissingEvidence: "suppress" | "downgrade" | "replace-with-safe-alt";
  safeAlternative?: string;
};
```

### ClaimPolicy Rules

- no invented years, awards, counts, credentials, guarantees, certifications, or reviews
- testimonial quotes may only render as real claims when approved
- sample testimonials are allowed only when explicitly permitted by mode and policy
- missing evidence must never be replaced with embellished proof

## Manual Approval Queue

Some claims may be business-relevant but not verifiable from lead ingestion alone.

This spec reserves a manual approval path:

- claim enters pending state
- reviewer approves or rejects claim
- approved claims may render in `strict` mode
- rejected claims are suppressed

This queue is part of the future workflow and must be reflected in proof object state and resolver behavior.

## ProofValue

`proof-object` must resolve to a strict shape.

```ts
type ProofValue = {
  kind: string;
  value: string | number | boolean;
  evidenceSource: "lead" | "seed" | "manual-approval";
  approvalStatus: "pending" | "approved" | "rejected";
  sample: boolean;
  lastVerifiedAt?: string;
};
```

### Sample Labeling Rule

- any non-factual seed or sample content allowed outside `strict` mode must either be visibly marked as sample in internal or seed workflows or be blocked from client-facing `preview-safe` mode unless policy explicitly allows it

## SectionPolicy

Each section must declare how it behaves when inputs are weak or absent.

```ts
type SectionPolicy = {
  key: SectionKey;
  canHide: boolean;
  requiredFields: string[];
  optionalFields: string[];
  fallbackBehavior: "omit" | "use-template-copy" | "downgrade-to-safe-copy" | "switch-variant";
  fallbackVariantKey?: string;
  minimumRenderableFields?: string[];
};
```

### Section Rules

- sections must not render empty shells
- sections may downgrade by variant, not just weaker text
- sections must declare whether they can hide cleanly

Example variant behavior:

- `why-choose-us`: proof-heavy to process-heavy
- `service-area`: city-list to regional coverage
- `gallery`: proof gallery to capability gallery

## SectionCopyMap and ResolvedSection

```ts
type SectionCopyMap = Partial<Record<SectionKey, SectionCopyVariant>>;

type SectionCopyVariant = {
  variantKey: string;
  heading: string;
  body?: string;
  items?: Array<{ title: string; body: string }>;
  faqItems?: Array<{ question: string; answer: string }>;
  cta?: { label: string; action: "call" | "form" | "quote" | "consult" };
};

type ResolvedSection = {
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
```

### ResolvedSection Rules

- every resolved section must declare visibility
- every resolved section must identify the variant used
- resolution notes may explain fallback or suppression behavior

## Visual Strategy and Assets

Visual logic is split between strategy and assets.

```ts
type VisualStrategy = {
  tone: string;
  realismRules: string[];
  shotCategories: string[];
  cropRules: Record<"hero" | "card" | "gallery", string>;
  priorities: string[];
  assetApprovalRequired: true;
};

type VisualAssets = {
  prompts: Array<{
    key: string;
    slot: string;
    aspectRatio: string;
    prompt: string;
    negativePrompt?: string;
    cropNotes?: string;
    fallbackAsset?: string;
  }>;
  generatedAssets?: Array<{
    key: string;
    slot: string;
    provider: "gemini";
    model: string;
    status: "pending" | "generated" | "approved" | "rejected";
    assetPath?: string;
  }>;
};
```

```ts
type ResolvedVisualSlot = {
  key: string;
  slot: string;
  status: "rendered" | "omitted";
  source?: "approved-generated" | "approved-fallback";
  assetPath?: string;
  cropNotes?: string;
  reasonCode?: ReasonCode;
};
```

### Visual Rules

- visuals must maintain documentary or commercial realism appropriate to the niche
- visuals must be safe for desktop and mobile crops
- visuals must not include fake logos or embedded text
- unapproved generated assets must never render
- each slot must use:
  - an approved generated asset
  - or an approved fallback asset
  - or omission if allowed by section policy

## LeadMappingRules

```ts
type LeadMappingRules = {
  directMap: Record<string, string>;
  conditionalMap: Record<string, {
    sourceField: string;
    requiresValidation: boolean;
    claimType?: string;
  }>;
  blockedOverrides: string[];
  transforms?: Array<{
    from: string;
    to: string;
    type: "format-phone" | "normalize-city-state" | "service-list-trim";
  }>;
};
```

### Transform Safety Rule

Transforms may normalize values only.

Transforms may not:

- infer missing proof
- embellish claims
- synthesize trust language
- expand sparse data into stronger assertions

## OverrideAudit

Every resolved render must include a structured audit trail.

```ts
type OverrideAudit = {
  accepted: Array<{ field: string; source: string; valueSummary: string }>;
  rejected: Array<{ field: string; source: string; reasonCode: ReasonCode; reason: string }>;
  fallbacks: Array<{ field: string; strategy: string; reasonCode: ReasonCode }>;
  suppressed: Array<{ field: string; reasonCode: ReasonCode; reason: string }>;
};

type SectionAudit = {
  decisions: Array<{
    section: SectionKey;
    action: "rendered" | "hidden" | "switched-variant" | "downgraded";
    reasonCode?: ReasonCode;
    note?: string;
  }>;
};

type ReasonCode =
  | "INVALID_FORMAT"
  | "MISSING_EVIDENCE"
  | "BLOCKED_OVERRIDE"
  | "FAILED_CLAIM_POLICY"
  | "EMPTY_VALUE"
  | "NOT_ALLOWED_IN_MODE"
  | "MISSING_APPROVED_ASSET"
  | "MISSING_CRITICAL_FIELD"
  | "SECTION_POLICY_SUPPRESSED";
```

### OverrideAudit Rules

- accepted values explain what was applied
- rejected values explain why lead or seed data was refused
- fallbacks explain how missing or weak data resolved
- suppressed values explain what was intentionally removed

## Prompt Derivation

Prompts must be derived from schema instead of maintained manually.

### `masterGeneratorPrompt`

Derived from:

- family structure
- niche vocabulary
- canonical style
- banned language
- claim policy
- section rules

### `imagePromptBuilder`

Derived from:

- visual strategy
- shot categories
- crop notes
- realism guardrails

### `qaPrompt`

Derived from:

- banned phrases
- required vocabulary
- claim rules
- section fallback logic
- sample mode behavior

### `personalizationPrompt`

Derived later from:

- lead mapping rules
- editable and conditional field rules
- sample mode restrictions

## End-to-End Flow

1. Define one `TemplateFamily`
2. Define one `NicheTemplate`
3. Define one `SeedBusiness`
4. Generate `PromptPack`
5. Author and QA archetype content
6. Resolve to `RenderPackage` in `seed-only`
7. Apply `LeadRecord` later
8. Resolve to `RenderPackage` in `strict`
9. Render preview only from the final package

## First Implementation Recommendation

Start with one vertical only:

- one concrete family
- one concrete niche template
- one seed business
- one resolver path

Recommended order:

1. define blue-collar service family
2. define roofing niche template
3. define one believable roofing seed business
4. implement resolver
5. render one client-safe preview path

## Self-Review Notes

This spec intentionally:

- keeps prompts out of the runtime path
- prevents raw lead data from mutating locked template logic
- forces claim control into explicit policy
- treats visuals as approval-gated assets
- defines resolver status so the app can tell whether a preview is client-safe
