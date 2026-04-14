import type { Json, Tables } from "@/types/supabase";

export type JobType = "lead_pull" | "preview_generate" | "promote_site";

export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export type Job = Tables<{ schema: "closehound" }, "jobs">;

export type JobRun = Tables<{ schema: "closehound" }, "job_runs">;

export type OperatorLock = Tables<{ schema: "closehound" }, "operator_locks">;

export type PreviewGenerateJobPayload = {
  leadId: string;
};

export type JobLogEntry = {
  at: string;
  level: "info" | "error";
  message: string;
};

export type PreviewGenerateJobResult = {
  leadId: string;
  previewUrl: string;
  leadStatus: string;
  previewSite?: Json;
  storageMode: "preview_url_only" | "preview_sites_table";
};
