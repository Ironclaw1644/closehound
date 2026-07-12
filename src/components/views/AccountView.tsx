import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/getSessionUser";
import { ensureProfile } from "@/lib/auth";
import { getQuota } from "@/lib/quota";
import { PLANS, type PlanId } from "@/lib/stripe/plans";
import { AccountActions } from "@/components/account/AccountActions";
import { Logo } from "@/components/site/Logo";
import { Label } from "@/components/site/Label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getDictionary, localizedPath, type Locale } from "@/lib/i18n";

export async function AccountView({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Promise<{ upgraded?: string; credits?: string }>;
}) {
  const t = getDictionary(locale).app.account;
  const nav = getDictionary(locale).app.nav;
  const lp = (p: string) => localizedPath(p, locale);

  const user = await getSessionUser();
  if (!user) redirect(`${lp("/login")}?next=${encodeURIComponent(lp("/account"))}`);
  await ensureProfile(user.id);
  const q = await getQuota(user.id);
  const sp = await searchParams;
  const pct = Math.min(100, Math.round((q.used / Math.max(q.limit, 1)) * 100));
  const planName = PLANS[q.plan as PlanId]?.name ?? "Free";
  const monthlyLeft = Math.max(0, q.limit - q.used);

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

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <Label accent>{t.eyebrow}</Label>
        <h1 className="mt-3 font-display text-4xl">{t.title}</h1>

        {(sp?.upgraded || sp?.credits) && (
          <div className="mt-6 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
            {sp.credits ? t.creditsAdded : t.upgraded}
          </div>
        )}

        <Card className="mt-6" data-tour="account">
          <CardHeader>
            <CardTitle>{t.membership}</CardTitle>
            <span className="rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 text-sm font-semibold text-gold">{planName}</span>
          </CardHeader>
          <CardContent className="space-y-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.signedInAs}</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.screensThisMonth}</span>
                <span className="tabular font-medium">{q.used} / {q.limit}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-[12px] text-muted-foreground">{monthlyLeft.toLocaleString()} {t.monthlyLeft}</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-hairline bg-background px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">{t.paygCredits}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{t.paygSub}</p>
              </div>
              <span className="tabular font-mono text-2xl font-semibold">{q.credits.toLocaleString()}</span>
            </div>

            <AccountActions plan={q.plan} locale={locale} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
