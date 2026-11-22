"use client";

import { useEffect, useRef, useState } from "react";
import { PhoneStepper } from "@/components/PhoneStepper";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Real screen recordings of the dashboard, sped up and silent. Team names and files in them are demo data. */
export const STAGE = [
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
  {
    id: "agent",
    tab: "Or build your own",
    video: "/media/agent-builds.mp4",
    poster: "/media/agent-builds.jpg",
    caption: "Need something the ready-made ones don’t cover? Describe it once and the agent builds it from the same plain editing steps.",
  },
] as const;

export function HeroStage() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const cap = useRef<HTMLParagraphElement>(null);

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

  // The caption under the recording lights up word by word as it plays, like the captions the
  // product burns into clips. All lit for people who turn motion off.
  useEffect(() => {
    const v = video.current;
    const p = cap.current;
    if (!v || !p) return;
    const words = Array.from(p.querySelectorAll<HTMLElement>(".cw"));
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let raf = 0;
    const paint = () => {
      raf = 0;
      const n = words.length;
      // a steady reading pace, finished well before the recording ends
      const per = v.duration ? Math.min(0.34, (v.duration * 0.8) / n) : 0.34;
      const lit = still ? n : v.currentTime > 0 ? Math.min(n, Math.floor(v.currentTime / per) + 1) : 0;
      words.forEach((w, i) => {
        w.classList.toggle("on", i < lit);
        w.classList.toggle("now", !still && lit < n && i === lit - 1);
      });
      if (!v.paused && !v.ended) raf = requestAnimationFrame(paint);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    for (const ev of ["play", "timeupdate", "seeked", "loadedmetadata"]) v.addEventListener(ev, kick);
    return () => {
      cancelAnimationFrame(raf);
      for (const ev of ["play", "timeupdate", "seeked", "loadedmetadata"]) v.removeEventListener(ev, kick);
    };
  }, [active]);

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
      <div className="stage-tabs" role="tablist" aria-label="See Takewon" onKeyDown={onKey}>
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
      <PhoneStepper label="See Takewon" controls="stage-panel" active={active} onChange={setActive} items={STAGE.map((s) => ({ id: s.id, label: s.tab }))} />
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
        <p className="stage-cap" ref={cap} key={item.id}>
          {item.caption.split(" ").map((w, i) => (
            <span key={i}>
              {i > 0 && " "}
              <span className="cw">{w}</span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
