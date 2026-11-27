"use client";

import { useEffect, useRef, useState } from "react";
import { EarlyAccessDialog } from "@/components/EarlyAccessDialog";
import { Check, Mail } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_HREF } from "@/lib/contact";
import { CONTENT, SOURCES, STEPS } from "@/lib/early-access";
import { pickEarlyAccess, type Pick } from "@/lib/prefill";

const label = (opts: readonly { value: string; label: string }[], value: string) => opts.find((o) => o.value === value)!.label;

/** A few real answers from each step of the form, so the visitor sees what they will be asked. Tapping one starts the form with it picked. */
const PREVIEW: { answers: { pick?: Pick; text: string; fill?: string }[]; shown?: number }[] = [
  { answers: [{ text: "Your name", fill: "Ava Reyes" }, { text: "Email", fill: "ava@studio.co" }, { text: "Your channel or show", fill: "youtube.com/@avareyes" }] },
  { answers: ["podcasts", "streams", "interviews"].map((v) => ({ pick: { field: "content", value: v }, text: label(CONTENT, v) })) },
  { answers: ["tech-week", "kinn", "social"].map((v) => ({ pick: { field: "source", value: v }, text: label(SOURCES, v) })) },
];

/** The answer each step shows being picked while the steps fill in, one after another. */
const SHOWN = [-1, 0, 1];
const BEAT = 1100;

/** Fills the steps in one after another once the section is in view, then starts over. Still with reduced motion. */
function useFillIn() {
  const ref = useRef<HTMLOListElement>(null);
  const [done, setDone] = useState(-1);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let n = -1;
    const tick = () => {
      n = n >= STEPS.length - 1 ? -1 : n + 1;
      setDone(n);
      // hold on the finished form, then start over
      timer = setTimeout(tick, n === STEPS.length - 1 ? BEAT * 3 : n === -1 ? BEAT * 0.8 : BEAT);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        clearTimeout(timer);
        if (e?.isIntersecting) {
          el.classList.add("is-in");
          timer = setTimeout(tick, BEAT);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);
  return { ref, done };
}

/** The close of the page: one clear ask, the four steps of the form shown as they are, with email as the quieter second route. */
export function EarlyAccess() {
  const { ref, done } = useFillIn();
  return (
    <section className="early" id="early" aria-labelledby="early-title">
      <div className="wrap">
        <div className="early-in">
          <h2 id="early-title">Join the beta</h2>
          <p className="early-lede">
            Takewon is in beta, and I’m inviting testers a few at a time. Three short steps, about two minutes. Tap an answer to start with it picked, and I reply to everyone myself.
          </p>
          <ol className="early-steps" ref={ref}>
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className={`early-step${i <= done ? " is-done" : ""}${i === done ? " is-now" : ""}`}
                style={{ "--i": i } as React.CSSProperties}
              >
                <p className="early-step-n">
                  <span>
                    <b>{i + 1}</b>
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                  </span>{" "}
                  {s.title}
                </p>
                <div className="early-answers">
                  {PREVIEW[i]!.answers.map((a, k) =>
                    a.pick ? (
                      <button
                        key={a.text}
                        type="button"
                        className={`early-answer${i <= done && k === SHOWN[i] ? " is-picked" : ""}`}
                        onClick={() => pickEarlyAccess(a.pick!)}
                      >
                        {a.text}
                      </button>
                    ) : (
                      <span key={a.text} className="early-answer is-field" aria-hidden="true" style={{ "--k": k } as React.CSSProperties}>
                        <span className="ph">{a.text}</span>
                        <span className="fill">{a.fill}</span>
                      </span>
                    ),
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="early-cta">
            <a className="btn primary lg" href="#early">
              Join the beta
            </a>
          </div>
          <div className="socials">
            <p>Questions first? Send an email.</p>
            <a href={CONTACT_HREF}>
              <Mail size={18} aria-hidden="true" /> {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <EarlyAccessDialog />
      </div>
    </section>
  );
}
