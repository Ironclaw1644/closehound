"use client";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCircle,
  faCircleCheck,
  faCircleExclamation,
  faSpinner,
  faClock,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import type { Job, JobStatus } from "@/types/operator";

// Bottom-sliding drawer with live job queue detail. Opens when the operator
// clicks the WorkerPill in the header. Shows the most recent 50 jobs with
// status, type, started/completed timestamps, error message (if failed), and
// a JSON-payload preview. Polls every 4s while open.

export type JobQueueDrawerProps = {
  open: boolean;
  jobs: Job[];
  onClose: () => void;
};

const STATUS_ICON: Record<JobStatus, typeof faCircle> = {
  pending: faClock,
  running: faSpinner,
  completed: faCircleCheck,
  failed: faCircleExclamation,
  cancelled: faBan,
};

const STATUS_TONE: Record<JobStatus, string> = {
  pending: "text-zinc-400",
  running: "text-amber-300",
  completed: "text-emerald-300",
  failed: "text-rose-300",
  cancelled: "text-zinc-500",
};

export function JobQueueDrawer({ open, jobs, onClose }: JobQueueDrawerProps) {
  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Group counts for the header pills
  const counts = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Job queue"
        className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[70vh] flex-col rounded-t-2xl border-t border-[color:var(--op-border-strong)] bg-[color:var(--op-panel)] shadow-[0_-24px_60px_rgba(0,0,0,0.5)]"
      >
        {/* Drag handle / header */}
        <header className="flex items-center justify-between gap-3 border-b border-[color:var(--op-border)] px-5 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-[color:var(--op-text)]">Job queue</h2>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]">
              {(Object.keys(STATUS_TONE) as JobStatus[]).map((s) =>
                counts[s] ? (
                  <span
                    key={s}
                    className={`inline-flex items-center gap-1 rounded-full border border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-2 py-0.5 ${STATUS_TONE[s]}`}
                  >
                    <span className="font-semibold tabular-nums">{counts[s]}</span>
                    {s}
                  </span>
                ) : null
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[color:var(--op-text-subtle)] hover:bg-[color:var(--op-panel-soft)] hover:text-[color:var(--op-text)]"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </header>

        {/* Body — scrollable list of jobs */}
        <div className="flex-1 overflow-y-auto">
          {jobs.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-[color:var(--op-text-subtle)]">
              No jobs yet. Use LeadHound to queue your first.
            </p>
          ) : (
            <ul className="divide-y divide-[color:var(--op-border)]">
              {jobs.map((job) => (
                <li key={job.id}>
                  <JobRow job={job} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

function JobRow({ job }: { job: Job }) {
  const status = job.status as JobStatus;
  const Icon = STATUS_ICON[status] ?? faCircle;
  const tone = STATUS_TONE[status] ?? "text-zinc-400";
  const spinning = status === "running";

  const started = job.started_at ? new Date(job.started_at) : null;
  const completed = job.completed_at ? new Date(job.completed_at) : null;
  const durationMs = started && completed ? completed.getTime() - started.getTime() : null;

  return (
    <details className="group">
      <summary className="flex cursor-pointer items-center gap-3 px-5 py-2.5 hover:bg-[color:var(--op-panel-soft)]">
        <FontAwesomeIcon
          icon={Icon}
          className={`h-3 w-3 ${tone} ${spinning ? "animate-spin" : ""}`}
        />
        <span className="min-w-[140px] font-mono text-[11px] text-[color:var(--op-text)]">
          {job.job_type}
        </span>
        <span className={`min-w-[80px] text-[10px] uppercase tracking-[0.14em] ${tone}`}>
          {status}
        </span>
        <span className="flex-1 truncate text-[11px] text-[color:var(--op-text-muted)]">
          {summarizePayload(job)}
        </span>
        <span className="text-[10px] tabular-nums text-[color:var(--op-text-subtle)]">
          {durationMs !== null
            ? `${Math.max(1, Math.round(durationMs / 1000))}s`
            : started
              ? "running"
              : relativeTime(job.created_at)}
        </span>
      </summary>
      <div className="border-t border-[color:var(--op-border)] bg-[color:var(--op-bg)] px-5 py-3">
        <DetailGrid
          rows={[
            ["id", job.id],
            ["created", new Date(job.created_at).toLocaleString()],
            started ? ["started", started.toLocaleString()] : null,
            completed ? ["completed", completed.toLocaleString()] : null,
            job.requested_by ? ["requested_by", job.requested_by] : null,
            job.lead_id ? ["lead_id", job.lead_id] : null,
          ]}
        />
        {job.error_message ? (
          <div className="mt-3">
            <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-rose-400">
              Error
            </p>
            <pre className="overflow-x-auto rounded-md border border-rose-500/20 bg-rose-500/5 px-3 py-2 font-mono text-[11px] leading-5 text-rose-200">
              {job.error_message}
            </pre>
          </div>
        ) : null}
        <div className="mt-3">
          <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--op-text-subtle)]">
            Payload
          </p>
          <pre className="max-h-[200px] overflow-auto rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-3 py-2 font-mono text-[11px] leading-5 text-[color:var(--op-text-muted)]">
            {JSON.stringify(job.payload, null, 2)}
          </pre>
        </div>
        {job.result ? (
          <div className="mt-3">
            <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--op-text-subtle)]">
              Result
            </p>
            <pre className="max-h-[200px] overflow-auto rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-3 py-2 font-mono text-[11px] leading-5 text-[color:var(--op-text-muted)]">
              {JSON.stringify(job.result, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>
    </details>
  );
}

function DetailGrid({ rows }: { rows: ([string, string] | null)[] }) {
  const visible = rows.filter((r): r is [string, string] => !!r);
  return (
    <dl className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-1 text-[11px]">
      {visible.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-[color:var(--op-text-subtle)]">{k}</dt>
          <dd className="break-all font-mono text-[color:var(--op-text)]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function summarizePayload(job: Job): string {
  // Compact one-line summary based on job_type. Keeps the table row readable
  // before the operator clicks to expand.
  const p = job.payload as Record<string, unknown> | null;
  if (!p || typeof p !== "object") return "—";
  if (job.job_type === "lead_pull") {
    const { industry, city, state, maxResults } = p as {
      industry?: string;
      city?: string;
      state?: string;
      maxResults?: number;
    };
    return [industry, [city, state].filter(Boolean).join(", "), maxResults ? `${maxResults}×` : null]
      .filter(Boolean)
      .join(" · ");
  }
  if (job.job_type === "preview_generate" || job.job_type === "outreach_email") {
    const leadId = (p as { leadId?: string }).leadId;
    return leadId ? `lead ${leadId.slice(0, 8)}…` : "—";
  }
  if (job.job_type === "promote_site") {
    const purchaseId = (p as { purchaseId?: string }).purchaseId;
    return purchaseId ? `purchase ${purchaseId.slice(0, 8)}…` : "—";
  }
  return "—";
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}s ago`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  return `${Math.round(ms / 86_400_000)}d ago`;
}
