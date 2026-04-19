import type { RoofingPreviewModel } from "@/lib/template-system/roofing-preview";

export function RoofingPreviewTemplate({
  model,
}: {
  model: RoofingPreviewModel;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <section className="rounded-[32px] bg-slate-950 px-8 py-12 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-300">
            Roofing Archetype
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">
            {model.hero.heading}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            {model.hero.body}
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex rounded-full bg-red-700 px-6 py-3 text-sm font-semibold text-white"
          >
            {model.hero.ctaLabel}
          </a>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[28px] border border-black/10 bg-white p-8">
            <h2 className="text-3xl font-semibold">Roofing services</h2>
            <div className="mt-6 grid gap-4">
              {model.services.map((item, index) => (
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
            <h2 className="text-3xl font-semibold">What homeowners want</h2>
            <div className="mt-6 grid gap-4">
              {model.whyChooseUs.map((item, index) => (
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
          <h2 className="text-3xl font-semibold">How the job moves</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {model.process.map((item, index) => (
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

        <section id="contact" className="mt-8 rounded-[28px] bg-slate-950 px-8 py-10 text-white">
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
            className="mt-8 inline-flex rounded-full bg-red-700 px-6 py-3 text-sm font-semibold text-white"
          >
            {model.contact.ctaLabel}
          </a>
        </section>
      </div>
    </main>
  );
}
