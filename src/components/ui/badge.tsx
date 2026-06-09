import { cn } from "@/lib/utils";

/** Deal Score badge — chartreuse for strong, amber mid, red weak. */
export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const tone =
    score >= 70
      ? "bg-primary text-primary-foreground"
      : score >= 45
        ? "border border-warning/40 bg-warning/15 text-warning"
        : "border border-destructive/40 bg-destructive/15 text-destructive";
  return (
    <span
      className={cn(
        "tabular inline-flex h-6 min-w-[2.25rem] items-center justify-center rounded-md px-1.5 text-xs font-bold",
        tone,
        className
      )}
    >
      {score}
    </span>
  );
}

export function Pill({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  const tones = {
    muted: "border-border bg-secondary text-muted-foreground",
    accent: "border-primary/40 bg-primary/10 text-primary",
    success: "border-success/40 bg-success/10 text-success",
    warning: "border-warning/40 bg-warning/10 text-warning",
    danger: "border-destructive/40 bg-destructive/10 text-destructive",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
