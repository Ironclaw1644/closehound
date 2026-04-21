import assert from "node:assert/strict";
import test from "node:test";

import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { CLINICAL_CARE_FAMILY } from "@/lib/template-system/families/clinical-care";
import { HEALTH_WELLNESS_FAMILY } from "@/lib/template-system/families/health-wellness";
import { buildDentalPreviewModel } from "@/lib/template-system/dental-preview";
import { buildMedSpaPreviewModel } from "@/lib/template-system/med-spa-preview";
import { DENTAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/dental";
import { JUNK_REMOVAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/junk-removal";
import { MED_SPA_NICHE_TEMPLATE } from "@/lib/template-system/niches/med-spa";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { DENTAL_SEED_BUSINESS } from "@/lib/template-system/seeds/dental-seed";
import { JUNK_REMOVAL_SEED_BUSINESS } from "@/lib/template-system/seeds/junk-removal-seed";
import { MED_SPA_SEED_BUSINESS } from "@/lib/template-system/seeds/med-spa-seed";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";
import { buildTemplateCopyInventory } from "@/lib/template-system/copy-review/inventory";
import { TEMPLATE_COPY_REVIEW_TEMPLATES } from "@/lib/template-system/copy-review/registry";
import {
  __resetTemplateCopyReviewStateForTests,
  buildTemplateCopyReviewSummary,
  listTemplateCopyReviewState,
  saveApprovedTemplateCopySlot,
  saveRevisionTemplateCopySlot,
} from "@/lib/template-system/copy-review/repository";

async function buildRoofingInventory() {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });
  const preview = buildBlueCollarPreviewModel(render);

  return buildTemplateCopyInventory({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    familyKey: BLUE_COLLAR_SERVICE_FAMILY.key,
    renderer: "blue-collar",
    previewModel: preview,
  });
}

async function buildDentalInventory() {
  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
  });
  const preview = buildDentalPreviewModel(render);

  return buildTemplateCopyInventory({
    templateKey: DENTAL_NICHE_TEMPLATE.key,
    familyKey: CLINICAL_CARE_FAMILY.key,
    renderer: "clinical-care",
    previewModel: preview,
  });
}

async function buildJunkRemovalInventory() {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: JUNK_REMOVAL_NICHE_TEMPLATE,
    seed: JUNK_REMOVAL_SEED_BUSINESS,
    sampleMode: "strict",
  });
  const preview = buildBlueCollarPreviewModel(render);

  return buildTemplateCopyInventory({
    templateKey: JUNK_REMOVAL_NICHE_TEMPLATE.key,
    familyKey: BLUE_COLLAR_SERVICE_FAMILY.key,
    renderer: "blue-collar",
    previewModel: preview,
  });
}

test("copy inventory extracts visible roofing slots in page order", () => {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });
  const preview = buildBlueCollarPreviewModel(render);

  const inventory = buildTemplateCopyInventory({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    familyKey: BLUE_COLLAR_SERVICE_FAMILY.key,
    renderer: "blue-collar",
    previewModel: preview,
  });

  assert.equal(inventory[0]?.slotRole, "hero-meta");
  assert.equal(inventory[1]?.slotRole, "hero-heading");
  assert.equal(inventory[2]?.slotRole, "hero-body");
  assert.equal(inventory.some((slot) => slot.slotRole === "primary-cta-label"), true);
  assert.equal(inventory.some((slot) => slot.slotRole === "section-heading"), true);
  assert.equal(inventory.some((slot) => slot.slotRole === "card-title"), true);
  assert.equal(inventory.some((slot) => slot.slotRole === "faq-answer"), true);
  assert.equal(
    inventory.some((slot) => slot.currentText.includes("Summit Peak Roofing")),
    true
  );
  assert.equal(
    inventory.some((slot) =>
      slot.currentText.includes("Roofing work that protects your home and keeps the job moving")
    ),
    true
  );
  assert.equal(
    inventory.some((slot) => slot.currentText.includes("Talk through the roofing issue")),
    true
  );
});

test("copy inventory extracts visible med spa slots in page order", () => {
  const render = resolveTemplateRender({
    family: HEALTH_WELLNESS_FAMILY,
    template: MED_SPA_NICHE_TEMPLATE,
    seed: MED_SPA_SEED_BUSINESS,
    sampleMode: "strict",
  });
  const preview = buildMedSpaPreviewModel(render);

  const inventory = buildTemplateCopyInventory({
    templateKey: MED_SPA_NICHE_TEMPLATE.key,
    familyKey: HEALTH_WELLNESS_FAMILY.key,
    renderer: "health-wellness",
    previewModel: preview,
  });

  assert.equal(inventory[0]?.slotRole, "hero-meta");
  assert.equal(inventory[1]?.slotRole, "hero-heading");
  assert.equal(inventory[2]?.slotRole, "hero-body");
  assert.equal(inventory.some((slot) => slot.slotRole === "primary-cta-label"), true);
  assert.equal(inventory.some((slot) => slot.slotRole === "section-heading"), true);
  assert.equal(inventory.some((slot) => slot.slotRole === "card-title"), true);
  assert.equal(inventory.some((slot) => slot.slotRole === "faq-answer"), true);
  assert.equal(
    inventory.some((slot) => slot.currentText.includes("Raleigh, NC")),
    true
  );
  assert.equal(
    inventory.some((slot) =>
      slot.currentText.includes(
        "Personalized aesthetic care. Real results."
      )
    ),
    true
  );
  assert.equal(
    inventory.some((slot) =>
      slot.currentText.includes(
        "A med spa experience built around comfort, clarity, and care"
      )
    ),
    true
  );
});

test("copy inventory extracts visible dental slots in page order", async () => {
  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
  });
  const preview = buildDentalPreviewModel(render);
  const inventory = buildTemplateCopyInventory({
    templateKey: DENTAL_NICHE_TEMPLATE.key,
    familyKey: CLINICAL_CARE_FAMILY.key,
    renderer: "clinical-care",
    previewModel: preview,
  });

  assert.equal(inventory[0]?.slotRole, "hero-meta");
  assert.equal(inventory[1]?.slotRole, "hero-heading");
  assert.equal(inventory[2]?.slotRole, "hero-body");
  assert.equal(inventory.some((slot) => slot.slotRole === "primary-cta-label"), true);
  assert.equal(inventory.some((slot) => slot.slotRole === "section-heading"), true);
  assert.equal(inventory.some((slot) => slot.slotRole === "card-title"), true);
  assert.equal(
    inventory.some((slot) => slot.slotRole === "faq-answer"),
    (preview.faq?.items.length ?? 0) > 0
  );
  assert.equal(
    inventory.some((slot) => slot.currentText.includes("Harbor Point Dental")),
    true
  );
  assert.equal(
    inventory.some((slot) =>
      slot.currentText.includes("General dentistry with clear guidance and comfortable visits")
    ),
    true
  );
  assert.equal(
    inventory.some((slot) => slot.currentText.includes("Schedule Visit")),
    true
  );
});

test("template copy review registry exposes dental archetype metadata", () => {
  const config = TEMPLATE_COPY_REVIEW_TEMPLATES.find(
    (entry) => entry.templateKey === "dental-v1"
  );

  assert.equal(config?.familyKey, "clinical-care");
  assert.equal(config?.label, "Dental");
  assert.equal(config?.previewPath, "/preview/templates/dental-archetype");
});

test("template copy review registry exposes junk removal archetype metadata", () => {
  const config = TEMPLATE_COPY_REVIEW_TEMPLATES.find(
    (entry) => entry.templateKey === "junk-removal-v1"
  );

  assert.equal(config?.familyKey, "blue-collar-service");
  assert.equal(config?.label, "Junk Removal");
  assert.equal(config?.previewPath, "/preview/templates/junk-removal-archetype");
});

test("copy inventory extracts visible junk removal slots in page order", async () => {
  const inventory = await buildJunkRemovalInventory();

  assert.equal(inventory[0]?.slotRole, "hero-meta");
  assert.equal(inventory[1]?.slotRole, "hero-heading");
  assert.equal(inventory[2]?.slotRole, "hero-body");
  assert.equal(inventory.some((slot) => slot.slotRole === "primary-cta-label"), true);
  assert.equal(
    inventory.some((slot) => slot.currentText.includes("ClearPath Junk Removal")),
    true
  );
  assert.equal(
    inventory.some((slot) =>
      slot.currentText.includes("Junk removal for pickups, cleanouts, and haul-away work")
    ),
    true
  );
  assert.equal(
    inventory.some((slot) =>
      slot.currentText.includes("Get a junk removal quote or call now")
    ),
    true
  );
});

test("copy review state defaults to unreviewed for untouched inventory", async () => {
  await __resetTemplateCopyReviewStateForTests();
  const inventory = await buildRoofingInventory();

  const reviewState = await listTemplateCopyReviewState(ROOFING_NICHE_TEMPLATE.key);
  const summary = buildTemplateCopyReviewSummary({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    inventory,
    reviewState,
  });

  assert.equal(reviewState.length, 0);
  assert.equal(summary.approvedCount, 0);
  assert.equal(summary.needsRevisionCount, 0);
  assert.equal(summary.unreviewedCount, inventory.length);
  assert.equal(summary.copyApproved, false);
});

test("copy review state saves one approved slot", async () => {
  await __resetTemplateCopyReviewStateForTests();
  const inventory = await buildRoofingInventory();
  const heroHeadingSlot = inventory.find((slot) => slot.slotKey === "hero.heading");

  assert.ok(heroHeadingSlot);

  await saveApprovedTemplateCopySlot({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    slotKey: heroHeadingSlot.slotKey,
    reviewNotes: "Approved as written.",
  });

  const reviewState = await listTemplateCopyReviewState(ROOFING_NICHE_TEMPLATE.key);
  const approved = reviewState.find((slot) => slot.slotKey === heroHeadingSlot.slotKey);

  assert.equal(approved?.status, "approved");
  assert.equal(approved?.decision, "approved");
  assert.equal(approved?.reviewNotes, "Approved as written.");
});

test("copy review state saves one revision request", async () => {
  await __resetTemplateCopyReviewStateForTests();
  const inventory = await buildRoofingInventory();
  const serviceBodySlot = inventory.find(
    (slot) => slot.slotKey === "services.items.0.body"
  );

  assert.ok(serviceBodySlot);

  await saveRevisionTemplateCopySlot({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    slotKey: serviceBodySlot.slotKey,
    decision: "revise_tone",
    proposedText: "Tighten this service description for a more direct tone.",
    reviewNotes: "Feels slightly soft for roofing.",
  });

  const reviewState = await listTemplateCopyReviewState(ROOFING_NICHE_TEMPLATE.key);
  const revised = reviewState.find((slot) => slot.slotKey === serviceBodySlot.slotKey);

  assert.equal(revised?.status, "needs-revision");
  assert.equal(revised?.decision, "revise_tone");
  assert.equal(
    revised?.proposedText,
    "Tighten this service description for a more direct tone."
  );
  assert.equal(revised?.reviewNotes, "Feels slightly soft for roofing.");
});

test("copy review summary counts approved, needs-revision, and unreviewed slots", async () => {
  await __resetTemplateCopyReviewStateForTests();
  const inventory = await buildRoofingInventory();
  const heroHeadingSlot = inventory.find((slot) => slot.slotKey === "hero.heading");
  const serviceBodySlot = inventory.find(
    (slot) => slot.slotKey === "services.items.0.body"
  );

  assert.ok(heroHeadingSlot);
  assert.ok(serviceBodySlot);

  await saveApprovedTemplateCopySlot({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    slotKey: heroHeadingSlot.slotKey,
  });
  await saveRevisionTemplateCopySlot({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    slotKey: serviceBodySlot.slotKey,
    decision: "replace",
    proposedText: "Replace with tighter homeowner-facing copy.",
  });

  const reviewState = await listTemplateCopyReviewState(ROOFING_NICHE_TEMPLATE.key);
  const summary = buildTemplateCopyReviewSummary({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    inventory,
    reviewState,
  });

  assert.equal(summary.approvedCount, 1);
  assert.equal(summary.needsRevisionCount, 1);
  assert.equal(summary.unreviewedCount, inventory.length - 2);
  assert.equal(summary.copyApproved, false);
});

test("copy review state replaces a revision with approval for the same slot", async () => {
  await __resetTemplateCopyReviewStateForTests();
  const inventory = await buildRoofingInventory();
  const heroHeadingSlot = inventory.find((slot) => slot.slotKey === "hero.heading");

  assert.ok(heroHeadingSlot);

  await saveRevisionTemplateCopySlot({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    slotKey: heroHeadingSlot.slotKey,
    decision: "revise_fit",
    proposedText: "Shorter headline for tighter hero width.",
    reviewNotes: "Trim to fit.",
  });

  await saveApprovedTemplateCopySlot({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    slotKey: heroHeadingSlot.slotKey,
    reviewNotes: "Approved after rewrite.",
  });

  const reviewState = await listTemplateCopyReviewState(ROOFING_NICHE_TEMPLATE.key);
  const finalState = reviewState.find((slot) => slot.slotKey === heroHeadingSlot.slotKey);
  const summary = buildTemplateCopyReviewSummary({
    templateKey: ROOFING_NICHE_TEMPLATE.key,
    inventory,
    reviewState,
  });

  assert.equal(finalState?.status, "approved");
  assert.equal(finalState?.decision, "approved");
  assert.equal(finalState?.proposedText, undefined);
  assert.equal(finalState?.reviewNotes, "Approved after rewrite.");
  assert.equal(summary.approvedCount, 1);
  assert.equal(summary.needsRevisionCount, 0);
  assert.equal(summary.unreviewedCount, inventory.length - 1);
});

test("copy review state preserves concurrent writes for different slots", async () => {
  await __resetTemplateCopyReviewStateForTests();
  const inventory = await buildRoofingInventory();
  const heroHeadingSlot = inventory.find((slot) => slot.slotKey === "hero.heading");
  const serviceBodySlot = inventory.find(
    (slot) => slot.slotKey === "services.items.0.body"
  );

  assert.ok(heroHeadingSlot);
  assert.ok(serviceBodySlot);

  await Promise.all([
    saveApprovedTemplateCopySlot({
      templateKey: ROOFING_NICHE_TEMPLATE.key,
      slotKey: heroHeadingSlot.slotKey,
    }),
    saveRevisionTemplateCopySlot({
      templateKey: ROOFING_NICHE_TEMPLATE.key,
      slotKey: serviceBodySlot.slotKey,
      decision: "revise_tone",
      proposedText: "Make this more direct.",
    }),
  ]);

  const reviewState = await listTemplateCopyReviewState(ROOFING_NICHE_TEMPLATE.key);

  assert.equal(reviewState.length, 2);
  assert.equal(
    reviewState.some(
      (slot) => slot.slotKey === heroHeadingSlot.slotKey && slot.status === "approved"
    ),
    true
  );
  assert.equal(
    reviewState.some(
      (slot) =>
        slot.slotKey === serviceBodySlot.slotKey &&
        slot.status === "needs-revision" &&
        slot.decision === "revise_tone"
    ),
    true
  );
});
