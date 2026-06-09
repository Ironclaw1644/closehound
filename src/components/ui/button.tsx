import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const VARIANTS = {
  primary: "bg-primary text-primary-foreground hover:brightness-95 active:brightness-90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
  outline: "border border-border bg-transparent text-foreground hover:bg-secondary",
  ghost: "bg-transparent text-foreground hover:bg-secondary",
  danger: "bg-destructive text-destructive-foreground hover:brightness-95",
} as const;

const SIZES = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-4 text-sm",
  lg: "h-11 px-6 text-[15px]",
  icon: "h-9 w-9",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-md font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
