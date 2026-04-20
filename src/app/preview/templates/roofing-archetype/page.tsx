import { notFound } from "next/navigation";

import { BlueCollarPreviewTemplate } from "@/components/site-templates/blue-collar-preview";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import {
  getApprovedTemplateImageCandidates,
  getMostRecentlyApprovedTemplateImageBatch,
} from "@/lib/template-system/images/repository";
import { resolveRoofingArchetypeBatchSelection } from "@/lib/template-system/images/selection";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";
import { ROOFING_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/roofing";

export default async function RoofingArchetypePreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ batch?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const hasRequestedBatch = Object.prototype.hasOwnProperty.call(params, "batch");
  const requestedBatch = hasRequestedBatch ? (params.batch?.trim() ?? "") : null;
  const generationBatchId = await resolveRoofingArchetypeBatchSelection({
    requestedBatch,
    hasRequestedBatch,
    getLatestApprovedBatch: () =>
      getMostRecentlyApprovedTemplateImageBatch(ROOFING_NICHE_TEMPLATE.key),
  });
  const approvedImageCandidates = generationBatchId
    ? await getApprovedTemplateImageCandidates({
        templateKey: ROOFING_NICHE_TEMPLATE.key,
        generationBatchId,
        slotDefinitions: ROOFING_VISUAL_SLOTS,
      })
    : {};
  const approvedImageCandidatesForRender = Object.fromEntries(
    Object.entries(approvedImageCandidates).filter(([, candidate]) =>
      candidate !== undefined
    )
  ) as Record<
    string,
    {
      id: string;
      slot: string;
      status: "approved";
      storagePath: string;
      cropNotes?: string;
    }
  >;

  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates: approvedImageCandidatesForRender,
  });

  if (!render.status.isPreviewSafe) {
    notFound();
  }

  return (
    <BlueCollarPreviewTemplate model={buildBlueCollarPreviewModel(render)} />
  );
}
