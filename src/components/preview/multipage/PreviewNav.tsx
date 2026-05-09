import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { getPaletteForModel } from "@/lib/preview/palettes";
import {
  previewHomeUrl,
  previewServicesUrl,
  previewServiceAreaUrl,
  previewAboutUrl,
  previewContactUrl,
} from "@/lib/preview/multipage";

const NAV_LINKS = [
  { label: "Services", href: previewServicesUrl },
  { label: "Service Area", href: previewServiceAreaUrl },
  { label: "About", href: previewAboutUrl },
  { label: "Contact", href: previewContactUrl },
] as const;

export function PreviewNav({
  model,
  active,
}: {
  model: PreviewModel;
  active?: "home" | "services" | "service-area" | "about" | "contact";
}) {
  const palette = getPaletteForModel(model);
  const initials = model.business.name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur"
      style={{
        background: `${palette.surface}cc`,
        borderBottom: `1px solid ${palette.border}`,
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        {/* Brand block */}
        <Link
          href={previewHomeUrl(model.slug)}
          className="flex items-center gap-3 transition hover:opacity-90"
        >
          {model.assets.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={model.assets.logoUrl}
              alt={`${model.business.name} logo`}
              className="h-10 w-10 rounded-lg object-cover"
              style={{ outline: `1px solid ${palette.border}` }}
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold"
              style={{
                background: palette.inkBg,
                color: palette.inkText,
              }}
            >
              {initials}
            </div>
          )}
          <div className="leading-tight">
            <p
              className="text-[15px] font-semibold tracking-tight"
              style={{ color: palette.text }}
            >
              {model.business.name}
            </p>
            {model.business.city ? (
              <p
                className="text-[10px] uppercase tracking-[0.28em]"
                style={{ color: palette.textMuted }}
              >
                {model.business.city}
              </p>
            ) : null}
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.label.toLowerCase().replace(/\s+/g, "-");
            return (
              <Link
                key={link.label}
                href={link.href(model.slug)}
                className="relative inline-flex transition hover:opacity-80"
                style={{
                  color: isActive ? palette.accent : palette.text,
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {link.label}
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: palette.accent }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Primary CTA */}
        {model.business.phoneDisplay ? (
          <a
            href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
            className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
            style={{
              background: palette.accent,
              color: palette.accentInk,
              boxShadow: `0 2px 0 ${palette.inkBg}33, 0 8px 18px ${palette.accent}33`,
            }}
          >
            <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5 transition group-hover:rotate-[-12deg]" />
            <span className="hidden sm:inline">{model.business.phoneDisplay}</span>
            <span className="sm:hidden">Call</span>
          </a>
        ) : null}
      </div>
    </header>
  );
}
