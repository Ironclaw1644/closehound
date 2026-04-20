export type ArchetypeImageCandidateStatus =
  | "generated"
  | "approved"
  | "rejected"
  | "unused";

export type ArchetypeVisualSlot = {
  key:
    | "hero"
    | "service-action"
    | "detail-closeup"
    | "team-or-workmanship"
    | "workspace-or-site"
    | "gallery-extra";
  required: boolean;
  aspectRatio: string;
  cropNotes: string;
  promptIntent: string;
  negativePrompt: string;
};
