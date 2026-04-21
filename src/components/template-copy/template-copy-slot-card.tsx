import {
  faCircleCheck,
  faClockRotateLeft,
  faFilePen,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  approveTemplateCopySlotAction,
  reviseTemplateCopySlotAction,
} from "@/app/internal/template-copy/actions";
import type { TemplateCopySlot } from "@/lib/template-system/copy-review/types";

function statusStyles(status: TemplateCopySlot["status"]) {
  if (status === "approved") {
    return {
      className: "bg-emerald-100 text-emerald-900",
      icon: faCircleCheck,
      label: "Approved",
    };
  }

  if (status === "needs-revision") {
    return {
      className: "bg-amber-100 text-amber-900",
      icon: faFilePen,
      label: "Needs revision",
    };
  }

  return {
    className: "bg-slate-100 text-slate-700",
    icon: faClockRotateLeft,
    label: "Unreviewed",
  };
}

function formatRoleLabel(role: string) {
  return role
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatSectionLabel(sectionKey: string) {
  return sectionKey
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function TemplateCopySlotCard({
  slot,
}: {
  slot: TemplateCopySlot;
}) {
  const status = statusStyles(slot.status);

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${status.className}`}
        >
          <FontAwesomeIcon icon={status.icon} className="h-3 w-3" />
          {status.label}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700">
          {formatRoleLabel(slot.slotRole)}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          #{slot.pageOrder}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Current text
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-800">{slot.currentText}</p>
        </div>

        {slot.proposedText ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-800">
              Proposed revision
            </p>
            <p className="mt-3 text-sm leading-7 text-amber-950">{slot.proposedText}</p>
          </div>
        ) : null}

        {slot.reviewNotes ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Review notes
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{slot.reviewNotes}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium uppercase tracking-[0.18em]">
          <FontAwesomeIcon icon={faLayerGroup} className="h-3 w-3" />
          {formatSectionLabel(slot.sectionKey)}
        </span>
      </div>

      <form className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <input type="hidden" name="templateKey" value={slot.templateKey} />
        <input type="hidden" name="slotKey" value={slot.slotKey} />

        <div className="space-y-2">
          <label
            htmlFor={`${slot.slotKey}-proposed-text`}
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500"
          >
            Proposed text
          </label>
          <textarea
            id={`${slot.slotKey}-proposed-text`}
            name="proposedText"
            defaultValue={slot.proposedText ?? ""}
            rows={4}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-slate-500"
            placeholder="Optional replacement text for revision states"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`${slot.slotKey}-review-notes`}
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500"
          >
            Review notes
          </label>
          <textarea
            id={`${slot.slotKey}-review-notes`}
            name="reviewNotes"
            defaultValue={slot.reviewNotes ?? ""}
            rows={3}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-slate-500"
            placeholder="Optional reviewer notes"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            formAction={approveTemplateCopySlotAction}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Approve
          </button>
          <button
            type="submit"
            formAction={reviseTemplateCopySlotAction}
            name="decision"
            value="revise_tone"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Revise tone
          </button>
          <button
            type="submit"
            formAction={reviseTemplateCopySlotAction}
            name="decision"
            value="revise_fit"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Revise fit
          </button>
          <button
            type="submit"
            formAction={reviseTemplateCopySlotAction}
            name="decision"
            value="replace"
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100"
          >
            Replace
          </button>
        </div>
      </form>
    </article>
  );
}
