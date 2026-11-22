"use client";

import { useEffect, useRef } from "react";
import { FileVideo } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SPLIT_STEPS } from "./SplitScene";

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
const TOKENS = ["tiktok", "instagram", "youtube", "facebook"] as const;

/** A recording going down a line: through the five steps, out as a clip for every feed. */
function FactoryLine() {
  return (
    <div className="fline" role="img" aria-label="One recording goes through five steps and out to TikTok, Instagram, YouTube, LinkedIn, Facebook and X">
      <span className="fline-in">
        <FileVideo size={18} strokeWidth={2.2} />
        <span>interview.mp4</span>
      </span>
      <span className="fline-belt">
        <i className="fline-track" />
        {SPLIT_STEPS.map((s) => (
          <span key={s.move} className="split-n fline-st" data-move={s.move}>
            <s.icon size={16} strokeWidth={2.4} />
          </span>
        ))}
        {TOKENS.map((t, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={t} className="fline-tok" src={`/media/split/${t}.jpg`} alt="" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </span>
      <span className="fline-out">
        {MID_CTA_FEEDS.map((f) => (
          <span key={f.key} className="fline-feed">
            <Logo name={f.key} size={22} />
          </span>
        ))}
      </span>
    </div>
  );
}

export function MidCta({ look = "rails" }: { look?: "rails" | "line" }) {
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
        <div className={`mid-cta-in mid-cta-${look}`} ref={ref}>
          {look === "line" && <FactoryLine />}
          {look === "rails" && (
          <ul className="mid-feeds" aria-label="Ready for TikTok, Instagram, YouTube, LinkedIn, Facebook and X">
            {MID_CTA_FEEDS.map((f, i) => (
              <li key={f.key} className="mid-feed" data-feed={f.key} style={{ "--i": i } as React.CSSProperties}>
                <Logo name={f.key} size={30} />
              </li>
            ))}
          </ul>
          )}
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
