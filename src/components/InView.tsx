"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/**
 * A block that gets the class `is-in` the first time it scrolls into view, so its CSS can play an entrance.
 * With reduced motion (or no IntersectionObserver) it is in from the start.
 */
export function InView({ children, className, style, threshold = 0.25 }: { children: ReactNode; className?: string; style?: CSSProperties; threshold?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
