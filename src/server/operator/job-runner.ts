import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { runLeadPullJob } from "@/server/leadhound/handler";
import { runOutreachEmailJob } from "@/server/outreach/handler";
import { runPreviewGenerateJob } from "@/server/preview-generate/handler";
import { runPromoteSiteJob } from "@/server/promote/handler";
import type { Database, Json } from "@/types/supabase";
import type { Job, JobLogEntry, JobRun } from "@/types/operator";

export const PREVIEW_GENERATE_LOCK_KEY = "preview_generate";
export const LEAD_PULL_LOCK_KEY = "lead_pull";

export const PREVIEW_GENERATE_LOCK_TTL_MS = 15 * 60 * 1000;
export const LEAD_PULL_LOCK_TTL_MS = 15 * 60 * 1000;

type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
  entries: JobLogEntry[];
};

type RunResult = {
  result: Json;
  runStatus: "completed";
  log: JobLogEntry[];
};

function createLogger(): Logger {
  const entries: JobLogEntry[] = [];
  function push(level: JobLogEntry["level"], message: string) {
    entries.push({ at: new Date().toISOString(), level, message });
  }
  return {
    entries,
    info(message) {
      push("info", message);
    },
    error(message) {
      push("error", message);
    },
  };
}

function getClosehound(supabase: SupabaseClient<Database>) {
  return supabase.schema("closehound");
}

export async function createJobRun(
  supabase: SupabaseClient<Database>,
  jobId: string,
  workerName: string
) {
  const { data, error } = await getClosehound(supabase)
    .from("job_runs")
    .insert({
      job_id: jobId,
      worker_name: workerName,
      run_status: "running",
      log: [],
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? `Unable to create job_run for job ${jobId}.`);
  }

  return data as JobRun;
}

export async function completeJobRun(
  supabase: SupabaseClient<Database>,
  runId: string,
  runStatus: string,
  log: JobLogEntry[]
) {
  const { error } = await getClosehound(supabase)
    .from("job_runs")
    .update({
      run_status: runStatus,
      log: log as unknown as Json,
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function runJobHandler(
  supabase: SupabaseClient<Database>,
  job: Job
): Promise<RunResult> {
  const logger = createLogger();
  let result: Json = null;

  switch (job.job_type) {
    case "lead_pull":
      result = (await runLeadPullJob(supabase, job.payload, logger)) as unknown as Json;
      break;
    case "preview_generate":
      result = (await runPreviewGenerateJob(supabase, job.payload, logger)) as unknown as Json;
      break;
    case "outreach_email":
      result = (await runOutreachEmailJob(job.payload, logger)) as unknown as Json;
      break;
    case "promote_site":
      result = (await runPromoteSiteJob(job.payload, logger)) as unknown as Json;
      break;
    default:
      throw new Error(`Unsupported job type: ${job.job_type}`);
  }

  return {
    result,
    runStatus: "completed",
    log: logger.entries,
  };
}

export function lockKeyForJob(job: Job): string | null {
  if (job.job_type === "preview_generate") return PREVIEW_GENERATE_LOCK_KEY;
  if (job.job_type === "lead_pull") return LEAD_PULL_LOCK_KEY;
  return null;
}

export function lockTtlMsForKey(key: string): number {
  if (key === PREVIEW_GENERATE_LOCK_KEY) return PREVIEW_GENERATE_LOCK_TTL_MS;
  if (key === LEAD_PULL_LOCK_KEY) return LEAD_PULL_LOCK_TTL_MS;
  return PREVIEW_GENERATE_LOCK_TTL_MS;
}
