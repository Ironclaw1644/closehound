import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Label } from "@/components/site/Label";
import { getDictionary } from "@/lib/i18n";
import { type Locale } from "@/lib/i18n/config";

export function LegalView({ locale, doc }: { locale: Locale; doc: "terms" | "privacy" }) {
  const l = getDictionary(locale).legal;
  const d = l[doc];

  return (
    <>
      <Header locale={locale} />
      <main className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <Label accent>{l.eyebrow}</Label>
        <h1 className="mt-4 font-display text-5xl">{d.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{l.updated}</p>
        {l.translationNote && (
          <p className="mt-2 text-[13px] italic text-muted-foreground">{l.translationNote}</p>
        )}
        <div className="mt-10 space-y-8">
          {d.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold">{s.h}</h2>
              {s.p.map((para, i) => (
                <p key={i} className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{para}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
