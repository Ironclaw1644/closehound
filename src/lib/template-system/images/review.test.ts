import test from "node:test";
import assert from "node:assert/strict";

import {
  TEMPLATE_IMAGE_REVIEW_TEMPLATES,
  buildTemplatePreviewInspectionHref,
  getTemplateImageReviewConfig,
  resolveSelectedTemplateBatchId,
} from "@/lib/template-system/images/review-registry";
import {
  extractCandidateId,
  getTemplatePathsToRevalidate,
} from "@/app/internal/template-images/action-utils";
import {
  buildTemplateReviewSummaryFromRecords,
  applyApprovalMutation,
  applyRejectMutation,
  getCurrentApprovedTemplateImageCandidatesFromRecords,
  selectMostRecentlyApprovedTemplateImageBatch,
  sortTemplateBatchesNewestFirst,
  type ArchetypeImageCandidateRecord,
} from "@/lib/template-system/images/repository";

function makeRecord(
  overrides: Partial<ArchetypeImageCandidateRecord>
): ArchetypeImageCandidateRecord {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    generationBatchId: overrides.generationBatchId ?? "batch-1",
    familyKey: overrides.familyKey ?? "blue-collar-service",
    templateKey: overrides.templateKey ?? "roofing-v1",
    templateVersion: overrides.templateVersion ?? "1.0.0",
    seedBusinessKey: overrides.seedBusinessKey ?? null,
    leadId: overrides.leadId ?? null,
    slot: overrides.slot ?? "hero",
    candidateIndex: overrides.candidateIndex ?? 0,
    prompt: overrides.prompt ?? "prompt",
    negativePrompt: overrides.negativePrompt ?? "negative",
    promptVersion: overrides.promptVersion ?? "v1",
    provider: overrides.provider ?? "gemini",
    model: overrides.model ?? "nano-banana-2",
    status: overrides.status ?? "generated",
    storagePath:
      "storagePath" in overrides
        ? (overrides.storagePath ?? "")
        : "template-images/roofing-v1/batch-1/hero-0.png",
    assetUrl:
      "assetUrl" in overrides
        ? (overrides.assetUrl ?? null)
        : "https://example.com/hero-0.png",
    aspectRatio: overrides.aspectRatio ?? "16:9",
    cropNotes: overrides.cropNotes ?? null,
    createdAt: overrides.createdAt ?? "2026-04-20T12:00:00.000Z",
    createdBy: overrides.createdBy ?? "codex",
    approvalUpdatedAt: overrides.approvalUpdatedAt ?? null,
    approvalUpdatedBy: overrides.approvalUpdatedBy ?? null,
  };
}

test("review registry exposes supported template configs", () => {
  assert.equal(TEMPLATE_IMAGE_REVIEW_TEMPLATES.length, 3);
  assert.equal(
    getTemplateImageReviewConfig("roofing-v1")?.previewPath,
    "/preview/templates/roofing-archetype"
  );
  assert.equal(
    getTemplateImageReviewConfig("hvac-v1")?.previewPath,
    "/preview/templates/hvac-archetype"
  );
  assert.equal(
    getTemplateImageReviewConfig("plumbing-v1")?.previewPath,
    "/preview/templates/plumbing-archetype"
  );
  assert.equal(getTemplateImageReviewConfig("unknown-template"), undefined);
});

test("template review summary reports required and optional approval counts", () => {
  const summary = buildTemplateReviewSummaryFromRecords({
    templateKey: "roofing-v1",
    slotDefinitions: [
      { key: "hero", required: true },
      { key: "service-action", required: true },
      { key: "gallery-extra", required: false },
    ],
    records: [
      makeRecord({ templateKey: "roofing-v1", slot: "hero", status: "approved" }),
      makeRecord({
        templateKey: "roofing-v1",
        slot: "service-action",
        status: "approved",
        id: "two",
      }),
    ],
  });

  assert.equal(summary.requiredApprovedCount, 2);
  assert.equal(summary.requiredTotalCount, 2);
  assert.equal(summary.optionalApprovedCount, 0);
  assert.equal(summary.optionalTotalCount, 1);
  assert.equal(summary.isPreviewSafe, true);
});

test("batch sorting prefers newest created timestamp first", () => {
  const batches = sortTemplateBatchesNewestFirst([
    { generationBatchId: "batch-old", createdAt: "2026-04-19T10:00:00.000Z" },
    { generationBatchId: "batch-new", createdAt: "2026-04-20T10:00:00.000Z" },
  ]);

  assert.deepEqual(
    batches.map((batch) => batch.generationBatchId),
    ["batch-new", "batch-old"]
  );
});

test("latest approved batch prefers approval time over generation order", () => {
  const records = [
    makeRecord({
      templateKey: "roofing-v1",
      generationBatchId: "batch-newer-generated-first",
      createdAt: "2026-04-19T12:00:00.000Z",
      approvalUpdatedAt: "2026-04-18T09:00:00.000Z",
      status: "approved",
    }),
    makeRecord({
      templateKey: "roofing-v1",
      generationBatchId: "batch-older-generated-later",
      createdAt: "2026-04-10T12:00:00.000Z",
      approvalUpdatedAt: "2026-04-20T09:00:00.000Z",
      status: "approved",
      id: "later-approved",
    }),
  ];

  assert.equal(
    selectMostRecentlyApprovedTemplateImageBatch(records, "roofing-v1"),
    "batch-older-generated-later"
  );

  const summary = buildTemplateReviewSummaryFromRecords({
    templateKey: "roofing-v1",
    slotDefinitions: [{ key: "hero", required: true }],
    records,
  });

  assert.equal(summary.latestBatchId, "batch-older-generated-later");
});

test("template review summary is preview-safe when required approvals are split across batches", () => {
  const records = [
    makeRecord({
      templateKey: "roofing-v1",
      generationBatchId: "batch-older",
      slot: "hero",
      status: "approved",
      approvalUpdatedAt: "2026-04-18T09:00:00.000Z",
      id: "older-hero",
    }),
    makeRecord({
      templateKey: "roofing-v1",
      generationBatchId: "batch-latest",
      slot: "service-action",
      status: "approved",
      approvalUpdatedAt: "2026-04-20T09:00:00.000Z",
      id: "latest-service-action",
    }),
  ];

  const summary = buildTemplateReviewSummaryFromRecords({
    templateKey: "roofing-v1",
    slotDefinitions: [
      { key: "hero", required: true },
      { key: "service-action", required: false },
    ],
    records,
  });

  assert.equal(summary.latestBatchId, "batch-latest");
  assert.equal(summary.requiredApprovedCount, 1);
  assert.equal(summary.optionalApprovedCount, 1);
  assert.equal(summary.requiredTotalCount, 1);
  assert.equal(summary.optionalTotalCount, 1);
  assert.equal(summary.isPreviewSafe, true);
});

test("template review summary is preview-safe when required approvals are covered across different batches", () => {
  const records = [
    makeRecord({
      templateKey: "roofing-v1",
      generationBatchId: "batch-older",
      slot: "hero",
      status: "approved",
      approvalUpdatedAt: "2026-04-18T09:00:00.000Z",
      id: "older-hero",
    }),
    makeRecord({
      templateKey: "roofing-v1",
      generationBatchId: "batch-latest",
      slot: "service-action",
      status: "approved",
      approvalUpdatedAt: "2026-04-20T09:00:00.000Z",
      id: "latest-service-action",
    }),
  ];

  const summary = buildTemplateReviewSummaryFromRecords({
    templateKey: "roofing-v1",
    slotDefinitions: [
      { key: "hero", required: true },
      { key: "service-action", required: true },
      { key: "gallery-extra", required: false },
    ],
    records,
  });

  assert.equal(summary.latestBatchId, "batch-latest");
  assert.equal(summary.requiredApprovedCount, 2);
  assert.equal(summary.optionalApprovedCount, 0);
  assert.equal(summary.requiredTotalCount, 2);
  assert.equal(summary.optionalTotalCount, 1);
  assert.equal(summary.isPreviewSafe, true);
});

test("template review summary ignores approved records without a renderable asset URL", () => {
  const summary = buildTemplateReviewSummaryFromRecords({
    templateKey: "roofing-v1",
    slotDefinitions: [
      { key: "hero", required: true },
      { key: "service-action", required: true },
    ],
    records: [
      makeRecord({
        id: "missing-hero-asset",
        templateKey: "roofing-v1",
        slot: "hero",
        status: "approved",
        assetUrl: null,
      }),
      makeRecord({
        id: "renderable-service-action",
        templateKey: "roofing-v1",
        slot: "service-action",
        status: "approved",
      }),
    ],
  });

  assert.equal(summary.requiredApprovedCount, 1);
  assert.equal(summary.requiredTotalCount, 2);
  assert.equal(summary.isPreviewSafe, false);
});

test("current approved candidates prefer the newest approved record per slot across batches", () => {
  const approvedBySlot = getCurrentApprovedTemplateImageCandidatesFromRecords({
    templateKey: "roofing-v1",
    slotDefinitions: [
      { key: "hero", required: true },
      { key: "service-action", required: true },
    ],
    records: [
      makeRecord({
        templateKey: "roofing-v1",
        generationBatchId: "batch-older",
        slot: "hero",
        status: "approved",
        approvalUpdatedAt: "2026-04-18T09:00:00.000Z",
        id: "older-hero",
      }),
      makeRecord({
        templateKey: "roofing-v1",
        generationBatchId: "batch-latest",
        slot: "hero",
        status: "approved",
        approvalUpdatedAt: "2026-04-20T09:00:00.000Z",
        id: "latest-hero",
      }),
      makeRecord({
        templateKey: "roofing-v1",
        generationBatchId: "batch-other",
        slot: "service-action",
        status: "approved",
        approvalUpdatedAt: "2026-04-19T09:00:00.000Z",
        id: "service-action",
      }),
    ],
  });

  assert.equal(approvedBySlot.hero?.id, "latest-hero");
  assert.equal(approvedBySlot["service-action"]?.id, "service-action");
});

test("resolveSelectedTemplateBatchId prefers an explicit batch when present", () => {
  const selected = resolveSelectedTemplateBatchId({
    batches: [
      { generationBatchId: "batch-new", createdAt: "2026-04-20T10:00:00.000Z" },
      { generationBatchId: "batch-old", createdAt: "2026-04-19T10:00:00.000Z" },
    ],
    requestedBatchId: "batch-old",
  });

  assert.equal(selected, "batch-old");
});

test("resolveSelectedTemplateBatchId returns null when an explicit batch is missing", () => {
  const selected = resolveSelectedTemplateBatchId({
    batches: [
      { generationBatchId: "batch-new", createdAt: "2026-04-20T10:00:00.000Z" },
      { generationBatchId: "batch-old", createdAt: "2026-04-19T10:00:00.000Z" },
    ],
    requestedBatchId: "missing-batch",
  });

  assert.equal(selected, null);
});

test("resolveSelectedTemplateBatchId returns null when no batches exist", () => {
  const selected = resolveSelectedTemplateBatchId({
    batches: [],
  });

  assert.equal(selected, null);
});

test("resolveSelectedTemplateBatchId returns the newest batch when no batch is requested", () => {
  const selected = resolveSelectedTemplateBatchId({
    batches: [
      { generationBatchId: "batch-new", createdAt: "2026-04-20T10:00:00.000Z" },
      { generationBatchId: "batch-old", createdAt: "2026-04-19T10:00:00.000Z" },
    ],
  });

  assert.equal(selected, "batch-new");
});

test("buildTemplatePreviewInspectionHref appends the batch query only when available", () => {
  assert.equal(
    buildTemplatePreviewInspectionHref({
      previewPath: "/preview/templates/roofing-archetype",
      generationBatchId: "batch-123",
    }),
    "/preview/templates/roofing-archetype?batch=batch-123"
  );

  assert.equal(
    buildTemplatePreviewInspectionHref({
      previewPath: "/preview/templates/roofing-archetype",
      generationBatchId: null,
    }),
    "/preview/templates/roofing-archetype"
  );
});

test("extractCandidateId trims valid input and rejects missing values", () => {
  const validFormData = new FormData();
  validFormData.set("candidateId", "  candidate-123  ");
  assert.equal(extractCandidateId(validFormData), "candidate-123");

  const missingFormData = new FormData();
  assert.throws(() => extractCandidateId(missingFormData), /Missing candidate id/);
});

test("getTemplatePathsToRevalidate includes index detail and preview paths", () => {
  assert.deepEqual(getTemplatePathsToRevalidate("roofing-v1"), [
    "/internal/template-images",
    "/internal/template-images/roofing-v1",
    "/preview/templates/roofing-archetype",
  ]);

  assert.deepEqual(getTemplatePathsToRevalidate("unknown-template"), [
    "/internal/template-images",
    "/internal/template-images/unknown-template",
  ]);
});

test("approving a candidate demotes any approved candidate for the same template slot across batches", () => {
  const records = [
    makeRecord({
      id: "batch-a-approved",
      templateKey: "roofing-v1",
      generationBatchId: "batch-a",
      slot: "hero",
      status: "approved",
      approvalUpdatedAt: "2026-04-19T08:00:00.000Z",
    }),
    makeRecord({
      id: "batch-b-generated",
      templateKey: "roofing-v1",
      generationBatchId: "batch-b",
      slot: "hero",
      status: "generated",
    }),
    makeRecord({
      id: "batch-c-approved-different-slot",
      templateKey: "roofing-v1",
      generationBatchId: "batch-c",
      slot: "service-action",
      status: "approved",
    }),
  ];

  const next = applyApprovalMutation(records, {
    candidateId: "batch-b-generated",
    approvedBy: "codex",
    approvedAt: "2026-04-20T09:00:00.000Z",
  });

  assert.equal(
    next.find((record) => record.id === "batch-b-generated")?.status,
    "approved"
  );
  assert.equal(
    next.find((record) => record.id === "batch-a-approved")?.status,
    "generated"
  );
  assert.equal(
    next.find((record) => record.id === "batch-c-approved-different-slot")?.status,
    "approved"
  );
});

test("approving a candidate without a renderable asset URL throws", () => {
  const records = [
    makeRecord({
      id: "missing-asset",
      templateKey: "roofing-v1",
      slot: "hero",
      status: "generated",
      assetUrl: null,
    }),
  ];

  assert.throws(
    () =>
      applyApprovalMutation(records, {
        candidateId: "missing-asset",
        approvedBy: "codex",
      }),
    /renderable asset URL/
  );
});

test("rejecting the active approved candidate leaves the slot unapproved", () => {
  const records = [
    makeRecord({
      id: "approved-hero",
      templateKey: "roofing-v1",
      slot: "hero",
      status: "approved",
      approvalUpdatedAt: "2026-04-20T08:00:00.000Z",
      approvalUpdatedBy: "codex",
    }),
    makeRecord({
      id: "generated-service-action",
      templateKey: "roofing-v1",
      slot: "service-action",
      status: "generated",
    }),
  ];

  const next = applyRejectMutation(records, {
    candidateId: "approved-hero",
    rejectedAt: "2026-04-20T10:00:00.000Z",
    rejectedBy: "codex",
  });

  assert.equal(
    next.find((record) => record.id === "approved-hero")?.status,
    "rejected"
  );
  assert.equal(
    next.some(
      (record) =>
        record.templateKey === "roofing-v1" &&
        record.slot === "hero" &&
        record.status === "approved"
    ),
    false
  );
});
