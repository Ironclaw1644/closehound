"use client";

import { useState, useTransition } from "react";
import type { Lead, LeadStatus } from "@/types/lead";

type LeadsTableProps = {
  initialLeads: Lead[];
};

const statusStyles: Record<LeadStatus, string> = {
  new: "border-white/10 bg-white/5 text-zinc-300",
  generated: "border-orange-400/20 bg-orange-400/10 text-orange-200",
  emailed: "border-sky-400/20 bg-sky-400/10 text-sky-200",
  called: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  closed: "border-violet-400/20 bg-violet-400/10 text-violet-200",
};

function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex min-w-24 justify-center rounded-full border px-3 py-1 text-xs font-medium capitalize tracking-[0.18em] ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

function updateLeadInList(leads: Lead[], updatedLead: Lead) {
  return leads.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead));
}

export default function LeadsTable({ initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [busyLeadId, setBusyLeadId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function runAction(
    leadId: string,
    endpoint: string,
    body: Record<string, string>,
    method = "POST"
  ) {
    setBusyLeadId(leadId);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Request failed.");
      }

      const data = (await response.json()) as { lead: Lead };

      startTransition(() => {
        setLeads((currentLeads) => updateLeadInList(currentLeads, data.lead));
      });
    } finally {
      setBusyLeadId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/8 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Lead pipeline</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Generate sites fast, then move straight into outreach.
          </p>
        </div>
        <div className="rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-orange-100">
          {leads.length} active leads
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-white/[0.02] text-xs uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="px-6 py-4 font-medium">Company</th>
              <th className="px-6 py-4 font-medium">City</th>
              <th className="px-6 py-4 font-medium">Rating</th>
              <th className="px-6 py-4 font-medium">Website</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr className="border-t border-white/6">
                <td colSpan={6} className="px-6 py-16 text-center">
                  <p className="text-base font-medium text-white">No leads yet</p>
                  <p className="mt-2 text-sm text-zinc-500">
                    Add rows in Supabase and they will appear here immediately.
                  </p>
                </td>
              </tr>
            ) : null}
            {leads.map((lead) => {
              const isBusy = busyLeadId === lead.id || isPending;
              const callDisabled = lead.status === "called" || lead.status === "closed" || isBusy;

              return (
                <tr key={lead.id} className="border-t border-white/6 text-sm text-zinc-200">
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
                        <span className="text-xs text-zinc-600">{lead.industry}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-zinc-400">{lead.city}</td>
                  <td className="px-6 py-5 text-zinc-300">
                    {typeof lead.rating === "number" ? lead.rating.toFixed(1) : "—"}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        lead.has_website
                          ? "bg-emerald-400/10 text-emerald-200"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {lead.has_website ? "Present" : "Missing"}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          runAction(lead.id, "/api/generate", {
                            lead_id: lead.id,
                          })
                        }
                        disabled={isBusy}
                        className="rounded-full border border-orange-300/20 bg-orange-300/12 px-4 py-2 text-xs font-medium text-orange-100 transition hover:bg-orange-300/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Generate Preview
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          runAction(
                            lead.id,
                            "/api/leads",
                            {
                              lead_id: lead.id,
                              status: "emailed",
                            },
                            "PATCH"
                          )
                        }
                        disabled={isBusy}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-200 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          runAction(
                            lead.id,
                            "/api/leads",
                            {
                              lead_id: lead.id,
                              status: "called",
                            },
                            "PATCH"
                          )
                        }
                        disabled={callDisabled}
                        className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-medium text-emerald-100 transition hover:bg-emerald-300/18 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {lead.status === "called" ? "Called" : "Call"}
                      </button>
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
