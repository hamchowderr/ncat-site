"use client";

import { CONTACT_EMAIL } from "@/lib/contact";
import { useEffect, useRef, useState } from "react";
import {
  CONTENT,
  EDITORS,
  HOSTING,
  JOBS,
  PLATFORMS,
  ROLES,
  SOURCES,
  STEPS,
  TEAM_SIZES,
  TOOLKIT,
  VOLUMES,
  checkEarlyAccess,
  type EarlyAccessInput,
  type Errors,
  type Field,
} from "@/lib/early-access";
import { PREFILL_EVENT, type SignedUp } from "@/lib/prefill";

type Option = { readonly value: string; readonly label: string };

const EMPTY: EarlyAccessInput = {
  name: "",
  email: "",
  link: "",
  role: "",
  teamSize: "",
  content: [],
  platforms: [],
  volume: "",
  hosting: "",
  toolkit: "",
  editors: [],
  jobs: [],
  details: "",
  source: "",
  website: "",
};

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; name: string } | { kind: "error"; message: string };

export function EarlyAccessForm({ onSent, tried = "" }: { onSent?: (who: SignedUp) => void; tried?: string } = {}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<EarlyAccessInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    const on = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      if (text) setData((d) => (d.details ? d : { ...d, details: text }));
    };
    window.addEventListener(PREFILL_EVENT, on);
    return () => window.removeEventListener(PREFILL_EVENT, on);
  }, []);

  useEffect(() => {
    if (moved.current) heading.current?.focus();
  }, [step]);

  const set = <K extends Field>(k: K, v: EarlyAccessInput[K]) => {
    setData((d) => ({ ...d, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const toggle = (k: "content" | "platforms" | "editors" | "jobs", v: string) => {
    const list = data[k];
    set(k, list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  };

  const last = step === STEPS.length - 1;

  const next = () => {
    const r = checkEarlyAccess(data, STEPS[step].fields);
    if (!r.ok) {
      setErrors(r.errors);
      const first = STEPS[step].fields.find((f) => r.errors[f]);
      if (first) document.getElementById(`ea-${first}`)?.focus();
      return false;
    }
    setErrors({});
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!next()) return;
    if (!last) {
      moved.current = true;
      setStep((s) => s + 1);
      return;
    }
    const all = checkEarlyAccess(data);
    if (!all.ok) {
      setErrors(all.errors);
      const i = STEPS.findIndex((s) => s.fields.some((f) => all.errors[f]));
      if (i >= 0) setStep(i);
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/early-access", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(tried ? { ...data, tried } : data) });
      if (res.ok) {
        setStatus({ kind: "sent", name: data.name.split(" ")[0] });
        onSent?.({ name: data.name, email: data.email });
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { errors?: Errors; error?: string };
      if (res.status === 422 && body.errors) {
        setErrors(body.errors);
        const i = STEPS.findIndex((s) => s.fields.some((f) => body.errors?.[f]));
        if (i >= 0) setStep(i);
        setStatus({ kind: "idle" });
        return;
      }
      setStatus({ kind: "error", message: body.error ?? `It didn’t send on my side. Try again in a minute, or email ${CONTACT_EMAIL}.` });
    } catch {
      setStatus({ kind: "error", message: "It couldn’t reach the server. Check your connection and try again." });
    }
  };

  if (status.kind === "sent") {
    return (
      <div className="ea-done" role="status">
        <h3>Thanks{status.name ? `, ${status.name}` : ""}. You’re on the list.</h3>
        <p>I read every one of these myself and reply by email.</p>
      </div>
    );
  }

  const err = (f: Field) =>
    errors[f] ? (
      <p className="ea-err" id={`ea-${f}-err`}>
        {errors[f]}
      </p>
    ) : null;
  const describedBy = (f: Field, hint?: boolean) => [hint && `ea-${f}-hint`, errors[f] && `ea-${f}-err`].filter(Boolean).join(" ") || undefined;

  const choice = (f: "role" | "teamSize" | "volume" | "hosting" | "toolkit" | "source", legend: string, options: readonly Option[], optional = false) => (
    <fieldset className="ea-q" id={`ea-${f}`} tabIndex={-1} aria-describedby={describedBy(f)} aria-invalid={!!errors[f] || undefined}>
      <legend>
        {legend}
        {optional && <span className="opt"> (optional)</span>}
      </legend>
      <div className="pills">
        {options.map((o) => (
          <label key={o.value} className="pill">
            <input type="radio" name={f} value={o.value} checked={data[f] === o.value} onChange={() => set(f, o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {err(f)}
    </fieldset>
  );

  const multi = (f: "content" | "platforms" | "editors" | "jobs", legend: string, options: readonly Option[], hint: string, optional = false) => (
    <fieldset className="ea-q" id={`ea-${f}`} tabIndex={-1} aria-describedby={describedBy(f, true)} aria-invalid={!!errors[f] || undefined}>
      <legend>
        {legend}
        {optional && <span className="opt"> (optional)</span>}
      </legend>
      <p className="ea-hint" id={`ea-${f}-hint`}>
        {hint}
      </p>
      <div className="pills">
        {options.map((o) => (
          <label key={o.value} className="pill">
            <input type="checkbox" name={f} value={o.value} checked={data[f].includes(o.value)} onChange={() => toggle(f, o.value)} />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      {err(f)}
    </fieldset>
  );

  const text = (f: "name" | "email" | "link", label: string, type: string, auto: string, optional = false, placeholder?: string) => (
    <div className="ea-q">
      <label htmlFor={`ea-${f}`}>
        {label}
        {optional && <span className="opt"> (optional)</span>}
      </label>
      <input
        id={`ea-${f}`}
        name={f}
        type={type}
        autoComplete={auto}
        placeholder={placeholder}
        value={data[f]}
        onChange={(e) => set(f, e.target.value)}
        aria-invalid={!!errors[f] || undefined}
        aria-describedby={describedBy(f)}
      />
      {err(f)}
    </div>
  );

  return (
    <form className="ea" onSubmit={submit} noValidate aria-labelledby="ea-step-title">
      <ol className="ea-progress" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s.title} className={i < step ? "done" : i === step ? "now" : undefined} aria-current={i === step ? "step" : undefined}>
            <span>{s.title}</span>
          </li>
        ))}
      </ol>
      <h3 className="ea-step" id="ea-step-title" ref={heading} tabIndex={-1}>
        <span className="sr">
          Step {step + 1} of {STEPS.length}:{" "}
        </span>
        {STEPS[step].title}
      </h3>

      {step === 0 && (
        <div className="ea-body">
          <div className="ea-two">
            {text("name", "Your name", "text", "name")}
            {text("email", "Email", "email", "email")}
          </div>
          {choice("role", "What describes you best?", ROLES)}
          {choice("teamSize", "How many people would use it?", TEAM_SIZES)}
          {text("link", "Your channel, show or website", "url", "url", true, "https://")}
        </div>
      )}

      {step === 1 && (
        <div className="ea-body">
          {multi("content", "What do you make?", CONTENT, "Pick all that apply.")}
          {multi("platforms", "Where does it get posted?", PLATFORMS, "Pick all that apply.", true)}
          {choice("volume", "Roughly how much do you record each week?", VOLUMES)}
        </div>
      )}

      {step === 2 && (
        <div className="ea-body">
          {choice("hosting", "Where would it run?", HOSTING)}
          {choice("toolkit", "Do you run the NCA Toolkit already?", TOOLKIT, true)}
          {multi("editors", "Where do you finish videos?", EDITORS, "Pick all that apply.", true)}
        </div>
      )}

      {step === 3 && (
        <div className="ea-body">
          {multi("jobs", "Which jobs should run by themselves?", JOBS, "Pick all that apply, or describe it below.")}
          <div className="ea-q">
            <label htmlFor="ea-details">
              The first automation you’d want, in your words<span className="opt"> (optional if you picked jobs)</span>
            </label>
            <textarea
              id="ea-details"
              name="details"
              rows={4}
              value={data.details}
              placeholder="Every new episode in my folder: transcript, MP3, cut the silences and 9:16 clips with my captions"
              onChange={(e) => set("details", e.target.value)}
            />
          </div>
          {choice("source", "Where did you hear about it?", SOURCES, true)}
        </div>
      )}

      <div className="hp" aria-hidden="true">
        <label htmlFor="ea-website">Website</label>
        <input id="ea-website" name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      {status.kind === "error" && (
        <p className="ea-err ea-fail" role="alert">
          {status.message}
        </p>
      )}

      <div className="ea-nav">
        {step > 0 && (
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              moved.current = true;
              setErrors({});
              setStep((s) => s - 1);
            }}
          >
            Back
          </button>
        )}
        <button type="submit" className="btn primary" disabled={status.kind === "sending"}>
          {last ? (status.kind === "sending" ? "Sending…" : "Join early access") : "Next"}
        </button>
        <span className="ea-count" aria-hidden="true">
          {step + 1} of {STEPS.length}
        </span>
      </div>
    </form>
  );
}
