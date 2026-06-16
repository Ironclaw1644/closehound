"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { getDictionary, localizedPath, type Locale } from "@/lib/i18n";

export function AccountActions({ plan, locale = "en" }: { plan: string; locale?: Locale }) {
  const router = useRouter();
  const t = getDictionary(locale).app.account;
  const lp = (p: string) => localizedPath(p, locale);
  const subscribed = plan !== "free";

  async function portal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const json = await res.json();
    if (json.url) location.href = json.url;
  }

  async function signOut() {
    await getBrowserSupabase().auth.signOut();
    router.push(lp("/"));
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={lp("/pricing")}
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
      >
        {subscribed ? t.changePlan : t.upgradeBuy}
      </Link>
      {subscribed && (
        <Button variant="outline" onClick={portal}>{t.manageBilling}</Button>
      )}
      <Button variant="ghost" onClick={signOut}>{t.signOut}</Button>
    </div>
  );
}
