import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { SavedList } from "@/components/saved/SavedList";
import { Logo } from "@/components/site/Logo";
import { Label } from "@/components/site/Label";
import { getDictionary, localizedPath, type Locale } from "@/lib/i18n";

export async function SavedView({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).app.saved;
  const nav = getDictionary(locale).app.nav;
  const lp = (p: string) => localizedPath(p, locale);

  const user = await getSessionUser();
  if (!user) redirect(`${lp("/login")}?next=${encodeURIComponent(lp("/saved"))}`);

  return (
    <div className="min-h-screen">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-6">
          <Link href={lp("/")} aria-label="CloseHound home"><Logo /></Link>
          <Link href={lp("/screen")} className="text-sm text-muted-foreground transition hover:text-foreground">
            {nav.backToScreener}
          </Link>
        </div>
      </header>
      <main data-tour="saved" className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <Label accent>{t.eyebrow}</Label>
        <h1 className="mt-3 font-display text-4xl">{t.title}</h1>
        <div className="mt-6">
          <SavedList locale={locale} />
        </div>
      </main>
    </div>
  );
}
