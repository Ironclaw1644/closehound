"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { getBrowserSupabase } from "@/lib/supabase/browser";

export function AccountActions({ plan }: { plan: string }) {
  const router = useRouter();

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
      {plan === "pro" ? (
        <Button variant="outline" onClick={portal}>
          Manage billing
        </Button>
      ) : (
        <CheckoutButton>Upgrade to Pro</CheckoutButton>
      )}
      <Button variant="ghost" onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
