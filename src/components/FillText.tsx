"use client";

import { useEffect, useRef } from "react";

/**
 * A line of text that fills in, word by word, as the page scrolls: the words start a soft grey
 * and turn ink, and the `hot` words turn the brand gradient. It is already part filled when the
 * page opens, so nothing is unreadable, and fully filled for people who turn motion off.
 */
export function FillText({ text, hot = [], className }: { text: string; hot?: string[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = text.split(" ");
  const isHot = (w: string) => hot.includes(w.replace(/[^\p{L}\p{N}-]/gu, "").toLowerCase());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>(".fw"));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (reduce) {
      spans.forEach((s) => s.classList.add("on"));
      return;
    }
    let raf = 0;
    const paint = () => {
      raf = 0;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY;
      // a third filled at the top of the page, all filled by the time the line is a fifth of the way down the screen
      const span = Math.max(220, top - vh * 0.2);
      const p = Math.min(1, 0.32 + (0.68 * window.scrollY) / span);
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle("on", i < lit));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <p ref={ref} className={`fill-text ${className ?? ""}`}>
      {words.map((w, i) => (
        <span key={i}>
          <span className={isHot(w) ? "fw hot" : "fw"}>{w}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
