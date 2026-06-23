import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GUIDE_CHAPTERS, CHAPTER_SLUGS, guideChapter } from "@/lib/guide/content";
import { SITE, breadcrumbLd, faqLd, articleLd, howToLd } from "@/lib/markets/seo";
import { Label } from "@/components/site/Label";
import { Breadcrumbs, FaqBlock, JsonLd, CtaBand } from "@/components/markets/ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_CHAPTERS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = guideChapter(slug);
  if (!c) return {};
  return {
    title: { absolute: c.metaTitle },
    description: c.metaDescription,
    alternates: { canonical: `/guide/${c.slug}` },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: `${SITE}/guide/${c.slug}`,
      images: [{ url: "/og.png", width: 1200, height: 630 }],
    },
  };
}

export default async function GuideChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = guideChapter(slug);
  if (!c) notFound();

  const idx = CHAPTER_SLUGS.indexOf(c.slug as (typeof CHAPTER_SLUGS)[number]);
  const prev = idx > 0 ? guideChapter(CHAPTER_SLUGS[idx - 1]) : undefined;
  const next = idx >= 0 && idx < CHAPTER_SLUGS.length - 1 ? guideChapter(CHAPTER_SLUGS[idx + 1]) : undefined;

  const ld: unknown[] = [
    breadcrumbLd([
      { name: "CloseHound", path: "/" },
      { name: "Playbook", path: "/guide" },
      { name: c.title, path: `/guide/${c.slug}` },
    ]),
    articleLd({ headline: c.title, description: c.metaDescription, path: `/guide/${c.slug}` }),
    faqLd(c.faqs),
  ];
  if (c.checklist?.length) {
    ld.push(howToLd({ name: c.title, description: c.metaDescription, steps: c.checklist.map((i) => ({ name: i.item, text: i.detail })) }));
  }

  return (
    <main>
      <JsonLd data={ld} />
      <article className="relative">
        <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-5 pt-10 pb-6 sm:px-8">
          <Breadcrumbs
            items={[
              { name: "Home", path: "/" },
              { name: "Playbook", path: "/guide" },
              { name: c.title, path: `/guide/${c.slug}` },
            ]}
          />
          <Label accent className="mt-6">
            SECTION 8 PLAYBOOK · {String(idx + 1).padStart(2, "0")}
          </Label>
          <h1 className="mt-4 font-display text-4xl leading-[1.07] sm:text-5xl">{c.title}</h1>
          {c.intro.map((p, i) => (
            <p key={i} className="mt-5 text-[17px] leading-relaxed text-muted-foreground">{p}</p>
          ))}
        </div>

        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          {c.sections.map((s) => (
            <section key={s.heading} className="mt-9">
              <h2 className="font-display text-2xl text-foreground">{s.heading}</h2>
              {s.body.map((p, i) => (
                <p key={i} className="mt-3 text-[15.5px] leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </section>
          ))}

          {c.checklist?.length ? (
            <section className="mt-9">
              <div className="overflow-hidden rounded-xl border border-hairline">
                {c.checklist.map((item, i) => (
                  <div key={item.item} className={`flex gap-3 px-5 py-4 ${i % 2 ? "bg-surface-1/40" : "bg-surface-1"}`}>
                    <span className="mt-0.5 text-gold">✓</span>
                    <span>
                      <span className="block font-medium text-foreground">{item.item}</span>
                      <span className="mt-0.5 block text-[14px] leading-relaxed text-muted-foreground">{item.detail}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-12">
            <h2 className="mb-5 font-display text-2xl">FAQ</h2>
            <FaqBlock faqs={c.faqs} />
          </section>

          {/* Prev / next */}
          <nav className="mt-10 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/guide/${prev.slug}`} className="rounded-lg border border-hairline px-4 py-3 transition hover:border-gold/30 hover:bg-surface-1/60">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">← Previous</span>
                <span className="mt-0.5 block text-sm font-medium text-foreground">{prev.title}</span>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/guide/${next.slug}`} className="rounded-lg border border-hairline px-4 py-3 text-right transition hover:border-gold/30 hover:bg-surface-1/60">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">Next →</span>
                <span className="mt-0.5 block text-sm font-medium text-foreground">{next.title}</span>
              </Link>
            ) : <span />}
          </nav>

          <p className="mt-8 text-xs leading-relaxed text-muted-foreground/70">
            General educational guidance, not legal or financial advice — Section 8 rules vary by Public
            Housing Authority. Verify specifics with your local PHA (and an attorney for legal questions).
          </p>
        </div>
      </article>

      <CtaBand
        title="Put the playbook to work"
        sub="Screen live listings against HUD voucher rents and rank them by Deal Score — free to start."
      />
    </main>
  );
}
