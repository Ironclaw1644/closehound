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
