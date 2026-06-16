import Link from "next/link";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Label } from "@/components/site/Label";
import { getDictionary } from "@/lib/i18n";
import { localizedPath, type Locale } from "@/lib/i18n/config";

export function DemoView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).demo;
  const lp = (p: string) => localizedPath(p, locale);

  return (
    <>
      <Header locale={locale} />
      <main>
        <section className="relative">
          <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-4xl px-5 pt-16 pb-10 text-center sm:px-8">
            <Label accent className="justify-center">{t.eyebrow}</Label>
            <h1 className="mt-5 font-display text-5xl leading-tight sm:text-6xl">
              <span className="text-gradient">{t.title}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[16px] text-muted-foreground">{t.sub}</p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-5 pb-8 sm:px-8">
          <div className="overflow-hidden rounded-2xl border border-hairline bg-surface-1 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
            <video className="aspect-video w-full bg-background" controls playsInline poster="/demo-poster.jpg" preload="metadata">
              <source src="/demo.mp4" type="video/mp4" />
              {t.videoFallback}
            </video>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
          <Label>{t.stepsEyebrow}</Label>
          <ol className="mt-5 space-y-3">
            {t.steps.map((s, i) => (
              <li key={s} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground">
                <span className="font-mono font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link href={lp("/screen")} className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-[15px] font-semibold text-primary-foreground transition hover:brightness-95">
              {t.cta}
            </Link>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
