import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth";
import { getQuota } from "@/lib/quota";
import { AccountActions } from "@/components/account/AccountActions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata = { title: "Account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/account");
  await ensureProfile(user.id);
  const q = await getQuota(user.id);
  const pct = Math.min(100, Math.round((q.used / Math.max(q.limit, 1)) * 100));

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl">Account</h1>
        <a href="/screen" className="text-sm text-muted-foreground hover:text-foreground">
          ← Screener
        </a>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Plan &amp; usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-sm font-semibold capitalize text-primary">
              {q.plan}
            </span>
          </div>
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
          </div>
          <AccountActions plan={q.plan} />
        </CardContent>
      </Card>
    </main>
  );
}
