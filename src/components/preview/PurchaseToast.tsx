"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleInfo, faXmark } from "@fortawesome/free-solid-svg-icons";

// Toast that surfaces Stripe checkout return state. Stripe redirects back to
// /preview/<slug>?purchase=success or ?purchase=cancelled — the page reads
// that query param and mounts this component to show a banner.
//
// Auto-dismisses after 8 s (longer than the saved banner because the buyer
// just paid a real $497 and we want them to see it). Click X to dismiss.

export type PurchaseToastProps = {
  status: "success" | "cancelled";
};

export function PurchaseToast({ status }: PurchaseToastProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 8000);
    return () => clearTimeout(t);
  }, []);

  // After dismissing, also clean up the URL so a reload doesn't re-trigger.
  useEffect(() => {
    if (open) return;
    const url = new URL(window.location.href);
    if (url.searchParams.has("purchase")) {
      url.searchParams.delete("purchase");
      window.history.replaceState({}, "", url.toString());
    }
  }, [open]);

  if (!open) return null;

  const isSuccess = status === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 transform"
    >
      <div
        className={`flex items-start gap-3 rounded-2xl border px-5 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.18)] backdrop-blur ${
          isSuccess
            ? "border-emerald-500/40 bg-emerald-500/95 text-white"
            : "border-zinc-500/30 bg-zinc-100/95 text-zinc-900"
        }`}
      >
        <FontAwesomeIcon
          icon={isSuccess ? faCircleCheck : faCircleInfo}
          className="mt-0.5 h-5 w-5 flex-none"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {isSuccess ? "Payment received." : "Checkout cancelled."}
          </p>
          <p className="mt-0.5 text-sm leading-5 opacity-90">
            {isSuccess
              ? "Check your inbox for your claim link — you'll get an email in the next minute or two."
              : "No charge. Whenever you're ready, click Buy this site again."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Dismiss"
          className="rounded-md p-1 opacity-70 hover:opacity-100"
        >
          <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
