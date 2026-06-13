import { cn } from "@/lib/utils";
import { GRADE_META, type Grade } from "@/lib/config/assumptions";

const TONE: Record<string, string> = {
  success: "border-success/40 bg-success/12 text-success",
  accent: "border-primary/40 bg-primary/12 text-primary",
  warning: "border-warning/40 bg-warning/12 text-warning",
  danger: "border-destructive/45 bg-destructive/12 text-destructive",
};

/** A–F cash-flow opportunity grade. `withLabel` shows the word (Prime/Strong…). */
export function GradeBadge({
  grade,
  withLabel = false,
  className,
}: {
  grade: Grade;
  withLabel?: boolean;
  className?: string;
}) {
  const meta = GRADE_META[grade];
  return (
    <span
      title={meta.blurb}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wide",
        TONE[meta.tone],
        className
      )}
    >
      <span className="grid h-4 w-4 place-items-center rounded-[4px] bg-foreground/10">{grade}</span>
      {withLabel && <span className="font-sans font-semibold tracking-normal">{meta.label}</span>}
    </span>
  );
}
