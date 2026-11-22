"use client";

import { useEffect, useRef } from "react";
import { Logo } from "@/components/brand/Logo";

/** The feeds every recording ends up on, in the order they light up. */
export const MID_CTA_FEEDS = [
  { key: "tiktok", name: "TikTok" },
  { key: "instagram", name: "Instagram" },
  { key: "youtube", name: "YouTube" },
  { key: "linkedin", name: "LinkedIn" },
  { key: "facebook", name: "Facebook" },
  { key: "x", name: "X" },
] as const;

/**
 * The ask, straight after the scene that shows the whole idea, so nobody has to scroll to the end of the page to sign up.
 * The feeds' real logos float in on both sides of the words (Chowderr's pick, 2026-11-22); where there is no room
 * beside them they line up in one row above the headline.
 */
export function MidCta() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="mid-cta" aria-labelledby="mid-cta-title">
      <div className="wrap">
        <div className="mid-cta-in mid-cta-rails" ref={ref}>
          <ul className="mid-feeds" aria-label="Ready for TikTok, Instagram, YouTube, LinkedIn, Facebook and X">
            {MID_CTA_FEEDS.map((f, i) => (
              <li key={f.key} className="mid-feed" data-feed={f.key} style={{ "--i": i } as React.CSSProperties}>
                <Logo name={f.key} size={30} />
              </li>
            ))}
          </ul>
          <h2 id="mid-cta-title">Use AI once. Every recording after that runs by itself.</h2>
          <p>
            Build your content factory once. From then on it runs on a server or
            an always-on machine you own, with no fee for each video.
          </p>
          <a className="btn primary" href="#early">
            Get early access
          </a>
        </div>
      </div>
    </section>
  );
}
