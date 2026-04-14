import { getSupabaseAdminClient } from "@/lib/supabase";
import type { Job } from "@/types/operator";
import {
  PREVIEW_GENERATE_LOCK_KEY,
  PREVIEW_GENERATE_LOCK_TTL_MS,
  completeJobRun,
  createJobRun,
  runJobHandler,
} from "@/server/operator/job-runner";

const DEFAULT_POLL_INTERVAL_MS = 5_000;

type RunWorkerOnceResult = {
  processedJobId: string | null;
};

function isLockableJob(job: Job) {
  return job.job_type === PREVIEW_GENERATE_LOCK_KEY;
}

function nextLockExpiration() {
  return new Date(Date.now() + PREVIEW_GENERATE_LOCK_TTL_MS).toISOString();
}

async function acquireOperatorLock(lockKey: string, workerName: string) {
  const supabase = getSupabaseAdminClient();
  const closehound = supabase.schema("closehound");
  const now = new Date().toISOString();

  await closehound.from("operator_locks").delete().eq("lock_key", lockKey).lt("expires_at", now);

  const { error } = await closehound.from("operator_locks").insert({
    lock_key: lockKey,
    locked_by: workerName,
    expires_at: nextLockExpiration(),
  });

  if (!error) {
    return true;
  }

  if (error.code === "23505") {
    return false;
  }

  throw new Error(error.message);
}

async function releaseOperatorLock(lockKey: string, workerName: string) {
  const closehound = getSupabaseAdminClient().schema("closehound");
  const { error } = await closehound
    .from("operator_locks")
    .delete()
    .eq("lock_key", lockKey)
    .eq("locked_by", workerName);

  if (error) {
    throw new Error(error.message);
  }
}

async function claimPendingJob(job: Job) {
  const closehound = getSupabaseAdminClient().schema("closehound");
  const now = new Date().toISOString();
  const { data, error } = await closehound
    .from("jobs")
    .update({
      status: "running",
      started_at: now,
      completed_at: null,
      error_message: null,
      updated_at: now,
    })
    .eq("id", job.id)
    .eq("status", "pending")
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    throw new Error(error.message);
  }

  return data as Job;
}

async function failJob(jobId: string, message: string) {
  const now = new Date().toISOString();
  const { error } = await getSupabaseAdminClient()
    .schema("closehound")
    .from("jobs")
    .update({
      status: "failed",
      error_message: message,
      completed_at: now,
      updated_at: now,
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }
}

async function completeJob(jobId: string, result: Job["result"]) {
  const now = new Date().toISOString();
  const { error } = await getSupabaseAdminClient()
    .schema("closehound")
    .from("jobs")
    .update({
      status: "completed",
      result,
      completed_at: now,
      updated_at: now,
      error_message: null,
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function runOperatorWorkerOnce(workerName: string): Promise<RunWorkerOnceResult> {
  const closehound = getSupabaseAdminClient().schema("closehound");
  const { data, error } = await closehound
    .from("jobs")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  const jobs = (data ?? []) as Job[];

  for (const pendingJob of jobs) {
    const lockKey = isLockableJob(pendingJob) ? PREVIEW_GENERATE_LOCK_KEY : null;
    let lockAcquired = false;

    try {
      if (lockKey) {
        lockAcquired = await acquireOperatorLock(lockKey, workerName);

        if (!lockAcquired) {
          continue;
        }
      }

      const claimedJob = await claimPendingJob(pendingJob);

      if (!claimedJob) {
        if (lockKey && lockAcquired) {
          await releaseOperatorLock(lockKey, workerName);
          lockAcquired = false;
        }

        continue;
      }

      const run = await createJobRun(getSupabaseAdminClient(), claimedJob.id, workerName);

      try {
        const outcome = await runJobHandler(getSupabaseAdminClient(), claimedJob);
        await completeJob(claimedJob.id, outcome.result);
        await completeJobRun(getSupabaseAdminClient(), run.id, outcome.runStatus, outcome.log);

        return {
          processedJobId: claimedJob.id,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown operator job error.";
        await failJob(claimedJob.id, message);
        await completeJobRun(getSupabaseAdminClient(), run.id, "failed", [
          {
            at: new Date().toISOString(),
            level: "error",
            message,
          },
        ]);

        return {
          processedJobId: claimedJob.id,
        };
      } finally {
        if (lockKey && lockAcquired) {
          await releaseOperatorLock(lockKey, workerName);
          lockAcquired = false;
        }
      }
    } catch (error) {
      if (lockKey && lockAcquired) {
        await releaseOperatorLock(lockKey, workerName);
        lockAcquired = false;
      }

      throw error;
    }
  }

  return {
    processedJobId: null,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function startOperatorWorker({
  workerName,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
}: {
  workerName: string;
  pollIntervalMs?: number;
}) {
  for (;;) {
    try {
      const { processedJobId } = await runOperatorWorkerOnce(workerName);

      if (!processedJobId) {
        await sleep(pollIntervalMs);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown worker loop error.";
      console.error(`[operator-worker:${workerName}] ${message}`);
      await sleep(pollIntervalMs);
    }
  }
}
