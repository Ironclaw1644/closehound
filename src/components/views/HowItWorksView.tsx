import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Label } from "@/components/site/Label";
import { GradeBadge } from "@/components/site/GradeBadge";
import { marketsByOpportunity, type Grade } from "@/lib/config/assumptions";
import { getDictionary } from "@/lib/i18n";
import { localizedPath, type Locale } from "@/lib/i18n/config";

export function HowItWorksView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).howItWorks;
  const lp = (p: string) => localizedPath(p, locale);
  const ordered = marketsByOpportunity();
  const grades: Grade[] = ["A", "B", "C", "D", "F"];

  return (
    <>
      <Header locale={locale} />
      <main>
        {/* Hero */}
        <section className="relative">
          <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-4xl px-5 pt-16 pb-8 sm:px-8">
            <Label accent>{t.eyebrow}</Label>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] sm:text-6xl">{t.title}</h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">{t.intro}</p>
          </div>
        </section>

        {/* Methodology */}
        <section id="methodology" className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
          <Label accent>{t.scoreEyebrow}</Label>
          <h2 className="mt-4 font-display text-4xl">{t.scoreTitle}</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{t.scoreSub}</p>
          <div className="mt-8 overflow-hidden rounded-xl border border-hairline">
            {t.score.map((row, i) => (
              <div
                key={row.k}
                className={`grid grid-cols-[140px_60px_1fr] items-start gap-4 px-5 py-4 ${i % 2 ? "bg-surface-1/40" : "bg-surface-1"}`}
              >
                <span className="font-semibold">{row.k}</span>
                <span className="font-mono text-primary">{SCORE_WEIGHTS[i]}</span>
                <span className="text-[14px] leading-relaxed text-muted-foreground">{row.d}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Data */}
        <section id="data" className="border-y border-hairline bg-surface-1/40">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8">
            <Label gold>{t.dataEyebrow}</Label>
            <h2 className="mt-4 font-display text-4xl">{t.dataTitle}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {t.data.map((d) => (
                <div key={d.k} className="rounded-xl border border-hairline bg-background p-5">
                  <h3 className="font-semibold">{d.k}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{d.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grading + full market list */}
        <section id="zones" className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
          <Label accent>{t.gradesEyebrow}</Label>
          <h2 className="mt-4 font-display text-4xl">{t.gradesTitle}</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{t.gradesSub}</p>

          <div className="mt-8 space-y-8">
            {grades.map((g) => {
              const inGrade = ordered.filter((m) => m.grade === g);
              if (!inGrade.length) return null;
              const gm = t.grades[g];
              return (
                <div key={g}>
                  <div className="flex items-center gap-3">
                    <GradeBadge grade={g} />
                    <span className="text-sm font-semibold">{gm.label}</span>
                    <span className="text-[13px] text-muted-foreground">{gm.blurb}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {inGrade.map((m) => (
                      <span key={m.id} className="rounded-md border border-hairline bg-surface-1 px-2.5 py-1 text-[13px] text-muted-foreground">
                        {m.label} <span className="font-mono text-[11px] opacity-70">{m.state}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-[13px] text-muted-foreground">
            {t.anyZipLead}
            <strong className="text-foreground">{t.anyZipEmphasis}</strong>
            {t.anyZipTail}
          </p>
        </section>

        {/* CTA */}
        <section className="border-t border-hairline">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
            <h2 className="font-display text-4xl">{t.ctaTitle}</h2>
            <Link href={lp("/screen")} className="mt-6 inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-[15px] font-semibold text-primary-foreground transition hover:brightness-95">
              {t.cta}
            </Link>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}

const SCORE_WEIGHTS = ["35%", "25%", "25%", "15%"];
