import {
  faArrowUpRightFromSquare,
  faClipboardCheck,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

import type { TemplateCopySlot } from "@/lib/template-system/copy-review/types";
import { TemplateCopySlotCard } from "@/components/template-copy/template-copy-slot-card";

type SectionGroup = {
  sectionKey: string;
  slots: readonly TemplateCopySlot[];
};

type TemplateCopyDetailSummary = {
  approvedCount: number;
  needsRevisionCount: number;
  unreviewedCount: number;
  totalCount: number;
  copyApproved: boolean;
};

function formatCount(value: number, total: number) {
  return `${value}/${total}`;
}

function formatFamilyLabel(familyKey: string) {
  if (familyKey === "blue-collar-service") {
    return "Blue-Collar Service";
  }

  if (familyKey === "health-wellness") {
    return "Health & Wellness";
  }

  return familyKey.replace(/-/g, " ");
}

function formatSectionLabel(sectionKey: string) {
  return sectionKey
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function TemplateCopyDetail({
  familyKey,
  groupedSlots,
  previewPath,
  slots,
  summary,
  templateKey,
  title,
}: {
  familyKey: string;
  groupedSlots: readonly SectionGroup[];
  previewPath: string;
  slots: readonly TemplateCopySlot[];
  summary: TemplateCopyDetailSummary;
  templateKey: string;
  title: string;
}) {
  const hasSlots = slots.length > 0;

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] bg-white px-8 py-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
                {formatFamilyLabel(familyKey)}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                {title} copy review
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
                Review rendered copy in page order, grouped by section, before treating the
                archetype copy as approved.
              </p>
              <p className="mt-2 text-sm text-slate-500">{templateKey}</p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={previewPath}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
              >
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3.5 w-3.5" />
                Preview
              </Link>
            </div>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Approved
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCount(summary.approvedCount, summary.totalCount)}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Needs revision
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCount(summary.needsRevisionCount, summary.totalCount)}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Unreviewed
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCount(summary.unreviewedCount, summary.totalCount)}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Copy approved
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-950">
                {summary.copyApproved ? "yes" : "no"}
              </dd>
            </div>
          </dl>
        </header>

        {!hasSlots ? (
          <section className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-10 text-sm leading-6 text-slate-600 shadow-sm">
            No visible copy slots were extracted for this template yet.
          </section>
        ) : (
          <section className="grid gap-4">
            {groupedSlots.map((group) => (
              <article
                key={group.sectionKey}
                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                      <FontAwesomeIcon icon={faLayerGroup} className="h-3 w-3" />
                      {formatSectionLabel(group.sectionKey)}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                      {formatSectionLabel(group.sectionKey)}
                    </h2>
                  </div>
                  <p className="inline-flex items-center gap-2 text-sm text-slate-500">
                    <FontAwesomeIcon icon={faClipboardCheck} className="h-3.5 w-3.5" />
                    {group.slots.length} slot{group.slots.length === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-2">
                  {group.slots.map((slot) => (
                    <TemplateCopySlotCard key={slot.slotKey} slot={slot} />
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
