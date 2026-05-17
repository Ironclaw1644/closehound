"use client";

import { useEffect, useRef, useState } from "react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  // direction tells the element where to come from
  from?: "up" | "left" | "right" | "scale" | "fade";
  // amount of viewport (0..1) that must be visible to trigger
  threshold?: number;
};

const FROM_CLASS = {
  up: "translate-y-6",
  left: "-translate-x-4",
  right: "translate-x-4",
  scale: "scale-[0.96]",
  fade: "",
} as const;

export function Reveal({
  children,
  className = "",
  delay = 0,
  from = "up",
  threshold = 0.12,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Default shown=true so SSR + hydration always paints visible content.
  // The fade-up animation kicks in for real "below the fold" elements via the
  // useEffect below: it briefly hides the element then animates it in once it
  // enters the viewport. This guarantees content is never stuck invisible
  // even if IntersectionObserver is unreliable.
  const [shown, setShown] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (typeof IntersectionObserver === "undefined") return;
    const node = ref.current;
    const rect = node.getBoundingClientRect();
    const startsBelowFold = rect.top > (window.innerHeight || 0);
    if (!startsBelowFold) return; // already visible — leave shown=true

    // Below-the-fold element: hide it, then animate in when it intersects.
    setShown(false);
    setAnimateIn(true);
    let cancelled = false;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !cancelled) {
            setShown(true);
            obs.disconnect();
            break;
          }
        }
      },
      { threshold }
    );
    obs.observe(node);
    const fallback = window.setTimeout(() => {
      if (cancelled) return;
      setShown(true);
    }, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      obs.disconnect();
    };
  }, [threshold]);

  const transform = shown ? "translate-y-0 translate-x-0 scale-100" : FROM_CLASS[from];
  const opacity = shown ? "opacity-100" : "opacity-0";
  const transition = animateIn
    ? "transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
    : "";

  return (
    <div
      ref={ref}
      className={`${transition} ${transform} ${opacity} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
