import Link from "next/link";

import type {
  TemplateImageBatchSummary,
  TemplateReviewSummary,
} from "@/lib/template-system/images/repository";
import type { TemplateImageReviewConfig } from "@/lib/template-system/images/review-registry";

function formatCount(approved: number, total: number) {
  return `${approved}/${total}`;
}

export type TemplateImageIndexItem = {
  batches: readonly TemplateImageBatchSummary[];
  config: TemplateImageReviewConfig;
  summary: TemplateReviewSummary;
};

export function TemplateImageIndex({
  items,
  notice,
}: {
  items: readonly TemplateImageIndexItem[];
  notice?: string | null;
}) {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] bg-slate-950 px-8 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-300">
            Internal Template Image Review
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Review generated image batches by template.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
            Pick a template to inspect batches, compare current approved slot winners, and
            jump between the normal live preview and batch-specific inspection mode.
          </p>
        </header>

        {notice ? (
          <section className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
            {notice}
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          {items.map((item) => {
            const latestBatchId = item.batches[0]?.generationBatchId ?? null;

            return (
              <article
                key={item.config.templateKey}
                className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                      {item.config.templateKey}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      {item.config.label}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      item.summary.isPreviewSafe
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {item.summary.isPreviewSafe ? "preview safe" : "needs approvals"}
                  </span>
                </div>

                <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <dt>Latest batch</dt>
                    <dd className="font-medium text-slate-950">
                      {latestBatchId ?? "No batches yet"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Required approvals</dt>
                    <dd className="font-medium text-slate-950">
                      {formatCount(item.summary.requiredApprovedCount, item.summary.requiredTotalCount)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt>Optional approvals</dt>
                    <dd className="font-medium text-slate-950">
                      {formatCount(item.summary.optionalApprovedCount, item.summary.optionalTotalCount)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                    {item.batches.length ? `${item.batches.length} batch${item.batches.length === 1 ? "" : "es"}` : "Unseeded"}
                  </p>
                  <Link
                    href={`/internal/template-images/${item.config.templateKey}`}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Open review
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
