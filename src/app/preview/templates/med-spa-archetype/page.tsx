import { notFound } from "next/navigation";

import { HealthWellnessPreviewTemplate } from "@/components/site-templates/health-wellness-preview";
import { HEALTH_WELLNESS_FAMILY } from "@/lib/template-system/families/health-wellness";
import { buildHealthWellnessPreviewModel } from "@/lib/template-system/health-wellness-preview";
import { resolveApprovedArchetypeImageCandidates } from "@/lib/template-system/images/selection";
import { MED_SPA_NICHE_TEMPLATE } from "@/lib/template-system/niches/med-spa";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { MED_SPA_SEED_BUSINESS } from "@/lib/template-system/seeds/med-spa-seed";
import { MED_SPA_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/med-spa";

export default async function MedSpaArchetypePreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ batch?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const hasRequestedBatch = Object.prototype.hasOwnProperty.call(params, "batch");
  const requestedBatch = hasRequestedBatch ? (params.batch?.trim() ?? "") : null;
  const { approvedImageCandidates } = await resolveApprovedArchetypeImageCandidates({
    templateKey: MED_SPA_NICHE_TEMPLATE.key,
    requestedBatch,
    hasRequestedBatch,
    slotDefinitions: MED_SPA_VISUAL_SLOTS,
  });

  const render = resolveTemplateRender({
    family: HEALTH_WELLNESS_FAMILY,
    template: MED_SPA_NICHE_TEMPLATE,
    seed: MED_SPA_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates,
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
