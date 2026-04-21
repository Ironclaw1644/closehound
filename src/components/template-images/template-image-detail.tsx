import Link from "next/link";
import type { ReactNode } from "react";

import { TemplateImageCard } from "@/components/template-images/template-image-card";
import type { ArchetypeImageCandidateRecord, TemplateReviewSummary } from "@/lib/template-system/images/repository";
import type { TemplateImageBatchSummary } from "@/lib/template-system/images/repository";
import type { TemplateImageReviewConfig } from "@/lib/template-system/images/review-registry";

function formatCount(approved: number, total: number) {
  return `${approved}/${total}`;
}

export type TemplateImageDetailSlotState = {
  approvedCandidate?: ArchetypeImageCandidateRecord;
  candidates: readonly ArchetypeImageCandidateRecord[];
  required: boolean;
  slotKey: string;
};

export function TemplateImageDetail({
  batches,
  canMutate,
  config,
  inspectionPreviewHref,
  notice,
  livePreviewHref,
  requestedBatchId,
  selectedBatchId,
  selectedBatchMissing,
  slotStates,
  summary,
}: {
  batches: readonly TemplateImageBatchSummary[];
  canMutate: boolean;
  config: TemplateImageReviewConfig;
  inspectionPreviewHref: string | null;
  notice?: string | null;
  livePreviewHref: string;
  requestedBatchId: string | null;
  selectedBatchId: string | null;
  selectedBatchMissing: boolean;
  slotStates: readonly TemplateImageDetailSlotState[];
  summary: TemplateReviewSummary;
}) {
  let batchContent: ReactNode = null;
  const selectedBatchHasCandidates = slotStates.some(
    (slotState) => slotState.candidates.length > 0
  );

  if (selectedBatchId) {
    batchContent = (
      <>
        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-950">Approved slots</h2>
            <p className="text-sm text-slate-500">
              The approved candidate can live in an older batch than the one selected above.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {slotStates.map((slotState) => (
              <div
                key={slotState.slotKey}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                    {slotState.slotKey}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                    {slotState.required ? "required" : "optional"}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {slotState.approvedCandidate
                    ? `Approved in batch ${slotState.approvedCandidate.generationBatchId}`
                    : "No approved candidate for this slot yet."}
                </p>
              </div>
            ))}
          </div>
        </section>

        {selectedBatchHasCandidates ? (
          <section className="grid gap-4">
            {slotStates.map((slotState) => (
              <article
                key={slotState.slotKey}
                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                        {slotState.slotKey}
                      </h2>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
                        {slotState.required ? "required" : "optional"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {slotState.approvedCandidate
                        ? `Current approved candidate: batch ${slotState.approvedCandidate.generationBatchId}, index ${slotState.approvedCandidate.candidateIndex}`
                        : "No approved candidate in history for this slot."}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {slotState.candidates.length} candidate
                    {slotState.candidates.length === 1 ? "" : "s"} in selected batch
                  </p>
                </div>

                {slotState.candidates.length ? (
                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {slotState.candidates.map((candidate) => (
                      <TemplateImageCard
                        key={candidate.id}
                        candidate={candidate}
                        approvedCandidate={slotState.approvedCandidate}
                        canMutate={canMutate}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    No candidates were found for this slot in the selected batch.
                  </p>
                )}
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-10 text-sm leading-6 text-slate-600 shadow-sm">
            Batch {selectedBatchId} exists, but no candidate records were found for it.
          </section>
        )}
      </>
    );
  } else if (batches.length === 0) {
    batchContent = (
      <section className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-10 text-sm leading-6 text-slate-600 shadow-sm">
        No batches are available for this template yet, so there is nothing to inspect.
      </section>
    );
  } else if (selectedBatchMissing) {
    batchContent = (
      <section className="rounded-[24px] border border-amber-200 bg-amber-50 px-6 py-10 text-sm leading-6 text-amber-900 shadow-sm">
        Requested batch {requestedBatchId} does not exist for {config.templateKey}. Choose one
        of the available batches above.
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] bg-white px-8 py-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
                {config.templateKey}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
                {config.label} image review
              </h1>
              <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
                Batch history stays intact, but approval state is global per slot. The currently
                approved image for each slot remains visible even when you inspect an older batch.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={livePreviewHref}
                className="rounded-full bg-slate-950 px-4 py-2 font-semibold text-white transition hover:bg-slate-800"
              >
                Live preview
              </Link>
              {inspectionPreviewHref ? (
                <Link
                  href={inspectionPreviewHref}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Inspect selected batch
                </Link>
              ) : null}
            </div>
          </div>

          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Required approvals
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCount(summary.requiredApprovedCount, summary.requiredTotalCount)}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Optional approvals
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCount(summary.optionalApprovedCount, summary.optionalTotalCount)}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Preview safe
              </dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-950">
                {summary.isPreviewSafe ? "yes" : "no"}
              </dd>
            </div>
          </dl>

          {notice ? (
            <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
              {notice}
            </section>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="font-medium text-slate-900">Selected batch:</span>
            <span>
              {selectedBatchId ??
                (batches.length === 0
                  ? "No batches yet"
                  : selectedBatchMissing
                    ? `Requested batch ${requestedBatchId} was not found`
                    : "No batches yet")}
            </span>
            {requestedBatchId && selectedBatchMissing && batches.length > 0 ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-900">
                requested batch missing
              </span>
            ) : null}
          </div>
        </header>

        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-950">Batch selector</h2>
            <p className="text-sm text-slate-500">
              {batches.length ? `${batches.length} batch${batches.length === 1 ? "" : "es"} loaded` : "No batches available"}
            </p>
          </div>

          {batches.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {batches.map((batch) => {
                const isSelected = batch.generationBatchId === selectedBatchId;

                return (
                  <Link
                    key={batch.generationBatchId}
                    href={`/internal/template-images/${config.templateKey}?batch=${encodeURIComponent(batch.generationBatchId)}`}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {batch.generationBatchId}
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              No candidate batches have been generated for this template yet.
            </p>
          )}
        </section>

        {batchContent}
      </div>
    </main>
  );
}
