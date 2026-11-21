"use client";

import { useEffect, useRef } from "react";
import { Maximize2 } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Screens this narrow show the "Watch full screen" button under each recording. */
export const PHONE = "(max-width: 640px)";

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

  // a whole dashboard window is small on a phone, so the recording opens full screen there (turn the phone to see it large)
  const full = () => {
    const v = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!v) return;
    if (v.requestFullscreen) v.requestFullscreen().catch(() => v.webkitEnterFullscreen?.());
    else v.webkitEnterFullscreen?.();
    v.play()?.catch(() => {});
  };

  return (
    <figure className={small ? "shot sm" : "shot"}>
      <video
        onClick={() => {
          if (window.matchMedia?.(PHONE).matches) full();
        }}
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
      <button type="button" className="shot-full" onClick={full}>
        <Maximize2 size={14} strokeWidth={2.2} aria-hidden="true" />
        Watch full screen
      </button>
    </figure>
  );
}
