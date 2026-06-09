"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

function LoginInner() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/screen";
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const sb = getBrowserSupabase();
      const res =
        mode === "in"
          ? await sb.auth.signInWithPassword({ email, password })
          : await sb.auth.signUp({ email, password });
      if (res.error) {
        setMsg(res.error.message);
        return;
      }
      if (mode === "up" && !res.data.session) {
        setMsg("Account created — check your email to confirm, then sign in.");
        setMode("in");
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setMsg("Auth is not configured.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 block text-center font-display text-2xl">
          CloseHound
        </Link>
        <div className="rounded-xl border border-border bg-card p-6">
          <h1 className="text-lg font-semibold">{mode === "in" ? "Sign in" : "Create account"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "in" ? "Run your screens and save deals." : "Start with 10 free screens."}
          </p>
          <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
            <input
              className={inputCls}
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              className={inputCls}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
            />
            <Button type="submit" disabled={busy}>
              {busy ? "…" : mode === "in" ? "Sign in" : "Sign up"}
            </Button>
          </form>
          {msg && <p className="mt-3 text-sm text-warning">{msg}</p>}
          <button
            className="mt-4 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setMode((m) => (m === "in" ? "up" : "in"));
              setMsg(null);
            }}
          >
            {mode === "in" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
