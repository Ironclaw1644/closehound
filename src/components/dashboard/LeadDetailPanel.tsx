"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faPaperPlane,
  faWandMagicSparkles,
  faPhoneVolume,
  faCircleCheck,
  faExternalLink,
  faEnvelope,
  faPhone,
  faLocationDot,
  faGlobe,
  faStar,
  faQuoteLeft,
} from "@fortawesome/free-solid-svg-icons";
import type { Lead, LeadStatus } from "@/types/lead";
import { humanizeOperatorError } from "@/lib/operator/humanize-error";

// Slide-out right-side panel showing the full profile of a single lead.
// Mounted by LeadConsole when the operator clicks/Enter on a row.
// Keeps the lead-list visible behind the overlay so context isn't lost.

export type LeadDetailPanelProps = {
  lead: Lead | null;
  onClose: () => void;
  onStatusChange: (leadId: string, status: LeadStatus) => Promise<void>;
};

const STATUS_TONE: Record<LeadStatus, string> = {
  new: "border-white/10 text-zinc-300",
  generated: "border-amber-500/30 text-amber-200 bg-amber-500/10",
  emailed: "border-sky-400/30 text-sky-200 bg-sky-500/10",
  called: "border-emerald-400/30 text-emerald-200 bg-emerald-500/10",
  closed: "border-violet-400/30 text-violet-200 bg-violet-500/10",
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "new",
  generated: "preview",
  emailed: "emailed",
  called: "called",
  closed: "closed",
};

export function LeadDetailPanel({ lead, onClose, onStatusChange }: LeadDetailPanelProps) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Escape closes
  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lead, onClose]);

  if (!lead) return null;

  const callAction = async (action: "generate" | "email" | "called" | "closed") => {
    setBusy(action);
    setError(null);
    try {
      if (action === "generate") {
        const res = await fetch("/api/generate/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadIds: [lead.id] }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      } else if (action === "email") {
        const res = await fetch("/api/outreach/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: lead.id }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? `HTTP ${res.status}`);
      } else {
        await onStatusChange(lead.id, action);
      }
    } catch (err) {
      setError(humanizeOperatorError(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      {/* Backdrop — click closes the panel. Click-through transparent area keeps
          most of the table visible. */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Lead detail: ${lead.company_name}`}
        className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[480px] flex-col border-l border-[color:var(--op-border)] bg-[color:var(--op-panel)] shadow-[-24px_0_60px_rgba(0,0,0,0.5)]"
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 border-b border-[color:var(--op-border)] px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                  STATUS_TONE[lead.status] ?? STATUS_TONE.new
                }`}
              >
                {STATUS_LABEL[lead.status] ?? lead.status}
              </span>
              {typeof lead.lead_score === "number" ? (
                <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--op-text-subtle)]">
                  score {lead.lead_score.toFixed(1)}
                </span>
              ) : null}
            </div>
            <h2 className="mt-1 truncate text-base font-semibold text-[color:var(--op-text)]">
              {lead.company_name}
            </h2>
            <p className="mt-0.5 text-xs text-[color:var(--op-text-muted)]">
              {[lead.industry ?? "—", lead.city ?? "—"].join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[color:var(--op-text-subtle)] hover:bg-[color:var(--op-panel-soft)] hover:text-[color:var(--op-text)]"
            aria-label="Close panel"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </header>

        {error ? (
          <div className="mx-5 mt-3 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        ) : null}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Contact */}
          <Section title="Contact">
            <DetailRow
              icon={faPhone}
              label="Phone"
              value={lead.phone}
              href={lead.phone ? `tel:${lead.phone.replace(/[^\d+]/g, "")}` : undefined}
            />
            <DetailRow
              icon={faEnvelope}
              label="Email"
              value={lead.contact_email}
              href={lead.contact_email ? `mailto:${lead.contact_email}` : undefined}
            />
            <DetailRow icon={faLocationDot} label="City" value={lead.city} />
          </Section>

          {/* Business */}
          <Section title="Business">
            <DetailRow icon={faStar} label="Rating" value={formatRating(lead.rating, lead.review_count)} />
            <DetailRow
              icon={faGlobe}
              label="Has website"
              value={typeof lead.has_website === "boolean" ? (lead.has_website ? "yes" : "no") : null}
            />
            <DetailRow
              icon={faQuoteLeft}
              label="Years in business"
              value={typeof lead.years_in_business === "number" ? `${lead.years_in_business}` : null}
            />
            <DetailRow icon={faExternalLink} label="Lead source" value={lead.lead_source} />
          </Section>

          {/* Top review (if present) */}
          {lead.top_review ? (
            <Section title="Top review">
              <blockquote className="rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-3 py-2.5 text-xs leading-5 text-[color:var(--op-text-muted)]">
                <span className="text-[color:var(--op-text)]">"{lead.top_review}"</span>
                {lead.top_reviewer_name ? (
                  <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-[color:var(--op-text-subtle)]">
                    — {lead.top_reviewer_name}
                  </span>
                ) : null}
              </blockquote>
            </Section>
          ) : null}

          {/* Notes (read-only for now — keeps scope tight) */}
          {lead.notes ? (
            <Section title="Notes">
              <p className="text-xs leading-5 text-[color:var(--op-text-muted)]">
                {lead.notes}
              </p>
            </Section>
          ) : null}

          {/* Preview link */}
          {lead.preview_url ? (
            <Section title="Preview">
              <a
                href={lead.preview_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-3 py-1.5 text-xs hover:border-[color:var(--op-accent)] hover:text-[color:var(--op-accent)]"
              >
                <FontAwesomeIcon icon={faExternalLink} className="h-3 w-3" />
                Open preview
              </a>
            </Section>
          ) : null}
        </div>

        {/* Footer actions */}
        <footer className="border-t border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-5 py-3">
          <div className="grid grid-cols-2 gap-2">
            <PanelAction
              icon={faWandMagicSparkles}
              label="Generate preview"
              busy={busy === "generate"}
              disabled={!!lead.preview_url}
              onClick={() => callAction("generate")}
              hint={lead.preview_url ? "Already generated" : undefined}
            />
            <PanelAction
              icon={faPaperPlane}
              label="Send outreach"
              tone="accent"
              busy={busy === "email"}
              disabled={!lead.preview_url}
              onClick={() => callAction("email")}
              hint={!lead.preview_url ? "Needs preview first" : undefined}
            />
            <PanelAction
              icon={faPhoneVolume}
              label="Mark called"
              busy={busy === "called"}
              onClick={() => callAction("called")}
            />
            <PanelAction
              icon={faCircleCheck}
              label="Mark closed"
              busy={busy === "closed"}
              onClick={() => callAction("closed")}
            />
          </div>
        </footer>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--op-text-subtle)]">
        {title}
      </h3>
      <div className="grid gap-1.5">{children}</div>
    </section>
  );
}

function DetailRow({
  icon,
  label,
  value,
  href,
}: {
  icon: typeof faPhone;
  label: string;
  value: string | number | null | undefined;
  href?: string;
}) {
  const display = value === null || value === undefined || value === "" ? "—" : String(value);
  return (
    <div className="flex items-start gap-2.5 text-xs">
      <FontAwesomeIcon icon={icon} className="mt-0.5 h-3 w-3 text-[color:var(--op-text-subtle)]" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--op-text-subtle)]">
          {label}
        </p>
        {href && display !== "—" ? (
          <a
            href={href}
            className="block truncate text-[color:var(--op-text)] hover:text-[color:var(--op-accent)]"
          >
            {display}
          </a>
        ) : (
          <p className="break-words text-[color:var(--op-text)]">{display}</p>
        )}
      </div>
    </div>
  );
}

function PanelAction({
  icon,
  label,
  onClick,
  busy,
  disabled,
  tone,
  hint,
}: {
  icon: typeof faPaperPlane;
  label: string;
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
  tone?: "accent";
  hint?: string;
}) {
  const isAccent = tone === "accent";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      title={hint}
      className={`inline-flex flex-col items-center justify-center gap-1 rounded-md px-3 py-2.5 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
        isAccent
          ? "bg-[color:var(--op-accent)] text-[color:var(--op-bg)] hover:opacity-90 disabled:hover:opacity-40"
          : "border border-[color:var(--op-border)] hover:bg-[color:var(--op-panel)]"
      }`}
    >
      <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
      <span>{busy ? "Working…" : label}</span>
    </button>
  );
}

function formatRating(rating: number | null | undefined, count: number | null | undefined) {
  const r = typeof rating === "number" ? rating.toFixed(1) : "—";
  if (typeof count === "number") return `${r}★ · ${count} reviews`;
  return r;
}
