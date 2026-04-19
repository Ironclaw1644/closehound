import test from "node:test";
import assert from "node:assert/strict";

import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { REASON_CODES } from "@/lib/template-system/reason-codes";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";
import type { RenderPackage, SampleMode, SectionKey } from "@/lib/template-system/types";

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

test("roofing seed business does not pre-approve fabricated testimonials", () => {
  assert.equal(
    ROOFING_SEED_BUSINESS.conditionalProof.sampleTestimonials.approvalStatus,
    "pending"
  );
});
