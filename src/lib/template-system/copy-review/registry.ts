import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { buildTemplateCopyInventory } from "@/lib/template-system/copy-review/inventory";
import { buildDentalPreviewModel } from "@/lib/template-system/dental-preview";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { CLINICAL_CARE_FAMILY } from "@/lib/template-system/families/clinical-care";
import { HEALTH_WELLNESS_FAMILY } from "@/lib/template-system/families/health-wellness";
import { buildHealthWellnessPreviewModel } from "@/lib/template-system/health-wellness-preview";
import { DENTAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/dental";
import { HVAC_NICHE_TEMPLATE } from "@/lib/template-system/niches/hvac";
import { MED_SPA_NICHE_TEMPLATE } from "@/lib/template-system/niches/med-spa";
import { PLUMBING_NICHE_TEMPLATE } from "@/lib/template-system/niches/plumbing";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { DENTAL_SEED_BUSINESS } from "@/lib/template-system/seeds/dental-seed";
import { HVAC_SEED_BUSINESS } from "@/lib/template-system/seeds/hvac-seed";
import { MED_SPA_SEED_BUSINESS } from "@/lib/template-system/seeds/med-spa-seed";
import { PLUMBING_SEED_BUSINESS } from "@/lib/template-system/seeds/plumbing-seed";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";

export type TemplateCopyReviewConfig = {
  templateKey: "roofing-v1" | "hvac-v1" | "plumbing-v1" | "med-spa-v1" | "dental-v1";
  familyKey: string;
  label: string;
  previewPath: string;
  buildInventory: () => ReturnType<typeof buildTemplateCopyInventory>;
};

export const TEMPLATE_COPY_REVIEW_TEMPLATES = [
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
  {
    templateKey: "dental-v1",
    familyKey: CLINICAL_CARE_FAMILY.key,
    label: "Dental",
    previewPath: "/preview/templates/dental-archetype",
    buildInventory: () => {
      const render = resolveTemplateRender({
        family: CLINICAL_CARE_FAMILY,
        template: DENTAL_NICHE_TEMPLATE,
        seed: DENTAL_SEED_BUSINESS,
        sampleMode: "strict",
      });

      return buildTemplateCopyInventory({
        templateKey: DENTAL_NICHE_TEMPLATE.key,
        familyKey: CLINICAL_CARE_FAMILY.key,
        renderer: "clinical-care",
        previewModel: buildDentalPreviewModel(render),
      });
    },
  },
] as const satisfies readonly TemplateCopyReviewConfig[];

export function getTemplateCopyReviewConfig(templateKey: string) {
  return TEMPLATE_COPY_REVIEW_TEMPLATES.find(
    (config) => config.templateKey === templateKey
  );
}
