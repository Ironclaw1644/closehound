import { notFound } from "next/navigation";

import { BlueCollarPreviewTemplate } from "@/components/site-templates/blue-collar-preview";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { PLUMBING_NICHE_TEMPLATE } from "@/lib/template-system/niches/plumbing";
import { buildBlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { PLUMBING_SEED_BUSINESS } from "@/lib/template-system/seeds/plumbing-seed";

export default function PlumbingArchetypePreviewPage() {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: PLUMBING_NICHE_TEMPLATE,
    seed: PLUMBING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  if (!render.status.isPreviewSafe) {
    notFound();
  }

  return (
    <BlueCollarPreviewTemplate model={buildBlueCollarPreviewModel(render)} />
  );
}
