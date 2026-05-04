import "server-only";

// Local Ollama scoring. Defaults to qwen2.5; override with OLLAMA_MODEL.
// We treat the model as a JSON oracle: it returns {score, reasons[]} on a 1–10 scale.
// The score is a *sales-fit* score, not a quality score — does this business
// look like the kind that would say yes to a $497 done-for-you site this week?

const DEFAULT_BASE = "http://localhost:11434";
const DEFAULT_MODEL = "qwen2.5:latest";

export type ClassifyInput = {
  companyName: string;
  industry: string;
  city: string | null;
  rating: number | null;
  reviewCount: number | null;
  hasWebsite: boolean;
  topReview: string | null;
};

export type ClassifyOutput = {
  score: number;
  reasons: string[];
};

const SYSTEM = `You are a sales analyst at a website agency. We sell $497 done-for-you websites to local US businesses. Score this lead 1-10 on how likely they are to say yes within 7 days. Higher is better.

Strong signals:
- No existing website but rated 4.3+ with 25+ Google reviews (active, healthy business that just hasn't built one).
- Top review mentions phone calls, scheduling, or word-of-mouth (they will benefit from web).
- Service-based local business (handyman, HVAC, dental, etc.).

Negative signals:
- Already has a real website.
- Less than 10 reviews (too new or inactive).
- Rating below 4.0 (might be struggling or contentious).
- Chains, franchises, big-box (decisions made elsewhere).

Return ONLY this JSON: {"score": <1-10 number>, "reasons": ["short reason", "short reason"]}.`;

function buildPrompt(input: ClassifyInput): string {
  const lines = [
    `company: ${input.companyName}`,
    `industry: ${input.industry}`,
    `city: ${input.city ?? "unknown"}`,
    `rating: ${input.rating ?? "n/a"}`,
    `reviews: ${input.reviewCount ?? 0}`,
    `has_website: ${input.hasWebsite ? "yes" : "no"}`,
  ];
  if (input.topReview) {
    lines.push(`top_review: """${input.topReview.slice(0, 400)}"""`);
  }
  return lines.join("\n");
}

function tryParseJson(raw: string): ClassifyOutput | null {
  // Some models wrap JSON in fences. Strip them.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  // Find the first { ... } block.
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = cleaned.slice(start, end + 1);
  try {
    const parsed = JSON.parse(slice) as { score?: unknown; reasons?: unknown };
    const score = typeof parsed.score === "number" ? parsed.score : Number(parsed.score);
    if (!Number.isFinite(score)) return null;
    const reasons = Array.isArray(parsed.reasons)
      ? parsed.reasons.filter((r): r is string => typeof r === "string").slice(0, 4)
      : [];
    return { score: Math.max(1, Math.min(10, score)), reasons };
  } catch {
    return null;
  }
}

function heuristicScore(input: ClassifyInput): ClassifyOutput {
  // Used when Ollama is unavailable. Keeps the worker functional offline.
  let score = 5;
  const reasons: string[] = [];
  if (!input.hasWebsite) {
    score += 2.5;
    reasons.push("no website");
  } else {
    score -= 3;
    reasons.push("already has site");
  }
  if ((input.rating ?? 0) >= 4.5) {
    score += 1;
    reasons.push("strong rating");
  } else if ((input.rating ?? 0) < 4.0) {
    score -= 1.5;
    reasons.push("low rating");
  }
  if ((input.reviewCount ?? 0) >= 50) {
    score += 1;
    reasons.push("active review base");
  } else if ((input.reviewCount ?? 0) < 10) {
    score -= 1.5;
    reasons.push("few reviews");
  }
  return {
    score: Math.max(1, Math.min(10, Math.round(score * 10) / 10)),
    reasons,
  };
}

export async function classifyLead(input: ClassifyInput): Promise<ClassifyOutput> {
  const base = process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_BASE;
  const model = process.env.OLLAMA_MODEL?.trim() || DEFAULT_MODEL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20_000);

  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        system: SYSTEM,
        prompt: buildPrompt(input),
        stream: false,
        format: "json",
        options: { temperature: 0.2 },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      return heuristicScore(input);
    }

    const body = (await res.json()) as { response?: string };
    const parsed = body.response ? tryParseJson(body.response) : null;
    return parsed ?? heuristicScore(input);
  } catch {
    return heuristicScore(input);
  } finally {
    clearTimeout(timeoutId);
  }
}
