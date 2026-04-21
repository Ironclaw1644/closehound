"use server";

import { revalidatePath } from "next/cache";

import {
  approveTemplateImageCandidate,
  rejectTemplateImageCandidate,
} from "@/lib/template-system/images/repository";
import {
  extractCandidateId,
  getTemplatePathsToRevalidate,
} from "@/app/internal/template-images/action-utils";

export async function approveTemplateImageAction(formData: FormData) {
  const candidateId = extractCandidateId(formData);
  const approved = await approveTemplateImageCandidate({
    candidateId,
    approvedBy: "internal-review",
  });

  for (const path of getTemplatePathsToRevalidate(approved.templateKey)) {
    revalidatePath(path);
  }
}

export async function rejectTemplateImageAction(formData: FormData) {
  const candidateId = extractCandidateId(formData);
  const rejected = await rejectTemplateImageCandidate({
    candidateId,
    rejectedBy: "internal-review",
  });

  for (const path of getTemplatePathsToRevalidate(rejected.templateKey)) {
    revalidatePath(path);
  }
}
