"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MovingIcon } from "@/components/MovingIcon";
import FacebookIcon from "@/components/itshover/facebook-icon";
import InstagramIcon from "@/components/itshover/instagram-icon";
import LinkedinIcon from "@/components/itshover/linkedin-icon";
import TiktokIcon from "@/components/itshover/tiktok-icon";
import TwitterXIcon from "@/components/itshover/twitter-x-icon";
import YoutubeIcon from "@/components/itshover/youtube-icon";
import { CLIP_SHAPES, formatLimit, frameName } from "@/lib/clipShapes";

/** The social platforms whose logos rain down the hero's side margins. */
export const HERO_PLATFORMS = [
  { name: "TikTok", icon: TiktokIcon },
  { name: "YouTube", icon: YoutubeIcon },
  { name: "X", icon: TwitterXIcon },
  { name: "Instagram", icon: InstagramIcon },
  { name: "LinkedIn", icon: LinkedinIcon },
  { name: "Facebook", icon: FacebookIcon },
] as const;

// how near the cursor has to come before a logo drifts out of its way, and how far it goes
const REACH = 150;
const SHOVE = 46;

/**
 * Each logo falls twice, once down each side margin. Every drop on a side shares one pace and
 * they leave at even gaps, so they never bunch up or cross. `top` is where the first six rest
 * when motion is turned off.
 */
const SIDE = { left: 18, right: 21 } as const;
const LANES = [
  { p: 0, side: "left", x: 20, size: 92, tilt: -14, top: 10 },
  { p: 3, side: "right", x: 40, size: 96, tilt: 16, top: 0 },
  { p: 1, side: "left", x: 44, size: 104, tilt: 12, top: 210 },
  { p: 4, side: "right", x: 20, size: 100, tilt: -12, top: 220 },
  { p: 2, side: "left", x: 30, size: 70, tilt: -8, top: 440 },
  { p: 5, side: "right", x: 76, size: 86, tilt: 10, top: 450 },
  { p: 3, side: "left", x: 64, size: 72, tilt: 18, top: 0 },
  { p: 0, side: "right", x: 90, size: 74, tilt: -16, top: 0 },
  { p: 5, side: "left", x: 16, size: 80, tilt: 8, top: 0 },
  { p: 1, side: "right", x: 30, size: 88, tilt: -6, top: 0 },
  { p: 4, side: "left", x: 50, size: 66, tilt: -18, top: 0 },
  { p: 2, side: "right", x: 60, size: 64, tilt: 14, top: 0 },
] as const;
const DROPS = LANES.map((lane, i) => {
  const dur = SIDE[lane.side];
  const nth = Math.floor(i / 2); // 6 per side, alternating sides
  return { ...lane, dur, delay: -(nth * dur) / 6 - (lane.side === "right" ? dur / 12 : 0) };
});

/**
 * Logos drift out of the cursor's way. Clicking one stops it and shows the clip shapes the
 * dashboard makes for that platform, beside it in the margin; clicking anywhere else lets it go.
 * Decoration only (hidden from screen readers): the same shapes are listed in the platforms section.
 */
export function HeroIcons() {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const box = root.current;
    const hero = box?.closest<HTMLElement>(".hero");
    if (!box || !hero || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const pushes = Array.from(box.querySelectorAll<HTMLElement>(".hi-push"));
    let pointer: { x: number; y: number } | null = null;
    let raf = 0;
    const tick = () => {
      raf = 0;
      for (const el of pushes) {
        if (!pointer || el.parentElement!.classList.contains("open")) {
          el.style.transform = "";
          continue;
        }
        const r = el.parentElement!.getBoundingClientRect();
        const dx = r.left + r.width / 2 - pointer.x;
        const dy = r.top + r.height / 2 - pointer.y;
        const d = Math.hypot(dx, dy) || 1;
        // eases off again once the cursor is right over the logo, so it can still be caught and clicked
        const inner = r.width * 0.3;
        const push = d < REACH ? ((REACH - d) / REACH) * SHOVE * Math.min(1, Math.max(0, (d - inner) / 40)) : 0;
        el.style.transform = push ? `translate(${(dx / d) * push}px, ${(dy / d) * push}px)` : "";
      }
      // keep following while the logos fall under a still cursor
      if (pointer) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => {
      pointer = null;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
    };
  }, []);

  useEffect(() => {
    if (open === null) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest?.(".hi.open")) setOpen(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="hero-icons" aria-hidden="true" ref={root}>
      {DROPS.map((d, i) => {
        const { name, icon } = HERO_PLATFORMS[d.p];
        const style = {
          [d.side]: `${d.x}px`,
          "--top": `${d.top}px`,
          "--dur": `${d.dur}s`,
          "--delay": `${d.delay}s`,
          "--tilt": `${d.tilt}deg`,
        } as CSSProperties;
        return (
          <span
            key={i}
            className={`hi hi-${d.side}${i >= 6 ? " hi-extra" : ""}${open === i ? " open" : ""}`}
            data-platform={name}
            style={style}
            onClick={(e) => {
              // undo the tilt the logo stopped at, so the shapes read level
              const tag = e.currentTarget.querySelector<HTMLElement>(".hi-tag");
              if (tag) tag.style.rotate = `${-parseFloat(getComputedStyle(e.currentTarget).rotate || "0")}deg`;
              setOpen(open === i ? null : i);
            }}
          >
            <span className="hi-push">
              <MovingIcon icon={icon} size={d.size} strokeWidth={1.6} trigger=".hi" />
            </span>
            <span className="hi-tag">
              <b>{name}</b>
              {CLIP_SHAPES[name].map((q) => (
                <span key={q.place}>
                  {q.place === name ? "" : `${q.place}: `}
                  {frameName(q.frame)}, up to {formatLimit(q.maxSeconds)}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
}
