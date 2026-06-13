import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { getQuota } from "@/lib/quota";
import { PLANS, type PlanId } from "@/lib/stripe/plans";
import { AccountActions } from "@/components/account/AccountActions";
import { Logo } from "@/components/site/Logo";
import { Label } from "@/components/site/Label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; credits?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");
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
          <Link href="/" aria-label="CloseHound home"><Logo /></Link>
          <Link href="/screen" className="text-sm text-muted-foreground transition hover:text-foreground">
            ← Screener
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <Label accent>ACCOUNT</Label>
        <h1 className="mt-3 font-display text-4xl">Plan &amp; usage</h1>

        {(sp?.upgraded || sp?.credits) && (
          <div className="mt-6 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
            {sp.credits ? "Credits added — happy hunting." : "You're upgraded. Go find some deals."}
          </div>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Membership</CardTitle>
            <span className="rounded-md border border-gold/30 bg-gold/10 px-2.5 py-1 text-sm font-semibold text-gold">
              {planName}
            </span>
          </CardHeader>
          <CardContent className="space-y-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Signed in as</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {/* Monthly allotment */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Screens this month</span>
                <span className="tabular font-medium">
                  {q.used} / {q.limit}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-[12px] text-muted-foreground">
                {monthlyLeft.toLocaleString()} monthly screens left · resets at the start of next month.
              </p>
            </div>

            {/* Credits */}
            <div className="flex items-center justify-between rounded-lg border border-hairline bg-background px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">Pay-as-you-go credits</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  Used automatically after your monthly screens run out. Never expire.
                </p>
              </div>
              <span className="tabular font-mono text-2xl font-semibold">{q.credits.toLocaleString()}</span>
            </div>

            <AccountActions plan={q.plan} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
