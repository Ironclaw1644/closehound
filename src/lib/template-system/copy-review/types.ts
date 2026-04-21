import type { BlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";
import type { HealthWellnessPreviewModel } from "@/lib/template-system/health-wellness-preview";
import type { SectionKey } from "@/lib/template-system/types";

export type TemplateCopyReviewStatus =
  | "unreviewed"
  | "approved"
  | "needs-revision";

export type TemplateCopyReviewDecision =
  | "approved"
  | "revise_tone"
  | "revise_fit"
  | "replace";

export type TemplateCopySlotRole =
  | "hero-meta"
  | "hero-heading"
  | "hero-body"
  | "primary-cta-label"
  | "secondary-cta-label"
  | "section-heading"
  | "section-body"
  | "card-title"
  | "card-body"
  | "faq-question"
  | "faq-answer"
  | "contact-detail";

export type TemplateCopySlot = {
  templateKey: string;
  familyKey: string;
  sectionKey: SectionKey | "featured-treatments";
  slotKey: string;
  slotRole: TemplateCopySlotRole;
  pageOrder: number;
  currentText: string;
  proposedText?: string;
  status: TemplateCopyReviewStatus;
  decision?: TemplateCopyReviewDecision;
  reviewNotes?: string;
};

export type TemplateCopyInventory = TemplateCopySlot[];

export type TemplateCopyInventoryInput =
  | {
      templateKey: string;
      familyKey: string;
      renderer: "blue-collar";
      previewModel: BlueCollarPreviewModel;
    }
  | {
      templateKey: string;
      familyKey: string;
      renderer: "health-wellness";
      previewModel: HealthWellnessPreviewModel;
    };
