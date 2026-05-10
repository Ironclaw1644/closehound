"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCircle,
  faCircleCheck,
  faCircleExclamation,
  faPaperPlane,
  faWandMagicSparkles,
  faPhoneVolume,
  faXmark,
  faExternalLink,
  faChevronDown,
  faPlus,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { INDUSTRY_OPTIONS, type IndustryValue } from "@/lib/industries";
import type { Lead, LeadStatus } from "@/types/lead";
import type { Job } from "@/types/operator";
import { ConfirmModal } from "./ConfirmModal";
import { UndoToast } from "./UndoToast";
import { LeadDetailPanel } from "./LeadDetailPanel";
import { JobQueueDrawer } from "./JobQueueDrawer";
import { useUrlFilters } from "@/lib/dashboard/url-filters";
import { humanizeOperatorError } from "@/lib/operator/humanize-error";

type Props = {
  initialLeads: Lead[];
  initialJobs: Job[];
  configured: boolean;
};

type WorkerStatus = "idle" | "busy" | "stalled" | "unconfigured";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "new",
  generated: "preview",
  emailed: "emailed",
  called: "called",
  closed: "closed",
};

const STATUS_TONE: Record<LeadStatus, string> = {
  new: "border-white/10 text-zinc-300",
  generated: "border-amber-500/30 text-amber-200 bg-amber-500/10",
  emailed: "border-sky-400/30 text-sky-200 bg-sky-500/10",
  called: "border-emerald-400/30 text-emerald-200 bg-emerald-500/10",
  closed: "border-violet-400/30 text-violet-200 bg-violet-500/10",
};

function formatRating(rating: Lead["rating"], count: Lead["review_count"]) {
  const ratingPart = typeof rating === "number" ? rating.toFixed(1) : "—";
  const countPart = typeof count === "number" ? `${count}` : "";
  return countPart ? `${ratingPart} · ${countPart}` : ratingPart;
}

function formatScore(score: Lead["lead_score"]) {
  return typeof score === "number" ? score.toFixed(1) : "—";
}

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return `${Math.max(1, Math.round(ms / 1000))}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h`;
  return `${Math.round(ms / 86_400_000)}d`;
}

export function LeadConsole({ initialLeads, initialJobs, configured }: Props) {
  const [leads, setLeads] = useState(initialLeads);
  const [jobs, setJobs] = useState(initialJobs);

  // Filters live in the URL so /dashboard?industry=hvac&status=emailed&q=austin
  // is shareable and survives reload. `q` = search; `industry`/`status` mirror
  // local types.
  const { values: filterValues, setFilter } = useUrlFilters({
    q: "",
    industry: "all",
    status: "all",
  });
  const search = filterValues.q;
  const industry = filterValues.industry as IndustryValue;
  const statusFilter = filterValues.status as "all" | LeadStatus;
  const setSearch = (v: string) => setFilter("q", v);
  const setIndustry = (v: IndustryValue) => setFilter("industry", v);
  const setStatusFilter = (v: "all" | LeadStatus) => setFilter("status", v);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leadHoundOpen, setLeadHoundOpen] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [jobDrawerOpen, setJobDrawerOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<null | {
    action: "generate" | "email" | "mark";
    count: number;
  }>(null);
  const [undoState, setUndoState] = useState<null | {
    message: string;
    leadIds: string[];
    priorStatus: LeadStatus;
  }>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Poll jobs + leads every 4s.
  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    async function tick() {
      try {
        const [leadsRes, jobsRes] = await Promise.all([
          fetch("/api/leads", { cache: "no-store" }),
          fetch("/api/jobs", { cache: "no-store" }),
        ]);
        if (!cancelled) {
          if (leadsRes.ok) {
            const payload = (await leadsRes.json()) as { leads?: Lead[] };
            if (payload.leads) setLeads(payload.leads);
          }
          if (jobsRes.ok) {
            const payload = (await jobsRes.json()) as { jobs?: Job[] };
            if (payload.jobs) setJobs(payload.jobs);
          }
        }
      } catch {
        /* keep polling silently */
      }
    }
    void tick();
    const id = window.setInterval(tick, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [configured]);

  const workerStatus: WorkerStatus = useMemo(() => {
    if (!configured) return "unconfigured";
    const running = jobs.find((j) => j.status === "running");
    const failedRecent = jobs.find(
      (j) =>
        j.status === "failed" &&
        Date.now() - new Date(j.created_at).getTime() < 10 * 60 * 1000
    );
    if (failedRecent) return "stalled";
    if (running) return "busy";
    return "idle";
  }, [jobs, configured]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      if (industry !== "all" && (lead.industry ?? "").toLowerCase() !== industry.toLowerCase()) {
        return false;
      }
      if (statusFilter !== "all" && lead.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        lead.company_name,
        lead.city ?? "",
        lead.industry ?? "",
        lead.contact_email ?? "",
        lead.phone ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [leads, industry, statusFilter, search]);

  const allSelected = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const partiallySelected = !allSelected && filtered.some((l) => selected.has(l.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const lead of filtered) next.delete(lead.id);
      } else {
        for (const lead of filtered) next.add(lead.id);
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Bulk actions — gated through confirmation modal so destructive actions
  // (mark closed) can't fire on accident. Generate + email are also confirmed
  // because they spend API credits / send real emails to real prospects.
  const requestBulk = useCallback(
    (action: "generate" | "email" | "mark") => {
      const ids = Array.from(selected);
      if (ids.length === 0) return;
      setConfirmState({ action, count: ids.length });
    },
    [selected]
  );

  const executeBulk = useCallback(
    async (action: "generate" | "email" | "mark") => {
      const ids = Array.from(selected);
      if (ids.length === 0) return;
      setBusy(action);
      setError(null);
      // Capture the prior status of selected leads so "mark closed" can be undone
      // by the toast. Most rows will be the same prior status, but we batch the
      // first one for a single revert action. Per-lead revert would need a join.
      const priorStatus =
        leads.find((l) => l.id === ids[0])?.status ?? "new";
      try {
        if (action === "generate") {
          await fetch("/api/generate/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leadIds: ids }),
          });
        } else if (action === "email") {
          await fetch("/api/outreach/email/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leadIds: ids }),
          });
        } else {
          await fetch("/api/leads/bulk-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leadIds: ids, status: "closed" }),
          });
          // Surface an undo toast only for the destructive bulk-close path.
          setUndoState({
            message: `Marked ${ids.length} lead${ids.length === 1 ? "" : "s"} closed.`,
            leadIds: ids,
            priorStatus,
          });
        }
        setSelected(new Set());
      } catch (err) {
        setError(humanizeOperatorError(err));
      } finally {
        setBusy(null);
      }
    },
    [selected, leads]
  );

  const undoMarkClosed = useCallback(async () => {
    if (!undoState) return;
    try {
      await fetch("/api/leads/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: undoState.leadIds,
          status: undoState.priorStatus,
        }),
      });
    } catch (err) {
      setError(humanizeOperatorError(err));
    } finally {
      setUndoState(null);
    }
  }, [undoState]);

  // Single-lead status change called by the detail panel.
  const handleStatusChange = useCallback(
    async (leadId: string, status: LeadStatus) => {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error ?? `HTTP ${res.status}`);
      }
    },
    []
  );

  // Keyboard shortcuts.
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (isInput) return;

      if (e.key === "j") {
        setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "k") {
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === " ") {
        e.preventDefault();
        const lead = filtered[activeIndex];
        if (lead) toggleOne(lead.id);
      } else if (e.key === "Enter" && !detailLead) {
        // Enter on the focused row opens the detail panel.
        const lead = filtered[activeIndex];
        if (lead) setDetailLead(lead);
      } else if (e.key.toLowerCase() === "g" && selected.size) {
        requestBulk("generate");
      } else if (e.key.toLowerCase() === "e" && selected.size) {
        requestBulk("email");
      } else if (e.key.toLowerCase() === "x" && selected.size) {
        requestBulk("mark");
      }
    },
    [filtered, activeIndex, selected, requestBulk, detailLead]
  );

  const handleLeadHoundQueue = useCallback(
    async (payload: { industry: string; city: string; state?: string; maxResults?: number }) => {
      setBusy("leadhound");
      setError(null);
      try {
        const res = await fetch("/api/leadhound/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        if (!res.ok) throw new Error(body.error ?? "Failed to queue LeadHound.");
        setLeadHoundOpen(false);
      } catch (err) {
        setError(humanizeOperatorError(err));
      } finally {
        setBusy(null);
      }
    },
    []
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* ── Top bar ──────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-[color:var(--op-border)] bg-[color:var(--op-bg)]/95 px-4 py-2.5 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--op-accent)] text-[color:var(--op-bg)] text-sm font-bold">
            C
          </span>
          <span className="text-sm font-semibold tracking-tight">closehound</span>
          <span className="ml-2 rounded-full border border-[color:var(--op-border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[color:var(--op-text-muted)]">
            Operator
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/customers"
            className="inline-flex items-center gap-2 rounded-md border border-[color:var(--op-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--op-text)] hover:bg-[color:var(--op-panel-soft)]"
          >
            <FontAwesomeIcon icon={faUsers} className="h-3 w-3" />
            Customers
          </Link>
          <button
            type="button"
            onClick={() => setLeadHoundOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[color:var(--op-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--op-text)] hover:bg-[color:var(--op-panel-soft)]"
          >
            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
            LeadHound
          </button>
          <button
            type="button"
            onClick={() => setJobDrawerOpen(true)}
            aria-label="Open job queue"
            className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--op-accent)]"
          >
            <WorkerPill status={workerStatus} jobs={jobs} />
          </button>
        </div>
      </header>

      {/* ── Filters ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[color:var(--op-border)] px-4 py-2 sm:px-6">
        <label className="relative flex flex-1 min-w-[260px] items-center">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 h-3.5 w-3.5 text-[color:var(--op-text-subtle)]"
          />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search company, city, email, phone   /"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel)] pl-9 pr-3 text-sm outline-none placeholder:text-[color:var(--op-text-subtle)] focus:border-[color:var(--op-border-strong)]"
          />
        </label>
        <Select
          value={industry}
          onChange={(v) => setIndustry(v as IndustryValue)}
          options={INDUSTRY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
        />
        <Select
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as "all" | LeadStatus)}
          options={[
            { value: "all", label: "All statuses" },
            { value: "new", label: "New" },
            { value: "generated", label: "Preview" },
            { value: "emailed", label: "Emailed" },
            { value: "called", label: "Called" },
            { value: "closed", label: "Closed" },
          ]}
        />
        <span className="ml-auto text-xs tabular text-[color:var(--op-text-subtle)]">
          {filtered.length} of {leads.length}
        </span>
      </div>

      {/* ── Errors ──────────────────────────────────────── */}
      {error ? (
        <div className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 sm:px-6">
          {error}
        </div>
      ) : null}

      {/* ── Lead table ──────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {!configured ? (
          <EmptyState
            title="Supabase service-role key missing"
            body="Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local, then run npm run dev."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No leads yet"
            body="Use LeadHound (top right) to queue a Google Places pull, then run worker locally."
          />
        ) : (
          <table className="w-full text-sm tabular">
            <thead className="sticky top-0 bg-[color:var(--op-bg)] text-left text-[10px] uppercase tracking-[0.18em] text-[color:var(--op-text-subtle)]">
              <tr>
                <th className="w-8 px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = partiallySelected;
                    }}
                    onChange={toggleAll}
                  />
                </th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Score</th>
                <th className="px-3 py-2 font-medium">Company</th>
                <th className="px-3 py-2 font-medium">City</th>
                <th className="px-3 py-2 font-medium">Industry</th>
                <th className="px-3 py-2 font-medium">Rating</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Age</th>
                <th className="w-10 px-3 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, index) => {
                const isSelected = selected.has(lead.id);
                const isActive = index === activeIndex;
                return (
                  <tr
                    key={lead.id}
                    onClick={() => {
                      setActiveIndex(index);
                      setDetailLead(lead);
                    }}
                    className={`group border-t border-[color:var(--op-border)] cursor-pointer ${
                      isActive
                        ? "bg-[color:var(--op-accent-soft)]"
                        : "hover:bg-[color:var(--op-panel-soft)]"
                    }`}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleOne(lead.id);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                          STATUS_TONE[lead.status] ?? STATUS_TONE.new
                        }`}
                      >
                        {STATUS_LABEL[lead.status] ?? lead.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[color:var(--op-text)]">
                      {formatScore(lead.lead_score)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-[color:var(--op-text)]">
                        {lead.company_name}
                      </div>
                      {lead.preview_url ? (
                        <a
                          href={lead.preview_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-[color:var(--op-text-subtle)] hover:text-[color:var(--op-accent)]"
                        >
                          <FontAwesomeIcon icon={faExternalLink} className="h-2.5 w-2.5" />
                          Preview
                        </a>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--op-text-muted)]">
                      {lead.city ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--op-text-muted)]">
                      {lead.industry ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--op-text-muted)]">
                      {formatRating(lead.rating, lead.review_count)}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--op-text-muted)] truncate max-w-[200px]">
                      {lead.contact_email ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--op-text-muted)]">
                      {lead.phone ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--op-text-subtle)]">
                      {relativeTime(lead.created_at)}
                    </td>
                    <td className="px-3 py-2"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>

      {/* ── Bottom action bar ───────────────────────────── */}
      {selected.size > 0 ? (
        <div className="sticky bottom-0 z-30 flex items-center justify-between gap-3 border-t border-[color:var(--op-border)] bg-[color:var(--op-panel)] px-4 py-2 sm:px-6">
          <span className="text-xs text-[color:var(--op-text-muted)]">
            <span className="font-medium text-[color:var(--op-text)] tabular">
              {selected.size}
            </span>{" "}
            selected
          </span>
          <div className="flex items-center gap-2">
            <ActionButton
              label="Generate previews"
              hint="G"
              icon={faWandMagicSparkles}
              onClick={() => requestBulk("generate")}
              busy={busy === "generate"}
            />
            <ActionButton
              label="Send emails"
              hint="E"
              icon={faPaperPlane}
              onClick={() => requestBulk("email")}
              busy={busy === "email"}
            />
            <ActionButton
              label="Mark closed"
              hint="X"
              icon={faCircleCheck}
              onClick={() => requestBulk("mark")}
              busy={busy === "mark"}
              tone="muted"
            />
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--op-border)] px-3 py-1.5 text-xs hover:bg-[color:var(--op-panel-soft)]"
            >
              <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {/* ── LeadHound dialog ────────────────────────────── */}
      {leadHoundOpen ? (
        <LeadHoundDialog
          onClose={() => setLeadHoundOpen(false)}
          onSubmit={handleLeadHoundQueue}
          busy={busy === "leadhound"}
        />
      ) : null}

      {/* ── Keyboard hints ──────────────────────────────── */}
      <div className="hidden sm:flex items-center justify-end gap-3 border-t border-[color:var(--op-border)] bg-[color:var(--op-bg)] px-6 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[color:var(--op-text-subtle)]">
        <Kbd k="/" /> search
        <Kbd k="J" /> / <Kbd k="K" /> nav
        <Kbd k="␣" /> select
        <Kbd k="⏎" /> detail
        <Kbd k="G" /> generate
        <Kbd k="E" /> email
        <Kbd k="X" /> close
      </div>

      {/* ── Confirmation modal for destructive bulk actions ──────────────── */}
      <ConfirmModal
        open={!!confirmState}
        title={confirmState ? confirmTitleFor(confirmState.action, confirmState.count) : ""}
        body={confirmState ? confirmBodyFor(confirmState.action, confirmState.count) : ""}
        confirmLabel={confirmState ? confirmLabelFor(confirmState.action) : "Confirm"}
        tone={confirmState?.action === "mark" ? "destructive" : "primary"}
        onConfirm={() => {
          if (!confirmState) return;
          const action = confirmState.action;
          setConfirmState(null);
          void executeBulk(action);
        }}
        onCancel={() => setConfirmState(null)}
      />

      {/* ── Undo toast after destructive bulk close ─────────────────────── */}
      <UndoToast
        open={!!undoState}
        message={undoState?.message ?? ""}
        onUndo={() => {
          void undoMarkClosed();
        }}
        onDismiss={() => setUndoState(null)}
      />

      {/* ── Lead detail slide-out panel ─────────────────────────────────── */}
      <LeadDetailPanel
        lead={detailLead}
        onClose={() => setDetailLead(null)}
        onStatusChange={handleStatusChange}
      />

      {/* ── Job queue drawer (opened by clicking the worker pill) ───────── */}
      <JobQueueDrawer
        open={jobDrawerOpen}
        jobs={jobs}
        onClose={() => setJobDrawerOpen(false)}
      />
    </div>
  );
}

// Confirm-modal copy per action. Generate/email confirmations are still
// requested (these spend Stripe/Resend credits + send to real prospects) but
// styled as primary, not destructive.
function confirmTitleFor(action: "generate" | "email" | "mark", count: number): string {
  const plural = count === 1 ? "lead" : "leads";
  if (action === "generate") return `Generate previews for ${count} ${plural}?`;
  if (action === "email") return `Send outreach to ${count} ${plural}?`;
  return `Mark ${count} ${plural} closed?`;
}

function confirmBodyFor(action: "generate" | "email" | "mark", count: number): string {
  if (action === "generate") {
    return "Queues a preview_generate job for each lead. Worker will pick these up and render multipage sites. Safe to repeat — already-generated leads will be skipped.";
  }
  if (action === "email") {
    return "Sends a real outreach email to each lead that already has a preview. Skips any without a preview. Make sure your copy is what you want them to read.";
  }
  return "Sets status to 'closed' on each lead. You can undo within 4 seconds from the toast that appears.";
}

function confirmLabelFor(action: "generate" | "email" | "mark"): string {
  if (action === "generate") return "Generate";
  if (action === "email") return "Send emails";
  return "Mark closed";
}

function Kbd({ k }: { k: string }) {
  return (
    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded border border-[color:var(--op-border-strong)] px-1 text-[10px] tabular text-[color:var(--op-text-muted)]">
      {k}
    </span>
  );
}

function ActionButton({
  label,
  hint,
  icon,
  onClick,
  busy,
  tone,
}: {
  label: string;
  hint: string;
  icon: typeof faPaperPlane;
  onClick: () => void;
  busy?: boolean;
  tone?: "muted";
}) {
  const isMuted = tone === "muted";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
        isMuted
          ? "border border-[color:var(--op-border)] hover:bg-[color:var(--op-panel-soft)]"
          : "bg-[color:var(--op-accent)] text-[color:var(--op-bg)] hover:opacity-90"
      } disabled:opacity-50`}
    >
      <FontAwesomeIcon icon={icon} className="h-3 w-3" />
      {busy ? "Working…" : label}
      <Kbd k={hint} />
    </button>
  );
}

function Select<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value as T)}
        className="h-8 appearance-none rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel)] pl-3 pr-8 text-xs outline-none focus:border-[color:var(--op-border-strong)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[color:var(--op-panel)]">
            {o.label}
          </option>
        ))}
      </select>
      <FontAwesomeIcon
        icon={faChevronDown}
        className="pointer-events-none absolute right-2.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-[color:var(--op-text-subtle)]"
      />
    </div>
  );
}

function WorkerPill({ status, jobs }: { status: WorkerStatus; jobs: Job[] }) {
  const tone =
    status === "idle"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
      : status === "busy"
        ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
        : status === "stalled"
          ? "text-rose-300 bg-rose-500/10 border-rose-500/30"
          : "text-zinc-400 bg-white/5 border-white/10";

  const label =
    status === "idle"
      ? "worker idle"
      : status === "busy"
        ? "worker busy"
        : status === "stalled"
          ? "worker stalled"
          : "worker offline";

  const recentRunning = jobs.filter((j) => j.status === "running").length;

  return (
    <span
      title={`Recent jobs: ${jobs.length}, running: ${recentRunning}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${tone}`}
    >
      <FontAwesomeIcon
        icon={status === "stalled" ? faCircleExclamation : faCircle}
        className="h-2 w-2"
      />
      {label}
    </span>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto mt-24 max-w-md rounded-2xl border border-[color:var(--op-border)] bg-[color:var(--op-panel)] p-8 text-center">
      <span
        className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--op-panel-soft)] text-[color:var(--op-text-subtle)]"
        aria-hidden
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5" />
      </span>
      <p className="text-base font-semibold text-[color:var(--op-text)]">{title}</p>
      <p className="mt-2 text-xs leading-5 text-[color:var(--op-text-muted)]">{body}</p>
    </div>
  );
}

function LeadHoundDialog({
  onClose,
  onSubmit,
  busy,
}: {
  onClose: () => void;
  onSubmit: (payload: {
    industry: string;
    city: string;
    state?: string;
    maxResults?: number;
  }) => Promise<void>;
  busy: boolean;
}) {
  const [industry, setIndustry] = useState("handyman");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [maxResults, setMaxResults] = useState(40);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[color:var(--op-border)] bg-[color:var(--op-panel)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">LeadHound run</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[color:var(--op-text-subtle)] hover:text-[color:var(--op-text)]"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-[color:var(--op-text-muted)]">
          Queues a lead_pull job. Worker picks it up, scrapes Google Places, scores with Ollama,
          inserts new leads.
        </p>
        <div className="mt-4 grid gap-3">
          <Field label="Industry">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="h-9 w-full rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-3 text-sm"
            >
              {INDUSTRY_OPTIONS.filter((o) => o.value !== "all").map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Field label="City">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Austin"
                  className="h-9 w-full rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-3 text-sm"
                />
              </Field>
            </div>
            <Field label="State">
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="TX"
                maxLength={2}
                className="h-9 w-full rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-3 text-sm uppercase"
              />
            </Field>
          </div>
          <Field label="Max results">
            <input
              type="number"
              min={5}
              max={120}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="h-9 w-full rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-3 text-sm tabular"
            />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--op-border)] px-3 py-1.5 text-xs hover:bg-[color:var(--op-panel-soft)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !industry || !city}
            onClick={() =>
              void onSubmit({ industry, city: city.trim(), state: state.trim() || undefined, maxResults })
            }
            className="inline-flex items-center gap-1.5 rounded-md bg-[color:var(--op-accent)] px-3 py-1.5 text-xs font-medium text-[color:var(--op-bg)] disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faPhoneVolume} className="h-3 w-3" />
            {busy ? "Queueing…" : "Queue lead_pull"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--op-text-subtle)]">
        {label}
      </span>
      {children}
    </label>
  );
}
