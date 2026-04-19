import { notFound } from "next/navigation";

import { RoofingPreviewTemplate } from "@/components/site-templates/roofing-preview";
import { BLUE_COLLAR_SERVICE_FAMILY } from "@/lib/template-system/families/blue-collar-service";
import { ROOFING_NICHE_TEMPLATE } from "@/lib/template-system/niches/roofing";
import { buildRoofingPreviewModel } from "@/lib/template-system/roofing-preview";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { ROOFING_SEED_BUSINESS } from "@/lib/template-system/seeds/roofing-seed";

export default function RoofingArchetypePreviewPage() {
  const render = resolveTemplateRender({
    family: BLUE_COLLAR_SERVICE_FAMILY,
    template: ROOFING_NICHE_TEMPLATE,
    seed: ROOFING_SEED_BUSINESS,
    sampleMode: "strict",
  });

  if (!render.status.isPreviewSafe) {
    notFound();
  }

  return <RoofingPreviewTemplate model={buildRoofingPreviewModel(render)} />;
}
