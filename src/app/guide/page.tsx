import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_CHAPTERS, GUIDE_HUB } from "@/lib/guide/content";
import { SITE, breadcrumbLd } from "@/lib/markets/seo";
import { Label } from "@/components/site/Label";
import { Breadcrumbs, JsonLd, CtaBand } from "@/components/markets/ui";
import { LeadForm } from "@/components/guide/LeadForm";

export const metadata: Metadata = {
  title: { absolute: GUIDE_HUB.metaTitle },
  description: GUIDE_HUB.metaDescription,
  alternates: { canonical: "/guide" },
  openGraph: {
    title: GUIDE_HUB.metaTitle,
    description: GUIDE_HUB.metaDescription,
    url: `${SITE}/guide`,
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function GuideHubPage() {
  const ld = [
    breadcrumbLd([
      { name: "CloseHound", path: "/" },
      { name: "Playbook", path: "/guide" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: GUIDE_CHAPTERS.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.title,
        url: `${SITE}/guide/${c.slug}`,
      })),
    },
  ];

  return (
    <main>
      <JsonLd data={ld} />
      <section className="relative">
        <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-5 pt-10 pb-6 sm:px-8">
          <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Playbook", path: "/guide" }]} />
          <Label accent className="mt-6">
            SECTION 8 PLAYBOOK
          </Label>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-6xl">{GUIDE_HUB.h1}</h1>
          {GUIDE_HUB.intro.map((p, i) => (
            <p key={i} className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline">
          {GUIDE_CHAPTERS.map((c, i) => (
            <Link key={c.slug} href={`/guide/${c.slug}`} className="group flex items-start gap-4 bg-background px-5 py-5 transition hover:bg-surface-1/60">
              <span className="mt-0.5 font-mono text-sm font-bold text-gold">{String(i + 1).padStart(2, "0")}</span>
              <span className="min-w-0">
                <span className="block font-display text-xl text-foreground transition group-hover:text-gold">{c.title}</span>
                <span className="mt-1 block text-[15px] leading-relaxed text-muted-foreground">{c.summary}</span>
              </span>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground/70">
          General educational guidance, not legal or financial advice — Section 8 rules vary by Public
          Housing Authority, so verify specifics with your local PHA. Found a market first?{" "}
          <Link href="/markets" className="text-gold hover:underline">Browse graded Section 8 markets →</Link>
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-10 sm:px-8">
        <div className="rounded-2xl border border-gold/25 bg-surface-1 px-6 py-7 sm:px-8">
          <h2 className="font-display text-2xl">Get the free Section 8 playbook (PDF)</h2>
          <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
            The full 5-chapter playbook as a printable PDF, plus new market drops when we add them. No spam.
          </p>
          <div className="mt-5 max-w-md">
            <LeadForm source="guide-hub" />
          </div>
        </div>
      </section>

      <CtaBand
        title="Find a Section 8 deal worth closing"
        sub="Screen live listings against HUD voucher rents and rank them by Deal Score — free to start."
      />
    </main>
  );
}
