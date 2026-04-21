import {
  MedSpaPreviewTemplate,
} from "@/components/site-templates/med-spa-preview";
import type { HealthWellnessPreviewModel } from "@/lib/template-system/health-wellness-preview";

export function HealthWellnessPreviewTemplate({
  model,
}: {
  model: HealthWellnessPreviewModel;
}) {
  return <MedSpaPreviewTemplate model={model} />;
}
