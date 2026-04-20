import { notFound } from "next/navigation";

import { BlueCollarPreviewTemplate } from "@/components/site-templates/blue-collar-preview";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { resolveApprovedArchetypeImageCandidates } from "@/lib/template-system/images/selection";
import { HVAC_NICHE_TEMPLATE } from "@/lib/template-system/niches/hvac";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { HVAC_SEED_BUSINESS } from "@/lib/template-system/seeds/hvac-seed";
import { HVAC_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/hvac";

export default async function HvacArchetypePreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ batch?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const hasRequestedBatch = Object.prototype.hasOwnProperty.call(params, "batch");
  const requestedBatch = hasRequestedBatch ? (params.batch?.trim() ?? "") : null;
  const { approvedImageCandidates } = await resolveApprovedArchetypeImageCandidates({
    templateKey: HVAC_NICHE_TEMPLATE.key,
    requestedBatch,
    hasRequestedBatch,
    slotDefinitions: HVAC_VISUAL_SLOTS,
  });

  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: HVAC_NICHE_TEMPLATE,
    seed: HVAC_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates,
  });

  if (!render.status.isPreviewSafe) {
    notFound();
  }

  return <BlueCollarPreviewTemplate model={buildBlueCollarPreviewModel(render)} />;
}
