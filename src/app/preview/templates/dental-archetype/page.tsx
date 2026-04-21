import { notFound } from "next/navigation";

import { DentalPreview } from "@/components/site-templates/dental-preview";
import { buildDentalPreviewModel } from "@/lib/template-system/dental-preview";
import { CLINICAL_CARE_FAMILY } from "@/lib/template-system/families/clinical-care";
import { resolveApprovedArchetypeImageCandidates } from "@/lib/template-system/images/selection";
import { DENTAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/dental";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { DENTAL_SEED_BUSINESS } from "@/lib/template-system/seeds/dental-seed";
import { DENTAL_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/dental";

export default async function DentalArchetypePreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ batch?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const hasRequestedBatch = Object.prototype.hasOwnProperty.call(params, "batch");
  const requestedBatch = hasRequestedBatch ? (params.batch?.trim() ?? "") : null;
  const { approvedImageCandidates } = await resolveApprovedArchetypeImageCandidates({
    templateKey: DENTAL_NICHE_TEMPLATE.key,
    requestedBatch,
    hasRequestedBatch,
    slotDefinitions: DENTAL_VISUAL_SLOTS,
  });

  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates,
  });

  if (!render.status.isPreviewSafe) {
    notFound();
  }

  return <DentalPreview model={buildDentalPreviewModel(render)} />;
}
