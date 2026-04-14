"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { INDUSTRY_OPTIONS, type IndustryValue } from "@/lib/industries";
import { buildPreviewPath } from "@/lib/preview";
import type { Lead, LeadStatus } from "@/types/lead";
import type { Job, JobStatus, PreviewGenerateJobResult } from "@/types/operator";

type LeadsTableProps = {
  leads: Lead[];
  initialJobs: Job[];
};

const RADIUS_OPTIONS = [
  { label: "5 miles", value: "5" },
  { label: "10 miles", value: "10" },
  { label: "25 miles", value: "25" },
  { label: "50 miles", value: "50" },
] as const;

const ACTIVE_JOB_STATUSES: JobStatus[] = ["pending", "running"];

const statusStyles: Record<LeadStatus, string> = {
  new: "border-white/10 bg-white/[0.04] text-zinc-300",
  generated: "border-orange-400/20 bg-orange-400/10 text-orange-200",
  emailed: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  called: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  closed: "border-violet-400/20 bg-violet-400/10 text-violet-200",
};

const jobStatusStyles: Record<JobStatus, string> = {
  pending: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  running: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  failed: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  cancelled: "border-zinc-400/20 bg-zinc-400/10 text-zinc-300",
};

function formatRating(rating: Lead["rating"]) {
  return typeof rating === "number" ? rating.toFixed(1) : "—";
}

function formatContactEmail(contactEmail: Lead["contact_email"]) {
  return contactEmail?.trim() || "Test fallback";
}

function formatJobLabel(status: JobStatus) {
  return status.replace("_", " ");
}

function getPreviewHref(previewUrl: string | null) {
  if (!previewUrl) {
    return null;
  }

  if (previewUrl.startsWith("/preview/")) {
    return previewUrl;
  }

  try {
    const parsed = new URL(previewUrl);
    const slug = parsed.pathname.split("/").filter(Boolean).at(-1);

    if (slug) {
      return buildPreviewPath(slug);
    }
  } catch {
    const parts = previewUrl.split("/").filter(Boolean);
    const slug = parts.at(-1);

    if (slug) {
      return buildPreviewPath(slug);
    }
  }

  return previewUrl;
}

function applyCompletedPreviewJobs(leads: Lead[], jobs: Job[]) {
  return leads.map((lead) => {
    const previewJob = jobs.find(
      (job) =>
        job.job_type === "preview_generate" &&
        job.lead_id === lead.id &&
        job.status === "completed" &&
        job.result &&
        typeof job.result === "object" &&
        !Array.isArray(job.result)
    );

    if (!previewJob) {
      return lead;
    }

    const result = previewJob.result as PreviewGenerateJobResult;

    return {
      ...lead,
      preview_url: result.previewUrl ?? lead.preview_url,
      status: (result.leadStatus as LeadStatus) ?? lead.status,
    };
  });
}

function WebsiteChip({ hasWebsite }: { hasWebsite: Lead["has_website"] }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${
        hasWebsite
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
          : "border-white/10 bg-white/[0.03] text-zinc-400"
      }`}
    >
      {hasWebsite ? "Yes" : "No"}
    </span>
  );
}

function StatusChip({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function JobStatusChip({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${jobStatusStyles[status]}`}
    >
      {formatJobLabel(status)}
    </span>
  );
}

function ActionButton({
  children,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:border-white/6 disabled:bg-white/[0.02] disabled:text-zinc-500"
    >
      {children}
    </button>
  );
}

export default function LeadsTable({ leads, initialJobs }: LeadsTableProps) {
  const [rows, setRows] = useState(() => applyCompletedPreviewJobs(leads, initialJobs));
  const [jobs, setJobs] = useState(initialJobs);
  const [queueingLeadId, setQueueingLeadId] = useState<string | null>(null);
  const [sendingLeadId, setSendingLeadId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [zipInput, setZipInput] = useState("");
  const [radius, setRadius] = useState<(typeof RADIUS_OPTIONS)[number]["value"]>("25");
  const [industryDraft, setIndustryDraft] = useState<IndustryValue>("all");
  const [appliedIndustry, setAppliedIndustry] = useState<IndustryValue>("all");

  useEffect(() => {
    setRows(applyCompletedPreviewJobs(leads, jobs));
  }, [jobs, leads]);

  useEffect(() => {
    let isCancelled = false;

    async function refreshJobs() {
      try {
        const response = await fetch("/api/jobs", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { jobs?: Job[] };

        if (!isCancelled && payload.jobs) {
          setJobs(payload.jobs);
        }
      } catch {
        // Keep the polling loop quiet. The dashboard should still be usable offline.
      }
    }

    void refreshJobs();

    const intervalId = window.setInterval(() => {
      void refreshJobs();
    }, 5000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const filteredRows =
    appliedIndustry === "all"
      ? rows
      : rows.filter((lead) => (lead.industry ?? "").toLowerCase() === appliedIndustry.toLowerCase());

  const activePreviewJob = jobs.find(
    (job) => job.job_type === "preview_generate" && ACTIVE_JOB_STATUSES.includes(job.status as JobStatus)
  );

  const leadNamesById = useMemo(
    () => new Map(rows.map((lead) => [lead.id, lead.company_name])),
    [rows]
  );

  async function handleGeneratePreview(leadId: string) {
    setActionError(null);
    setQueueingLeadId(leadId);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId }),
      });

      const payload = (await response.json()) as { error?: string; job?: Job };

      if (!response.ok || !payload.job) {
        throw new Error(payload.error ?? "Failed to queue preview job.");
      }

      setJobs((currentJobs) => [payload.job!, ...currentJobs].slice(0, 12));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to queue preview job.";
      setActionError(message);
    } finally {
      setQueueingLeadId(null);
    }
  }

  async function handleEmailLead(leadId: string) {
    setActionError(null);
    setSendingLeadId(leadId);

    try {
      const response = await fetch("/api/outreach/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadId }),
      });

      const payload = (await response.json()) as { error?: string; status?: LeadStatus };

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to send email.");
      }

      setRows((currentRows) =>
        currentRows.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                status: payload.status ?? "emailed",
              }
            : lead
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send email.";
      setActionError(message);
    } finally {
      setSendingLeadId(null);
    }
  }

  function handleSearch() {
    setAppliedIndustry(industryDraft);
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-white/8 bg-zinc-950">
      <div className="border-b border-white/8 px-6 py-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <h2 className="text-lg font-semibold text-white">Lead pipeline</h2>
          <p className="mt-1 text-sm text-zinc-500 xl:mt-0">
            Live rows from <span className="text-zinc-300">closehound.leads</span> with queued
            operator jobs
          </p>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_180px_220px_auto]">
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              ZIP code
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter ZIP"
              maxLength={5}
              value={zipInput}
              onChange={(event) => {
                setZipInput(event.target.value.replace(/\D/g, "").slice(0, 5));
              }}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-300/40 focus:bg-white/[0.05]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Radius
            </span>
            <select
              value={radius}
              onChange={(event) =>
                setRadius(event.target.value as (typeof RADIUS_OPTIONS)[number]["value"])
              }
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition focus:border-orange-300/40 focus:bg-white/[0.05]"
            >
              {RADIUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-zinc-950 text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Industry
            </span>
            <select
              value={industryDraft}
              onChange={(event) => setIndustryDraft(event.target.value as IndustryValue)}
              className="h-11 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none transition focus:border-orange-300/40 focus:bg-white/[0.05]"
            >
              {INDUSTRY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-zinc-950 text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={handleSearch}
              className="h-11 rounded-2xl border border-orange-300/20 bg-orange-300/10 px-5 text-sm font-medium text-orange-50 transition hover:border-orange-300/35 hover:bg-orange-300/16"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {filteredRows.length} of {rows.length} leads shown
            {appliedIndustry !== "all" ? (
              <>
                {" "}
                for <span className="text-zinc-300">{appliedIndustry}</span>
              </>
            ) : null}
          </p>
          <p>
            ZIP <span className="text-zinc-300">{zipInput || "not set"}</span> and radius{" "}
            <span className="text-zinc-300">
              {RADIUS_OPTIONS.find((option) => option.value === radius)?.label ?? "25 miles"}
            </span>{" "}
            are staged for the live search workflow.
          </p>
        </div>

        {activePreviewJob ? (
          <div className="mt-4 rounded-2xl border border-sky-400/15 bg-sky-400/8 px-4 py-3 text-sm text-sky-100">
            Preview queue busy: one <code>preview_generate</code> job is currently{" "}
            <span className="font-medium">{activePreviewJob.status}</span>.
          </div>
        ) : null}
      </div>

      {actionError ? (
        <div className="border-b border-rose-300/10 bg-rose-300/5 px-6 py-3 text-sm text-rose-100">
          {actionError}
        </div>
      ) : null}

      <div className="border-b border-white/8 px-6 py-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium uppercase tracking-[0.22em] text-zinc-400">
            Recent jobs
          </h3>
          <span className="text-xs text-zinc-500">Supabase is the control plane</span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4 text-sm text-zinc-500">
              No operator jobs yet.
            </div>
          ) : null}

          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{job.job_type}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {leadNamesById.get(job.lead_id ?? "") ?? "No lead attached"}
                  </p>
                </div>
                <JobStatusChip status={job.status as JobStatus} />
              </div>

              <p className="mt-3 text-xs text-zinc-500">{new Date(job.created_at).toLocaleString()}</p>

              {job.error_message ? (
                <p className="mt-3 text-sm text-rose-200">{job.error_message}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-white/[0.02] text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="px-6 py-4 font-medium">Company Name</th>
              <th className="px-6 py-4 font-medium">Contact Email</th>
              <th className="px-6 py-4 font-medium">City</th>
              <th className="px-6 py-4 font-medium">Industry</th>
              <th className="px-6 py-4 font-medium">Rating</th>
              <th className="px-6 py-4 font-medium">Has Website</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Job</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr className="border-t border-white/6">
                <td colSpan={9} className="px-6 py-16 text-center">
                  <p className="text-base font-medium text-white">No leads found</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {rows.length === 0 ? (
                      <>
                        Seed or insert rows into{" "}
                        <span className="text-zinc-300">closehound.leads</span> and they will appear
                        here.
                      </>
                    ) : (
                      <>
                        No rows match the current industry filter. Choose{" "}
                        <span className="text-zinc-300">All</span> to show every loaded lead.
                      </>
                    )}
                  </p>
                </td>
              </tr>
            ) : null}

            {filteredRows.map((lead) => {
              const isQueueing = queueingLeadId === lead.id;
              const isSending = sendingLeadId === lead.id;
              const canEmail = Boolean(lead.preview_url) && !isSending;
              const previewHref = getPreviewHref(lead.preview_url);
              const leadJob = jobs.find(
                (job) =>
                  job.lead_id === lead.id &&
                  job.job_type === "preview_generate" &&
                  ACTIVE_JOB_STATUSES.includes(job.status as JobStatus)
              );
              const generateDisabled = isQueueing || Boolean(activePreviewJob);

              return (
                <tr
                  key={lead.id}
                  className="border-t border-white/6 text-sm text-zinc-200 transition hover:bg-white/[0.015]"
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-white">{lead.company_name}</span>
                      {lead.preview_url ? (
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <a
                            href={previewHref ?? lead.preview_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-500 transition hover:text-orange-200"
                          >
                            {previewHref ?? lead.preview_url}
                          </a>
                          <a
                            href={previewHref ?? lead.preview_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-orange-300/15 bg-orange-300/8 px-2.5 py-1 uppercase tracking-[0.18em] text-[10px] text-orange-100 transition hover:border-orange-300/30 hover:bg-orange-300/12"
                          >
                            Open Preview
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600">{lead.phone ?? "No phone"}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`text-sm ${
                        lead.contact_email ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      {formatContactEmail(lead.contact_email)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-zinc-400">{lead.city ?? "—"}</td>
                  <td className="px-6 py-5 text-zinc-300">{lead.industry ?? "—"}</td>
                  <td className="px-6 py-5 text-zinc-300">{formatRating(lead.rating)}</td>
                  <td className="px-6 py-5">
                    <WebsiteChip hasWebsite={lead.has_website} />
                  </td>
                  <td className="px-6 py-5">
                    <StatusChip status={lead.status} />
                  </td>
                  <td className="px-6 py-5">
                    {leadJob ? (
                      <JobStatusChip status={leadJob.status as JobStatus} />
                    ) : (
                      <span className="text-xs text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <ActionButton
                        disabled={generateDisabled}
                        onClick={() => {
                          void handleGeneratePreview(lead.id);
                        }}
                      >
                        {isQueueing
                          ? "Queueing..."
                          : leadJob?.status === "pending"
                            ? "Queued"
                            : leadJob?.status === "running"
                              ? "Running..."
                              : activePreviewJob
                                ? "Worker Busy"
                                : "Generate Preview"}
                      </ActionButton>
                      <ActionButton
                        disabled={!canEmail}
                        onClick={() => {
                          void handleEmailLead(lead.id);
                        }}
                      >
                        {isSending ? "Sending..." : "Email"}
                      </ActionButton>
                      <ActionButton>Call</ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
