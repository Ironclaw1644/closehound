import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Label } from "@/components/site/Label";
import { PricingTable } from "@/components/billing/PricingTable";
import { getDictionary } from "@/lib/i18n";
import { type Locale } from "@/lib/i18n/config";

export function PricingView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const t = d.pricing;

  return (
    <>
      <Header locale={locale} />
      <main>
        <section className="relative">
          <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-4xl px-5 pt-16 pb-8 text-center sm:px-8">
            <Label accent className="justify-center">{t.eyebrow}</Label>
            <h1 className="mt-5 font-display text-5xl leading-tight sm:text-6xl">
              <span className="text-gradient">{t.title}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-muted-foreground">{t.subhead}</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <PricingTable t={t} planCopy={d.plans} locale={locale} />
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
