import Link from "next/link";

// CloseHound landing. Phase 10 gates /screen behind auth; for now both CTAs are
// open so the funnel is demoable.
export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(900px 420px at 50% -10%, rgba(235,255,0,0.12), transparent 60%)",
        }}
      />
      <span className="relative rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
        Section 8 deal screener
      </span>
      <h1 className="relative mt-5 font-display text-6xl leading-[0.95] tracking-tight sm:text-7xl">
        Sniff out the deal.
      </h1>
      <p className="relative mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
        CloseHound finds for-sale homes whose HUD voucher rent ceiling is high
        relative to price — pulls SAFMR + live listings, underwrites every
        property with realistic assumptions, and ranks them by Deal Score.
      </p>
      <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/screen"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition hover:brightness-95"
        >
          Open the screener
        </Link>
        <Link
          href="/pricing"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-[15px] font-semibold text-foreground transition hover:bg-secondary"
        >
          Pricing
        </Link>
      </div>
    </main>
  );
}
