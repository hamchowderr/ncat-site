"use client";

import { useEffect, useState } from "react";
import { HeroStage } from "@/components/HeroStage";
import { prefillEarlyAccess } from "@/lib/prefill";
import { useReducedMotion } from "@/lib/useReducedMotion";

const WORDS = ["clipped", "captioned", "transcribed", "resized"];

/** The ready-made automations the dashboard ships with, by their names in the app. */
export const PRESETS = [
  "Clips for social",
  "Caption every new upload",
  "Vertical and captioned from a watched folder",
  "Episode to audio and transcript",
  "Captioned video with your logo",
  "Transcribe a link",
];

export function Hero() {
  const reduce = useReducedMotion();
  const [word, setWord] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setWord((w) => (w + 1) % WORDS.length), 2600);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap">
        <h1 id="hero-title">
          Your content, organized and{" "}
          <span className="rot" aria-hidden="true">
            <span key={WORDS[word]} className="rot-word">
              {WORDS[word]}
            </span>
          </span>
          <span className="sr">clipped</span> automatically
        </h1>
        <p className="hero-sub">
          Pick a ready-made automation and switch it on. From then on, every new recording is filed, transcribed, cut and captioned by itself,
          on a server you own, with no AI tokens spent on each video.
        </p>
        <div className="hero-cta">
          <a className="btn primary" href="#early">
            Get early access
          </a>
          <a className="btn ghost" href="#templates">
            See the automations
          </a>
        </div>
        <p className="presets-lead" id="presets-title">
          Ready-made automations, ready to switch on
        </p>
        <ul className="chips" aria-labelledby="presets-title">
          {PRESETS.map((name) => (
            <li key={name}>
              <button type="button" onClick={() => prefillEarlyAccess(name)}>
                {name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <HeroStage />
    </section>
  );
}
