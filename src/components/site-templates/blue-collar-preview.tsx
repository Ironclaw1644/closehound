import {
  faArrowRight,
  faBuilding,
  faCircleQuestion,
  faClipboardCheck,
  faCouch,
  faLocationDot,
  faPhone,
  faTruckRampBox,
  faWarehouse,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type {
  BlueCollarPreviewIcon,
  BlueCollarPreviewModel,
} from "@/lib/template-system/blue-collar-preview";

const iconMap: Record<BlueCollarPreviewIcon, IconDefinition> = {
  "truck-ramp-box": faTruckRampBox,
  couch: faCouch,
  warehouse: faWarehouse,
  building: faBuilding,
  "clipboard-check": faClipboardCheck,
  phone: faPhone,
  "location-dot": faLocationDot,
  "circle-question": faCircleQuestion,
};

const displayFace = {
  fontFamily:
    '"Avenir Next Condensed", "Arial Narrow Bold", "Franklin Gothic Demi Cond", "Helvetica Neue", sans-serif',
};

const bodyFace = {
  fontFamily:
    '"Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
};

function IconBadge({
  icon,
  label,
  className = "",
}: {
  icon: BlueCollarPreviewIcon;
  label: string;
  className?: string;
}) {
  return (
    <span
      aria-label={label}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-[#11161b] text-[#f3b341] shadow-[0_12px_24px_rgba(0,0,0,0.24)] ${className}`.trim()}
    >
      <FontAwesomeIcon icon={iconMap[icon]} className="h-4 w-4" />
    </span>
  );
}

function getCtaIcon(href: string, label: string) {
  const normalizedLabel = label.toLowerCase();

  if (href.startsWith("tel:") || normalizedLabel.includes("call")) {
    return faPhone;
  }

  if (
    normalizedLabel.includes("quote") ||
    normalizedLabel.includes("estimate") ||
    normalizedLabel.includes("request")
  ) {
    return faClipboardCheck;
  }

  return faArrowRight;
}

export function BlueCollarPreviewTemplate({
  model,
}: {
  model: BlueCollarPreviewModel;
}) {
  return (
    <main
      className="min-h-screen bg-[linear-gradient(180deg,#cfd5d8_0%,#e7e2d8_18%,#f3efe7_100%)] text-[#11161b]"
      style={bodyFace}
    >
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <section className="overflow-hidden rounded-[34px] border border-[#3a454d] bg-[#11161b] text-white shadow-[0_30px_90px_rgba(17,22,27,0.28)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_420px]">
            <div className="relative overflow-hidden px-7 py-8 sm:px-10 sm:py-10">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_38%),repeating-linear-gradient(135deg,rgba(243,179,65,0.1)_0_16px,rgba(243,179,65,0)_16px_64px)]" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#f3b341]">
                  <IconBadge
                    icon={model.hero.badgeIcon}
                    label={model.hero.badgeLabel}
                    className="h-10 w-10 rounded-xl border-[#3a454d] bg-[#191f25]"
                  />
                  <span>{model.hero.badgeLabel}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f3b341]" />
                  <span>{model.businessName}</span>
                </div>

                <h1
                  className="mt-6 max-w-4xl text-5xl uppercase leading-[0.9] tracking-[-0.05em] text-[#f7f3ea] sm:text-6xl"
                  style={displayFace}
                >
                  {model.hero.heading}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-[#c9d0d5] sm:text-lg">
                  {model.hero.body}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href={model.hero.primaryCta.href}
                    className="inline-flex items-center gap-3 rounded-full bg-[#f3b341] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#11161b] transition hover:bg-[#ffd07a]"
                  >
                    <FontAwesomeIcon
                      icon={getCtaIcon(
                        model.hero.primaryCta.href,
                        model.hero.primaryCta.label
                      )}
                      className="h-4 w-4"
                    />
                    {model.hero.primaryCta.label}
                  </a>
                  {model.hero.secondaryCta ? (
                    <a
                      href={model.hero.secondaryCta.href}
                      className="inline-flex items-center gap-3 rounded-full border border-[#4a555d] bg-white/5 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/10"
                    >
                      <FontAwesomeIcon
                        icon={getCtaIcon(
                          model.hero.secondaryCta.href,
                          model.hero.secondaryCta.label
                        )}
                        className="h-4 w-4 text-[#f3b341]"
                      />
                      {model.hero.secondaryCta.label}
                    </a>
                  ) : null}
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {model.services.items.map((item, index) => (
                    <article
                      key={`${item.title ?? "service"}-${index}`}
                      className="rounded-[24px] border border-[#313a41] bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_100%)] p-5 backdrop-blur"
                    >
                      <div className="flex items-center gap-3">
                        <IconBadge icon={item.icon} label={item.iconLabel} />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f3b341]">
                          {item.iconLabel}
                        </p>
                      </div>
                      {item.title ? (
                        <h2
                          className="mt-4 text-[1.65rem] uppercase leading-tight tracking-[-0.04em] text-[#f7f3ea]"
                          style={displayFace}
                        >
                          {item.title}
                        </h2>
                      ) : null}
                      <p className="mt-2 text-sm leading-6 text-[#bcc6cc]">
                        {item.body}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#313a41] bg-[linear-gradient(180deg,#d7dbde_0%,#c8cfd4_100%)] p-5 lg:border-l lg:border-t-0">
              <div className="flex h-full flex-col rounded-[28px] border border-[#9ea7ae] bg-[linear-gradient(180deg,#f4efe6_0%,#ddd6ca_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                {model.hero.imageSrc ? (
                  <div className="overflow-hidden rounded-[24px] border border-[#aeb6bd] bg-[#c5ccd2]">
                    <img
                      src={model.hero.imageSrc}
                      alt={model.hero.heading}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/5] items-end rounded-[24px] border border-dashed border-[#8b949b] bg-[linear-gradient(180deg,#eef1f3_0%,#d9e0e5_100%)] p-5">
                    <div className="rounded-[22px] border border-[#a9b1b8] bg-white/80 p-5 text-[#172027] shadow-[0_12px_24px_rgba(17,22,27,0.12)]">
                      <div className="flex items-center gap-3">
                        <IconBadge
                          icon="warehouse"
                          label="Crew staging"
                          className="border-[#c5ccd2] bg-[#f4efe6] text-[#11161b]"
                        />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#6a7278]">
                          Crew staging
                        </p>
                      </div>
                      <h2
                        className="mt-4 text-3xl uppercase leading-[0.92] tracking-[-0.045em]"
                        style={displayFace}
                      >
                        Ready crews. Clear scope. Work that gets handled.
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-[#465159]">
                        From first call to final walkthrough, the job stays organized with practical scheduling, direct communication, and a clean finish.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-[24px] bg-[#1c242b] px-5 py-5 text-[#edf2f5]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f3b341]">
                    Dispatch board
                  </p>
                  <div className="mt-4 grid gap-3 text-sm text-[#d3dbe0]">
                    {model.serviceArea ? (
                      <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <IconBadge
                          icon={model.serviceArea.icon}
                          label="Service area"
                          className="h-9 w-9 rounded-xl border-[#3d474f] bg-[#11161b]"
                        />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#96a4af]">
                            Coverage
                          </p>
                          <p className="mt-1 text-sm leading-5 text-white">
                            {model.serviceArea.heading}
                          </p>
                        </div>
                      </div>
                    ) : null}
                    {model.contact.phone ? (
                      <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                        <IconBadge
                          icon={model.contact.phoneIcon}
                          label="Phone"
                          className="h-9 w-9 rounded-xl border-[#3d474f] bg-[#11161b]"
                        />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#96a4af]">
                            Direct line
                          </p>
                          <p className="mt-1 text-sm leading-5 text-white">
                            {model.contact.phone}
                          </p>
                        </div>
                      </div>
                    ) : null}
                    {model.serviceArea ? (
                      <div className="rounded-2xl border border-white/8 bg-[#11161b] px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#96a4af]">
                          Route notes
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#dbe3e8]">
                          {model.serviceArea.body}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {model.whyChooseUs || model.faq ? (
          <section className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            {model.whyChooseUs ? (
              <div className="rounded-[32px] border border-[#b4bbb8] bg-[linear-gradient(180deg,#f7f2e8_0%,#efe7d9_100%)] px-7 py-8 shadow-[0_20px_70px_rgba(39,47,53,0.10)] sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a5a22]">
                      Why crews get hired
                    </p>
                    <h2
                      className="mt-3 text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-[#151b21]"
                      style={displayFace}
                    >
                      {model.whyChooseUs.heading}
                    </h2>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-[#4d5a63]">
                    Local customers are looking for crews that show up prepared, explain the work clearly, and keep the next step simple.
                  </p>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-3">
                  {model.whyChooseUs.items.map((item, index) => (
                    <article
                      key={`${item.title ?? "proof"}-${index}`}
                      className="rounded-[24px] border border-[#d8d1c6] bg-white/82 p-6"
                    >
                      <div className="flex items-center gap-3">
                        <IconBadge
                          icon={item.icon}
                          label={item.iconLabel}
                          className="border-[#e5ddd1] bg-[#fbf7f0] text-[#11161b]"
                        />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7b858c]">
                          {item.iconLabel}
                        </p>
                      </div>
                      {item.title ? (
                        <h3
                          className="mt-5 text-[1.85rem] uppercase leading-[0.94] tracking-[-0.04em] text-[#151b21]"
                          style={displayFace}
                        >
                          {item.title}
                        </h3>
                      ) : null}
                      <p className="mt-3 text-sm leading-6 text-[#50606a]">
                        {item.body}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {model.faq ? (
              <div className="rounded-[32px] border border-[#b4bcc3] bg-[linear-gradient(180deg,#e8edf0_0%,#d7dfe5_100%)] px-6 py-8 shadow-[0_20px_70px_rgba(37,47,55,0.12)] sm:px-7">
                <div className="flex items-center gap-3">
                  <IconBadge
                    icon={model.faq.icon}
                    label="Questions"
                    className="border-[#c2ccd3] bg-white text-[#11161b]"
                  />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#66737d]">
                      Common questions
                    </p>
                    <h2
                      className="mt-1 text-3xl uppercase leading-[0.94] tracking-[-0.045em] text-[#151b21]"
                      style={displayFace}
                    >
                      {model.faq.heading}
                    </h2>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {model.faq.items.map((item, index) => (
                    <article
                      key={`${item.question}-${index}`}
                      className="rounded-[22px] border border-white/65 bg-white/82 p-5"
                    >
                      <h3 className="text-base font-semibold uppercase tracking-[0.02em] text-[#1b242b]">
                        {item.question}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-[#53616a]">
                        {item.answer}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
        {model.process ? (
          <section className="mt-8 rounded-[32px] border border-[#232c33] bg-[#151b21] px-7 py-8 text-white shadow-[0_24px_80px_rgba(21,27,33,0.28)] sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#f3b341]">
                  Crew process
                </p>
                <h2
                  className="mt-3 text-4xl uppercase leading-[0.92] tracking-[-0.05em] text-[#f7f3ea]"
                  style={displayFace}
                >
                  {model.process.heading}
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-[#b9c3ca]">
                Customers can see how the job moves from first review to approved scope and completed work without guesswork.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {model.process.items.map((item, index) => (
                <article
                  key={`${item.title ?? "step"}-${index}`}
                  className="rounded-[24px] border border-[#303a42] bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <IconBadge icon={item.icon} label={item.iconLabel} />
                    <span
                      className="text-4xl leading-none text-white/10"
                      style={displayFace}
                    >
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f3b341]">
                    {item.iconLabel}
                  </p>
                  {item.title ? (
                    <h3
                      className="mt-3 text-[1.8rem] uppercase leading-[0.94] tracking-[-0.04em] text-[#f7f3ea]"
                      style={displayFace}
                    >
                      {item.title}
                    </h3>
                  ) : null}
                  <p className="mt-3 text-sm leading-6 text-[#c3ccd2]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section
          id="contact"
          className="mt-8 rounded-[32px] border border-[#b8aa8e] bg-[linear-gradient(135deg,#f1b54f_0%,#cf8d2a_100%)] px-7 py-8 text-[#161c22] shadow-[0_24px_80px_rgba(164,104,24,0.24)] sm:px-8"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#62410f]">
                Ready to book
              </p>
              <h2
                className="mt-3 text-4xl uppercase leading-[0.92] tracking-[-0.05em]"
                style={displayFace}
              >
                {model.contact.heading}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#2f2415]">
                {model.contact.body}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#2f2415]">
                {model.contact.phone ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#9b6a1d]/35 bg-white/35 px-4 py-2">
                    <FontAwesomeIcon icon={iconMap[model.contact.phoneIcon]} className="h-4 w-4" />
                    {model.contact.phone}
                  </span>
                ) : null}
                {model.contact.email ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#9b6a1d]/35 bg-white/35 px-4 py-2">
                    {model.contact.email}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rounded-[26px] border border-[#845814]/20 bg-[#161c22] p-5 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f3b341]">
                Next step
              </p>
              <p className="mt-3 text-sm leading-6 text-[#c5ced4]">
                Call now or request service to lock in the next step and get the scope moving.
              </p>
              {model.contact.cta ? (
                <a
                  href={model.contact.cta.href}
                  className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#f3b341] px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-[#11161b] transition hover:bg-[#ffd07a]"
                >
                  <FontAwesomeIcon
                    icon={getCtaIcon(
                      model.contact.cta.href,
                      model.contact.cta.label
                    )}
                    className="h-4 w-4"
                  />
                  {model.contact.cta.label}
                </a>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
