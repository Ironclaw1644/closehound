"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { Lead, LeadStatus } from "@/types/lead";

type LeadsTableProps = {
  leads: Lead[];
};

const statusStyles: Record<LeadStatus, string> = {
  new: "border-white/10 bg-white/[0.04] text-zinc-300",
  generated: "border-orange-400/20 bg-orange-400/10 text-orange-200",
  emailed: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  called: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  closed: "border-violet-400/20 bg-violet-400/10 text-violet-200",
};

function formatRating(rating: Lead["rating"]) {
  return typeof rating === "number" ? rating.toFixed(1) : "—";
}

function formatContactEmail(contactEmail: Lead["contact_email"]) {
  return contactEmail?.trim() || "Test fallback";
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

export default function LeadsTable({ leads }: LeadsTableProps) {
  const [rows, setRows] = useState(leads);
  const [sendingLeadId, setSendingLeadId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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

  return (
    <div className="overflow-hidden rounded-[26px] border border-white/8 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Lead pipeline</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Live rows from <span className="text-zinc-300">closehound.leads</span>
          </p>
        </div>
      </div>

      {actionError ? (
        <div className="border-b border-rose-300/10 bg-rose-300/5 px-6 py-3 text-sm text-rose-100">
          {actionError}
        </div>
      ) : null}

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
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr className="border-t border-white/6">
                <td colSpan={8} className="px-6 py-16 text-center">
                  <p className="text-base font-medium text-white">No leads found</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Seed or insert rows into <span className="text-zinc-300">closehound.leads</span>{" "}
                    and they will appear here.
                  </p>
                </td>
              </tr>
            ) : null}

            {rows.map((lead) => {
              const isSending = sendingLeadId === lead.id;
              const canEmail = Boolean(lead.preview_url) && !isSending;

              return (
                <tr
                  key={lead.id}
                  className="border-t border-white/6 text-sm text-zinc-200 transition hover:bg-white/[0.015]"
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-white">{lead.company_name}</span>
                      {lead.preview_url ? (
                        <a
                          href={lead.preview_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-zinc-500 transition hover:text-orange-200"
                        >
                          {lead.preview_url}
                        </a>
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
                    <div className="flex justify-end gap-2">
                      <ActionButton>Generate Preview</ActionButton>
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
