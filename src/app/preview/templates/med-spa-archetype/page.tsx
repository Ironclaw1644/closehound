import { notFound } from "next/navigation";

import { HealthWellnessPreviewTemplate } from "@/components/site-templates/health-wellness-preview";
import { HEALTH_WELLNESS_FAMILY } from "@/lib/template-system/families/health-wellness";
import { buildHealthWellnessPreviewModel } from "@/lib/template-system/health-wellness-preview";
import { MED_SPA_NICHE_TEMPLATE } from "@/lib/template-system/niches/med-spa";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { MED_SPA_SEED_BUSINESS } from "@/lib/template-system/seeds/med-spa-seed";

export default function MedSpaArchetypePreviewPage() {
  const render = resolveTemplateRender({
    family: HEALTH_WELLNESS_FAMILY,
    template: MED_SPA_NICHE_TEMPLATE,
    seed: MED_SPA_SEED_BUSINESS,
    sampleMode: "strict",
  });

  if (!render.status.isPreviewSafe) {
    notFound();
  }

  return (
    <HealthWellnessPreviewTemplate
      model={buildHealthWellnessPreviewModel(render)}
    />
  );
}
