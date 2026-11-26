"use client";

import { useState } from "react";
import { NEWS_WORDING, newsSignupUrl, subscribe, type NewsOutcome } from "@/lib/newsletter";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; message: string };

const MESSAGES: Record<Exclude<NewsOutcome, "ok">, string> = {
  invalid: "That address doesn't look right.",
  busy: "Too many sign-ups right now. Try again in a few minutes.",
  failed: "That didn't go through. Try again.",
};

/** Product news by email, with double opt-in: the app emails a link to confirm before anything else is sent. */
export function NewsletterBox({ url = newsSignupUrl() }: { url?: string | null } = {}) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  if (!url) return null;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus({ kind: "sending" });
    const outcome = await subscribe(url, email.trim(), website);
    setStatus(outcome === "ok" ? { kind: "done" } : { kind: "error", message: MESSAGES[outcome] });
  };

  return (
    <section className="news" aria-labelledby="news-title">
      <h2 id="news-title">Product news</h2>
      {status.kind === "done" ? (
        <p role="status" className="news-done">
          Check your inbox. Click the button in our email to confirm, and you&rsquo;re on the list.
        </p>
      ) : (
        <form onSubmit={send} noValidate>
          <div className="news-row">
            <label htmlFor="news-email" className="news-label">
              Email address
            </label>
            <input
              id="news-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby="news-words"
              aria-invalid={status.kind === "error" || undefined}
              required
            />
            <button type="submit" className="btn dark sm" disabled={status.kind === "sending"}>
              {status.kind === "sending" ? "Sending" : "Subscribe"}
            </button>
          </div>
          {/* A field people never see: a bot that fills it in is thanked and ignored. */}
          <input
            className="news-trap"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <p id="news-words" className="news-words">
            {NEWS_WORDING}
          </p>
          {status.kind === "error" && (
            <p role="alert" className="news-error">
              {status.message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
