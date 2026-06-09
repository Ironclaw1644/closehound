// Lightweight dev indicator: counts data-source calls (live vs cache vs mock)
// for the current server instance, surfaced in the UI so you can see caching
// working. Ephemeral per serverless instance — diagnostic only, not billing.

type Source = "hud" | "rentcast";
type Kind = "live" | "cache" | "mock";

const counters: Record<string, number> = {};

export function recordCall(source: Source, kind: Kind): void {
  const key = `${source}:${kind}`;
  counters[key] = (counters[key] ?? 0) + 1;
}

export function getMetrics(): Record<string, number> {
  return { ...counters };
}

/** Total billable (live) calls observed — the number that costs real money. */
export function billableCalls(): number {
  return (counters["hud:live"] ?? 0) + (counters["rentcast:live"] ?? 0);
}

export function resetMetrics(): void {
  for (const k of Object.keys(counters)) delete counters[k];
}
