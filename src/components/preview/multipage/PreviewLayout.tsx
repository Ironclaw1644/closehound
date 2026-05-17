import type { ReactNode } from "react";
import { PreviewNav } from "@/components/preview/multipage/PreviewNav";
import { PreviewFooter } from "@/components/preview/multipage/PreviewFooter";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/preview/multipage/Breadcrumbs";
import { BuyBar } from "@/components/preview/BuyBar";
import { getPaletteForModel } from "@/lib/preview/palettes";
import { INDUSTRY_FONT_CLASS } from "@/lib/preview/fonts";
import type { PreviewModel } from "@/lib/preview/types";

// PreviewLayout is the wrapper for ALL multi-page deep routes (services,
// service-area, about, contact, per-service detail). It:
// - Picks the industry-specific font CSS variables onto the wrapper.
// - Sets the page background from the palette.
// - Renders the nav at top, breadcrumbs below, content, footer, and the
//   sticky BuyBar so prospects can buy from any subpage, not just the home.

export function PreviewLayout({
  model,
  active,
  breadcrumbs,
  children,
}: {
  model: PreviewModel;
  active?: "home" | "services" | "service-area" | "about" | "contact";
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
}) {
  const palette = getPaletteForModel(model);
  const fontClasses = INDUSTRY_FONT_CLASS[model.industry];

  return (
    <div
      className={`${fontClasses} min-h-screen pb-24`}
      style={{
        background: palette.background,
        color: palette.text,
      }}
    >
      {/* Skip link for keyboard users — invisible until focused, then jumps
          past the nav and breadcrumbs straight to the page content. Important
          for screen-reader and keyboard-only users; doesn't affect mouse UX. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:no-underline focus:shadow-lg"
        style={{
          background: palette.accent,
          color: palette.accentInk,
        }}
      >
        Skip to main content
      </a>
      <PreviewNav model={model} active={active} />
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <Breadcrumbs model={model} trail={breadcrumbs} />
      ) : null}
      <main id="main-content">{children}</main>
      <PreviewFooter model={model} />
      <BuyBar model={model} />
    </div>
  );
}
