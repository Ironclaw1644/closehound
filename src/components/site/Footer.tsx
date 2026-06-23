import Link from "next/link";
import { Logo } from "./Logo";
import { Label } from "./Label";
import { getDictionary } from "@/lib/i18n";
import { localizedPath, type Locale } from "@/lib/i18n/config";

export function Footer({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).footer;
  const lp = (p: string) => localizedPath(p, locale);
  const year = new Date().getFullYear();

  const COLUMNS = [
    {
      title: t.product,
      links: [
        { href: "/screen", label: t.links.openScreener },
        { href: lp("/how-it-works"), label: t.links.howItWorks },
        { href: "/markets", label: locale === "es" ? "Mercados" : "Markets" },
        { href: "/guide", label: locale === "es" ? "Guía Sección 8" : "Section 8 Playbook" },
        { href: lp("/pricing"), label: t.links.pricing },
        { href: lp("/demo"), label: t.links.watchDemo },
      ],
    },
    {
      title: t.trust,
      links: [
        { href: `${lp("/how-it-works")}#methodology`, label: t.links.methodology },
        { href: `${lp("/how-it-works")}#data`, label: t.links.dataSource },
        { href: `${lp("/how-it-works")}#faq`, label: t.links.faq },
      ],
    },
  ];

  return (
    <footer className="border-t border-hairline bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t.tagline}
            </p>
            <Label className="mt-6" gold>
              {t.walkperro}
            </Label>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <Label>{col.title}</Label>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-hairline pt-6">
          <p className="text-[12px] leading-relaxed text-muted-foreground">{t.disclaimer}</p>
          <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-[12px] text-muted-foreground">
              © {year} {t.copyright}
            </p>
            <div className="flex items-center gap-5 text-[12px] text-muted-foreground">
              <Link href={lp("/legal/terms")} className="transition hover:text-foreground">{t.terms}</Link>
              <Link href={lp("/legal/privacy")} className="transition hover:text-foreground">{t.privacy}</Link>
              <a href="mailto:walkperro@proton.me" className="transition hover:text-foreground">{t.contact}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
