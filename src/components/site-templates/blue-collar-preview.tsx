import type { BlueCollarPreviewModel } from "@/lib/template-system/blue-collar-preview";

export function BlueCollarPreviewTemplate({
  model,
}: {
  model: BlueCollarPreviewModel;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <section className="rounded-[32px] bg-slate-950 px-8 py-12 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-300">
            Blue-Collar Archetype
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">
            {model.hero.heading}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            {model.hero.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={model.hero.primaryCta.href}
              className="inline-flex rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white"
            >
              {model.hero.primaryCta.label}
            </a>
            {model.hero.secondaryCta ? (
              <a
                href={model.hero.secondaryCta.href}
                className="inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white"
              >
                {model.hero.secondaryCta.label}
              </a>
            ) : null}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-3xl font-semibold">{model.services.heading}</h2>
            <div className="mt-6 grid gap-4">
              {model.services.items.map((item, index) => (
                <article
                  key={`${item.title ?? "service"}-${index}`}
                  className="rounded-2xl border border-black/8 p-5"
                >
                  {item.title ? (
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                  ) : null}
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-3xl font-semibold">
              {model.whyChooseUs.heading}
            </h2>
            <div className="mt-6 grid gap-4">
              {model.whyChooseUs.items.map((item, index) => (
                <article
                  key={`${item.title ?? "proof"}-${index}`}
                  className="rounded-2xl border border-black/8 p-5"
                >
                  {item.title ? (
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                  ) : null}
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-black/10 bg-white p-8">
          <h2 className="text-3xl font-semibold">{model.process.heading}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {model.process.items.map((item, index) => (
              <article
                key={`${item.title ?? "step"}-${index}`}
                className="rounded-2xl border border-black/8 p-5"
              >
                {item.title ? (
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                ) : null}
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-3xl font-semibold">{model.faq.heading}</h2>
            <div className="mt-6 grid gap-4">
              {model.faq.items.map((item, index) => (
                <article
                  key={`${item.question}-${index}`}
                  className="rounded-2xl border border-black/8 p-5"
                >
                  <h3 className="text-lg font-semibold">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-3xl font-semibold">{model.serviceArea.heading}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {model.serviceArea.body}
            </p>
          </div>
        </section>

        <section
          id="contact"
          className="mt-8 rounded-[28px] bg-slate-950 px-8 py-10 text-white"
        >
          <h2 className="text-3xl font-semibold">{model.contact.heading}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            {model.contact.body}
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
            {model.contact.phone ? <span>{model.contact.phone}</span> : null}
            {model.contact.email ? <span>{model.contact.email}</span> : null}
          </div>
          <a
            href="#contact"
            className="mt-8 inline-flex rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white"
          >
            {model.contact.ctaLabel}
          </a>
        </section>
      </div>
    </main>
  );
}
