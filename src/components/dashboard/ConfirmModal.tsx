"use client";
import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

// Reusable "Are you sure?" modal for destructive bulk actions on the
// dashboard. Same visual language as LeadHoundDialog (dark panel + accent
// pill button). Escape closes; click-outside closes; focus traps to the
// confirm button when mounted.

export type ConfirmModalProps = {
  open: boolean;
  title: string;
  body: string;
  /** Button label for the confirm action. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Button label for cancel. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Style — "destructive" uses red, "primary" uses accent. */
  tone?: "destructive" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  // Focus the confirm button on open; Escape closes the modal.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => confirmRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && document.activeElement === confirmRef.current) {
        // Default form-like behavior on Enter when focused.
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open) return null;

  const confirmStyle =
    tone === "destructive"
      ? "bg-rose-500/90 text-white hover:bg-rose-500"
      : "bg-[color:var(--op-accent)] text-[color:var(--op-bg)] hover:opacity-90";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[color:var(--op-border)] bg-[color:var(--op-panel)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {tone === "destructive" ? (
            <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-rose-500/15 text-rose-300">
              <FontAwesomeIcon icon={faTriangleExclamation} className="h-4 w-4" />
            </span>
          ) : null}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h2
                id="confirm-modal-title"
                className="text-base font-semibold text-[color:var(--op-text)]"
              >
                {title}
              </h2>
              <button
                type="button"
                onClick={onCancel}
                className="text-[color:var(--op-text-subtle)] hover:text-[color:var(--op-text)]"
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-[color:var(--op-text-muted)]">
              {body}
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--op-border)] px-3 py-1.5 text-xs hover:bg-[color:var(--op-panel-soft)]"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${confirmStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
