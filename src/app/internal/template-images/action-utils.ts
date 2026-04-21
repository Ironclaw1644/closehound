import { getTemplateImageReviewConfig } from "@/lib/template-system/images/review-registry";

export function extractCandidateId(formData: FormData) {
  const candidateId = formData.get("candidateId");

  if (typeof candidateId !== "string" || !candidateId.trim()) {
    throw new Error("Missing candidate id.");
  }

  return candidateId.trim();
}

export function getTemplatePathsToRevalidate(templateKey: string) {
  const config = getTemplateImageReviewConfig(templateKey);

  if (!config) {
    return ["/internal/template-images", `/internal/template-images/${templateKey}`];
  }

  return [
    "/internal/template-images",
    `/internal/template-images/${templateKey}`,
    config.previewPath,
  ];
}
