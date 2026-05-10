"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

// Small top-right toast with an Undo affordance and a countdown bar. Used
// after destructive bulk actions on the dashboard so the operator has a
// 4-second window to revert. The component owns its own countdown timer and
// auto-dismisses if Undo isn't clicked.

export type UndoToastProps = {
  open: boolean;
  message: string;
  /** Total ms the toast stays visible before auto-dismissing. */
  durationMs?: number;
  onUndo: () => void;
  onDismiss: () => void;
};

export function UndoToast({
  open,
  message,
  durationMs = 4000,
  onUndo,
  onDismiss,
}: UndoToastProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!open) {
      setElapsed(0);
      return;
    }
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const e = Date.now() - startedAt;
      setElapsed(e);
      if (e >= durationMs) {
        window.clearInterval(id);
        onDismiss();
      }
    }, 80);
    return () => window.clearInterval(id);
  }, [open, durationMs, onDismiss]);

  if (!open) return null;

  const progress = Math.min(1, elapsed / durationMs);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 w-[320px] overflow-hidden rounded-xl border border-[color:var(--op-border-strong)] bg-[color:var(--op-panel)] shadow-[0_18px_40px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="text-sm text-[color:var(--op-text)]">{message}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onUndo}
            className="rounded-md bg-[color:var(--op-accent)] px-2.5 py-1 text-xs font-semibold text-[color:var(--op-bg)] hover:opacity-90"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md p-1 text-[color:var(--op-text-subtle)] hover:text-[color:var(--op-text)]"
            aria-label="Dismiss"
          >
            <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
          </button>
        </div>
      </div>
      {/* Countdown bar */}
      <div
        className="h-0.5 bg-[color:var(--op-accent)] transition-[width]"
        style={{
          width: `${(1 - progress) * 100}%`,
          transitionDuration: "80ms",
        }}
      />
    </div>
  );
}
