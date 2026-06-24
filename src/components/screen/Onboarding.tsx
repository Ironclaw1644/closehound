"use client";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { getDictionary, localizedPath, type Locale } from "@/lib/i18n";

/** First-run walkthrough for the screener. Reuses the DealCompare overlay
 *  pattern (fixed inset-0 z-50 + backdrop). Teaches the 4-step flow AND makes
 *  the per-ZIP credit model explicit so nobody is surprised by "out of screens". */
export function Onboarding({
  open,
  onClose,
  locale = "en",
}: {
  open: boolean;
  onClose: () => void;
  locale?: Locale;
}) {
  const t = getDictionary(locale).app.onboarding;
  const lp = (p: string) => localizedPath(p, locale);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 max-h-[90vh] w-[min(94vw,640px)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <Logo />
              <span className="font-display text-xl">{t.title}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{t.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-md px-2 py-1 text-sm text-muted-foreground transition hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <ol className="flex flex-col gap-4 p-5">
          {t.steps.map((s) => (
            <li key={s.n} className="flex gap-3.5">
              <span className="tabular mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 font-mono text-sm font-bold text-primary">
                {s.n}
              </span>
              <div>
                <div className="text-sm font-semibold text-foreground">{s.title}</div>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-col gap-3 border-t border-border bg-surface-1 p-5">
          <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-center text-[13px] font-medium text-foreground">
            {t.footer}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-4 text-[13px]">
              {/* The playbook is English-only — link the plain path so /es never 404s. */}
              <a href="/guide" className="font-medium text-primary underline-offset-2 hover:underline">
                {t.guideCta}
              </a>
              <a href={lp("/how-it-works")} className="font-medium text-primary underline-offset-2 hover:underline">
                {t.howCta}
              </a>
            </div>
            <Button onClick={onClose}>{t.cta}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
