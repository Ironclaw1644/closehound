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
  faIdCard,
  faBriefcase,
  faCalendar,
  faTag,
  faPencil,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { Lead, LeadStatus } from "@/types/lead";
import { humanizeOperatorError } from "@/lib/operator/humanize-error";

// Shape of each officer row stored in `new_business_leads.officers` jsonb.
type Officer = {
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  middle?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  role?: string | null;
  // Filled in by an enrichment pass (Apollo, manual lookup, etc.)
  phone?: string | null;
  email?: string | null;
};

// Shape returned by /api/leads/[id]/sos-detail. Mirrors the
// `closehound.new_business_leads` columns we project.
type SosFiling = {
  source_entity_id: string;
  business_name: string;
  entity_type: string | null;
  filing_date: string | null;
  state: string | null;
  principal_address: {
    line1?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  } | null;
  registered_agent: { name?: string | null; address?: string | null; city?: string | null; state?: string | null } | null;
  officers: Officer[] | null;
  naics_code: string | null;
  naics_inferred: boolean | null;
  raw_payload: Record<string, unknown> | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_checked_at: string | null;
  domain_found: string | null;
  has_website: boolean | null;
  gmb_found: boolean | null;
  priority_score: number | null;
  priority_tier: string | null;
};

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
  const [sos, setSos] = useState<SosFiling | null>(null);
  const [sosLoading, setSosLoading] = useState(false);

  // Escape closes
  useEffect(() => {
    if (!lead) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lead, onClose]);

  // Fetch the matching SOS filing whenever a new lead is opened. Resets when
  // the panel closes (lead === null). Won't fetch for non-SOS sources — the
  // API returns {sos: null} and the section just doesn't render.
  useEffect(() => {
    if (!lead) {
      setSos(null);
      return;
    }
    let cancelled = false;
    setSosLoading(true);
    fetch(`/api/leads/${lead.id}/sos-detail`)
      .then((r) => (r.ok ? r.json() : Promise.resolve({ sos: null })))
      .then((body: { sos: SosFiling | null }) => {
        if (!cancelled) setSos(body.sos);
      })
      .catch(() => {
        if (!cancelled) setSos(null);
      })
      .finally(() => {
        if (!cancelled) setSosLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lead]);

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
        className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-full sm:max-w-[480px] flex-col border-l border-[color:var(--op-border)] bg-[color:var(--op-panel)] shadow-[-24px_0_60px_rgba(0,0,0,0.5)]"
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
          {/* Contact — phone/email come from contact_check enrichment for SOS
              leads, or from Google Places for the legacy preserved lead. Both
              are inline-editable so the operator can paste in a number they
              looked up manually (e.g. via TruePeopleSearch). */}
          <Section title="Contact">
            <EditableContactRow
              leadId={lead.id}
              icon={faPhone}
              label="Phone"
              value={lead.phone ?? sos?.contact_phone ?? null}
              field="phone"
              hrefPrefix="tel"
              placeholder="(555) 123-4567"
              inputMode="tel"
            />
            <EditableContactRow
              leadId={lead.id}
              icon={faEnvelope}
              label="Email"
              value={lead.contact_email ?? sos?.contact_email ?? null}
              field="contact_email"
              hrefPrefix="mailto"
              placeholder="owner@example.com"
              inputMode="email"
            />
            <DetailRow
              icon={faLocationDot}
              label="Address"
              value={
                sos?.principal_address
                  ? formatAddress(sos.principal_address)
                  : lead.city
              }
            />
          </Section>

          {/* SOS filing details — only shows for fl_sunbiz / ny_dos leads.
              For the legacy Google Places lead the API returns sos=null and
              this section is hidden entirely. */}
          {sos ? (
            <Section title={sourceLabel(lead.lead_source)}>
              <DetailRow
                icon={faCalendar}
                label="Filing date"
                value={sos.filing_date ?? null}
              />
              <DetailRow
                icon={faBriefcase}
                label="Entity type"
                value={sos.entity_type ?? null}
              />
              <DetailRow
                icon={faTag}
                label="NAICS"
                value={
                  sos.naics_code
                    ? `${sos.naics_code}${sos.naics_inferred ? " (inferred from name)" : ""}`
                    : null
                }
              />
              <DetailRow
                icon={faIdCard}
                label="State filing ID"
                value={sos.source_entity_id}
              />
              {sos.registered_agent?.name ? (
                <DetailRow
                  icon={faIdCard}
                  label="Registered agent"
                  value={
                    [
                      sos.registered_agent.name,
                      sos.registered_agent.city,
                      sos.registered_agent.state,
                    ]
                      .filter(Boolean)
                      .join(" · ") || null
                  }
                />
              ) : null}
            </Section>
          ) : sosLoading ? (
            <Section title="State filing">
              <p className="text-xs text-[color:var(--op-text-subtle)]">Loading…</p>
            </Section>
          ) : null}

          {/* Officers — the actual humans who registered the LLC. Their phone /
              email isn't in the state filing; enrich via Apollo or run a name+
              address skip-trace to populate `officer.phone` / `officer.email`. */}
          {sos?.officers && sos.officers.length > 0 ? (
            <Section title={`Officer${sos.officers.length > 1 ? "s" : ""}`}>
              {sos.officers.map((officer, idx) => (
                <OfficerCard key={idx} officer={officer} />
              ))}
            </Section>
          ) : null}

          {/* Business */}
          <Section title="Business">
            <DetailRow icon={faStar} label="Rating" value={formatRating(lead.rating, lead.review_count)} />
            <DetailRow
              icon={faGlobe}
              label="Has website"
              value={typeof lead.has_website === "boolean" ? (lead.has_website ? "yes" : "no") : null}
            />
            {sos?.domain_found ? (
              <DetailRow icon={faGlobe} label="Domain" value={sos.domain_found} />
            ) : null}
            <DetailRow
              icon={faQuoteLeft}
              label="Years in business"
              value={typeof lead.years_in_business === "number" ? `${lead.years_in_business}` : null}
            />
            <DetailRow icon={faExternalLink} label="Lead source" value={sourceLabel(lead.lead_source)} />
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

/** Inline-editable contact row (phone / email).
 *
 * Default state: displays the value as a tel:/mailto: link with a pencil
 * affordance on hover. Click pencil → input replaces the link. Save sends
 * PATCH /api/leads with the single field. Empty string clears. The polling
 * in LeadConsole picks up the new value within ~4s.
 *
 * Optimistic: when the user hits Save we exit the input immediately even
 * before the network round-trip completes, then the polled refresh
 * re-syncs. A brief "saving…" badge indicates the in-flight write.
 */
function EditableContactRow({
  leadId,
  icon,
  label,
  value,
  field,
  hrefPrefix,
  placeholder,
  inputMode,
}: {
  leadId: string;
  icon: typeof faPhone;
  label: string;
  value: string | null;
  field: "phone" | "contact_email";
  hrefPrefix: "tel" | "mailto";
  placeholder: string;
  inputMode: "tel" | "email";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the draft if the underlying value changes (polling refresh) and
  // we're not actively editing.
  useEffect(() => {
    if (!editing) setDraft(value ?? "");
  }, [value, editing]);

  const begin = () => {
    setDraft(value ?? "");
    setEditing(true);
    setError(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          [field]: draft.trim() === "" ? null : draft.trim(),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(value ?? "");
    setEditing(false);
    setError(null);
  };

  const href =
    value
      ? `${hrefPrefix}:${hrefPrefix === "tel" ? value.replace(/[^\d+]/g, "") : value}`
      : undefined;

  return (
    <div className="group flex items-start gap-2.5 text-xs">
      <FontAwesomeIcon icon={icon} className="mt-0.5 h-3 w-3 text-[color:var(--op-text-subtle)]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--op-text-subtle)]">
            {label}
          </p>
          {saving ? (
            <span className="text-[9px] uppercase tracking-[0.14em] text-[color:var(--op-text-subtle)]">
              saving…
            </span>
          ) : null}
        </div>
        {editing ? (
          <div className="mt-0.5 flex items-center gap-1.5">
            <input
              type={inputMode === "tel" ? "tel" : "email"}
              inputMode={inputMode}
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void save();
                else if (e.key === "Escape") cancel();
              }}
              placeholder={placeholder}
              className="flex-1 h-7 rounded border border-[color:var(--op-border-strong)] bg-[color:var(--op-panel-soft)] px-2 text-xs text-[color:var(--op-text)] outline-none focus:border-[color:var(--op-accent)]"
            />
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              aria-label="Save"
              className="rounded p-1 text-[color:var(--op-accent)] hover:bg-[color:var(--op-panel-soft)] disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faCheck} className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={cancel}
              disabled={saving}
              aria-label="Cancel"
              className="rounded p-1 text-[color:var(--op-text-subtle)] hover:bg-[color:var(--op-panel-soft)]"
            >
              <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {value ? (
              <a
                href={href}
                className="truncate text-[color:var(--op-text)] hover:text-[color:var(--op-accent)]"
              >
                {value}
              </a>
            ) : (
              <button
                type="button"
                onClick={begin}
                className="text-[color:var(--op-text-subtle)] italic hover:text-[color:var(--op-accent)]"
              >
                Add {label.toLowerCase()}…
              </button>
            )}
            {value ? (
              <button
                type="button"
                onClick={begin}
                aria-label={`Edit ${label}`}
                className="opacity-0 group-hover:opacity-100 rounded p-1 text-[color:var(--op-text-subtle)] hover:bg-[color:var(--op-panel-soft)] hover:text-[color:var(--op-text)] transition"
              >
                <FontAwesomeIcon icon={faPencil} className="h-2.5 w-2.5" />
              </button>
            ) : null}
          </div>
        )}
        {error ? (
          <p className="mt-1 text-[10px] text-rose-300">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

function OfficerCard({ officer }: { officer: Officer }) {
  const name = officer.name || [officer.first_name, officer.last_name].filter(Boolean).join(" ");
  const addressLine = [
    officer.address,
    [officer.city, officer.state].filter(Boolean).join(", "),
    officer.zip,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <div className="rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-3 py-2.5 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-[color:var(--op-text)]">{name || "—"}</span>
        {officer.role ? (
          <span className="rounded-full border border-[color:var(--op-border)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--op-text-subtle)]">
            {officer.role}
          </span>
        ) : null}
      </div>
      {addressLine ? (
        <p className="mt-1 leading-5 text-[color:var(--op-text-muted)]">{addressLine}</p>
      ) : null}
      {officer.phone || officer.email ? (
        <div className="mt-2 grid gap-1">
          {officer.phone ? (
            <a
              href={`tel:${officer.phone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-1.5 text-[color:var(--op-text)] hover:text-[color:var(--op-accent)]"
            >
              <FontAwesomeIcon icon={faPhone} className="h-2.5 w-2.5" />
              {officer.phone}
            </a>
          ) : null}
          {officer.email ? (
            <a
              href={`mailto:${officer.email}`}
              className="inline-flex items-center gap-1.5 text-[color:var(--op-text)] hover:text-[color:var(--op-accent)]"
            >
              <FontAwesomeIcon icon={faEnvelope} className="h-2.5 w-2.5" />
              {officer.email}
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function formatRating(rating: number | null | undefined, count: number | null | undefined) {
  const r = typeof rating === "number" ? rating.toFixed(1) : "—";
  if (typeof count === "number") return `${r}★ · ${count} reviews`;
  return r;
}

function formatAddress(addr: {
  line1?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}) {
  const parts = [
    addr.line1,
    [addr.city, addr.state].filter(Boolean).join(", "),
    addr.zip,
  ]
    .map((p) => (p ? p.trim() : ""))
    .filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

function sourceLabel(source: string | null | undefined): string {
  if (source === "fl_sunbiz") return "FL — Sunbiz filing";
  if (source === "ny_dos") return "NY — DOS filing";
  if (source === "google_places") return "Google Places";
  if (source === "seed") return "Seed data";
  return source ?? "—";
}
