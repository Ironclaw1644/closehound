"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
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
  { label: "Services", href: previewServicesUrl, slug: "services" },
  { label: "Service Area", href: previewServiceAreaUrl, slug: "service-area" },
  { label: "About", href: previewAboutUrl, slug: "about" },
  { label: "Contact", href: previewContactUrl, slug: "contact" },
] as const;

export function PreviewNav({
  model,
  active,
}: {
  model: PreviewModel;
  active?: "home" | "services" | "service-area" | "about" | "contact";
}) {
  const palette = getPaletteForModel(model);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on resize past the md breakpoint so reopening on
  // mobile starts clean.
  useEffect(() => {
    if (!menuOpen) return;
    const onResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [menuOpen]);

  // Lock body scroll when the menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

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
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:gap-6">
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
          <div className="min-w-0 leading-tight">
            <p
              className="truncate text-[15px] font-semibold tracking-tight"
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

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.slug;
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

        <div className="flex items-center gap-2">
          {/* Primary CTA — always visible */}
          {model.business.phoneDisplay ? (
            <a
              href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
              className="group inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition hover:-translate-y-0.5 sm:px-4"
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

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            style={{
              background: palette.surface,
              color: palette.text,
              border: `1px solid ${palette.border}`,
            }}
          >
            <FontAwesomeIcon icon={faBars} className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile menu sheet — slides in from the top, fills the viewport */}
      {menuOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-50 flex flex-col md:hidden"
          style={{ background: palette.background, color: palette.text }}
        >
          {/* Sheet header mirrors the main header so the brand stays anchored. */}
          <div
            className="flex items-center justify-between gap-3 px-5 py-4"
            style={{ borderBottom: `1px solid ${palette.border}` }}
          >
            <span
              className="text-[15px] font-semibold tracking-tight"
              style={{ color: palette.text }}
            >
              {model.business.name}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: palette.surface,
                color: palette.text,
                border: `1px solid ${palette.border}`,
              }}
            >
              <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-5 py-6">
            <Link
              href={previewHomeUrl(model.slug)}
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-semibold transition"
              style={{
                background: active === "home" ? palette.surface : "transparent",
                color: active === "home" ? palette.accent : palette.text,
              }}
            >
              Home
            </Link>
            {NAV_LINKS.map((link) => {
              const isActive = active === link.slug;
              return (
                <Link
                  key={link.label}
                  href={link.href(model.slug)}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-semibold transition"
                  style={{
                    background: isActive ? palette.surface : "transparent",
                    color: isActive ? palette.accent : palette.text,
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          {model.business.phoneDisplay ? (
            <div className="px-5 pb-6">
              <a
                href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
                onClick={() => setMenuOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-base font-semibold"
                style={{
                  background: palette.accent,
                  color: palette.accentInk,
                }}
              >
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                {model.business.phoneDisplay}
              </a>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
