// Placeholder home for the CloseHound rebuild (Phase 1). The real Section 8
// deal-screener UI lands in later phases; this just keeps the app building with
// zero internal imports after the old lead-gen surface was removed.

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#0E0E0E] px-6 text-center text-[#F5F1E8]">
      <span className="rounded-full border border-[#EBFF00]/40 bg-[#EBFF00]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#EBFF00]">
        Rebuilding
      </span>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">CloseHound</h1>
      <p className="max-w-md text-sm leading-relaxed text-[#F5F1E8]/70">
        Section 8 deal screener. Sniff out the deal — coming soon.
      </p>
    </main>
  );
}
