"use client";

import { EarlyAccessDialog } from "@/components/EarlyAccessDialog";
import { Mail } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_HREF } from "@/lib/contact";
import { CONTENT, HOSTING, JOBS, STEPS } from "@/lib/early-access";
import { pickEarlyAccess, type Pick } from "@/lib/prefill";

const label = (opts: readonly { value: string; label: string }[], value: string) => opts.find((o) => o.value === value)!.label;

/** A few real answers from each step of the form, so the visitor sees what they will be asked. Tapping one starts the form with it picked. */
const PREVIEW: { answers: { pick?: Pick; text: string }[] }[] = [
  { answers: [{ text: "Your name" }, { text: "Email" }, { text: "Your channel or show" }] },
  { answers: ["podcasts", "streams", "interviews"].map((v) => ({ pick: { field: "content", value: v }, text: label(CONTENT, v) })) },
  { answers: [
    { pick: { field: "hosting", value: "server" }, text: label(HOSTING, "server") },
    { pick: { field: "hosting", value: "machine" }, text: "My own always-on machine" },
  ] },
  { answers: ["captions", "silences", "vertical"].map((v) => ({ pick: { field: "jobs", value: v }, text: label(JOBS, v) })) },
];

/** The close of the page: one clear ask, the four steps of the form shown as they are, with email as the quieter second route. */
export function EarlyAccess() {
  return (
    <section className="early" id="early" aria-labelledby="early-title">
      <div className="wrap">
        <div className="early-in">
          <h2 id="early-title">Get early access</h2>
          <p className="early-lede">
            Four short steps, about two minutes. Tap an answer to start with it picked, and I reply to everyone myself.
          </p>
          <ol className="early-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="early-step" style={{ "--i": i } as React.CSSProperties}>
                <p className="early-step-n">
                  <span>{i + 1}</span> {s.title}
                </p>
                <div className="early-answers">
                  {PREVIEW[i]!.answers.map((a) =>
                    a.pick ? (
                      <button key={a.text} type="button" className="early-answer" onClick={() => pickEarlyAccess(a.pick!)}>
                        {a.text}
                      </button>
                    ) : (
                      <span key={a.text} className="early-answer is-field" aria-hidden="true">
                        {a.text}
                      </span>
                    ),
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="early-cta">
            <a className="btn primary lg" href="#early">
              Get early access
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
