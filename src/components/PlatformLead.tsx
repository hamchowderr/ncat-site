"use client";

import { useEffect, useRef } from "react";
import { siFacebook, siInstagram, siTiktok, siX, siYoutube } from "simple-icons";
import { FileLogo } from "@/components/brand/Logo";

/**
 * A lead paragraph read in the platforms' own colours: each phrase belongs to one platform and
 * takes that platform's colour as it scrolls into view. The platforms' real logos stand in two
 * rails outside the text, left and right in turn, and each pops in with its phrase, so the
 * words themselves stay clean to read.
 */

export type Platform = "tiktok" | "instagram" | "youtube" | "facebook" | "linkedin" | "x";

export const PLATFORM_NAMES: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X",
};

/** Each platform's own brand colour, from its brand guidelines (Instagram's is its gradient). */
export const PLATFORM_COLOURS: Record<Platform, string> = {
  tiktok: "#000000",
  instagram: "#e1306c",
  youtube: "#ff0000",
  facebook: "#0866ff",
  linkedin: "#0a66c2",
  x: "#000000",
};

function Svg({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg className="pl-logo" viewBox="0 0 24 24" aria-hidden="true" data-platform={label}>
      {children}
    </svg>
  );
}

/** The platforms' marks in their real colours: TikTok's cyan and red offsets, Instagram's gradient. */
export function PlatformMark({ platform }: { platform: Platform }) {
  switch (platform) {
    case "tiktok":
      return (
        <Svg label="tiktok">
          <path d={siTiktok.path} fill="#25f4ee" transform="translate(-0.7 -0.7)" />
          <path d={siTiktok.path} fill="#fe2c55" transform="translate(0.7 0.7)" />
          <path d={siTiktok.path} fill="#000" />
        </Svg>
      );
    case "instagram":
      return (
        <Svg label="instagram">
          <defs>
            <radialGradient id="pl-ig" cx="0.3" cy="1.07" r="1.3">
              <stop offset="0" stopColor="#fdf497" />
              <stop offset="0.1" stopColor="#fdf497" />
              <stop offset="0.5" stopColor="#fd5949" />
              <stop offset="0.68" stopColor="#d6249f" />
              <stop offset="1" stopColor="#285aeb" />
            </radialGradient>
          </defs>
          <path d={siInstagram.path} fill="url(#pl-ig)" />
        </Svg>
      );
    case "youtube":
      return (
        <Svg label="youtube">
          <path d="M5 7.5h14v9H5z" fill="#fff" />
          <path d={siYoutube.path} fill="#ff0000" />
        </Svg>
      );
    case "facebook":
      return (
        <Svg label="facebook">
          <path d={siFacebook.path} fill="#0866ff" />
        </Svg>
      );
    case "x":
      return (
        <Svg label="x">
          <path d={siX.path} fill="#000" />
        </Svg>
      );
    case "linkedin":
      return (
        <span className="pl-logo pl-logo-file" aria-hidden="true" data-platform="linkedin">
          <FileLogo name="linkedin" size={40} />
        </span>
      );
  }
}

export type LeadPhrase = { platform: Platform; text: string };

export function PlatformLead({ phrases, className = "" }: { phrases: LeadPhrase[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const parts = Array.from(root.querySelectorAll<HTMLElement>(".pl-phrase"));
    const light = (p: Element) => {
      p.classList.add("is-on");
      root.querySelector(`.pl-rail [data-platform="${(p as HTMLElement).dataset.platform}"]`)?.classList.add("is-on");
    };
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || typeof IntersectionObserver === "undefined") {
      parts.forEach(light);
      return;
    }
    root.classList.add("pl-armed");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            light(e.target);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -22% 0px" },
    );
    parts.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, []);

  const rail = (side: "left" | "right") => (
    <span className={`pl-rail pl-rail-${side}`} aria-hidden="true">
      {phrases
        .filter((_, i) => (i % 2 === 0) === (side === "left"))
        .map((p) => (
          <span key={p.platform} className="pl-rail-logo" data-platform={p.platform}>
            <PlatformMark platform={p.platform} />
          </span>
        ))}
    </span>
  );

  return (
    <div ref={ref} className={`pl-wrap ${className}`}>
      {rail("left")}
      <p className="pl-lead">
        {phrases.map((p, i) => (
          <span key={i}>
            <span className={`pl-phrase pl-${p.platform}`} data-platform={p.platform}>
              <span className="pl-words">{p.text}</span>
            </span>{" "}
          </span>
        ))}
      </p>
      {rail("right")}
    </div>
  );
}
