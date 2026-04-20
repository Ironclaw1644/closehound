import { notFound } from "next/navigation";

import { BlueCollarPreviewTemplate } from "@/components/site-templates/blue-collar-preview";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { resolveApprovedArchetypeImageCandidates } from "@/lib/template-system/images/selection";
import { PLUMBING_NICHE_TEMPLATE } from "@/lib/template-system/niches/plumbing";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { PLUMBING_SEED_BUSINESS } from "@/lib/template-system/seeds/plumbing-seed";
import { PLUMBING_VISUAL_SLOTS } from "@/lib/template-system/visual-slots/plumbing";

export default async function PlumbingArchetypePreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ batch?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const hasRequestedBatch = Object.prototype.hasOwnProperty.call(params, "batch");
  const requestedBatch = hasRequestedBatch ? (params.batch?.trim() ?? "") : null;
  const { approvedImageCandidates } = await resolveApprovedArchetypeImageCandidates({
    templateKey: PLUMBING_NICHE_TEMPLATE.key,
    requestedBatch,
    hasRequestedBatch,
    slotDefinitions: PLUMBING_VISUAL_SLOTS,
  });

  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: PLUMBING_NICHE_TEMPLATE,
    seed: PLUMBING_SEED_BUSINESS,
    sampleMode: "strict",
    approvedImageCandidates,
  });

  if (!render.status.isPreviewSafe) {
    notFound();
  }

  return (
    <BlueCollarPreviewTemplate model={buildBlueCollarPreviewModel(render)} />
  );
}
