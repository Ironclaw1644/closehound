"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
  className,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="tabular w-full bg-transparent px-2.5 py-1.5 text-sm outline-none"
        />
        {suffix && <span className="pr-2.5 text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      {label && (
        <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-input bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      >
        {children}
      </select>
    </label>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "good" | "bad";
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "tabular text-[15px] font-semibold",
          tone === "good" && "text-success",
          tone === "bad" && "text-destructive"
        )}
      >
        {value}
      </span>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  );
}
