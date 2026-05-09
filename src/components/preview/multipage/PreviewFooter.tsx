import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faLocationDot, faClock } from "@fortawesome/free-solid-svg-icons";
import type { PreviewModel } from "@/lib/preview/types";
import { getPaletteForModel } from "@/lib/preview/palettes";
import {
  previewHomeUrl,
  previewServicesUrl,
  previewServiceUrl,
  previewServiceAreaUrl,
  previewAboutUrl,
  previewContactUrl,
  serviceSlug,
} from "@/lib/preview/multipage";

export function PreviewFooter({ model }: { model: PreviewModel }) {
  const palette = getPaletteForModel(model);

  return (
    <footer
      className="relative"
      style={{
        background: palette.inkBg,
        color: palette.inkText,
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-[1.4fr,1fr,1fr,1fr]">
        {/* Brand column */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em]" style={{ color: palette.accent }}>
            Local · Trusted · Same-day
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight">
            {model.business.name}
          </p>
          {model.business.city ? (
            <p className="mt-2 text-sm" style={{ color: palette.inkText, opacity: 0.7 }}>
              {model.business.city} and surrounding area
            </p>
          ) : null}
          {model.business.phoneDisplay ? (
            <a
              href={model.business.phoneTelHref ?? `tel:${model.business.phoneDisplay}`}
              className="mt-6 inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{
                background: palette.accent,
                color: palette.accentInk,
              }}
            >
              <FontAwesomeIcon icon={faPhone} className="h-3.5 w-3.5" />
              {model.business.phoneDisplay}
            </a>
          ) : null}
        </div>

        {/* Site map: Services */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: palette.accent }}>
            Services
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href={previewServicesUrl(model.slug)} className="transition hover:opacity-80" style={{ color: palette.inkText }}>
                All services
              </Link>
            </li>
            {model.services.items.map((service) => (
              <li key={service.title}>
                <Link
                  href={previewServiceUrl(model.slug, serviceSlug(service.title))}
                  className="transition hover:opacity-80"
                  style={{ color: palette.inkText, opacity: 0.85 }}
                >
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Site map: company */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: palette.accent }}>
            Company
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href={previewHomeUrl(model.slug)} className="transition hover:opacity-80" style={{ color: palette.inkText }}>
                Home
              </Link>
            </li>
            <li>
              <Link href={previewServiceAreaUrl(model.slug)} className="transition hover:opacity-80" style={{ color: palette.inkText, opacity: 0.85 }}>
                Service area
              </Link>
            </li>
            <li>
              <Link href={previewAboutUrl(model.slug)} className="transition hover:opacity-80" style={{ color: palette.inkText, opacity: 0.85 }}>
                About
              </Link>
            </li>
            <li>
              <Link href={previewContactUrl(model.slug)} className="transition hover:opacity-80" style={{ color: palette.inkText, opacity: 0.85 }}>
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Hours + address */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em]" style={{ color: palette.accent }}>
            Hours
          </p>
          <ul className="mt-4 space-y-2 text-sm" style={{ color: palette.inkText, opacity: 0.85 }}>
            <li className="flex justify-between gap-4">
              <span>Mon–Fri</span>
              <span>8a–6p</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Sat</span>
              <span>9a–2p</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Sun</span>
              <span>Closed</span>
            </li>
          </ul>
          {model.business.city ? (
            <address
              className="mt-6 not-italic flex items-start gap-2 text-sm"
              style={{ color: palette.inkText, opacity: 0.85 }}
            >
              <FontAwesomeIcon icon={faLocationDot} className="mt-1 h-3.5 w-3.5" style={{ color: palette.accent }} />
              <span>
                Serving {model.business.city}
                <br />
                and surrounding area
              </span>
            </address>
          ) : null}
        </div>
      </div>

      {/* Sub-footer */}
      <div
        className="border-t mx-auto max-w-6xl px-5 py-6 text-center text-xs sm:px-8"
        style={{
          borderColor: `${palette.inkText}1a`,
          color: palette.inkText,
          opacity: 0.6,
        }}
      >
        <p className="flex flex-wrap items-center justify-center gap-2">
          <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
          Site preview built for {model.business.name} by{" "}
          <a href="https://walkperro.com" className="underline underline-offset-4">
            WalkPerro
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
