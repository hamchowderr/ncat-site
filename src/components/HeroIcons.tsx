"use client";

import type { CSSProperties } from "react";
import { MovingIcon } from "@/components/MovingIcon";
import FacebookIcon from "@/components/itshover/facebook-icon";
import InstagramIcon from "@/components/itshover/instagram-icon";
import LinkedinIcon from "@/components/itshover/linkedin-icon";
import TiktokIcon from "@/components/itshover/tiktok-icon";
import TwitterXIcon from "@/components/itshover/twitter-x-icon";
import YoutubeIcon from "@/components/itshover/youtube-icon";

/** The social platforms whose logos rain down the hero's side margins. */
export const HERO_PLATFORMS = [
  { name: "TikTok", icon: TiktokIcon },
  { name: "YouTube", icon: YoutubeIcon },
  { name: "X", icon: TwitterXIcon },
  { name: "Instagram", icon: InstagramIcon },
  { name: "LinkedIn", icon: LinkedinIcon },
  { name: "Facebook", icon: FacebookIcon },
];

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

export function HeroIcons() {
  return (
    <div className="hero-icons" aria-hidden="true">
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
          <span key={i} className={`hi${i >= 6 ? " hi-extra" : ""}`} data-platform={name} style={style}>
            <MovingIcon icon={icon} size={d.size} strokeWidth={1.6} trigger=".hi" />
          </span>
        );
      })}
    </div>
  );
}
