// Placeholder home for the CloseHound rebuild. Real Section 8 deal-screener UI
// lands in later phases; this keeps the app building and shows the brand tokens.

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
        Rebuilding
      </span>
      <h1 className="font-display text-5xl font-normal tracking-tight sm:text-6xl">
        CloseHound
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Section 8 deal screener. Sniff out the deal — coming soon.
      </p>
    </main>
  );
}
