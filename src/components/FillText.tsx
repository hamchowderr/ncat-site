"use client";

import { useEffect, useRef } from "react";

/**
 * A line of text that fills in, word by word, as the page scrolls. Words start pale grey and turn
 * ink; the phrases in [brackets] turn the brand gradient and get a highlighter swept behind them.
 * Only the first words are filled when the page opens. Fully filled for people who turn motion off.
 */
export function FillText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const parts = text.split(/(\[[^\]]+\])/).filter(Boolean);
  let n = 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>(".fw"));
    const marks = Array.from(el.querySelectorAll<HTMLElement>(".hl"));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let raf = 0;
    const paint = () => {
      raf = 0;
      let p = 1;
      if (!reduce) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        // starts with a few words lit, and finishes by the time the line reaches the top fifth of the screen
        const span = Math.max(260, top - window.innerHeight * 0.2);
        p = Math.min(1, 0.06 + (0.94 * window.scrollY) / span);
      }
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < lit));
      marks.forEach((m) => m.classList.toggle("on", Number(m.dataset.last) < lit));
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
      {parts.map((part, pi) => {
        const hot = part.startsWith("[");
        const words = (hot ? part.slice(1, -1) : part).split(/(\s+)/).filter((w) => w !== "");
        const spans = words.map((w, wi) => (/^\s+$/.test(w) ? w : <span key={wi} className={hot ? "fw hot" : "fw"} data-i={n++}>{w}</span>));
        return hot ? (
          <span key={pi} className="hl" data-last={n - 1}>
            {spans}
          </span>
        ) : (
          <span key={pi}>{spans}</span>
        );
      })}
    </p>
  );
}
