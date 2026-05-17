import type { Json, Tables } from "@/types/supabase";
import type { LeadIndustry } from "@/lib/industries";

export type JobType =
  | "lead_pull"
  | "preview_generate"
  | "outreach_email"
  | "promote_site";

export type JobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type Job = Tables<{ schema: "closehound" }, "jobs">;
export type JobRun = Tables<{ schema: "closehound" }, "job_runs">;
export type OperatorLock = Tables<{ schema: "closehound" }, "operator_locks">;
export type Purchase = Tables<{ schema: "closehound" }, "purchases">;

export type JobLogEntry = {
  at: string;
  level: "info" | "error";
  message: string;
};

export type LeadPullJobPayload = {
  industry: LeadIndustry;
  city: string;
  state?: string;
  radiusMiles?: number;
  maxResults?: number;
};

export type LeadPullJobResult = {
  industry: LeadIndustry;
  city: string;
  scanned: number;
  inserted: number;
  skipped: number;
  topScore: number | null;
};

export type PreviewGenerateJobPayload = {
  leadId: string;
};

export type PreviewGenerateJobResult = {
  leadId: string;
  previewUrl: string;
  slug: string;
  templateKey: string;
  paletteKey: string;
  logoUrl: string | null;
  heroUrl: string | null;
};

export type OutreachEmailJobPayload = {
  leadId: string;
  recipient?: string;
};

export type OutreachEmailJobResult = {
  leadId: string;
  recipient: string;
  messageId: string | null;
};

export type PromoteSiteJobPayload = {
  purchaseId: string;
};

export type PromoteSiteJobResult = {
  purchaseId: string;
  notified: boolean;
  channel: "email" | "log";
};

export function isJobLogArray(value: Json | null | undefined): value is JobLogEntry[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(
    (entry) =>
      entry !== null &&
      typeof entry === "object" &&
      !Array.isArray(entry) &&
      typeof (entry as { at?: unknown }).at === "string" &&
      typeof (entry as { message?: unknown }).message === "string"
  );
}
