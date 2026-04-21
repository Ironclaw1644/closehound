import {
  approveTemplateImageAction,
  rejectTemplateImageAction,
} from "@/app/internal/template-images/actions";
import {
  hasRenderableTemplateImageAsset,
  type ArchetypeImageCandidateRecord,
} from "@/lib/template-system/images/repository";
import { toTemplateImageObjectPath } from "@/lib/template-system/images/storage";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getCandidateThumbnailSrc(candidate: ArchetypeImageCandidateRecord) {
  if (candidate.assetUrl) {
    return candidate.assetUrl;
  }

  if (!candidate.storagePath) {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!supabaseUrl) {
    return null;
  }

  const objectPath = toTemplateImageObjectPath(candidate.storagePath);
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/template-images/${objectPath}`;
}

export function TemplateImageCard({
  candidate,
  approvedCandidate,
  canMutate,
}: {
  candidate: ArchetypeImageCandidateRecord;
  approvedCandidate?: ArchetypeImageCandidateRecord;
  canMutate: boolean;
}) {
  const thumbnailSrc = getCandidateThumbnailSrc(candidate);
  const isRenderable = hasRenderableTemplateImageAsset(candidate);
  const isCurrentApproved = approvedCandidate?.id === candidate.id;
  const approvedLabel = approvedCandidate
    ? `Approved in ${approvedCandidate.generationBatchId}`
    : "Not approved";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div className="relative min-h-[160px] bg-slate-100">
          {thumbnailSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnailSrc}
              alt={`${candidate.slot} candidate ${candidate.candidateIndex}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[160px] flex-col justify-between p-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Thumbnail unavailable
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  {candidate.storagePath || "No storage metadata is attached to this record."}
                </p>
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                Missing asset
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              {candidate.slot}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
              #{candidate.candidateIndex}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                isCurrentApproved
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {candidate.status}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                isRenderable ? "bg-sky-100 text-sky-900" : "bg-rose-100 text-rose-900"
              }`}
            >
              {isRenderable ? "renderable" : "missing asset"}
            </span>
          </div>

          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p>
              <span className="font-medium text-slate-900">Batch:</span>{" "}
              {candidate.generationBatchId}
            </p>
            <p>
              <span className="font-medium text-slate-900">Created:</span>{" "}
              {formatDateTime(candidate.createdAt)}
            </p>
            <p>
              <span className="font-medium text-slate-900">Prompt version:</span>{" "}
              {candidate.promptVersion}
            </p>
            <p>
              <span className="font-medium text-slate-900">Storage:</span>{" "}
              {candidate.storagePath || "n/a"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Approval state</p>
            <p className="mt-1 leading-6">{isCurrentApproved ? "Current slot winner" : approvedLabel}</p>
          </div>

          {canMutate ? (
            <form className="flex flex-wrap gap-3" action={approveTemplateImageAction}>
              <input type="hidden" name="candidateId" value={candidate.id} />
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Approve
              </button>
              <button
                type="submit"
                formAction={rejectTemplateImageAction}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Reject
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </article>
  );
}
