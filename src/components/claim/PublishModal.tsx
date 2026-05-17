"use client";
import { useState, useTransition } from "react";

// Publish / Unpublish modal for the editor header. Replaces the single-click
// publish form action with a "Publish to the world?" confirmation. Same
// pattern for unpublish ("Take your site offline?") so the buyer has a
// clear reversal path.
//
// Server actions are passed in (bound to the token in the parent) so this
// stays a pure client component with no server-only imports.

export function PublishModal({
  isPublished,
  liveUrl,
  publishAction,
  unpublishAction,
}: {
  isPublished: boolean;
  liveUrl: string;
  publishAction: () => Promise<void>;
  unpublishAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const variant = isPublished ? "unpublish" : "publish";

  const onConfirm = () => {
    startTransition(async () => {
      try {
        if (variant === "publish") {
          await publishAction();
        } else {
          await unpublishAction();
        }
      } catch {
        // The server actions redirect, which throws NEXT_REDIRECT — that's
        // expected. Other errors fall through silently; the form action
        // pattern in Next 15 surfaces them via the framework boundary.
      } finally {
        setOpen(false);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className={
          isPublished
            ? "inline-flex items-center justify-center rounded-full border border-black/15 px-5 py-2 text-sm font-semibold text-[#0e0e0e] transition hover:-translate-y-0.5 hover:border-black/40 disabled:cursor-default disabled:opacity-50 disabled:hover:translate-y-0"
            : "inline-flex items-center justify-center rounded-full bg-[#ebff00] px-5 py-2 text-sm font-semibold text-[#0e0e0e] transition hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-40 disabled:hover:translate-y-0"
        }
      >
        {isPending ? "Working…" : isPublished ? "Unpublish" : "Publish"}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="publish-modal-title"
              className="text-xl font-semibold tracking-tight text-[#0e0e0e]"
            >
              {variant === "publish" ? "Publish your site?" : "Take your site offline?"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6b6b6b]">
              {variant === "publish" ? (
                <>
                  Your site goes live at{" "}
                  <span className="break-all font-mono text-[13px] text-[#0e0e0e]">
                    {liveUrl}
                  </span>{" "}
                  the moment you confirm. You can unpublish anytime to take it
                  back down.
                </>
              ) : (
                <>
                  Visitors won't be able to see your site. You can re-publish
                  anytime. Your edits stay intact.
                </>
              )}
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="inline-flex items-center justify-center rounded-full border border-black/15 px-5 py-2.5 text-sm font-semibold text-[#0e0e0e] hover:border-black/40 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isPending}
                className={
                  variant === "publish"
                    ? "inline-flex items-center justify-center rounded-full bg-[#0e0e0e] px-5 py-2.5 text-sm font-semibold text-[#ebff00] transition hover:bg-[#2a2a2a] disabled:opacity-50"
                    : "inline-flex items-center justify-center rounded-full bg-[#c33a3a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a52e2e] disabled:opacity-50"
                }
              >
                {isPending
                  ? "Working…"
                  : variant === "publish"
                    ? "Publish now"
                    : "Take it down"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
