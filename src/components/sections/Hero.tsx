"use client";

import { useEffect, useState } from "react";
import { FillText } from "@/components/FillText";
import { HeroIcons } from "@/components/HeroIcons";
import { HeroStage } from "@/components/HeroStage";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { TRIAL_LABEL, TRIAL_NOTE, trialUrl } from "@/lib/trial";

const TRIAL = trialUrl();

const WORDS = ["clipped", "captioned", "transcribed", "resized"];

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
      <div className="wrap hero-top">
        <HeroIcons />
        <p className="slogan">
          Organized and{" "}
          <span className="rot" aria-hidden="true">
            <span key={WORDS[word]} className="rot-word">
              {WORDS[word]}
            </span>
          </span>
          <span className="sr">clipped</span> automatically
        </p>
        <h1 id="hero-title">Your content, social media ready.</h1>
        <FillText
          className="hero-sub"
          text="Pick a [ready-made automation] and switch it on. From then on, every new recording is [filed, transcribed, cut and captioned] by itself, on a [server you own], with [no AI tokens] spent on each video."
        />
        <div className="hero-cta">
          {TRIAL ? (
            <>
              <a className="btn primary" href={TRIAL}>
                {TRIAL_LABEL}
              </a>
              <a className="btn ghost" href="#early">
                Get early access
              </a>
              <span className="hero-note">{TRIAL_NOTE}</span>
            </>
          ) : (
            <>
              <a className="btn primary" href="#early">
                Get early access
              </a>
            </>
          )}
        </div>
      </div>
      <HeroStage />
    </section>
  );
}
