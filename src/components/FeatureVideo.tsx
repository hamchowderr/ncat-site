"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

type Props = { name: string; label: string; small?: boolean };

/**
 * A silent screen recording of the dashboard that plays while it is on screen and pauses
 * when it scrolls away. With reduced motion it stays on its first frame and shows controls,
 * so the visitor can still play it.
 */
export function FeatureVideo({ name, label, small }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduce || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play()?.catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <figure className={small ? "shot sm" : "shot"}>
      <video
        ref={ref}
        src={`/media/features/${name}.mp4`}
        poster={`/media/features/${name}.jpg`}
        aria-label={label}
        muted
        loop
        playsInline
        preload="metadata"
        controls={reduce}
        width={1280}
        height={800}
      />
    </figure>
  );
}
