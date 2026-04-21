import { notFound } from "next/navigation";

import { TemplateCopyDetail } from "@/components/template-copy/template-copy-detail";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { buildTemplateCopyInventory } from "@/lib/template-system/copy-review/inventory";
import {
  applyTemplateCopyReviewState,
  buildTemplateCopyReviewSummary,
  listTemplateCopyReviewState,
} from "@/lib/template-system/copy-review/repository";
import type { TemplateCopySlot } from "@/lib/template-system/copy-review/types";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { HEALTH_WELLNESS_FAMILY } from "@/lib/template-system/families/health-wellness";
import { buildHealthWellnessPreviewModel } from "@/lib/template-system/health-wellness-preview";
import { HVAC_NICHE_TEMPLATE } from "@/lib/template-system/niches/hvac";
import { MED_SPA_NICHE_TEMPLATE } from "@/lib/template-system/niches/med-spa";
import { PLUMBING_NICHE_TEMPLATE } from "@/lib/template-system/niches/plumbing";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { HVAC_SEED_BUSINESS } from "@/lib/template-system/seeds/hvac-seed";
import { MED_SPA_SEED_BUSINESS } from "@/lib/template-system/seeds/med-spa-seed";
import { PLUMBING_SEED_BUSINESS } from "@/lib/template-system/seeds/plumbing-seed";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";

export const dynamic = "force-dynamic";

const COPY_REVIEW_TEMPLATES = {
  "roofing-v1": {
    templateKey: "roofing-v1",
    familyKey: BLUE_COLLAR_SERVICE_FAMILY.key,
    label: "Roofing",
    previewPath: "/preview/templates/roofing-archetype",
    buildInventory: () => {
      const render = resolveTemplateRender({
        family: BLUE_COLLAR_SERVICE_FAMILY,
        template: ROOFING_NICHE_TEMPLATE,
        seed: ROOFING_SEED_BUSINESS,
        sampleMode: "strict",
      });

      return buildTemplateCopyInventory({
        templateKey: ROOFING_NICHE_TEMPLATE.key,
        familyKey: BLUE_COLLAR_SERVICE_FAMILY.key,
        renderer: "blue-collar",
        previewModel: buildBlueCollarPreviewModel(render),
      });
    },
  },
  "hvac-v1": {
    templateKey: "hvac-v1",
    familyKey: BLUE_COLLAR_SERVICE_FAMILY.key,
    label: "HVAC",
    previewPath: "/preview/templates/hvac-archetype",
    buildInventory: () => {
      const render = resolveTemplateRender({
        family: BLUE_COLLAR_SERVICE_FAMILY,
        template: HVAC_NICHE_TEMPLATE,
        seed: HVAC_SEED_BUSINESS,
        sampleMode: "strict",
      });

      return buildTemplateCopyInventory({
        templateKey: HVAC_NICHE_TEMPLATE.key,
        familyKey: BLUE_COLLAR_SERVICE_FAMILY.key,
        renderer: "blue-collar",
        previewModel: buildBlueCollarPreviewModel(render),
      });
    },
  },
  "plumbing-v1": {
    templateKey: "plumbing-v1",
    familyKey: BLUE_COLLAR_SERVICE_FAMILY.key,
    label: "Plumbing",
    previewPath: "/preview/templates/plumbing-archetype",
    buildInventory: () => {
      const render = resolveTemplateRender({
        family: BLUE_COLLAR_SERVICE_FAMILY,
        template: PLUMBING_NICHE_TEMPLATE,
        seed: PLUMBING_SEED_BUSINESS,
        sampleMode: "strict",
      });

      return buildTemplateCopyInventory({
        templateKey: PLUMBING_NICHE_TEMPLATE.key,
        familyKey: BLUE_COLLAR_SERVICE_FAMILY.key,
        renderer: "blue-collar",
        previewModel: buildBlueCollarPreviewModel(render),
      });
    },
  },
  "med-spa-v1": {
    templateKey: "med-spa-v1",
    familyKey: HEALTH_WELLNESS_FAMILY.key,
    label: "Med Spa",
    previewPath: "/preview/templates/med-spa-archetype",
    buildInventory: () => {
      const render = resolveTemplateRender({
        family: HEALTH_WELLNESS_FAMILY,
        template: MED_SPA_NICHE_TEMPLATE,
        seed: MED_SPA_SEED_BUSINESS,
        sampleMode: "strict",
      });

      return buildTemplateCopyInventory({
        templateKey: MED_SPA_NICHE_TEMPLATE.key,
        familyKey: HEALTH_WELLNESS_FAMILY.key,
        renderer: "health-wellness",
        previewModel: buildHealthWellnessPreviewModel(render),
      });
    },
  },
} as const;

function groupSlotsBySection(slots: readonly TemplateCopySlot[]) {
  const groups: Array<{ sectionKey: string; slots: TemplateCopySlot[] }> = [];
  const bySection = new Map<string, TemplateCopySlot[]>();

  for (const slot of slots) {
    if (!bySection.has(slot.sectionKey)) {
      const sectionSlots: TemplateCopySlot[] = [];
      bySection.set(slot.sectionKey, sectionSlots);
      groups.push({ sectionKey: slot.sectionKey, slots: sectionSlots });
    }

    bySection.get(slot.sectionKey)?.push(slot);
  }

  return groups;
}

export default async function TemplateCopyDetailPage({
  params,
}: {
  params: Promise<{ templateKey: string }>;
}) {
  const { templateKey } = await params;
  const config =
    COPY_REVIEW_TEMPLATES[templateKey as keyof typeof COPY_REVIEW_TEMPLATES];

  if (!config) {
    notFound();
  }

  const inventory = config.buildInventory();
  const reviewState = await listTemplateCopyReviewState(config.templateKey);
  const slots = applyTemplateCopyReviewState({
    inventory,
    reviewState,
  });
  const summary = buildTemplateCopyReviewSummary({
    templateKey: config.templateKey,
    inventory,
    reviewState,
  });

  return (
    <TemplateCopyDetail
      familyKey={config.familyKey}
      groupedSlots={groupSlotsBySection(slots)}
      previewPath={config.previewPath}
      slots={slots}
      summary={summary}
      templateKey={config.templateKey}
      title={config.label}
    />
  );
}
