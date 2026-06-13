"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function AccountActions({ plan }: { plan: string }) {
  const router = useRouter();
  const subscribed = plan !== "free";

  async function portal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const json = await res.json();
    if (json.url) location.href = json.url;
  }

  async function signOut() {
    await getBrowserSupabase().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/pricing"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-95"
      >
        {subscribed ? "Change plan" : "Upgrade · buy credits"}
      </Link>
      {subscribed && (
        <Button variant="outline" onClick={portal}>
          Manage billing
        </Button>
      )}
      <Button variant="ghost" onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
