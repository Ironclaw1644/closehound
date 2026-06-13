import { cn } from "@/lib/utils";

/** CloseHound reticle mark — a "lock-on" target: the screener sniffing out and
 *  locking onto a deal. Chartreuse tile, black reticle. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden="true">
      <rect x="0" y="0" width="32" height="32" rx="8" fill="var(--primary)" />
      <g
        fill="none"
        stroke="var(--primary-foreground)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* corner brackets — a reticle locking the target */}
        <path d="M9 7 H7 V9" />
        <path d="M23 7 H25 V9" />
        <path d="M9 25 H7 V23" />
        <path d="M23 25 H25 V23" />
        {/* center lock dot */}
        <circle cx="16" cy="16" r="3.4" fill="var(--primary-foreground)" stroke="none" />
      </g>
    </svg>
  );
}

export function Logo({ className, muted = true }: { className?: string; muted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight">
        Close<span className={muted ? "text-muted-foreground" : "text-primary"}>Hound</span>
      </span>
    </span>
  );
}
