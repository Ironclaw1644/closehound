import { notFound } from "next/navigation";

import { DentalPreview } from "@/components/site-templates/dental-preview";
import { buildDentalPreviewModel } from "@/lib/template-system/dental-preview";
import { CLINICAL_CARE_FAMILY } from "@/lib/template-system/families/clinical-care";
import { DENTAL_NICHE_TEMPLATE } from "@/lib/template-system/niches/dental";
import { resolveTemplateRender } from "@/lib/template-system/resolver";
import { DENTAL_SEED_BUSINESS } from "@/lib/template-system/seeds/dental-seed";

export default function DentalArchetypePreviewPage() {
  const render = resolveTemplateRender({
    family: CLINICAL_CARE_FAMILY,
    template: DENTAL_NICHE_TEMPLATE,
    seed: DENTAL_SEED_BUSINESS,
    sampleMode: "strict",
  });

  if (!render.status.isPreviewSafe) {
    notFound();
  }

  return <DentalPreview model={buildDentalPreviewModel(render)} />;
}
