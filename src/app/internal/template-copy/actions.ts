"use server";

import { revalidatePath } from "next/cache";

import {
  saveApprovedTemplateCopySlot,
  saveRevisionTemplateCopySlot,
} from "@/lib/template-system/copy-review/repository";
import type { TemplateCopyReviewDecision } from "@/lib/template-system/copy-review/types";

function readRequiredTrimmedString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing ${key}.`);
  }

  return value.trim();
}

function readOptionalTrimmedString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function readRevisionDecision(
  formData: FormData
): Exclude<TemplateCopyReviewDecision, "approved"> {
  const decision = readRequiredTrimmedString(formData, "decision");

  if (
    decision !== "revise_tone" &&
    decision !== "revise_fit" &&
    decision !== "replace"
  ) {
    throw new Error(`Unsupported revision decision: ${decision}`);
  }

  return decision;
}

function revalidateTemplateCopyPaths(templateKey: string) {
  revalidatePath("/internal/template-copy");
  revalidatePath(`/internal/template-copy/${templateKey}`);
}

export async function approveTemplateCopySlotAction(formData: FormData) {
  const templateKey = readRequiredTrimmedString(formData, "templateKey");
  const slotKey = readRequiredTrimmedString(formData, "slotKey");
  const reviewNotes = readOptionalTrimmedString(formData, "reviewNotes");

  await saveApprovedTemplateCopySlot({
    templateKey,
    slotKey,
    reviewNotes,
  });

  revalidateTemplateCopyPaths(templateKey);
}

export async function reviseTemplateCopySlotAction(formData: FormData) {
  const templateKey = readRequiredTrimmedString(formData, "templateKey");
  const slotKey = readRequiredTrimmedString(formData, "slotKey");
  const decision = readRevisionDecision(formData);
  const reviewNotes = readOptionalTrimmedString(formData, "reviewNotes");
  const proposedText = readOptionalTrimmedString(formData, "proposedText");

  if (decision === "replace" && !proposedText) {
    throw new Error("Replacement copy is required for replace decisions.");
  }

  await saveRevisionTemplateCopySlot({
    templateKey,
    slotKey,
    decision,
    proposedText,
    reviewNotes,
  });

  revalidateTemplateCopyPaths(templateKey);
}
