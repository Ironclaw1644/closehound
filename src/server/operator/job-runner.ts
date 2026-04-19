import type { SupabaseClient } from "@supabase/supabase-js";
import { buildPreviewUrl } from "@/lib/preview";
import { generatePreviewSite } from "@/lib/site-generator";
import type { Lead } from "@/types/lead";
import type { Database, Json } from "@/types/supabase";
import type {
  Job,
  JobLogEntry,
  JobRun,
  PreviewGenerateJobPayload,
  PreviewGenerateJobResult,
} from "@/types/operator";

export const PREVIEW_GENERATE_LOCK_KEY = "preview_generate";
export const MAX_CONCURRENT_PREVIEW_JOBS = 1;
export const PREVIEW_GENERATE_LOCK_TTL_MS = 15 * 60 * 1000;

type JobLogger = {
  entries: JobLogEntry[];
  info: (message: string) => void;
  error: (message: string) => void;
};

type JobRunResult = {
  result: Json;
  runStatus: "completed";
};

function createJobLogger(): JobLogger {
  const entries: JobLogEntry[] = [];

  function push(level: JobLogEntry["level"], message: string) {
    entries.push({
      at: new Date().toISOString(),
      level,
      message,
    });
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

function asPreviewPayload(payload: Job["payload"]): PreviewGenerateJobPayload {
  const leadId =
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    typeof payload.leadId === "string"
      ? payload.leadId
      : null;

  if (!leadId) {
    throw new Error("preview_generate job is missing payload.leadId.");
  }

  return { leadId };
}

async function storePreviewPayloadIfAvailable(
  supabase: SupabaseClient<Database>,
  slug: string,
  leadId: string,
  previewUrl: string,
  previewPayload: Json,
  logger: JobLogger
) {
  try {
    const { error } = await getClosehound(supabase)
      .from("preview_sites")
      .upsert({
        slug,
        lead_id: leadId,
        preview_url: previewUrl,
        preview_payload: previewPayload,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "slug",
      });

    if (error) {
      logger.info(
        `preview_sites unavailable for payload storage; falling back to preview_url only (${error.message}).`
      );

      return "preview_url_only" as const;
    }

    logger.info("Stored preview payload in closehound.preview_sites.");

    return "preview_sites_table" as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown preview_sites error.";
    logger.info(
      `preview_sites unavailable for payload storage; falling back to preview_url only (${message}).`
    );

    return "preview_url_only" as const;
  }
}

async function runPreviewGenerateJob(
  supabase: SupabaseClient<Database>,
  job: Job,
  logger: JobLogger
) {
  const { leadId } = asPreviewPayload(job.payload);
  const closehound = getClosehound(supabase);

  logger.info(`Fetching lead ${leadId}.`);

  const { data: lead, error: leadError } = await closehound
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .single();

  if (leadError || !lead) {
    throw new Error(leadError?.message ?? `Lead ${leadId} was not found.`);
  }

  logger.info(`Generating deterministic preview for ${lead.company_name}.`);

  const previewSite = generatePreviewSite(lead as Lead);
  const metadata = {
    presetDetected: previewSite.templateKey,
    detectionMode: "explicit" as const,
    matchedKeyword: null,
    previewRoute: previewSite.previewUrl,
  };
  const previewUrl = buildPreviewUrl(leadId);

  const { error: updateLeadError } = await closehound
    .from("leads")
    .update({
      preview_url: previewUrl,
      status: "generated",
    })
    .eq("id", leadId);

  if (updateLeadError) {
    throw new Error(updateLeadError.message);
  }

  logger.info(`Updated lead ${leadId} with preview URL ${previewUrl}.`);

  const storageMode = await storePreviewPayloadIfAvailable(
    supabase,
    leadId,
    leadId,
    previewUrl,
    previewSite as unknown as Json,
    logger
  );

  const result: PreviewGenerateJobResult = {
    leadId,
    previewUrl,
    leadStatus: "generated",
    metadata,
    previewSite: previewSite as unknown as Json,
    storageMode,
  };

  return result;
}

async function runStubJob(job: Job, logger: JobLogger) {
  logger.info(`Stub handler invoked for ${job.job_type}.`);
  throw new Error(`${job.job_type} is stubbed in Operator Mode v1 and not implemented yet.`);
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
      log,
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
): Promise<JobRunResult & { log: JobLogEntry[] }> {
  const logger = createJobLogger();

  let result: Json = null;

  switch (job.job_type) {
    case "preview_generate":
      result = await runPreviewGenerateJob(supabase, job, logger);
      break;
    case "lead_pull":
    case "promote_site":
      await runStubJob(job, logger);
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
