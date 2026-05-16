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
  faXmark,
  faExternalLink,
  faChevronDown,
  faPlus,
  faUsers,
  faChevronLeft,
  faChevronRight,
  faFileImport,
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

// Page size for the lead table. 100 fits ~2-3 screens of scroll on a 13"
// laptop and keeps the DOM manageable when the table has hundreds of rows.
const PAGE_SIZE = 100;

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
    source: "all",
  });
  const search = filterValues.q;
  const industry = filterValues.industry as IndustryValue;
  const statusFilter = filterValues.status as "all" | LeadStatus;
  const sourceFilter = filterValues.source as "all" | "fl_sunbiz" | "ny_dos" | "google_places";
  const setSearch = (v: string) => setFilter("q", v);
  const setIndustry = (v: IndustryValue) => setFilter("industry", v);
  const setStatusFilter = (v: "all" | LeadStatus) => setFilter("status", v);
  const setSourceFilter = (v: "all" | "fl_sunbiz" | "ny_dos" | "google_places") =>
    setFilter("source", v);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  // Pagination — page is 0-indexed. Reset to 0 whenever a filter changes so
  // results stay anchored at the top.
  const [page, setPage] = useState(0);
  useEffect(() => {
    setPage(0);
    setActiveIndex(0);
  }, [search, industry, statusFilter, sourceFilter]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sosPullOpen, setSosPullOpen] = useState(false);
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
      if (sourceFilter !== "all" && lead.lead_source !== sourceFilter) {
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
  }, [leads, industry, statusFilter, sourceFilter, search]);

  // Slice the filtered set into a single page worth of rows. Selection,
  // toggle-all, and the table render all operate against `paginated` so the
  // user can only act on rows they can actually see.
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const paginated = useMemo(
    () => filtered.slice(clampedPage * PAGE_SIZE, (clampedPage + 1) * PAGE_SIZE),
    [filtered, clampedPage]
  );

  const allSelected = paginated.length > 0 && paginated.every((l) => selected.has(l.id));
  const partiallySelected = !allSelected && paginated.some((l) => selected.has(l.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const lead of paginated) next.delete(lead.id);
      } else {
        for (const lead of paginated) next.add(lead.id);
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
      // Use `lead_id` to match the API route's payload contract. (An earlier
      // mismatch had this sending `id`, which the route silently rejected.)
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, status }),
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
        setActiveIndex((i) => Math.min(paginated.length - 1, i + 1));
      } else if (e.key === "k") {
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === " ") {
        e.preventDefault();
        const lead = paginated[activeIndex];
        if (lead) toggleOne(lead.id);
      } else if (e.key === "Enter" && !detailLead) {
        // Enter on the focused row opens the detail panel.
        const lead = paginated[activeIndex];
        if (lead) setDetailLead(lead);
      } else if (e.key.toLowerCase() === "g" && selected.size) {
        requestBulk("generate");
      } else if (e.key.toLowerCase() === "e" && selected.size) {
        requestBulk("email");
      } else if (e.key.toLowerCase() === "x" && selected.size) {
        requestBulk("mark");
      }
    },
    [paginated, activeIndex, selected, requestBulk, detailLead]
  );

  const handleSosPull = useCallback(
    async (payload: { source: "fl_sunbiz" | "ny_dos"; days: number }) => {
      setBusy("sos-pull");
      setError(null);
      try {
        const res = await fetch("/api/sos/pull", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = (await res.json().catch(() => ({}))) as { error?: string; hint?: string };
        if (!res.ok) throw new Error(body.error ?? "Failed to start SOS pull.");
        setSosPullOpen(false);
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
      {/* On mobile: tighter padding, "Operator" badge hidden, action buttons
          collapse to icon-only. The worker pill always shows because it
          carries critical state. */}
      <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-[color:var(--op-border)] bg-[color:var(--op-bg)]/95 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-6">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[color:var(--op-accent)] text-[color:var(--op-bg)] text-sm font-bold">
            C
          </span>
          <span className="text-sm font-semibold tracking-tight truncate">closehound</span>
          <span className="hidden sm:inline-block ml-2 rounded-full border border-[color:var(--op-border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[color:var(--op-text-muted)]">
            Operator
          </span>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/customers"
            aria-label="Customers"
            className="inline-flex items-center gap-2 rounded-md border border-[color:var(--op-border)] px-2 py-1.5 text-xs font-medium text-[color:var(--op-text)] hover:bg-[color:var(--op-panel-soft)] sm:px-3"
          >
            <FontAwesomeIcon icon={faUsers} className="h-3 w-3" />
            <span className="hidden sm:inline">Customers</span>
          </Link>
          <button
            type="button"
            onClick={() => setSosPullOpen(true)}
            aria-label="Pull SOS leads"
            className="inline-flex items-center gap-2 rounded-md border border-[color:var(--op-border)] px-2 py-1.5 text-xs font-medium text-[color:var(--op-text)] hover:bg-[color:var(--op-panel-soft)] sm:px-3"
            title="Pull fresh leads from state Secretary-of-State filings (FL / NY)"
          >
            <FontAwesomeIcon icon={faFileImport} className="h-3 w-3" />
            <span className="hidden sm:inline">Pull SOS leads</span>
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
        <Select
          value={sourceFilter}
          onChange={(v) =>
            setSourceFilter(v as "all" | "fl_sunbiz" | "ny_dos" | "google_places")
          }
          options={[
            { value: "all", label: "All sources" },
            { value: "fl_sunbiz", label: "FL — Sunbiz" },
            { value: "ny_dos", label: "NY — DOS" },
            { value: "google_places", label: "Google Places" },
          ]}
        />
        <span className="ml-auto text-xs tabular text-[color:var(--op-text-subtle)]">
          {filtered.length === 0
            ? "0 of " + leads.length
            : `${clampedPage * PAGE_SIZE + 1}–${Math.min(filtered.length, (clampedPage + 1) * PAGE_SIZE)} of ${filtered.length}`}
          {leads.length !== filtered.length ? ` (filtered from ${leads.length})` : ""}
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
            body="Tap 'Pull SOS leads' (top right) to fetch fresh FL/NY filings."
          />
        ) : (
          <>
          {/* Mobile card view — table doesn't fit at 375px so we stack each
              lead into a card. md:hidden flips it to the desktop table at the
              tablet breakpoint. */}
          <ul className="md:hidden divide-y divide-[color:var(--op-border)]">
            {paginated.map((lead, index) => {
              const isSelected = selected.has(lead.id);
              const isActive = index === activeIndex;
              return (
                <li
                  key={lead.id}
                  onClick={() => {
                    setActiveIndex(index);
                    setDetailLead(lead);
                  }}
                  className={`px-4 py-3 cursor-pointer ${
                    isActive
                      ? "bg-[color:var(--op-accent-soft)]"
                      : "active:bg-[color:var(--op-panel-soft)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleOne(lead.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                            STATUS_TONE[lead.status] ?? STATUS_TONE.new
                          }`}
                        >
                          {STATUS_LABEL[lead.status] ?? lead.status}
                        </span>
                        <span className="text-[11px] tabular text-[color:var(--op-text-muted)]">
                          {formatScore(lead.lead_score)}
                        </span>
                        <span className="ml-auto text-[10px] uppercase tracking-[0.14em] text-[color:var(--op-text-subtle)]">
                          {relativeTime(lead.created_at)}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-sm font-semibold text-[color:var(--op-text)] leading-snug break-words">
                        {lead.company_name}
                      </h3>
                      <p className="mt-0.5 text-xs text-[color:var(--op-text-muted)]">
                        {[lead.city ?? "—", lead.industry ?? "—"].join(" · ")}
                      </p>
                      {(lead.phone || lead.contact_email) ? (
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                              onClick={(e) => e.stopPropagation()}
                              className="tabular text-[color:var(--op-text)] hover:text-[color:var(--op-accent)] underline-offset-2 hover:underline"
                            >
                              {lead.phone}
                            </a>
                          ) : null}
                          {lead.contact_email ? (
                            <a
                              href={`mailto:${lead.contact_email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="truncate text-[color:var(--op-text)] hover:text-[color:var(--op-accent)] underline-offset-2 hover:underline"
                            >
                              {lead.contact_email}
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm tabular">
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
              {paginated.map((lead, index) => {
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
                      {lead.contact_email ? (
                        <a
                          href={`mailto:${lead.contact_email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-[color:var(--op-accent)] underline-offset-2 hover:underline"
                        >
                          {lead.contact_email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 text-[color:var(--op-text-muted)]">
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                          onClick={(e) => e.stopPropagation()}
                          className="tabular hover:text-[color:var(--op-accent)] underline-offset-2 hover:underline"
                        >
                          {lead.phone}
                        </a>
                      ) : (
                        "—"
                      )}
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
          </>
        )}
      </main>

      {/* ── Pagination bar (hidden when filtered fits on one page) ──────── */}
      {filtered.length > PAGE_SIZE ? (
        <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 border-t border-[color:var(--op-border)] bg-[color:var(--op-bg)] px-4 py-2 text-xs sm:px-6">
          <span className="tabular text-[color:var(--op-text-subtle)]">
            Page {clampedPage + 1} of {pageCount}
          </span>
          <div className="flex items-center gap-1.5">
            <PageButton
              disabled={clampedPage === 0}
              onClick={() => setPage(0)}
              label="First"
            />
            <PageButton
              disabled={clampedPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              icon={faChevronLeft}
              label="Prev"
            />
            <PageButton
              disabled={clampedPage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              icon={faChevronRight}
              label="Next"
              trailingIcon
            />
            <PageButton
              disabled={clampedPage >= pageCount - 1}
              onClick={() => setPage(pageCount - 1)}
              label="Last"
            />
          </div>
        </div>
      ) : null}

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

      {/* ── SOS pull dialog (replaces Google Places / LeadHound flow) ──── */}
      {sosPullOpen ? (
        <SosPullDialog
          onClose={() => setSosPullOpen(false)}
          onSubmit={handleSosPull}
          busy={busy === "sos-pull"}
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

function PageButton({
  onClick,
  disabled,
  label,
  icon,
  trailingIcon,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  icon?: typeof faPaperPlane;
  trailingIcon?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--op-border)] px-2.5 py-1 text-[11px] font-medium hover:bg-[color:var(--op-panel-soft)] disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {icon && !trailingIcon ? <FontAwesomeIcon icon={icon} className="h-2.5 w-2.5" /> : null}
      {label}
      {icon && trailingIcon ? <FontAwesomeIcon icon={icon} className="h-2.5 w-2.5" /> : null}
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

function SosPullDialog({
  onClose,
  onSubmit,
  busy,
}: {
  onClose: () => void;
  onSubmit: (payload: { source: "fl_sunbiz" | "ny_dos"; days: number }) => Promise<void>;
  busy: boolean;
}) {
  const [source, setSource] = useState<"fl_sunbiz" | "ny_dos">("fl_sunbiz");
  const [days, setDays] = useState(7);

  // Per-source description so the user understands what the pipeline will do.
  // Both run: fetch → NAICS filter → domain check → upsert → contact scrape →
  // promote to leads. No Google Places API anywhere in the chain.
  const desc =
    source === "fl_sunbiz"
      ? "Pulls daily fixed-width records from sftp.floridados.gov, filters by target NAICS, scores, and inserts new leads."
      : "Pulls recent entities from the NY DOS Socrata dataset (n9v6-gdp6), filters by name-inferred industry, scores, and inserts new leads.";

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
          <h2 className="text-base font-semibold">Pull SOS leads</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[color:var(--op-text-subtle)] hover:text-[color:var(--op-text)]"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs leading-5 text-[color:var(--op-text-muted)]">
          Runs the state Secretary-of-State ingestion pipeline (no Google Places API).
          Returns immediately — pipeline finishes in 2–5 min and new leads stream into the
          table as they upsert.
        </p>
        <div className="mt-4 grid gap-3">
          <Field label="Source">
            <div className="grid grid-cols-2 gap-2">
              <SourceRadio
                value="fl_sunbiz"
                selected={source}
                onSelect={setSource}
                title="Florida (Sunbiz)"
                sub="~500 leads / 7-day window"
              />
              <SourceRadio
                value="ny_dos"
                selected={source}
                onSelect={setSource}
                title="New York (DOS)"
                sub="~100 leads / 7-day window"
              />
            </div>
          </Field>
          <p className="text-[11px] leading-4 text-[color:var(--op-text-subtle)]">{desc}</p>
          <Field label="Days back (1–60)">
            <input
              type="number"
              min={1}
              max={60}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
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
            disabled={busy || days < 1}
            onClick={() => void onSubmit({ source, days })}
            className="inline-flex items-center gap-1.5 rounded-md bg-[color:var(--op-accent)] px-3 py-1.5 text-xs font-medium text-[color:var(--op-bg)] disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faFileImport} className="h-3 w-3" />
            {busy ? "Starting…" : source === "fl_sunbiz" ? "Pull FL leads" : "Pull NY leads"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SourceRadio<T extends string>({
  value,
  selected,
  onSelect,
  title,
  sub,
}: {
  value: T;
  selected: T;
  onSelect: (value: T) => void;
  title: string;
  sub: string;
}) {
  const active = selected === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left text-xs transition ${
        active
          ? "border-[color:var(--op-accent)] bg-[color:var(--op-accent)]/10 text-[color:var(--op-text)]"
          : "border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] text-[color:var(--op-text-muted)] hover:border-[color:var(--op-border-strong)]"
      }`}
    >
      <span className="font-medium text-[color:var(--op-text)]">{title}</span>
      <span className="text-[10px] uppercase tracking-[0.14em] text-[color:var(--op-text-subtle)]">
        {sub}
      </span>
    </button>
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
