import {
  faCalendarCheck,
  faClock,
  faEnvelope,
  faHandSparkles,
  faLocationDot,
  faPhone,
  faShieldHeart,
  faSyringe,
  faUserDoctor,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { MedSpaPreviewModel } from "@/lib/template-system/med-spa-preview";

const treatmentIcons = [faSyringe, faWandMagicSparkles, faHandSparkles];
const proofIcons = [faUserDoctor, faShieldHeart, faClock];

function buildCardKey(prefix: string, value: string | undefined, index: number) {
  return `${prefix}-${value ?? "item"}-${index}`;
}

export function MedSpaPreviewTemplate({
  model,
}: {
  model: MedSpaPreviewModel;
}) {
  return (
    <main className="min-h-screen bg-[#f5f0ea] text-stone-950">
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <section className="overflow-hidden rounded-[36px] border border-[#d9cec2] bg-[linear-gradient(135deg,#f8f4ef_0%,#efe4d7_52%,#e6ddd4_100%)] shadow-[0_28px_90px_rgba(78,55,38,0.12)]">
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_420px]">
            <div className="px-8 py-10 sm:px-12 sm:py-14">
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#6f6257]">
                <span>{model.serviceAreaLabel}</span>
                <span className="h-1 w-1 rounded-full bg-[#9c7f6a]" />
                <span>Consultation-led med spa</span>
              </div>
              <h1 className="mt-6 max-w-3xl font-sans text-5xl font-semibold leading-[0.96] tracking-[-0.04em] text-[#241a14] sm:text-6xl">
                {model.hero.heading}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f5348]">
                {model.hero.body}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={model.primaryCtaHref}
                  className="inline-flex items-center gap-3 rounded-full bg-[#231915] px-6 py-3.5 text-sm font-semibold text-[#fff8f2] shadow-[0_18px_50px_rgba(35,25,21,0.24)] transition hover:bg-[#352720]"
                >
                  <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4" />
                  {model.primaryCtaLabel}
                </a>
                <a
                  href={model.secondaryCtaHref}
                  className="inline-flex items-center gap-3 rounded-full border border-[#bca997] bg-white/80 px-6 py-3.5 text-sm font-semibold text-[#3f3128] backdrop-blur transition hover:bg-white"
                >
                  <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4 text-[#9c7f6a]" />
                  {model.secondaryCtaLabel}
                </a>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: faUserDoctor,
                    label: "Consultation first",
                    body: "Start with goals, skin concerns, and timing before choosing a treatment path.",
                  },
                  {
                    icon: faShieldHeart,
                    label: "Measured planning",
                    body: "Recommendations stay focused, conservative, and aligned with the look you want to maintain.",
                  },
                  {
                    icon: faClock,
                    label: "Clear next steps",
                    body: "Make it easy to book, ask questions, and understand what the first visit covers.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-white/55 bg-white/65 p-5 backdrop-blur"
                  >
                    <FontAwesomeIcon
                      icon={item.icon}
                      className="h-4 w-4 text-[#8e6f58]"
                    />
                    <h2 className="mt-4 font-sans text-2xl font-semibold tracking-[-0.03em] text-[#2c221d]">
                      {item.label}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#65574a]">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/40 bg-[#ddd3c8] p-5 lg:border-l lg:border-t-0">
              <div className="flex h-full flex-col rounded-[30px] border border-white/50 bg-[#f7f2eb] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                {model.heroImageSrc ? (
                  <div className="overflow-hidden rounded-[24px] bg-[#e7ddd3]">
                    <img
                      src={model.heroImageSrc}
                      alt={model.hero.heading ?? model.businessName}
                      className="aspect-[4/5] w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/5] items-end rounded-[24px] bg-[radial-gradient(circle_at_top,#fff6ee_0%,#ebdfd2_52%,#ddcec0_100%)] p-6">
                    <div className="rounded-[22px] border border-white/70 bg-white/70 p-5 backdrop-blur">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7a6b60]">
                        Visit atmosphere
                      </p>
                      <p className="mt-3 font-sans text-3xl font-semibold tracking-[-0.04em] text-[#2b211b]">
                        Quiet, polished, and consultation-led.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-5 rounded-[24px] bg-[#241a16] px-5 py-5 text-[#f9f2eb]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#cab8ab]">
                    First visit
                  </p>
                  <p className="mt-3 text-base leading-7 text-[#f3e9df]">
                    Ask about treatment goals, timing, and what a consultation covers before you book.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm text-[#d9cbbf]">
                    <span className="inline-flex items-center gap-2">
                      <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4" />
                      {model.serviceAreaLabel}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <FontAwesomeIcon icon={faPhone} className="h-4 w-4" />
                      {model.contactDetails.phone ?? "Call to book"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="mt-8 rounded-[34px] border border-[#ddd1c5] bg-white/85 px-8 py-10 shadow-[0_20px_70px_rgba(91,63,44,0.08)] backdrop-blur sm:px-10"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8d7d70]">
                Featured treatments
              </p>
              <h2 className="mt-3 font-sans text-4xl font-semibold tracking-[-0.04em] text-[#241b16]">
                {model.treatments.heading}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#6a5b50]">
              Explore a focused mix of injectable, skin, and facial-aesthetic services designed for clients who want a clear first step.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {(model.treatments.items ?? []).map((item, index) => (
              <article
                key={buildCardKey("treatment", item.title, index)}
                className="rounded-[26px] border border-[#eadfd4] bg-[linear-gradient(180deg,#fffdfa_0%,#f7f0e8_100%)] p-6"
              >
                <FontAwesomeIcon
                  icon={treatmentIcons[index % treatmentIcons.length]}
                  className="h-4 w-4 text-[#a27e63]"
                />
                {item.title ? (
                  <h3 className="mt-5 font-sans text-2xl font-semibold tracking-[-0.03em] text-[#2b211b]">
                    {item.title}
                  </h3>
                ) : null}
                <p className="mt-3 text-sm leading-6 text-[#6c5d51]">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <article className="rounded-[34px] border border-[#ddd1c5] bg-[#241a16] px-8 py-10 text-[#f8f1e9] shadow-[0_24px_90px_rgba(40,27,21,0.22)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#cdb9ab]">
              About the practice
            </p>
            <h2 className="mt-4 font-sans text-4xl font-semibold tracking-[-0.04em]">
              {model.about.heading}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#eaded3]">
              {model.about.body}
            </p>
          </article>

          <article className="rounded-[34px] border border-[#ddd1c5] bg-white px-8 py-10 shadow-[0_24px_80px_rgba(90,60,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d7d70]">
              Why clients choose this practice
            </p>
            <h2 className="mt-4 font-sans text-4xl font-semibold tracking-[-0.04em] text-[#241b16]">
              {model.whyChooseUs.heading}
            </h2>
            <div className="mt-6 grid gap-4">
              {(model.whyChooseUs.items ?? []).map((item, index) => (
                <article
                  key={buildCardKey("proof", item.title, index)}
                  className="rounded-[24px] border border-[#eee4db] bg-[#fcfaf7] p-5"
                >
                  <div className="flex items-start gap-4">
                    <FontAwesomeIcon
                      icon={proofIcons[index % proofIcons.length]}
                      className="mt-1 h-4 w-4 text-[#9a7b62]"
                    />
                    <div>
                      {item.title ? (
                        <h3 className="font-sans text-2xl font-semibold tracking-[-0.03em] text-[#2b211b]">
                          {item.title}
                        </h3>
                      ) : null}
                      <p className="mt-2 text-sm leading-6 text-[#6b5d52]">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <article className="rounded-[34px] border border-[#ddd1c5] bg-white px-8 py-10 shadow-[0_22px_78px_rgba(90,60,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d7d70]">
              What to expect
            </p>
            <h2 className="mt-4 font-sans text-4xl font-semibold tracking-[-0.04em] text-[#241b16]">
              {model.process.heading}
            </h2>
            <div className="mt-8 grid gap-4">
              {(model.process.items ?? []).map((item, index) => (
                <article
                  key={buildCardKey("process", item.title, index)}
                  className="rounded-[24px] border border-[#ece1d6] bg-[#faf6f2] p-5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#97775f]">
                    Step {index + 1}
                  </p>
                  {item.title ? (
                    <h3 className="mt-3 font-sans text-2xl font-semibold tracking-[-0.03em] text-[#2b211b]">
                      {item.title}
                    </h3>
                  ) : null}
                  <p className="mt-2 text-sm leading-6 text-[#67584d]">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </article>

          <article className="rounded-[34px] border border-[#ddd1c5] bg-[linear-gradient(180deg,#f7f1ea_0%,#efe6dc_100%)] px-8 py-10 shadow-[0_20px_70px_rgba(90,60,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d7d70]">
              Inside the space
            </p>
            <h2 className="mt-4 font-sans text-4xl font-semibold tracking-[-0.04em] text-[#241b16]">
              {model.gallery.heading ?? "A setting that feels private, polished, and easy to settle into."}
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#695a4f]">
              {model.gallery.body ??
                "From the consultation room to the reception area, every detail should support a calm visit, clear communication, and a welcoming experience for a diverse clientele."}
            </p>
            <div className="mt-8 grid gap-3">
              {(model.gallery.items?.length
                ? model.gallery.items.map((item) => item.title ?? item.body)
                : [
                    "Private consultation moments",
                    "Bright, well-kept treatment rooms",
                    "A reception area that feels calm and considered",
                  ]
              ).map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-white/60 bg-white/70 px-4 py-4 text-sm font-medium text-[#4f433a]"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <article className="rounded-[34px] border border-[#ddd1c5] bg-white px-8 py-10 shadow-[0_20px_72px_rgba(90,60,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d7d70]">
              Questions before booking
            </p>
            <h2 className="mt-4 font-sans text-4xl font-semibold tracking-[-0.04em] text-[#241b16]">
              {model.faq.heading}
            </h2>
            <div className="mt-8 grid gap-4">
              {(model.faq.faqItems ?? []).map((item, index) => (
                <article
                  key={buildCardKey("faq", item.question, index)}
                  className="rounded-[24px] border border-[#ede2d7] bg-[#fbf8f4] p-5"
                >
                  <h3 className="font-sans text-2xl font-semibold tracking-[-0.03em] text-[#2c221c]">
                    {item.question}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#66584d]">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </article>

          <article
            id="contact"
            className="rounded-[34px] border border-[#d4c6ba] bg-[#241a16] px-8 py-10 text-[#fbf4ed] shadow-[0_24px_90px_rgba(40,27,21,0.24)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d4c1b2]">
              Contact
            </p>
            <h2 className="mt-4 font-sans text-4xl font-semibold tracking-[-0.04em]">
              {model.contact.heading}
            </h2>
            <p className="mt-4 text-base leading-7 text-[#e7dbcf]">
              {model.contact.body}
            </p>

            <div className="mt-7 space-y-3 text-sm text-[#eaded3]">
              <p className="inline-flex items-center gap-3">
                <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-[#d7bda7]" />
                <span>{model.contactDetails.phone ?? "Call to book"}</span>
              </p>
              {model.contactDetails.email ? (
                <p className="inline-flex items-center gap-3">
                  <FontAwesomeIcon icon={faEnvelope} className="h-4 w-4 text-[#d7bda7]" />
                  <span>{model.contactDetails.email}</span>
                </p>
              ) : null}
              <p className="inline-flex items-center gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="h-4 w-4 text-[#d7bda7]" />
                <span>{model.serviceAreaLabel}</span>
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={model.primaryCtaHref}
                className="inline-flex items-center gap-3 rounded-full bg-[#f5ede3] px-6 py-3.5 text-sm font-semibold text-[#241a16] transition hover:bg-white"
              >
                <FontAwesomeIcon icon={faCalendarCheck} className="h-4 w-4" />
                {model.contact.cta?.label ?? model.primaryCtaLabel}
              </a>
              <a
                href={model.secondaryCtaHref}
                className="inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-[#f3e6d9] transition hover:bg-white/5"
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />
                {model.secondaryCtaLabel}
              </a>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
