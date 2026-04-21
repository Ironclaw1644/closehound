import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { CLINICAL_CARE_FAMILY } from "@/lib/template-system/families/clinical-care";
import { HEALTH_WELLNESS_FAMILY } from "@/lib/template-system/families/health-wellness";
import {
  normalizeSupportedIndustry,
  resolveLeadTemplatePreview,
} from "@/lib/template-system/lead-preview";
import { REASON_CODES } from "@/lib/template-system/reason-codes";
import { DENTAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/dental";
import { HVAC_NICHE_TEMPLATE } from "@/lib/template-system/niches/hvac";
import { MED_SPA_NICHE_TEMPLATE } from "@/lib/template-system/niches/med-spa";
import { PLUMBING_NICHE_TEMPLATE } from "@/lib/template-system/niches/plumbing";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { buildDentalPreviewModel } from "@/lib/template-system/dental-preview";
import { buildMedSpaPreviewModel } from "@/lib/template-system/med-spa-preview";
import { buildLeadPreviewView } from "@/lib/template-system/lead-preview";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import {
  buildCandidateGroupKey,
  getApprovedTemplateImageCandidatesFromRecords,
  listMissingRequiredApprovedSlots,
  selectMostRecentlyApprovedTemplateImageBatch,
  pickApprovedCandidateBySlot,
  type ArchetypeImageCandidateRecord,
} from "@/lib/template-system/images/repository";
import { buildTemplateImageStoragePath } from "@/lib/template-system/images/storage";
import {
  buildRoofingPromptBatch,
  buildDentalPromptBatch,
  buildMedSpaPromptBatch,
  buildRoofingSlotPrompt,
} from "@/lib/template-system/images/prompts";
import { createRoofingGenerationBatch } from "@/lib/template-system/images/generate-roofing";
import {
  ROOFING_VISUAL_SLOTS,
  getRoofingCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/roofing";
import { HVAC_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/hvac";
import {
  DENTAL_VISUAL_SLOTS,
  getDentalCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/dental";
import {
  MED_SPA_VISUAL_SLOTS,
  getMedSpaCandidateCountForSlot,
} from "@/lib/template-system/visual-slots/med-spa";
import { PLUMBING_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/plumbing";
import { HVAC_SEED_BUSINESS } from "@/lib/template-system/seeds/hvac-seed";
import { DENTAL_SEED_BUSINESS } from "@/lib/template-system/seeds/dental-seed";
import { MED_SPA_SEED_BUSINESS } from "@/lib/template-system/seeds/med-spa-seed";
import { PLUMBING_SEED_BUSINESS } from "@/lib/template-system/seeds/plumbing-seed";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";
import type { RenderPackage, SampleMode, SectionKey } from "@/lib/template-system/types";
import { resolveArchetypeBatchSelection } from "@/lib/template-system/images/selection";
import type { Lead } from "@/types/lead";

async function loadBlueCollarPreviewTemplate() {
  const sourceUrl = new URL(
    "../../components/site-templates/blue-collar-preview.tsx",
    import.meta.url
  );
  const source = readFileSync(sourceUrl, "utf8");
  const { outputText } = ts.transpileModule(source, {
    fileName: "blue-collar-preview.tsx",
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });

  const tempDir = mkdtempSync(
    path.join(process.cwd(), ".tmp-blue-collar-preview-")
  );
  const tempFilePath = path.join(tempDir, "blue-collar-preview.mjs");
  writeFileSync(tempFilePath, outputText, "utf8");

  try {
    return await import(pathToFileURL(tempFilePath).href);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

async function loadDentalPreviewTemplate() {
  const sourceUrl = new URL(
    "../../components/site-templates/dental-preview.tsx",
    import.meta.url
  );
  const source = readFileSync(sourceUrl, "utf8");
  const { outputText } = ts.transpileModule(source, {
    fileName: "dental-preview.tsx",
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });

  const tempDir = mkdtempSync(path.join(process.cwd(), ".tmp-dental-preview-"));
  const tempFilePath = path.join(tempDir, "dental-preview.mjs");
  writeFileSync(tempFilePath, outputText, "utf8");

  try {
    return await import(pathToFileURL(tempFilePath).href);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

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

test("dental niche matches clinical-care family and schema version", () => {
  assert.equal(DENTAL_NICHE_TEMPLATE.familyKey, CLINICAL_CARE_FAMILY.key);
  assert.equal(
    DENTAL_NICHE_TEMPLATE.expectedSchemaVersion,
    CLINICAL_CARE_FAMILY.schemaVersion
  );
});

test("clinical-care family keeps dental sample mode policy aligned", () => {
  assert.deepEqual(CLINICAL_CARE_FAMILY.sampleModePolicy.allowedModes, [
    "strict",
    "preview-safe",
    "seed-only",
  ]);
  assert.deepEqual(
    CLINICAL_CARE_FAMILY.sampleModePolicy.sectionBehaviorByMode.strict,
    { testimonials: "hide-unapproved", proofBar: "hide-unapproved" }
  );
  assert.deepEqual(
    CLINICAL_CARE_FAMILY.sampleModePolicy.sectionBehaviorByMode["preview-safe"],
    { testimonials: "hide-unapproved", proofBar: "hide-unapproved" }
  );
  assert.deepEqual(
    CLINICAL_CARE_FAMILY.sampleModePolicy.sectionBehaviorByMode["seed-only"],
    { testimonials: "allow-seed-labeled", proofBar: "allow-seed-labeled" }
  );
  assert.equal(
    CLINICAL_CARE_FAMILY.sampleModePolicy.claimBehaviorByMode.strict.requiresApprovedEvidence,
    true
  );
  assert.equal(
    CLINICAL_CARE_FAMILY.sampleModePolicy.visualBehaviorByMode.strict.approvedAssetsOnly,
    true
  );
});

test("roofing visual slots define required and optional coverage", () => {
  assert.deepEqual(
    ROOFING_VISUAL_SLOTS.map((slot) => ({
      key: slot.key,
      required: slot.required,
    })),
    [
      { key: "hero", required: true },
      { key: "service-action", required: true },
      { key: "detail-closeup", required: true },
      { key: "team-or-workmanship", required: false },
      { key: "workspace-or-site", required: false },
      { key: "gallery-extra", required: false },
    ]
  );
});

test("roofing visual slots use the v1 candidate policy", () => {
  assert.deepEqual(
    ROOFING_VISUAL_SLOTS.map((slot) => ({
      key: slot.key,
      candidates: getRoofingCandidateCountForSlot(slot.key),
    })),
    [
      { key: "hero", candidates: 3 },
      { key: "service-action", candidates: 2 },
      { key: "detail-closeup", candidates: 2 },
      { key: "team-or-workmanship", candidates: 2 },
      { key: "workspace-or-site", candidates: 2 },
      { key: "gallery-extra", candidates: 2 },
    ]
  );
});

test("roofing prompt batch uses 3 hero candidates and 2 for non-hero slots", () => {
  const batch = buildRoofingPromptBatch({
    familyKey: "blue-collar-service",
    templateKey: "roofing-v1",
    templateVersion: "1.0.0",
  });

  assert.equal(batch.filter((item) => item.slot === "hero").length, 3);
  assert.equal(
    batch.filter((item) => item.slot === "service-action").length,
    2
  );
});

test("med spa prompt batch uses 3 hero candidates and 2 for non-hero slots", () => {
  const batch = buildMedSpaPromptBatch({
    familyKey: "health-wellness",
    templateKey: "med-spa-v1",
    templateVersion: "1.0.0",
  });

  assert.equal(batch.filter((item) => item.slot === "hero").length, 3);
  assert.equal(batch.filter((item) => item.slot === "service-action").length, 2);
});

test("dental prompt batch uses 3 hero candidates and 2 for non-hero slots", () => {
  const batch = buildDentalPromptBatch({
    familyKey: "clinical-care",
    templateKey: "dental-v1",
    templateVersion: "1.0.0",
  });

  assert.equal(batch.filter((item) => item.slot === "hero").length, 3);
  assert.equal(batch.filter((item) => item.slot === "service-action").length, 2);
});

test("roofing prompt builder includes slot intent and negative prompt", () => {
  const prompt = buildRoofingSlotPrompt({
    slot: "detail-closeup",
    familyKey: "blue-collar-service",
    templateKey: "roofing-v1",
    templateVersion: "1.0.0",
  });

  assert.ok(prompt.prompt.includes("close-up roofing detail"));
  assert.ok(prompt.negativePrompt.includes("embedded text"));
  assert.equal(prompt.promptVersion, "1.0.0");
});

test("generation batch creation assigns one batch id per run", () => {
  const run = createRoofingGenerationBatch({
    familyKey: "blue-collar-service",
    templateKey: "roofing-v1",
    templateVersion: "1.0.0",
    createdBy: "test",
  });

  assert.equal(typeof run.generationBatchId, "string");
  assert.equal(new Set(run.items.map((item) => item.generationBatchId)).size, 1);
});

test("candidate registry keys isolate template batch slot groups", () => {
  const approved: ArchetypeImageCandidateRecord = {
    id: "hero-approved",
    generationBatchId: "batch-1",
    familyKey: "blue-collar-service",
    templateKey: "roofing-v1",
    templateVersion: "1.0.0",
    slot: "hero",
    candidateIndex: 1,
    prompt: "prompt",
    negativePrompt: "negative",
    promptVersion: "1.0.0",
    provider: "gemini",
    model: "nano-banana-2",
    status: "approved",
    storagePath: "template-images/roofing-v1/hero/approved.png",
    aspectRatio: "16:9",
    createdAt: "2026-04-19T00:00:00.000Z",
    createdBy: "test",
  };

  const otherBatch: ArchetypeImageCandidateRecord = {
    ...approved,
    id: "hero-other-batch",
    generationBatchId: "batch-2",
    candidateIndex: 0,
    storagePath: "template-images/roofing-v1/hero/other-batch.png",
  };

  assert.equal(
    buildCandidateGroupKey({
      templateKey: approved.templateKey,
      generationBatchId: approved.generationBatchId,
      slot: approved.slot,
    }),
    "roofing-v1::batch-1::hero"
  );

  const selected = pickApprovedCandidateBySlot(
    [approved, otherBatch],
    {
      templateKey: "roofing-v1",
      generationBatchId: "batch-1",
      slotDefinitions: ROOFING_VISUAL_SLOTS,
    }
  );

  assert.equal(selected.hero?.id, "hero-approved");
  assert.equal(selected["service-action"], undefined);
  assert.deepEqual(
    listMissingRequiredApprovedSlots([approved, otherBatch], {
      templateKey: "roofing-v1",
      generationBatchId: "batch-1",
      slotDefinitions: ROOFING_VISUAL_SLOTS,
    }),
    ["service-action", "detail-closeup"]
  );
});

test("most recently approved template image batch prefers the newest eligible batch", () => {
  const rows: ArchetypeImageCandidateRecord[] = [
    {
      id: "old-approved",
      generationBatchId: "batch-1",
      familyKey: "blue-collar-service",
      templateKey: "roofing-v1",
      templateVersion: "1.0.0",
      slot: "hero",
      candidateIndex: 0,
      prompt: "prompt",
      negativePrompt: "negative",
      promptVersion: "1.0.0",
      provider: "gemini",
      model: "nano-banana-2",
      status: "approved",
      storagePath: "template-images/roofing-v1/batch-1/hero-0.png",
      aspectRatio: "16:9",
      createdAt: "2026-04-19T00:00:00.000Z",
      createdBy: "test",
    },
    {
      id: "new-approved",
      generationBatchId: "batch-2",
      familyKey: "blue-collar-service",
      templateKey: "roofing-v1",
      templateVersion: "1.0.0",
      slot: "hero",
      candidateIndex: 0,
      prompt: "prompt",
      negativePrompt: "negative",
      promptVersion: "1.0.0",
      provider: "gemini",
      model: "nano-banana-2",
      status: "approved",
      storagePath: "template-images/roofing-v1/batch-2/hero-0.png",
      aspectRatio: "16:9",
      createdAt: "2026-04-20T00:00:00.000Z",
      createdBy: "test",
    },
    {
      id: "older-generated-later-approved",
      generationBatchId: "batch-1",
      familyKey: "blue-collar-service",
      templateKey: "roofing-v1",
      templateVersion: "1.0.0",
      slot: "service-action",
      candidateIndex: 0,
      prompt: "prompt",
      negativePrompt: "negative",
      promptVersion: "1.0.0",
      provider: "gemini",
      model: "nano-banana-2",
      status: "approved",
      storagePath: "template-images/roofing-v1/batch-1/service-action-0.png",
      aspectRatio: "4:3",
      createdAt: "2026-04-19T12:00:00.000Z",
      createdBy: "test",
    },
    {
      id: "second-approved-in-later-generated-batch",
      generationBatchId: "batch-2",
      familyKey: "blue-collar-service",
      templateKey: "roofing-v1",
      templateVersion: "1.0.0",
      slot: "hero",
      candidateIndex: 0,
      prompt: "prompt",
      negativePrompt: "negative",
      promptVersion: "1.0.0",
      provider: "gemini",
      model: "nano-banana-2",
      status: "approved",
      storagePath: "template-images/roofing-v1/batch-2/hero-0.png",
      aspectRatio: "16:9",
      createdAt: "2026-04-20T12:00:00.000Z",
      createdBy: "test",
    },
  ];

  assert.equal(
    selectMostRecentlyApprovedTemplateImageBatch(rows, "roofing-v1"),
    "batch-2"
  );
});

test("approved candidate retrieval returns only approved rows for the requested batch", () => {
  const rows: ArchetypeImageCandidateRecord[] = [
    {
      id: "approved-hero",
      generationBatchId: "batch-1",
      familyKey: "blue-collar-service",
      templateKey: "roofing-v1",
      templateVersion: "1.0.0",
      slot: "hero",
      candidateIndex: 0,
      prompt: "prompt",
      negativePrompt: "negative",
      promptVersion: "1.0.0",
      provider: "gemini",
      model: "nano-banana-2",
      status: "approved",
      storagePath: "template-images/roofing-v1/batch-1/hero-0.png",
      aspectRatio: "16:9",
      createdAt: "2026-04-20T00:00:00.000Z",
      createdBy: "test",
    },
    {
      id: "generated-hero",
      generationBatchId: "batch-1",
      familyKey: "blue-collar-service",
      templateKey: "roofing-v1",
      templateVersion: "1.0.0",
      slot: "hero",
      candidateIndex: 1,
      prompt: "prompt",
      negativePrompt: "negative",
      promptVersion: "1.0.0",
      provider: "gemini",
      model: "nano-banana-2",
      status: "generated",
      storagePath: "template-images/roofing-v1/batch-1/hero-1.png",
      aspectRatio: "16:9",
      createdAt: "2026-04-20T00:01:00.000Z",
      createdBy: "test",
    },
  ];

  const approved = getApprovedTemplateImageCandidatesFromRecords(rows, {
    templateKey: "roofing-v1",
    generationBatchId: "batch-1",
    slotDefinitions: ROOFING_VISUAL_SLOTS,
  });

  assert.equal(approved.hero?.id, "approved-hero");
  assert.equal(approved["service-action"], undefined);
});

test("archetype image selection uses pinned batch when provided", async () => {
  const batch = await resolveArchetypeBatchSelection({
    requestedBatch: "batch-2",
    hasRequestedBatch: true,
    getLatestApprovedBatch: async () => "batch-3",
  });

  assert.equal(batch, "batch-2");
});

test("archetype image selection uses latest approved batch by default", async () => {
  const batch = await resolveArchetypeBatchSelection({
    requestedBatch: null,
    hasRequestedBatch: false,
    getLatestApprovedBatch: async () => "batch-3",
  });

  assert.equal(batch, "batch-3");
});

test("archetype image selection leaves batch null when none are approved", async () => {
  const batch = await resolveArchetypeBatchSelection({
    requestedBatch: null,
    hasRequestedBatch: false,
    getLatestApprovedBatch: async () => null,
  });

  assert.equal(batch, null);
});

test("archetype image selection keeps an explicit empty batch pin", async () => {
  const batch = await resolveArchetypeBatchSelection({
    requestedBatch: "",
    hasRequestedBatch: true,
    getLatestApprovedBatch: async () => "batch-3",
  });

  assert.equal(batch, "");
});

test("pinned roofing batch with no approved assets does not fall back to another batch", async () => {
  const selectedBatch = await resolveArchetypeBatchSelection({
    requestedBatch: "batch-2",
    hasRequestedBatch: true,
    getLatestApprovedBatch: async () => "batch-3",
  });

  assert.equal(selectedBatch, "batch-2");

  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates: {},
  });

  assert.equal(render.resolvedVisuals.slots[0]?.status, "omitted");
  assert.equal(
    render.resolvedVisuals.slots[0]?.reasonCode,
    REASON_CODES.MISSING_APPROVED_ASSET
  );
});

test("approved candidate selection omits optional slots with no approved asset", () => {
  const selected = pickApprovedCandidateBySlot([], {
    templateKey: "roofing-v1",
    generationBatchId: "batch-1",
    slotDefinitions: ROOFING_VISUAL_SLOTS,
  });

  assert.equal(selected["service-action"], undefined);
  assert.equal(selected["gallery-extra"], undefined);
  assert.equal(Object.hasOwn(selected, "service-action"), false);
  assert.equal(Object.hasOwn(selected, "gallery-extra"), false);
  assert.deepEqual(
    listMissingRequiredApprovedSlots([], {
      templateKey: "roofing-v1",
      generationBatchId: "batch-1",
      slotDefinitions: ROOFING_VISUAL_SLOTS,
    }),
    ["hero", "service-action", "detail-closeup"]
  );
});

test("template image storage paths are namespaced by template batch and slot", () => {
  assert.equal(
    buildTemplateImageStoragePath({
      templateKey: "roofing-v1",
      generationBatchId: "batch-1",
      slot: "hero",
      candidateIndex: 0,
    }),
    "template-images/roofing-v1/batch-1/hero-0.png"
  );
});

test("resolver uses approved roofing visual assets when present", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates: {
      hero: {
        id: "hero-approved",
        slot: "hero",
        status: "approved",
        storagePath: "template-images/roofing-v1/batch-1/hero-0.png",
        cropNotes: "safe center crop for desktop and mobile hero layouts",
      } as never,
    },
  });

  assert.equal(render.resolvedVisuals.slots[0]?.status, "rendered");
  assert.equal(
    render.resolvedVisuals.slots[0]?.assetPath,
    "template-images/roofing-v1/batch-1/hero-0.png"
  );
});

test("resolver prefers approved asset urls when present", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates: {
      hero: {
        id: "hero-approved",
        slot: "hero",
        status: "approved",
        storagePath: "template-images/roofing-v1/batch-1/hero-0.png",
        assetUrl: "https://example.com/template-images/roofing-v1/batch-1/hero-0.png",
        cropNotes: "safe center crop for desktop and mobile hero layouts",
      } as never,
    },
  });

  assert.equal(
    render.resolvedVisuals.slots[0]?.assetPath,
    "https://example.com/template-images/roofing-v1/batch-1/hero-0.png"
  );
});

test("resolver uses approved HVAC visual assets when present", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: HVAC_NICHE_TEMPLATE,
    seed: HVAC_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates: {
      hero: {
        id: "hero-approved",
        slot: "hero",
        status: "approved",
        storagePath: "template-images/hvac-v1/batch-1/hero-0.png",
        cropNotes: "safe center crop for desktop and mobile hero layouts",
      } as never,
    },
  });

  assert.equal(render.resolvedVisuals.slots[0]?.status, "rendered");
  assert.equal(
    render.resolvedVisuals.slots[0]?.assetPath,
    "template-images/hvac-v1/batch-1/hero-0.png"
  );
});

test("resolver uses approved plumbing visual assets when present", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: PLUMBING_NICHE_TEMPLATE,
    seed: PLUMBING_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates: {
      hero: {
        id: "hero-approved",
        slot: "hero",
        status: "approved",
        storagePath: "template-images/plumbing-v1/batch-1/hero-0.png",
        cropNotes: "safe center crop for desktop and mobile hero layouts",
      } as never,
    },
  });

  assert.equal(render.resolvedVisuals.slots[0]?.status, "rendered");
  assert.equal(
    render.resolvedVisuals.slots[0]?.assetPath,
    "template-images/plumbing-v1/batch-1/hero-0.png"
  );
});

test("HVAC visual slot contract matches the roofing slot matrix", () => {
  assert.deepEqual(
    HVAC_VISUAL_SLOTS.map((slot) => slot.key),
    ROOFING_VISUAL_SLOTS.map((slot) => slot.key)
  );
  assert.deepEqual(
    HVAC_VISUAL_SLOTS.filter((slot) => slot.required).map((slot) => slot.key),
    ["hero", "service-action", "detail-closeup"]
  );
});

test("plumbing visual slot contract matches the roofing slot matrix", () => {
  assert.deepEqual(
    PLUMBING_VISUAL_SLOTS.map((slot) => slot.key),
    ROOFING_VISUAL_SLOTS.map((slot) => slot.key)
  );
  assert.deepEqual(
    PLUMBING_VISUAL_SLOTS.filter((slot) => slot.required).map((slot) => slot.key),
    ["hero", "service-action", "detail-closeup"]
  );
});

test("med spa visual slot contract matches the archetype slot matrix", () => {
  assert.deepEqual(
    MED_SPA_VISUAL_SLOTS.map((slot) => slot.key),
    ROOFING_VISUAL_SLOTS.map((slot) => slot.key)
  );
  assert.deepEqual(
    MED_SPA_VISUAL_SLOTS.filter((slot) => slot.required).map((slot) => slot.key),
    ["hero", "service-action", "detail-closeup"]
  );
  assert.deepEqual(
    MED_SPA_VISUAL_SLOTS.map((slot) => ({
      key: slot.key,
      candidates: getMedSpaCandidateCountForSlot(slot.key),
    })),
    [
      { key: "hero", candidates: 3 },
      { key: "service-action", candidates: 2 },
      { key: "detail-closeup", candidates: 2 },
      { key: "team-or-workmanship", candidates: 2 },
      { key: "workspace-or-site", candidates: 2 },
      { key: "gallery-extra", candidates: 2 },
    ]
  );
});

test("dental visual slots match the 6-slot archetype matrix", () => {
  assert.deepEqual(
    DENTAL_VISUAL_SLOTS.map((slot) => slot.key),
    ROOFING_VISUAL_SLOTS.map((slot) => slot.key)
  );
  assert.deepEqual(
    DENTAL_VISUAL_SLOTS.filter((slot) => slot.required).map((slot) => slot.key),
    ["hero", "service-action", "detail-closeup"]
  );
  assert.deepEqual(
    DENTAL_VISUAL_SLOTS.map((slot) => ({
      key: slot.key,
      candidates: getDentalCandidateCountForSlot(slot.key),
    })),
    [
      { key: "hero", candidates: 3 },
      { key: "service-action", candidates: 2 },
      { key: "detail-closeup", candidates: 2 },
      { key: "team-or-workmanship", candidates: 2 },
      { key: "workspace-or-site", candidates: 2 },
      { key: "gallery-extra", candidates: 2 },
    ]
  );
});

test("supported-industry helper normalizes HVAC variants", () => {
  assert.equal(normalizeSupportedIndustry("HVAC"), "hvac");
  assert.equal(normalizeSupportedIndustry("hvac"), "hvac");
  assert.equal(normalizeSupportedIndustry("heating and air"), "hvac");
  assert.equal(normalizeSupportedIndustry("heating & air"), "hvac");
  assert.equal(normalizeSupportedIndustry("heating and cooling"), "hvac");
  assert.equal(normalizeSupportedIndustry("air conditioning"), "hvac");
  assert.equal(normalizeSupportedIndustry("heating & cooling"), "hvac");
  assert.equal(normalizeSupportedIndustry("air conditioning repair"), "hvac");
  assert.equal(normalizeSupportedIndustry("  air-conditioning   repair!! "), "hvac");
  assert.equal(
    normalizeSupportedIndustry("heating, ventilation, and air conditioning"),
    "hvac"
  );
  assert.equal(
    normalizeSupportedIndustry("heating ventilation and air conditioning"),
    "hvac"
  );
  assert.equal(normalizeSupportedIndustry("HVAC service"), "hvac");
  assert.equal(normalizeSupportedIndustry("A/C repair"), "hvac");
  assert.equal(normalizeSupportedIndustry("air conditioner service"), "hvac");
  assert.equal(normalizeSupportedIndustry("air conditioner maintenance"), "hvac");
  assert.equal(normalizeSupportedIndustry("air conditioning installation"), "hvac");
  assert.equal(normalizeSupportedIndustry("heating service"), "hvac");
  assert.equal(normalizeSupportedIndustry("heating repair"), "hvac");
  assert.equal(normalizeSupportedIndustry("cooling service"), "hvac");
  assert.equal(normalizeSupportedIndustry("heating and air conditioning"), "hvac");
  assert.equal(normalizeSupportedIndustry("heating and air conditioning repair"), null);
});

test("supported-industry helper normalizes plumbing variants", () => {
  assert.equal(normalizeSupportedIndustry("Plumbing"), "plumbing");
  assert.equal(normalizeSupportedIndustry("plumber"), "plumbing");
  assert.equal(normalizeSupportedIndustry("residential plumbing"), "plumbing");
  assert.equal(normalizeSupportedIndustry("plumbing repair"), "plumbing");
  assert.equal(normalizeSupportedIndustry("water heater service"), "plumbing");
});

test("supported lead preview helper normalizes med spa variants", () => {
  assert.equal(normalizeSupportedIndustry("med spa"), "med-spa");
  assert.equal(normalizeSupportedIndustry("medspa"), "med-spa");
  assert.equal(normalizeSupportedIndustry("medical spa"), "med-spa");
  assert.equal(normalizeSupportedIndustry("aesthetic med spa"), "med-spa");
});

test("supported-industry helper normalizes dental variants", () => {
  assert.equal(normalizeSupportedIndustry("dentist"), "dental");
  assert.equal(normalizeSupportedIndustry("General Dentist"), "dental");
  assert.equal(normalizeSupportedIndustry("general dentistry"), "dental");
  assert.equal(normalizeSupportedIndustry("family dentist"), "dental");
  assert.equal(normalizeSupportedIndustry("family dentistry"), "dental");
});

test("supported-industry helper supports roofing hvac plumbing and med spa", () => {
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
    industry: "handyman",
    company_name: "River City Plumbing",
    city: "Columbus",
    state: "OH",
    phone: "(614) 555-0101",
  } as never);

  const plumbing = resolveLeadTemplatePreview({
    id: "lead-3b",
    industry: "plumbing",
    company_name: "Steady Flow Plumbing",
    city: "Columbus",
    state: "OH",
    phone: "(614) 555-0189",
    email: "service@steadyflowplumbing.com",
  } as never);

  const medSpaLead: Lead = {
    id: "lead-3d",
    status: "generated",
    industry: "med spa",
    company_name: "North Hills Med Spa",
    city: "Raleigh",
    phone: "(919) 555-0199",
    contact_email: "hello@northhillsmedspa.com",
    preview_url: "https://preview.closehound.local/preview/north-hills-med-spa-1",
    rating: null,
    has_website: true,
    created_at: "2026-04-21T00:00:00.000Z",
  };

  const medSpa = resolveLeadTemplatePreview(medSpaLead);

  assert.equal(roofing.supported, true);
  assert.equal(hvac.supported, true);
  assert.equal(plumbing.supported, true);
  assert.equal(medSpa.supported, true);
  assert.deepEqual(unsupported, {
    supported: false,
    reason: "UNSUPPORTED_INDUSTRY",
  });
});

test("supported lead preview maps dental industry variants to dental-v1", () => {
  const dentalLead: Lead = {
    id: "lead-1",
    status: "emailed",
    industry: "dental",
    company_name: "Harbor Point Dental",
    city: "Raleigh",
    phone: "(919) 555-0133",
    contact_email: "hello@harborpointdental.com",
    preview_url: "https://preview.closehound.local/preview/harbor-point-dental-1",
    rating: null,
    has_website: true,
    created_at: "2026-04-21T00:00:00.000Z",
  };

  const match = resolveLeadTemplatePreview(dentalLead);

  assert.equal(match.supported, true);
  if (!match.supported) {
    return;
  }

  assert.equal(match.templateKey, "dental-v1");
  assert.equal(match.familyKey, "clinical-care");
});

test("supported lead preview rejects unsupported dental specialist variants", () => {
  const match = resolveLeadTemplatePreview({
    id: "lead-2",
    industry: "Orthodontist",
    company_name: "Braces First Orthodontics",
    city: "Raleigh",
    state: "NC",
    phone: "(919) 555-0110",
    email: "hello@bracesfirstortho.com",
  } as never);

  assert.equal(match.supported, false);
});

test("lead preview view keeps supported dental leads on the template-system path", () => {
  const dentalLead: Lead = {
    id: "lead-dental-view",
    status: "emailed",
    industry: "dental",
    company_name: "Harbor Point Dental",
    city: "Raleigh",
    phone: "(919) 555-0133",
    contact_email: "hello@harborpointdental.com",
    preview_url: "https://preview.closehound.local/preview/harbor-point-dental-1",
    rating: null,
    has_website: true,
    created_at: "2026-04-21T00:00:00.000Z",
  };

  const dentalView = buildLeadPreviewView(dentalLead);

  assert.notEqual(dentalView.kind, "legacy");
  if (dentalView.kind === "legacy") {
    return;
  }

  assert.equal(dentalView.kind, "clinical-care");
  assert.equal(dentalView.renderPackage.templateKey, "dental-v1");
  assert.equal(dentalView.renderPackage.familyKey, "clinical-care");
});

test("new dental leads remain blocked before previewable lifecycle states", () => {
  const dentalLead: Lead = {
    id: "lead-dental-new",
    status: "new",
    industry: "dental",
    company_name: "Harbor Point Dental",
    city: "Raleigh",
    phone: "(919) 555-0133",
    contact_email: "hello@harborpointdental.com",
    preview_url: "https://preview.closehound.local/preview/harbor-point-dental-2",
    rating: null,
    has_website: true,
    created_at: "2026-04-21T00:00:00.000Z",
  };

  const dentalView = buildLeadPreviewView(dentalLead);

  assert.equal(dentalView.kind, "legacy");
  if (dentalView.kind !== "legacy") {
    return;
  }

  assert.equal(dentalView.reason, "LEAD_NOT_READY");
});

test("supported lead preview helper resolves med spa leads through template system", () => {
  const medSpaLead: Lead = {
    id: "lead-med-spa-1",
    status: "emailed",
    industry: "med spa",
    company_name: "Sample Med Spa",
    city: "Raleigh",
    phone: "(919) 555-0199",
    contact_email: "hello@example.com",
    preview_url: "https://preview.closehound.local/preview/sample-med-spa-1",
    rating: null,
    has_website: true,
    created_at: "2026-04-21T00:00:00.000Z",
  };

  const result = resolveLeadTemplatePreview(medSpaLead);

  assert.equal(result.supported, true);
  if (!result.supported) {
    return;
  }

  assert.equal(result.templateKey, "med-spa-v1");
  assert.equal(result.familyKey, "health-wellness");
  assert.equal(result.renderPackage.status.isPreviewSafe, true);
  assert.equal(result.renderPackage.resolvedFields.primaryCtaHref, "#contact");
  assert.equal(
    result.renderPackage.resolvedFields.secondaryCtaHref,
    "#services"
  );
});

test("lead preview view routes med spa through the health-wellness renderer once supported", () => {
  const medSpaLead: Lead = {
    id: "lead-med-spa-view",
    status: "called",
    industry: "med spa",
    company_name: "Sample Med Spa",
    city: "Raleigh",
    phone: "(919) 555-0199",
    contact_email: "hello@example.com",
    preview_url: "https://preview.closehound.local/preview/sample-med-spa-123",
    rating: null,
    has_website: true,
    created_at: "2026-04-21T00:00:00.000Z",
  };

  const medSpaView = buildLeadPreviewView(medSpaLead);

  assert.equal(medSpaView.kind, "health-wellness");
  if (medSpaView.kind !== "health-wellness") {
    return;
  }

  assert.equal(medSpaView.model.primaryCtaLabel, "Book Consultation");
  assert.equal(medSpaView.model.primaryCtaHref, "#contact");
  assert.equal(medSpaView.model.secondaryCtaLabel, "View Treatments");
  assert.equal(medSpaView.model.secondaryCtaHref, "#services");
  assert.equal(medSpaView.model.sectionKeys.includes("gallery"), true);
});

test("supported plumbing lead resolves to the plumbing family and template", () => {
  const supported = resolveLeadTemplatePreview({
    id: "lead-3c",
    industry: "plumbing",
    company_name: "Steady Flow Plumbing",
    city: "Columbus",
    state: "OH",
    phone: "(614) 555-0189",
    email: "service@steadyflowplumbing.com",
  } as never);

  assert.equal(supported.supported, true);
  if (!supported.supported) {
    return;
  }

  assert.equal(supported.familyKey, BLUE_COLLAR_SERVICE_FAMILY.key);
  assert.equal(supported.templateKey, PLUMBING_NICHE_TEMPLATE.key);
});

test("lead preview view uses the shared blue-collar path for plumbing leads", () => {
  const plumbingView = buildLeadPreviewView({
    id: "lead-9",
    status: "generated",
    industry: "plumbing",
    company_name: "Steady Flow Plumbing",
    city: "Columbus",
    phone: "(614) 555-0189",
    contact_email: "service@steadyflowplumbing.com",
  } as never);

  assert.equal(plumbingView.kind, "blue-collar");
  if (plumbingView.kind !== "blue-collar") {
    return;
  }

  assert.equal(
    plumbingView.model.hero.heading,
    "Plumbing help for urgent repairs and new installations"
  );
  assert.equal(plumbingView.model.contact.ctaLabel, "Call Now");
  assert.equal(plumbingView.model.hero.primaryCta.label, "Call Now");
  assert.equal(plumbingView.model.hero.secondaryCta?.label, "Request Estimate");
  assert.equal(plumbingView.model.hero.secondaryCta?.href, "#contact");
  assert.deepEqual(
    plumbingView.model.services.items.map((item) => item.title),
    ["Immediate Needs", "Upgrades & Installations"]
  );
});

test("buildLeadPreviewView falls back to legacy for unsafe plumbing renders", () => {
  const legacyView = buildLeadPreviewView(
    {
      id: "lead-10",
      status: "generated",
      industry: "plumbing",
      company_name: "Steady Flow Plumbing",
      city: "Columbus",
      phone: "(614) 555-0189",
      contact_email: "service@steadyflowplumbing.com",
      preview_url:
        "https://preview.closehound.local/preview/steady-flow-plumbing-columbus-123",
    } as never,
    () => ({
      supported: false,
      reason: "UNSAFE_RENDER" as const,
    })
  );

  assert.equal(legacyView.kind, "legacy");
  assert.equal(legacyView.reason, "UNSAFE_RENDER");
  assert.equal(legacyView.fallbackSlug, "steady-flow-plumbing-columbus-123");
});

test("lead preview view uses the shared blue-collar path only when render is safe", () => {
  const supportedView = buildLeadPreviewView({
    id: "lead-2",
    status: "generated",
    industry: "HVAC",
    company_name: "Summit Comfort Heating & Air",
    city: "Columbus",
    phone: "(614) 555-0126",
    contact_email: "service@summitcomfortair.com",
  } as never);

  const unsafeView = buildLeadPreviewView({
    id: "lead-4",
    status: "generated",
    industry: "HVAC",
    company_name: "Summit Comfort Heating & Air",
    city: "Columbus",
    phone: "(614) 555-0126",
    contact_email: "service@summitcomfortair.com",
  } as never, () => ({
    supported: false,
    reason: "UNSAFE_RENDER" as const,
  }));

  const pendingView = buildLeadPreviewView({
    id: "lead-6",
    status: "new",
    industry: "HVAC",
    company_name: "Summit Comfort Heating & Air",
    city: "Columbus",
    phone: "(614) 555-0126",
    contact_email: "service@summitcomfortair.com",
  } as never);

  assert.equal(supportedView.kind, "blue-collar");
  assert.equal(supportedView.model.hero.ctaLabel, "Request HVAC Service");
  assert.equal(unsafeView.kind, "legacy");
  assert.equal(unsafeView.fallbackSlug, null);
  assert.equal(pendingView.kind, "legacy");
});

test("unsupported generated leads preserve their stored legacy preview slug", () => {
  const legacyView = buildLeadPreviewView({
    id: "lead-7",
    status: "generated",
    industry: "handyman",
    company_name: "Patch & Pine Handyman",
    city: "St. Petersburg, FL",
    phone: "(727) 555-0184",
    contact_email: "jobs@patchandpine-demo.com",
    preview_url: "https://preview.closehound.local/preview/patch-pine-handyman-st-petersburg-fl-463838",
  } as never);

  assert.equal(legacyView.kind, "legacy");
  assert.equal(
    legacyView.fallbackSlug,
    "patch-pine-handyman-st-petersburg-fl-463838"
  );
});

test("unsupported generated leads preserve legacy slugs from non-/preview urls", () => {
  const legacyView = buildLeadPreviewView({
    id: "lead-8",
    status: "generated",
    industry: "handyman",
    company_name: "Patch & Pine Handyman",
    city: "St. Petersburg, FL",
    phone: "(727) 555-0184",
    contact_email: "jobs@patchandpine-demo.com",
    preview_url: "https://preview.closehound.local/patch-pine-handyman-st-petersburg-fl-463838",
  } as never);

  assert.equal(legacyView.kind, "legacy");
  assert.equal(
    legacyView.fallbackSlug,
    "patch-pine-handyman-st-petersburg-fl-463838"
  );
});

test("lead preview composes service area from the live lead city without a state field", () => {
  const supportedPreview = resolveLeadTemplatePreview({
    id: "lead-5",
    industry: "HVAC",
    company_name: "Summit Comfort Heating & Air",
    city: "Columbus",
    phone: "(614) 555-0126",
    contact_email: "service@summitcomfortair.com",
  } as never);

  assert.equal(supportedPreview.supported, true);
  if (!supportedPreview.supported) {
    return;
  }

  assert.equal(supportedPreview.renderPackage.resolvedFields.serviceAreaLabel, "Columbus");
  assert.equal(
    supportedPreview.renderPackage.resolvedSections["service-area"].heading,
    "HVAC service in Columbus"
  );
});

test("supported hvac render with missing required fields is unsafe", () => {
  const { services, ...businessProfile } = HVAC_SEED_BUSINESS.businessProfile;

  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: HVAC_NICHE_TEMPLATE,
    seed: {
      ...HVAC_SEED_BUSINESS,
      businessProfile,
    },
    sampleMode: "strict",
  });

  assert.equal(render.status.isPreviewSafe, false);
  assert.deepEqual(render.status.missingCriticalFields, ["services"]);
});

test("hvac niche matches family and schema version", () => {
  assert.equal(HVAC_NICHE_TEMPLATE.familyKey, BLUE_COLLAR_SERVICE_FAMILY.key);
  assert.equal(
    HVAC_NICHE_TEMPLATE.expectedSchemaVersion,
    BLUE_COLLAR_SERVICE_FAMILY.schemaVersion
  );
});

test("plumbing niche matches family and schema version", () => {
  assert.equal(PLUMBING_NICHE_TEMPLATE.familyKey, BLUE_COLLAR_SERVICE_FAMILY.key);
  assert.equal(
    PLUMBING_NICHE_TEMPLATE.expectedSchemaVersion,
    BLUE_COLLAR_SERVICE_FAMILY.schemaVersion
  );
});

test("med spa niche matches health-wellness family and schema version", () => {
  assert.equal(MED_SPA_NICHE_TEMPLATE.familyKey, HEALTH_WELLNESS_FAMILY.key);
  assert.equal(
    MED_SPA_NICHE_TEMPLATE.expectedSchemaVersion,
    HEALTH_WELLNESS_FAMILY.schemaVersion
  );
});

test("roofing seed business does not pre-approve fabricated testimonials", () => {
  assert.equal(
    ROOFING_SEED_BUSINESS.conditionalProof.sampleTestimonials.approvalStatus,
    "pending"
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
  assert.equal(
    MED_SPA_SEED_BUSINESS.conditionalProof.sampleTestimonials?.approvalStatus,
    "pending"
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
  assert.equal(preview.sectionKeys.includes("gallery"), render.resolvedSections.gallery.visible);
  if (render.resolvedSections.gallery.visible) {
    assert.equal(
      preview.gallery?.heading,
      render.resolvedSections.gallery.heading ?? ""
    );
  } else {
    assert.equal(preview.gallery, null);
  }
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

test("dental preview component renders clinical-modern sections without emoji", async () => {
  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
  });
  const model = buildDentalPreviewModel(render);
  const { DentalPreview } = await loadDentalPreviewTemplate();
  const html = renderToStaticMarkup(createElement(DentalPreview, { model }));

  assert.ok(html.includes("Schedule Visit"));
  assert.ok(html.includes("View Services"));
  assert.ok(html.includes("Dental services for prevention and restorative care"));
  assert.equal(Boolean(model.faq), render.resolvedSections.faq.visible);
  if (model.faq) {
    assert.ok(html.includes(model.faq.heading));
  }
  assert.equal(html.includes("🦷"), false);
});

test("dental preview model and component keep hidden optional sections hidden", async () => {
  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const hiddenRender = {
    ...render,
    resolvedSections: {
      ...render.resolvedSections,
      about: {
        ...render.resolvedSections.about,
        visible: false,
      },
      "why-choose-us": {
        ...render.resolvedSections["why-choose-us"],
        visible: false,
      },
      process: {
        ...render.resolvedSections.process,
        visible: false,
      },
      gallery: {
        ...render.resolvedSections.gallery,
        visible: false,
      },
      faq: {
        ...render.resolvedSections.faq,
        visible: false,
      },
    },
  };

  const model = buildDentalPreviewModel(hiddenRender);
  const { DentalPreview } = await loadDentalPreviewTemplate();
  const html = renderToStaticMarkup(createElement(DentalPreview, { model }));

  assert.equal(model.sectionKeys.includes("about"), false);
  assert.equal(model.sectionKeys.includes("why-choose-us"), false);
  assert.equal(model.sectionKeys.includes("process"), false);
  assert.equal(model.sectionKeys.includes("gallery"), false);
  assert.equal(model.sectionKeys.includes("faq"), false);
  assert.equal(html.includes("About the office"), false);
  assert.equal(html.includes("Why choose this practice"), false);
  assert.equal(html.includes("Visit process"), false);
  assert.equal(
    html.includes("A clean, modern office designed for comfortable visits"),
    false
  );
  assert.equal(html.includes("Questions before your first visit"), false);
});

test("dental contact CTA label and href stay aligned", () => {
  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const model = buildDentalPreviewModel({
    ...render,
    resolvedFields: {
      ...render.resolvedFields,
      primaryCtaLabel: "Schedule Visit",
      primaryCtaHref: "#contact",
    },
    resolvedSections: {
      ...render.resolvedSections,
      contact: {
        ...render.resolvedSections.contact,
        cta: {
          label: "Call the Office",
          action: "call",
        },
      },
    },
  });

  assert.deepEqual(model.contact.cta, {
    label: "Call the Office",
    href: "tel:(919) 555-0133",
  });
});

test("plumbing seed business keeps the expected testimonial proof shape", () => {
  assert.equal(
    PLUMBING_SEED_BUSINESS.nicheTemplateKey,
    PLUMBING_NICHE_TEMPLATE.key
  );
  assert.equal(
    PLUMBING_SEED_BUSINESS.conditionalProof.sampleTestimonials.kind,
    "testimonial-list"
  );
  assert.equal(PLUMBING_SEED_BUSINESS.conditionalProof.sampleTestimonials.value, 0);
  assert.equal(PLUMBING_SEED_BUSINESS.conditionalProof.sampleTestimonials.sample, true);
});

test("strict resolver suppresses pending seed testimonials", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.equal(render.resolvedSections.testimonials.visible, false);
  assert.equal(render.status.hasSuppressedClaims, true);
  assert.equal(
    render.sectionAudit.decisions.some((entry) => entry.section === "testimonials"),
    true
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
  assert.equal(render.resolvedSections.about.visible, true);
  assert.equal(
    render.resolvedSections.about.body,
    "Lumen Aesthetics Studio is designed for clients who want thoughtful treatment planning, discreet care, and a polished setting that feels calm from the first consultation onward."
  );
  assert.equal(render.resolvedSections.hero.cta?.action, "consult");
  assert.equal(render.resolvedSections.contact.cta?.action, "consult");
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
    ["insuranceAccepted", "sedationAvailable", "emergencyAvailability"]
  );
});

test("strict dental render populates visible sections", () => {
  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.equal(render.resolvedSections.hero.visible, true);
  assert.ok((render.resolvedSections.hero.heading ?? "").trim().length > 0);
  assert.ok((render.resolvedSections.hero.body ?? "").trim().length > 0);
  assert.equal(render.resolvedSections.services.visible, true);
  assert.ok((render.resolvedSections.services.heading ?? "").trim().length > 0);
  assert.ok((render.resolvedSections.services.items ?? []).length > 0);
  assert.equal(render.resolvedSections.contact.visible, true);
  assert.ok((render.resolvedSections.contact.heading ?? "").trim().length > 0);
  assert.ok((render.resolvedSections.contact.body ?? "").trim().length > 0);
  assert.ok(render.resolvedSections.contact.cta);
  assert.equal(
    render.resolvedFields.primaryPhone,
    DENTAL_SEED_BUSINESS.businessProfile.primaryPhone
  );
});

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
  assert.equal(preview.primaryCtaHref, "#contact");
  assert.equal(preview.secondaryCtaHref, "#services");
  assert.equal(preview.sectionKeys.includes("featured-treatments"), true);
  assert.equal(preview.sectionKeys.includes("process"), true);
  assert.equal(preview.sectionKeys.includes("gallery"), true);
  assert.match(preview.about.body ?? "", /thoughtful treatment planning/i);
  assert.equal(preview.gallery.visible, true);
  assert.match(preview.gallery.heading ?? "", /private|polished|settle into/i);

  const renderedCopy = [
    preview.hero.body,
    preview.about.body,
    preview.gallery.body,
    ...(preview.faq.faqItems ?? []).map((item) => item.answer),
  ].join(" ");

  assert.doesNotMatch(
    renderedCopy,
    /(template should|practice should|ai-generated|placeholder|lorem ipsum)/i
  );
});

test("blue-collar niches do not leak internal template language into authored copy", () => {
  const regex =
    /(template should|practice should|use a regional coverage statement|hyperlocal proof|city-level proof|without inventing|the page should support)/i;

  const renders = [
    resolveTemplateRender({
      family: BLUE_COLLAR_SERVICE_FAMILY,
      template: ROOFING_NICHE_TEMPLATE,
      seed: ROOFING_SEED_BUSINESS,
      sampleMode: "strict",
    }),
    resolveTemplateRender({
      family: BLUE_COLLAR_SERVICE_FAMILY,
      template: HVAC_NICHE_TEMPLATE,
      seed: HVAC_SEED_BUSINESS,
      sampleMode: "strict",
    }),
    resolveTemplateRender({
      family: BLUE_COLLAR_SERVICE_FAMILY,
      template: PLUMBING_NICHE_TEMPLATE,
      seed: PLUMBING_SEED_BUSINESS,
      sampleMode: "strict",
    }),
  ];

  for (const render of renders) {
    const preview = buildBlueCollarPreviewModel(render);
    const copy = [
      preview.hero.heading,
      preview.hero.body,
      preview.services.heading,
      ...preview.services.items.map((item) => `${item.title ?? ""} ${item.body}`),
      preview.whyChooseUs.heading,
      ...preview.whyChooseUs.items.map((item) => `${item.title ?? ""} ${item.body}`),
      preview.process.heading,
      ...preview.process.items.map((item) => `${item.title ?? ""} ${item.body}`),
      preview.faq.heading,
      ...preview.faq.items.map((item) => `${item.question} ${item.answer}`),
      preview.serviceArea.heading,
      preview.serviceArea.body,
      preview.contact.heading,
      preview.contact.body,
    ].join(" ");

    assert.doesNotMatch(copy, regex);
  }
});

test("health-wellness family encodes med spa claim policy guardrails", () => {
  assert.equal(
    HEALTH_WELLNESS_FAMILY.claimPolicies.boardCertification?.allowed,
    false
  );
  assert.equal(
    HEALTH_WELLNESS_FAMILY.claimPolicies.medicalDirector?.allowed,
    false
  );
  assert.equal(
    HEALTH_WELLNESS_FAMILY.claimPolicies.clinicalOutcomeClaims?.allowed,
    false
  );
  assert.equal(
    HEALTH_WELLNESS_FAMILY.claimPolicies.promotionalOffer?.evidenceRequired,
    true
  );
});

test("family-level resolver metadata stays generic for hvac renders", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: HVAC_NICHE_TEMPLATE,
    seed: HVAC_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.deepEqual(render.resolvedSections.about.resolutionNotes, [
    "Not used in this render path.",
  ]);
  assert.deepEqual(render.resolvedSections.gallery.resolutionNotes, [
    "No approved assets available for this render path.",
  ]);
  assert.equal(render.resolvedVisuals.slots[0]?.key, "hero-visual");
  assert.deepEqual(render.sectionAudit.decisions.find((entry) => entry.section === "hero"), {
    section: "hero",
    action: "downgraded",
    reasonCode: REASON_CODES.MISSING_APPROVED_ASSET,
    note: "No approved assets available for this render path.",
  });
});

test("preview-safe resolver audits missing hvac proof keys when only one proof field is present", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: HVAC_NICHE_TEMPLATE,
    seed: {
      ...HVAC_SEED_BUSINESS,
      conditionalProof: {
        emergencyService: HVAC_SEED_BUSINESS.conditionalProof.emergencyService,
      },
    },
    sampleMode: "preview-safe",
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

test("strict resolver suppresses genuinely missing hvac proof keys", () => {
  const { warrantyCopy, certifications, ...conditionalProof } =
    HVAC_SEED_BUSINESS.conditionalProof;
  const template = {
    ...HVAC_NICHE_TEMPLATE,
    key: "hvac-v2",
  } as typeof HVAC_NICHE_TEMPLATE;

  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template,
    seed: {
      ...HVAC_SEED_BUSINESS,
      nicheTemplateKey: template.key,
      conditionalProof,
    },
    sampleMode: "strict",
  });

  assert.equal(render.status.isPreviewSafe, true);
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

test("strict resolver audits all missing hvac conditional claims for sparse proof objects", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: HVAC_NICHE_TEMPLATE,
    seed: {
      ...HVAC_SEED_BUSINESS,
      conditionalProof: {
        sampleTestimonials: HVAC_SEED_BUSINESS.conditionalProof.sampleTestimonials,
      },
    },
    sampleMode: "strict",
  });

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
  assert.equal(
    render.resolvedVisuals.slots[0]?.reasonCode,
    "MISSING_APPROVED_ASSET"
  );
});

test("strict resolver includes contact fields in resolvedFields", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  assert.equal(
    render.resolvedFields.primaryPhone,
    ROOFING_SEED_BUSINESS.businessProfile.primaryPhone
  );
  assert.equal(
    render.resolvedFields.contactEmail,
    ROOFING_SEED_BUSINESS.businessProfile.contactEmail
  );
});

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

  assert.equal(
    roofingModel.hero.heading,
    "Roofing work that protects your home and keeps the job moving"
  );
  assert.equal(
    hvacModel.hero.heading,
    "Heating and cooling solutions you can trust"
  );
  assert.equal(
    roofingModel.contact.ctaLabel,
    "Request a Roofing Quote"
  );
  assert.equal(
    hvacModel.contact.ctaLabel,
    "Request HVAC Service"
  );
});

test("shared blue-collar preview model surfaces grouped plumbing services", async () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: PLUMBING_NICHE_TEMPLATE,
    seed: PLUMBING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const model = buildBlueCollarPreviewModel({
    ...render,
    resolvedFields: {
      ...render.resolvedFields,
      secondaryCtaLabel: "Request Estimate",
      secondaryCtaHref: "#contact",
    },
    resolvedSections: {
      ...render.resolvedSections,
      services: {
        ...render.resolvedSections.services,
        heading: "Plumbing services for immediate problems and planned work",
        items: [
          { title: "Immediate Needs", body: "Leaking lines, backed-up drains, running fixtures, and other active plumbing problems that need a fast diagnosis." },
          { title: "Planned Work / Installations", body: "Water-heater replacements, fixture installs, line updates, and scope-based residential plumbing work." },
        ],
      },
    },
  });
  const { BlueCollarPreviewTemplate } = await loadBlueCollarPreviewTemplate();
  const html = renderToStaticMarkup(
    createElement(BlueCollarPreviewTemplate, { model })
  );

  assert.equal(
    model.services.heading,
    "Plumbing services for immediate problems and planned work"
  );
  assert.deepEqual(
    model.services.items.map((item) => item.title),
    ["Immediate Needs", "Planned Work / Installations"]
  );
  assert.ok(html.includes("Request Estimate"));
  assert.ok(html.includes("Immediate Needs"));
  assert.ok(html.includes("Planned Work / Installations"));
  assert.ok(
    html.includes(
      "Leaking lines, backed-up drains, running fixtures, and other active plumbing problems that need a fast diagnosis."
    )
  );
});

test("shared blue-collar preview model exposes plumbing secondary CTA", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: PLUMBING_NICHE_TEMPLATE,
    seed: PLUMBING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const model = buildBlueCollarPreviewModel({
    ...render,
    resolvedFields: {
      ...render.resolvedFields,
      secondaryCtaLabel: "Request Estimate",
      secondaryCtaHref: "#contact",
    },
  });

  assert.equal(model.hero.primaryCta.label, "Call Now");
  assert.equal(model.hero.primaryCta.href, "tel:+16145550189");
  assert.equal(model.hero.secondaryCta?.label, "Request Estimate");
  assert.equal(model.hero.secondaryCta?.href, "#contact");
});

test("blue-collar preview model surfaces rendered hero image urls", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates: {
      hero: {
        id: "hero-approved",
        slot: "hero",
        status: "approved",
        storagePath: "template-images/roofing-v1/batch-1/hero-0.png",
        assetUrl: "https://example.com/template-images/roofing-v1/batch-1/hero-0.png",
      } as never,
    },
  });

  const model = buildBlueCollarPreviewModel(render);

  assert.equal(
    model.hero.imageSrc,
    "https://example.com/template-images/roofing-v1/batch-1/hero-0.png"
  );
});

test("strict resolver builds service items from resolved services values", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    lead: {
      source: "crm",
      normalizedFields: {
        services: ["Emergency Tarping", "Leak Repair"],
      },
    },
    sampleMode: "strict",
  });

  assert.deepEqual(
    render.resolvedSections.services.items?.map((item) => item.title),
    ["Emergency Tarping", "Leak Repair"]
  );
});

test("strict resolver keeps suppression and fallback audits tied to actual decisions", () => {
  const approvedRender = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: {
      ...ROOFING_SEED_BUSINESS,
      conditionalProof: {
        ...ROOFING_SEED_BUSINESS.conditionalProof,
        sampleTestimonials: {
          ...ROOFING_SEED_BUSINESS.conditionalProof.sampleTestimonials,
          approvalStatus: "approved",
        },
      },
    },
    sampleMode: "preview-safe",
  });

  assert.equal(approvedRender.resolvedSections.testimonials.visible, false);
  assert.equal(approvedRender.status.hasSuppressedClaims, true);
  assert.deepEqual(
    approvedRender.overrideAudit.suppressed.map((entry) => entry.field),
    ["licensedAndInsured", "warrantyCopy", "sampleTestimonials"]
  );
  assert.deepEqual(approvedRender.overrideAudit.fallbacks, []);
  assert.equal(approvedRender.status.hasFallbackSections, true);
  assert.deepEqual(approvedRender.sectionAudit.decisions, [
    {
      section: "testimonials",
      action: "hidden",
      reasonCode: REASON_CODES.MISSING_EVIDENCE,
      note: "Sample testimonial proof is not approved for this render path.",
    },
    {
      section: "hero",
      action: "downgraded",
      reasonCode: REASON_CODES.MISSING_APPROVED_ASSET,
      note: "No approved assets available for this render path.",
    },
  ]);
});

test("resolver uses suppression reasons that match the current mode", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "preview-safe",
  });

  assert.equal(render.resolvedSections.testimonials.visible, false);
  assert.deepEqual(
    render.overrideAudit.suppressed.map((entry) => entry.field),
    ["licensedAndInsured", "warrantyCopy", "sampleTestimonials"]
  );
  assert.equal(
    render.overrideAudit.suppressed.some((entry) =>
      entry.reason.includes("strict mode")
    ),
    false
  );
});

test("testimonials section resolution notes use the computed suppression note", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: {
      ...ROOFING_SEED_BUSINESS,
      conditionalProof: {
        ...ROOFING_SEED_BUSINESS.conditionalProof,
        sampleTestimonials: {
          ...ROOFING_SEED_BUSINESS.conditionalProof.sampleTestimonials,
          approvalStatus: "approved",
        },
      },
    },
    sampleMode: "preview-safe",
  });

  assert.deepEqual(render.resolvedSections.testimonials.resolutionNotes, [
    "Sample testimonial proof is not approved for this render path.",
  ]);
});

test("strict resolver allows approved non-sample testimonials", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: {
      ...ROOFING_SEED_BUSINESS,
      conditionalProof: {
        ...ROOFING_SEED_BUSINESS.conditionalProof,
        sampleTestimonials: {
          ...ROOFING_SEED_BUSINESS.conditionalProof.sampleTestimonials,
          approvalStatus: "approved",
          sample: false,
        },
      },
    },
    sampleMode: "strict",
  });

  assert.equal(render.resolvedSections.testimonials.visible, true);
  assert.equal(render.status.hasSuppressedClaims, true);
  assert.deepEqual(
    render.overrideAudit.suppressed.map((entry) => entry.field),
    ["licensedAndInsured", "warrantyCopy"]
  );
  assert.equal(
    render.sectionAudit.decisions.some((entry) => entry.section === "testimonials"),
    false
  );
});

test("resolver fails fast when template family is incompatible", () => {
  assert.throws(
    () =>
      resolveTemplateRender({
        family: BLUE_COLLAR_SERVICE_FAMILY,
        template: {
          ...ROOFING_NICHE_TEMPLATE,
          familyKey: "other-family",
        },
        seed: ROOFING_SEED_BUSINESS,
        sampleMode: "strict",
      }),
    /template family/i
  );
});

test("resolver fails fast when schema version is incompatible", () => {
  assert.throws(
    () =>
      resolveTemplateRender({
        family: BLUE_COLLAR_SERVICE_FAMILY,
        template: {
          ...ROOFING_NICHE_TEMPLATE,
          expectedSchemaVersion: "9.9.9",
        },
        seed: ROOFING_SEED_BUSINESS,
        sampleMode: "strict",
      }),
    /schema version/i
  );
});

test("resolver fails fast when seed niche template is incompatible", () => {
  assert.throws(
    () =>
      resolveTemplateRender({
        family: BLUE_COLLAR_SERVICE_FAMILY,
        template: ROOFING_NICHE_TEMPLATE,
        seed: {
          ...ROOFING_SEED_BUSINESS,
          nicheTemplateKey: "other-template",
        },
        sampleMode: "strict",
      }),
    /seed niche template/i
  );
});

test("resolver omits CTA payloads for hero and contact when CTA fields are missing", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: {
      ...ROOFING_SEED_BUSINESS,
      businessProfile: {
        ...ROOFING_SEED_BUSINESS.businessProfile,
        primaryCtaLabel: "",
        primaryCtaHref: "",
      },
    },
    sampleMode: "strict",
  });

  assert.equal(render.status.isPreviewSafe, false);
  assert.deepEqual(render.status.missingCriticalFields.sort(), [
    "primaryCtaHref",
    "primaryCtaLabel",
  ]);
  assert.equal(render.resolvedSections.hero.cta, undefined);
  assert.equal(render.resolvedSections.contact.cta, undefined);
});

test("resolver attributes omitted visual audit to the hero section", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  const heroAudit = render.sectionAudit.decisions.find(
    (entry) => entry.section === "hero"
  );

  assert.deepEqual(heroAudit, {
    section: "hero",
    action: "downgraded",
    reasonCode: REASON_CODES.MISSING_APPROVED_ASSET,
    note: "No approved assets available for this render path.",
  });
  assert.equal(
    render.sectionAudit.decisions.some((entry) => entry.section === "gallery"),
    false
  );
});
