"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExternalLink,
  faEnvelope,
  faPen,
  faCircleCheck,
  faCircleExclamation,
  faCircle,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import type { CustomerRow } from "@/lib/onboarding/storage";
import { humanizeOperatorError } from "@/lib/operator/humanize-error";

// Customers view — shows every preview_site row (i.e. every purchase) with
// publish status, custom domain status, revenue, and per-row actions:
//   - Open live site
//   - Open editor as buyer (mints a fresh claim token)
//   - Resend claim email (re-mints + emails the link)
//
// Joins purchase and lead data in-memory (see listCustomers in storage.ts).

export function CustomersConsole({ initial }: { initial: CustomerRow[] }) {
  const [rows] = useState(initial);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.company_name ?? "",
        r.slug,
        r.buyer_email ?? "",
        r.custom_domain ?? "",
        r.lead_city ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const totalRevenue = rows.reduce((acc, r) => acc + (r.amount_cents ?? 0), 0);

  async function resendClaim(previewSiteId: string, buyerEmail: string | null) {
    if (!buyerEmail) {
      setError("This customer has no buyer email on file.");
      return;
    }
    setBusy(previewSiteId);
    setError(null);
    setToast(null);
    try {
      const res = await fetch("/api/operator/resend-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previewSiteId }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; sentTo?: string };
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      setToast(`Claim link resent to ${body.sentTo ?? buyerEmail}.`);
    } catch (err) {
      setError(humanizeOperatorError(err));
    } finally {
      setBusy(null);
    }
  }

  async function openEditorAs(previewSiteId: string) {
    setBusy(previewSiteId);
    setError(null);
    try {
      const res = await fetch("/api/operator/resend-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ previewSiteId, returnTokenOnly: true }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        claimUrl?: string;
      };
      if (!res.ok || !body.claimUrl) throw new Error(body.error ?? `HTTP ${res.status}`);
      window.open(body.claimUrl, "_blank", "noreferrer");
    } catch (err) {
      setError(humanizeOperatorError(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Filter + stats */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[color:var(--op-border)] px-4 py-2 sm:px-6">
        <label className="relative flex flex-1 min-w-[260px] items-center">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 h-3.5 w-3.5 text-[color:var(--op-text-subtle)]"
          />
          <input
            type="text"
            placeholder="Search by name, slug, email, domain"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded-md border border-[color:var(--op-border)] bg-[color:var(--op-panel)] pl-9 pr-3 text-sm outline-none placeholder:text-[color:var(--op-text-subtle)] focus:border-[color:var(--op-border-strong)]"
          />
        </label>
        <span className="text-xs tabular text-[color:var(--op-text-subtle)]">
          {filtered.length} of {rows.length}
        </span>
        <span className="rounded-full border border-[color:var(--op-border)] bg-[color:var(--op-panel-soft)] px-3 py-1 text-xs tabular text-[color:var(--op-text)]">
          ${(totalRevenue / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })} revenue
        </span>
      </div>

      {error ? (
        <div className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-200 sm:px-6">
          {error}
        </div>
      ) : null}
      {toast ? (
        <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 sm:px-6">
          ✓ {toast}
        </div>
      ) : null}

      <main className="flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="mx-auto mt-24 max-w-md rounded-2xl border border-[color:var(--op-border)] bg-[color:var(--op-panel)] p-6 text-center">
            <p className="text-sm font-semibold">No customers yet</p>
            <p className="mt-2 text-xs leading-5 text-[color:var(--op-text-muted)]">
              A row appears here once Stripe fires its first paid checkout webhook.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[color:var(--op-bg)] text-left text-[10px] uppercase tracking-[0.18em] text-[color:var(--op-text-subtle)]">
              <tr>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Domain</th>
                <th className="px-3 py-2 font-medium">Live URL</th>
                <th className="px-3 py-2 font-medium">Paid</th>
                <th className="px-3 py-2 font-medium">Purchased</th>
                <th className="w-32 px-3 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  className="group border-t border-[color:var(--op-border)] hover:bg-[color:var(--op-panel-soft)]"
                >
                  <td className="px-3 py-2">
                    <StatusPill row={row} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-[color:var(--op-text)]">
                      {row.company_name ?? row.slug}
                    </div>
                    <div className="text-[11px] text-[color:var(--op-text-subtle)]">
                      {row.buyer_email ?? "no buyer email"}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-[color:var(--op-text-muted)]">
                    {row.custom_domain ?? (
                      <span className="text-[color:var(--op-text-subtle)]">default</span>
                    )}
                    {row.custom_domain && row.custom_domain_status ? (
                      <DomainStatus status={row.custom_domain_status} />
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    <a
                      href={row.preview_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[color:var(--op-text-muted)] hover:text-[color:var(--op-accent)]"
                    >
                      <FontAwesomeIcon icon={faExternalLink} className="h-2.5 w-2.5" />
                      <span className="truncate max-w-[200px]">{row.slug}</span>
                    </a>
                  </td>
                  <td className="px-3 py-2 text-[color:var(--op-text-muted)] tabular-nums">
                    {row.amount_cents !== null
                      ? `$${(row.amount_cents / 100).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-[color:var(--op-text-subtle)] text-[11px]">
                    {row.paid_at ? new Date(row.paid_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditorAs(row.id)}
                        disabled={busy === row.id}
                        title="Open editor as buyer (new token)"
                        className="rounded-md border border-[color:var(--op-border)] p-1.5 text-[color:var(--op-text-muted)] hover:bg-[color:var(--op-panel)] hover:text-[color:var(--op-text)] disabled:opacity-40"
                      >
                        <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => resendClaim(row.id, row.buyer_email)}
                        disabled={busy === row.id || !row.buyer_email}
                        title={
                          row.buyer_email
                            ? `Resend claim email to ${row.buyer_email}`
                            : "No buyer email"
                        }
                        className="rounded-md border border-[color:var(--op-border)] p-1.5 text-[color:var(--op-text-muted)] hover:bg-[color:var(--op-panel)] hover:text-[color:var(--op-text)] disabled:opacity-40"
                      >
                        <FontAwesomeIcon icon={faEnvelope} className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}

function StatusPill({ row }: { row: CustomerRow }) {
  if (row.is_published) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-emerald-200">
        <FontAwesomeIcon icon={faCircleCheck} className="h-2 w-2" />
        Live
      </span>
    );
  }
  if (row.claimed_at) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-amber-200">
        <FontAwesomeIcon icon={faCircle} className="h-2 w-2" />
        Editing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-sky-200">
      <FontAwesomeIcon icon={faCircle} className="h-2 w-2" />
      Awaiting claim
    </span>
  );
}

function DomainStatus({
  status,
}: {
  status: NonNullable<CustomerRow["custom_domain_status"]>;
}) {
  if (status.verified) {
    return (
      <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-emerald-300">
        <FontAwesomeIcon icon={faCircleCheck} className="h-2 w-2" />
        verified
      </span>
    );
  }
  return (
    <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-amber-300">
      <FontAwesomeIcon icon={faCircleExclamation} className="h-2 w-2" />
      pending DNS
    </span>
  );
}

// Suppress unused warning when CustomersConsole is imported from a Link.
export const _link = Link;
