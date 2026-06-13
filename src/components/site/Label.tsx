import { cn } from "@/lib/utils";

/** walkperro-style mono eyebrow: `// LIVE — V1`. */
export function Label({
  children,
  accent,
  gold,
  live,
  className,
}: {
  children: React.ReactNode;
  accent?: boolean;
  gold?: boolean;
  live?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "label inline-flex items-center gap-2",
        accent && "label-accent",
        gold && "label-gold",
        className
      )}
    >
      {live && <span className="live-dot" aria-hidden />}
      <span aria-hidden className="opacity-60">//</span>
      {children}
    </span>
  );
}
