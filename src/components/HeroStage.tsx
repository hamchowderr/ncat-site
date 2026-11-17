"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Real screen recordings of the dashboard, sped up and silent. Team names and files in them are demo data. */
export const STAGE = [
  {
    id: "agent",
    tab: "Describe it",
    video: "/media/agent-builds.mp4",
    poster: "/media/agent-builds.jpg",
    caption: "The agent reads your request, builds the automation on the canvas and asks before it changes anything.",
  },
  {
    id: "run",
    tab: "It runs by itself",
    video: "/media/live-run.mp4",
    poster: "/media/live-run.jpg",
    caption: "A new upload starts the run. Each step lights up as it finishes, with nobody at the desk.",
  },
  {
    id: "review",
    tab: "Review",
    video: "/media/review.mp4",
    poster: "/media/review.jpg",
    caption: "An approval step pauses the run until the right person on the team says yes.",
  },
  {
    id: "outputs",
    tab: "Outputs",
    video: "/media/outputs.mp4",
    poster: "/media/outputs.jpg",
    caption: "Every clip lands in your own storage, grouped by the run that made it.",
  },
] as const;

export function HeroStage() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    // Read the setting directly as well: during hydration the hook still reports the server value.
    if (reduce || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    // Autoplay can be refused (low-power mode); the poster stays up and the tabs still work.
    v.play()?.catch(() => {});
  }, [active, reduce]);

  const item = STAGE[active];

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (active + step + STAGE.length) % STAGE.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="stage" id="see-it">
      <div className="stage-tabs" role="tablist" aria-label="See the dashboard" onKeyDown={onKey}>
        {STAGE.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            id={`tab-${s.id}`}
            aria-selected={i === active}
            aria-controls="stage-panel"
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
          >
            {s.tab}
          </button>
        ))}
      </div>
      <div className="stage-panel" id="stage-panel" role="tabpanel" aria-labelledby={`tab-${item.id}`}>
        <div className="stage-screen">
          <video
            key={item.id}
            ref={video}
            src={item.video}
            poster={item.poster}
            muted
            playsInline
            controls={reduce}
            preload="metadata"
            aria-label={`Screen recording: ${item.caption}`}
            onEnded={() => setActive((a) => (a + 1) % STAGE.length)}
          />
        </div>
        <p className="stage-cap">{item.caption}</p>
      </div>
    </div>
  );
}
