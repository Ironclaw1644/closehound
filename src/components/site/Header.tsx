import Link from "next/link";
import { Logo } from "./Logo";
import { LocaleSwitch } from "./LocaleSwitch";
import { getDictionary } from "@/lib/i18n";
import { localizedPath, type Locale } from "@/lib/i18n/config";

export function Header({ locale = "en" }: { locale?: Locale }) {
  const t = getDictionary(locale).common;
  const lp = (p: string) => localizedPath(p, locale);

  const NAV = [
    { href: lp("/how-it-works"), label: t.nav.howItWorks },
    { href: `${lp("/how-it-works")}#zones`, label: t.nav.opportunityZones },
    { href: lp("/demo"), label: t.nav.demo },
    { href: lp("/pricing"), label: t.nav.pricing },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-hairline/80 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href={lp("/")} aria-label="CloseHound home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="text-[13.5px] font-medium text-muted-foreground transition hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <LocaleSwitch locale={locale} className="hidden sm:inline-flex" />
          <Link
            href={lp("/login")}
            className="hidden h-9 items-center rounded-md px-3 text-[13.5px] font-semibold text-muted-foreground transition hover:text-foreground sm:inline-flex"
          >
            {t.signIn}
          </Link>
          <Link
            href={lp("/screen")}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-[13.5px] font-semibold text-primary-foreground transition hover:brightness-95"
          >
            {t.startFree}
          </Link>
        </div>
      </div>
    </header>
  );
}
