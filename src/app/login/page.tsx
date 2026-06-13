"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { Label } from "@/components/site/Label";

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
    "h-11 rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-ring";

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div aria-hidden className="glow-radial pointer-events-none absolute inset-0" />
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center" aria-label="CloseHound home">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-hairline bg-surface-1 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]">
          <Label accent>{mode === "in" ? "SIGN IN" : "CREATE ACCOUNT"}</Label>
          <h1 className="mt-3 font-display text-2xl">
            {mode === "in" ? "Welcome back." : "Start hunting."}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "in" ? "Run your screens and save deals." : "10 free screens. No card required."}
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
            <Button type="submit" size="lg" disabled={busy} className="mt-1">
              {busy ? "…" : mode === "in" ? "Sign in" : "Create free account"}
            </Button>
          </form>
          {msg && <p className="mt-3 text-sm text-warning">{msg}</p>}
          <button
            className="mt-4 text-xs text-muted-foreground transition hover:text-foreground"
            onClick={() => {
              setMode((m) => (m === "in" ? "up" : "in"));
              setMsg(null);
            }}
          >
            {mode === "in" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
        <p className="mt-6 text-center text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Official HUD data · No surprise charges
        </p>
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
