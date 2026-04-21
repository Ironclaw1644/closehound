import {
  faArrowUpRightFromSquare,
  faClipboardCheck,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

type TemplateCopyIndexItem = {
  templateKey: string;
  familyKey: string;
  label: string;
  previewPath: string;
  summary: {
    approvedCount: number;
    needsRevisionCount: number;
    unreviewedCount: number;
    totalCount: number;
    copyApproved: boolean;
  };
};

function formatFamilyLabel(familyKey: string) {
  if (familyKey === "blue-collar-service") {
    return "Blue-Collar Service";
  }

  if (familyKey === "health-wellness") {
    return "Health & Wellness";
  }

  return familyKey.replace(/-/g, " ");
}

function formatCount(value: number, total: number) {
  return `${value}/${total}`;
}

export function TemplateCopyIndex({
  items,
}: {
  items: readonly TemplateCopyIndexItem[];
}) {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8 text-slate-950 sm:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[28px] bg-slate-950 px-8 py-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-300">
            Internal Template Copy Review
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Review visible template copy before approval.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
            Each template lists its rendered copy inventory, current review state, and the
            preview route used by the archetype page.
          </p>
        </header>

        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.templateKey}
              className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                    {formatFamilyLabel(item.familyKey)}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {item.label}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{item.templateKey}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    item.summary.copyApproved
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {item.summary.copyApproved ? "copy approved" : "needs review"}
                </span>
              </div>

              <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-4">
                  <dt className="inline-flex items-center gap-2">
                    <FontAwesomeIcon icon={faClipboardCheck} className="h-3.5 w-3.5" />
                    Approved
                  </dt>
                  <dd className="font-medium text-slate-950">
                    {formatCount(item.summary.approvedCount, item.summary.totalCount)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="inline-flex items-center gap-2">
                    <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" />
                    Needs revision
                  </dt>
                  <dd className="font-medium text-slate-950">
                    {formatCount(item.summary.needsRevisionCount, item.summary.totalCount)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Unreviewed</dt>
                  <dd className="font-medium text-slate-950">
                    {formatCount(item.summary.unreviewedCount, item.summary.totalCount)}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/internal/template-copy/${item.templateKey}`}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open review
                </Link>
                <Link
                  href={item.previewPath}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="h-3.5 w-3.5" />
                  Preview
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
