import type { RenderPackage } from "@/lib/template-system/types";
import {
  buildMedSpaPreviewModel,
  type MedSpaPreviewModel,
} from "@/lib/template-system/med-spa-preview";

export type HealthWellnessPreviewModel = MedSpaPreviewModel;

export function buildHealthWellnessPreviewModel(
  render: RenderPackage
): HealthWellnessPreviewModel {
  return buildMedSpaPreviewModel(render);
}
