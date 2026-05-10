"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faSpinner } from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { getPaletteForModel } from "@/lib/preview/palettes";

export function BuyBar({ model }: { model: PreviewModel }) {
  // Honor the buyer's brand.accent override (set in the editor's Brand tab) on
  // top of the per-industry palette. Falls back to the industry default when
  // the buyer hasn't picked a custom accent.
  const palette = getPaletteForModel(model);
  // Spinner + disable on click — Stripe checkout has a brief redirect lag
  // and we don't want eager prospects to double-click. The flag stays true
  // until the page unloads (the user is navigating away).
  const [navigating, setNavigating] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0d12]/95 px-4 py-3 backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="hidden sm:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
            For {model.business.name}
          </p>
          <p className="text-sm text-white/85">
            {model.buy.headline} <span className="text-white/55">{model.buy.subhead}</span>
          </p>
        </div>
        <a
          href={model.buy.href}
          onClick={() => setNavigating(true)}
          aria-disabled={navigating}
          className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
            navigating ? "pointer-events-none opacity-80" : ""
          }`}
          style={{ background: palette.accent, color: palette.accentInk }}
        >
          {navigating ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="h-3.5 w-3.5 animate-spin" />
              Opening checkout…
            </>
          ) : (
            <>
              {model.buy.ctaLabel}
              <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
            </>
          )}
        </a>
      </div>
    </div>
  );
}
