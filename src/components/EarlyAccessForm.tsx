"use client";

import { useState } from "react";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string; fields?: Record<string, string> };

export function EarlyAccessForm() {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/early-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; errors?: Record<string, string> };
      if (res.ok && body.ok) setState({ kind: "done" });
      else setState({ kind: "error", message: body.error ?? "Check the fields marked below.", fields: body.errors });
    } catch {
      setState({ kind: "error", message: "That did not send. Check your connection and try again." });
    }
  }

  if (state.kind === "done")
    return (
      <p className="ea-done" role="status">
        You’re on the list. Chowderr will reply to the email you gave.
      </p>
    );

  const fields = state.kind === "error" ? state.fields ?? {} : {};
  return (
    <form className="ea" onSubmit={onSubmit} noValidate>
      <div className="ea-row">
        <label>
          <span>Name</span>
          <input name="name" autoComplete="name" required aria-invalid={!!fields.name} />
          {fields.name && <em>{fields.name}</em>}
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required aria-invalid={!!fields.email} />
          {fields.email && <em>{fields.email}</em>}
        </label>
      </div>
      <fieldset className="ea-who">
        <legend>Who is it for?</legend>
        <label><input type="radio" name="who" value="solo" defaultChecked /> Just me</label>
        <label><input type="radio" name="who" value="team" /> My team</label>
      </fieldset>
      <label>
        <span>The first editing job you’d have the AI set up</span>
        <textarea id="ea-job" name="job" rows={3} placeholder="Every new episode → transcript, MP3 and captioned clips for my editor" />
      </label>
      <input className="ea-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn w" type="submit" disabled={state.kind === "sending"}>
        {state.kind === "sending" ? "Sending…" : "Get on the list"}
      </button>
      {state.kind === "error" && <p className="ea-err" role="alert">{state.message}</p>}
    </form>
  );
}
