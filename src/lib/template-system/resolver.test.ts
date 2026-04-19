import test from "node:test";
import assert from "node:assert/strict";

import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { REASON_CODES } from "@/lib/template-system/reason-codes";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
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
  assert.equal(approvedRender.overrideAudit.suppressed.length, 1);
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
      note: "No approved roofing assets available yet.",
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
  assert.equal(render.overrideAudit.suppressed.length, 1);
  assert.equal(
    render.overrideAudit.suppressed[0]?.reason.includes("strict mode"),
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
  assert.equal(render.status.hasSuppressedClaims, false);
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
    note: "No approved roofing assets available yet.",
  });
  assert.equal(
    render.sectionAudit.decisions.some((entry) => entry.section === "gallery"),
    false
  );
});
