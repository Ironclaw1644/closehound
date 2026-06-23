"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Email list capture for the playbook (dark marketing surface). */
export function LeadForm({ source = "guide" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="text-sm font-medium text-success">
        You&apos;re in — check your inbox.{" "}
        <a href="/section8-playbook.pdf" target="_blank" rel="noopener noreferrer" className="text-gold underline underline-offset-2">
          Or download the playbook PDF now →
        </a>
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email"
        className="h-11 flex-1 rounded-md border border-hairline bg-surface-1 px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-gold/40"
      />
      <Button type="submit" disabled={state === "loading"} className="h-11 shrink-0">
        {state === "loading" ? "…" : "Email me the PDF"}
      </Button>
      {state === "error" && <span className="text-xs text-destructive">Try again.</span>}
    </form>
  );
}
