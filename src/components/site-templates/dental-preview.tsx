import {
  faBuilding,
  faCalendarCheck,
  faCircleQuestion,
  faClipboardCheck,
  faEnvelope,
  faLocationDot,
  faPhone,
  faShieldHeart,
  faTooth,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type {
  DentalPreviewIcon,
  DentalPreviewModel,
} from "@/lib/template-system/dental-preview";

const iconMap: Record<DentalPreviewIcon, IconDefinition> = {
  tooth: faTooth,
  "shield-heart": faShieldHeart,
  "calendar-check": faCalendarCheck,
  "clipboard-check": faClipboardCheck,
  "location-dot": faLocationDot,
  envelope: faEnvelope,
  phone: faPhone,
  building: faBuilding,
  "circle-question": faCircleQuestion,
};

const editorialSerif = {
  fontFamily:
    '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
};

const clinicalSans = {
  fontFamily:
    '"Helvetica Neue", "Arial Nova", Arial, sans-serif',
};

function IconChip({
  icon,
  className = "",
}: {
  icon: DentalPreviewIcon;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#c7d6d9] bg-white text-[#1f4d57] shadow-[0_12px_24px_rgba(23,52,59,0.08)] ${className}`.trim()}
    >
      <FontAwesomeIcon icon={iconMap[icon]} className="h-4 w-4" />
    </span>
  );
}

export function DentalPreview({ model }: { model: DentalPreviewModel }) {
  return (
    <main
      className="min-h-screen bg-[linear-gradient(180deg,#f3f7f7_0%,#edf4f4_42%,#f8fbfb_100%)] text-[#17343b]"
      style={clinicalSans}
    >
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <section className="overflow-hidden rounded-[34px] border border-[#cfdcde] bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(238,246,246,0.96)_60%,rgba(228,240,241,0.98)_100%)] shadow-[0_28px_90px_rgba(29,63,72,0.10)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_420px]">
            <div className="px-8 py-10 sm:px-12 sm:py-14">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#557b84]">
                <IconChip icon={model.hero.badgeIcon} className="h-9 w-9 rounded-xl" />
                <span>{model.hero.badgeLabel}</span>
                <span className="h-1 w-1 rounded-full bg-[#8cb1b8]" />
                <span>{model.serviceAreaLabel}</span>
              </div>
              <h1
                className="mt-6 max-w-3xl text-5xl leading-[0.94] tracking-[-0.045em] text-[#16343b] sm:text-6xl"
                style={editorialSerif}
              >
                {model.hero.heading}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#47656d]">
                {model.hero.body}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={model.hero.primaryCta.href}
                  className="inline-flex items-center gap-3 rounded-full bg-[#173f47] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0f3138]"
                >
                  <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4" />
                  {model.hero.primaryCta.label}
                </a>
                {model.hero.secondaryCta ? (
                  <a
                    href={model.hero.secondaryCta.href}
                    className="inline-flex items-center gap-3 rounded-full border border-[#b8ccd0] bg-white/85 px-6 py-3.5 text-sm font-semibold text-[#204750] backdrop-blur transition hover:bg-white"
                  >
                    <FontAwesomeIcon icon={faTooth} className="h-4 w-4 text-[#5a8891]" />
                    {model.hero.secondaryCta.label}
                  </a>
                ) : null}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: "shield-heart" as const,
                    title: "Practical recommendations",
                    body: "Treatment options stay focused on what matters now, what can wait, and how to move forward clearly.",
                  },
                  {
                    icon: "clipboard-check" as const,
                    title: "Plainspoken visits",
                    body: "Exams, findings, and next steps are explained in direct language without cosmetic-glam framing.",
                  },
                  {
                    icon: "building" as const,
                    title: "Modern local office",
                    body: "Bright rooms, clean lines, and a calm front-desk experience that feels organized from the start.",
                  },
                ].map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[24px] border border-white/70 bg-white/78 p-5 backdrop-blur"
                  >
                    <IconChip icon={item.icon} />
                    <h2
                      className="mt-4 text-2xl tracking-[-0.035em] text-[#17343b]"
                      style={editorialSerif}
                    >
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#56737b]">
                      {item.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="border-t border-[#d5e2e4] bg-[#deebed] p-5 lg:border-l lg:border-t-0">
              <div className="flex h-full flex-col rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,#f8fbfb_0%,#eef5f5_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                {model.hero.imageSrc ? (
                  <div className="overflow-hidden rounded-[24px] bg-[#dbe8ea]">
                    <img
                      src={model.hero.imageSrc}
                      alt={model.hero.heading}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/5] items-end rounded-[24px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef6f7_56%,#dbe9eb_100%)] p-5">
                    <div className="rounded-[22px] border border-white/80 bg-white/88 p-5 shadow-[0_10px_24px_rgba(28,60,68,0.08)]">
                      <IconChip icon="building" />
                      <h2
                        className="mt-4 text-2xl tracking-[-0.035em] text-[#18353c]"
                        style={editorialSerif}
                      >
                        Calm, bright, and clearly organized.
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-[#5e7b83]">
                        The preview keeps the clinical atmosphere modern without inventing optional proof sections.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-5 rounded-[24px] bg-[#173f47] px-5 py-5 text-[#edf7f8]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#abd0d6]">
                    Visit details
                  </p>
                  <p className="mt-3 text-base leading-7 text-[#deeff1]">
                    {model.gallery?.body ||
                      "Call or request an appointment to get a clear first step before your visit."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-[#cfe5e8]">
                    <span className="inline-flex items-center gap-2">
                      <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                      {model.serviceAreaLabel}
                    </span>
                    {model.contact.phone ? (
                      <span className="inline-flex items-center gap-2">
                        <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                        {model.contact.phone}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="mt-8 rounded-[32px] border border-[#d1dfe1] bg-white/90 px-8 py-10 shadow-[0_20px_70px_rgba(34,69,77,0.08)] backdrop-blur sm:px-10"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#6d8d94]">
                Featured services
              </p>
              <h2
                className="mt-3 text-4xl tracking-[-0.04em] text-[#17343b]"
                style={editorialSerif}
              >
                Dental services for prevention and restorative care
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#5e7980]">
              Cleanings, exams, fillings, and related care are presented in a way that keeps first steps easy to understand.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {model.featuredServices.map((item, index) => (
              <article
                key={`${item.title ?? "service"}-${index}`}
                className="rounded-[24px] border border-[#e4ecee] bg-[linear-gradient(180deg,#ffffff_0%,#f5f9fa_100%)] p-6"
              >
                <IconChip icon={item.icon} />
                {item.title ? (
                  <h3
                    className="mt-5 text-2xl tracking-[-0.03em] text-[#17343b]"
                    style={editorialSerif}
                  >
                    {item.title}
                  </h3>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-[#5f7880]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {model.about || model.whyChooseUs ? (
          <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            {model.about ? (
              <article className="rounded-[32px] border border-[#d1dfe1] bg-[#173f47] px-8 py-10 text-[#edf7f8] shadow-[0_24px_90px_rgba(25,55,63,0.20)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a7cfd5]">
                  About the office
                </p>
                <h2 className="mt-4 text-4xl tracking-[-0.04em]" style={editorialSerif}>
                  {model.about.heading}
                </h2>
                <p className="mt-5 text-base leading-8 text-[#d9ebee]">{model.about.body}</p>
              </article>
            ) : null}

            {model.whyChooseUs ? (
              <article className="rounded-[32px] border border-[#d1dfe1] bg-white px-8 py-10 shadow-[0_24px_80px_rgba(34,69,77,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d8d94]">
                  Why choose this practice
                </p>
                <h2
                  className="mt-4 text-4xl tracking-[-0.04em] text-[#17343b]"
                  style={editorialSerif}
                >
                  {model.whyChooseUs.heading}
                </h2>
                <div className="mt-6 grid gap-4">
                  {model.whyChooseUs.items.map((item, index) => (
                    <article
                      key={`${item.title ?? "why"}-${index}`}
                      className="rounded-[22px] border border-[#e4ecee] bg-[#f8fbfb] p-5"
                    >
                      <div className="flex items-start gap-4">
                        <IconChip icon={item.icon} className="mt-1" />
                        <div>
                          {item.title ? (
                            <h3
                              className="text-2xl tracking-[-0.03em] text-[#17343b]"
                              style={editorialSerif}
                            >
                              {item.title}
                            </h3>
                          ) : null}
                          <p className="mt-2 text-sm leading-6 text-[#5f7880]">{item.body}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            ) : null}
          </section>
        ) : null}

        {model.process || model.gallery ? (
          <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            {model.process ? (
              <article className="rounded-[32px] border border-[#d1dfe1] bg-white px-8 py-10 shadow-[0_22px_78px_rgba(34,69,77,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d8d94]">
                  Visit process
                </p>
                <h2
                  className="mt-4 text-4xl tracking-[-0.04em] text-[#17343b]"
                  style={editorialSerif}
                >
                  {model.process.heading}
                </h2>
                <div className="mt-8 grid gap-4">
                  {model.process.items.map((item, index) => (
                    <article
                      key={`${item.title ?? "step"}-${index}`}
                      className="rounded-[22px] border border-[#e4ecee] bg-[#f8fbfb] p-5"
                    >
                      <div className="flex items-start gap-4">
                        <IconChip icon={item.icon} className="mt-1" />
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d8d94]">
                            Step {index + 1}
                          </p>
                          {item.title ? (
                            <h3
                              className="mt-3 text-2xl tracking-[-0.03em] text-[#17343b]"
                              style={editorialSerif}
                            >
                              {item.title}
                            </h3>
                          ) : null}
                          <p className="mt-2 text-sm leading-6 text-[#5f7880]">{item.body}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            ) : null}

            {model.gallery ? (
              <article className="rounded-[32px] border border-[#cfe0e2] bg-[linear-gradient(180deg,#eef6f7_0%,#e3eef0_100%)] px-8 py-10 shadow-[0_22px_78px_rgba(34,69,77,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5f848c]">
                  Office atmosphere
                </p>
                <h2 className="mt-4 text-4xl tracking-[-0.04em] text-[#17343b]" style={editorialSerif}>
                  {model.gallery.heading}
                </h2>
                <div className="mt-6 grid gap-4">
                  {model.gallery.cards.map((card) => (
                    <article
                      key={card.title}
                      className="rounded-[22px] border border-white/70 bg-white/78 p-5"
                    >
                      <div className="flex items-start gap-4">
                        <IconChip icon={card.icon} className="mt-1" />
                        <div>
                          <h3
                            className="text-2xl tracking-[-0.03em] text-[#17343b]"
                            style={editorialSerif}
                          >
                            {card.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-[#5f7880]">{card.body}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            ) : null}
          </section>
        ) : null}

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          {model.faq ? (
            <article className="rounded-[32px] border border-[#d1dfe1] bg-white px-8 py-10 shadow-[0_20px_70px_rgba(34,69,77,0.08)]">
              <div className="flex items-center gap-3">
                <IconChip icon="circle-question" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6d8d94]">
                    FAQ
                  </p>
                  <h2
                    className="mt-2 text-4xl tracking-[-0.04em] text-[#17343b]"
                    style={editorialSerif}
                  >
                    {model.faq.heading}
                  </h2>
                </div>
              </div>
              <div className="mt-8 grid gap-4">
                {model.faq.items.map((item, index) => (
                  <article
                    key={`${item.question}-${index}`}
                    className="rounded-[22px] border border-[#e4ecee] bg-[#f8fbfb] p-5"
                  >
                    <h3
                      className="text-2xl tracking-[-0.03em] text-[#17343b]"
                      style={editorialSerif}
                    >
                      {item.question}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#5f7880]">{item.answer}</p>
                  </article>
                ))}
              </div>
            </article>
          ) : null}

          <article
            id="contact"
            className="rounded-[32px] border border-[#cfe0e2] bg-[#173f47] px-8 py-10 text-[#eef7f8] shadow-[0_24px_90px_rgba(25,55,63,0.20)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a7cfd5]">
              Contact
            </p>
            <h2 className="mt-4 text-4xl tracking-[-0.04em]" style={editorialSerif}>
              {model.contact.heading}
            </h2>
            <p className="mt-4 text-base leading-8 text-[#d9ebee]">{model.contact.body}</p>
            <div className="mt-6 grid gap-3 text-sm text-[#d1e6e8]">
              <span className="inline-flex items-center gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                {model.serviceAreaLabel}
              </span>
              {model.contact.phone ? (
                <span className="inline-flex items-center gap-3">
                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                  {model.contact.phone}
                </span>
              ) : null}
              {model.contact.email ? (
                <span className="inline-flex items-center gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4" />
                  {model.contact.email}
                </span>
              ) : null}
            </div>
            {model.contact.cta ? (
              <a
                href={model.contact.cta.href}
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#173f47] transition hover:bg-[#eef6f7]"
              >
                <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4" />
                {model.contact.cta.label}
              </a>
            ) : null}
          </article>
        </section>
      </div>
    </main>
  );
}

export const DentalPreviewTemplate = DentalPreview;
