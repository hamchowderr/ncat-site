"use client";

import { useEffect, useRef, useState } from "react";
import { HeroStage } from "@/components/HeroStage";
import { prefillEarlyAccess } from "@/lib/prefill";
import { useReducedMotion } from "@/lib/useReducedMotion";

const WORDS = ["clipped", "captioned", "transcribed", "resized"];

export const EXAMPLES = [
  "Podcast to vertical clips",
  "Caption every upload",
  "Cut the silences",
  "One upload, every shape",
];

export function Hero() {
  const reduce = useReducedMotion();
  const [word, setWord] = useState(0);
  const [text, setText] = useState("");
  const input = useRef<HTMLInputElement>(null);

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
          Describe the job and the agent builds the automation. From then on, every new recording is filed, transcribed, cut and captioned by
          itself, on a server you own.
        </p>
        <form
          className="ask"
          onSubmit={(e) => {
            e.preventDefault();
            prefillEarlyAccess(text);
          }}
        >
          <label className="sr" htmlFor="ask-input">
            Describe an automation
          </label>
          <input
            ref={input}
            id="ask-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Every new episode: transcript, MP3 and captioned clips"
            autoComplete="off"
          />
          <button className="btn primary" type="submit">
            Set it up
          </button>
        </form>
        <ul className="chips" aria-label="Examples">
          {EXAMPLES.map((ex) => (
            <li key={ex}>
              <button
                type="button"
                onClick={() => {
                  setText(ex);
                  input.current?.focus();
                }}
              >
                {ex}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <HeroStage />
    </section>
  );
}
