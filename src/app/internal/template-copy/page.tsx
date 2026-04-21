import { TemplateCopyIndex } from "@/components/template-copy/template-copy-index";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { buildTemplateCopyInventory } from "@/lib/template-system/copy-review/inventory";
import {
  buildTemplateCopyReviewSummary,
  listTemplateCopyReviewState,
} from "@/lib/template-system/copy-review/repository";
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

const COPY_REVIEW_TEMPLATES = [
  {
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
  {
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
  {
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
  {
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
] as const;

export default async function TemplateCopyIndexPage() {
  const items = await Promise.all(
    COPY_REVIEW_TEMPLATES.map(async (config) => {
      const inventory = config.buildInventory();
      const reviewState = await listTemplateCopyReviewState(config.templateKey);
      const summary = buildTemplateCopyReviewSummary({
        templateKey: config.templateKey,
        inventory,
        reviewState,
      });

      return {
        templateKey: config.templateKey,
        familyKey: config.familyKey,
        label: config.label,
        previewPath: config.previewPath,
        summary,
      };
    })
  );

  return <TemplateCopyIndex items={items} />;
}
