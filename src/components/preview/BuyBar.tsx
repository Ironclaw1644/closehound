"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { getPaletteByKey } from "@/lib/preview/palettes";

export function BuyBar({ model }: { model: PreviewModel }) {
  const palette = getPaletteByKey(model.paletteKey);

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
          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          style={{ background: palette.accent, color: palette.accentInk }}
        >
          {model.buy.ctaLabel}
          <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
