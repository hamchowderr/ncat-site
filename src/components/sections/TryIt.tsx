"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useRef, useState } from "react";
import { DemoClips, DemoSteps, useDemoRun, waitingSteps } from "@/components/DemoRun";
import { MovingIcon } from "@/components/MovingIcon";
import UploadIcon from "@/components/itshover/upload-icon";
import type { StepView } from "@/lib/demo/run";
import { openEarlyAccess, type SignedUp } from "@/lib/prefill";
import { formatBytes, formatDuration } from "@/lib/tryIt";

const MAX_SECONDS = 10 * 60;
const MAX_BYTES = 1024 * 1024 * 1024;
const SAVED = "ncat-demo-run";

type Chosen = { file: File; seconds: number | null };
type Phase =
  | { kind: "idle" }
  | { kind: "chosen" }
  | { kind: "uploading"; percent: number }
  | { kind: "running"; id: string; k: string }
  | { kind: "error"; message: string };

/** How long a video is, read from the file in the browser. Null when the browser can't open it. */
function readLength(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    const done = (value: number | null) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    v.onloadedmetadata = () => done(Number.isFinite(v.duration) ? v.duration : null);
    v.onerror = () => done(null);
    v.src = url;
  });
}

/** Why a file can't go through the demo, or null. */
export function tooBig(size: number, seconds: number | null): string | null {
  if (size > MAX_BYTES) return `That file is ${formatBytes(size)}. The demo takes files up to 1 GB.`;
  if (seconds !== null && seconds > MAX_SECONDS + 1) return `That video is ${formatDuration(seconds)} long. The demo takes videos up to 10 minutes.`;
  return null;
}

const remember = (value: { id: string; k: string; fileName: string } | null) => {
  try {
    if (value) localStorage.setItem(SAVED, JSON.stringify(value));
    else localStorage.removeItem(SAVED);
  } catch {
    // Private windows can refuse; the run still goes on, and the email has the link.
  }
};

/**
 * Drop in a video and, once you sign up, the real toolkit runs a ready-made automation on
 * it: read, cut at the pauses into vertical clips, captioned. Every step shown is the
 * toolkit's own answer, and the clips at the end are the files it made.
 */
/** `emails`: whether the site can email the visitor their link (set up once toSend is). */
export function TryIt({ enabled = true, emails = false }: { enabled?: boolean; emails?: boolean }) {
  const [chosen, setChosen] = useState<Chosen | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const run = phase.kind === "running" ? phase : null;
  const { view, lost } = useDemoRun(run?.id ?? null, run?.k ?? null);

  // Coming back to the page picks up a run already going. Read after the first render, since
  // the server has no localStorage and the first render must match what it sent.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED) ?? "null") as { id?: string; k?: string; fileName?: string } | null;
      if (saved?.id && saved.k) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFileName(saved.fileName ?? null);
        setPhase({ kind: "running", id: saved.id, k: saved.k });
      }
    } catch {
      // nothing saved
    }
  }, []);

  if (!enabled) return null;

  const busy = phase.kind === "uploading" || phase.kind === "running";

  const take = async (file: File | undefined) => {
    if (!file || busy) return;
    const seconds = await readLength(file);
    setChosen({ file, seconds });
    setFileName(file.name);
    const problem = tooBig(file.size, seconds);
    setPhase(problem ? { kind: "error", message: problem } : { kind: "chosen" });
  };

  const begin = async (who: SignedUp) => {
    if (!chosen) return;
    const { file, seconds } = chosen;
    setPhase({ kind: "uploading", percent: 0 });
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...who, fileName: file.name, size: file.size, seconds }),
      });
      const booked = (await res.json()) as { ok: boolean; id?: string; key?: string; path?: string; error?: string };
      if (!booked.ok || !booked.id || !booked.key || !booked.path) throw new Error(booked.error ?? "That did not come through. Try again.");
      await upload(booked.path, file, {
        access: "private",
        handleUploadUrl: "/api/demo/upload",
        clientPayload: JSON.stringify({ id: booked.id, key: booked.key }),
        multipart: file.size > 50 * 1024 * 1024,
        // Progress can still arrive after the upload has finished; only an upload in progress takes it.
        onUploadProgress: ({ percentage }) => setPhase((p) => (p.kind === "uploading" ? { kind: "uploading", percent: Math.round(percentage) } : p)),
      });
      const started = await fetch("/api/demo/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: booked.id, key: booked.key }),
      });
      const answer = (await started.json()) as { ok: boolean; error?: string };
      if (!answer.ok) throw new Error(answer.error ?? "The toolkit couldn’t start. Try again.");
      remember({ id: booked.id, k: booked.key, fileName: file.name });
      setPhase({ kind: "running", id: booked.id, k: booked.key });
    } catch (error) {
      setPhase({ kind: "error", message: error instanceof Error && error.message ? error.message : "That did not come through. Try again." });
    }
  };

  const signUp = () => {
    if (!chosen) return;
    const tried = `${chosen.file.name}${chosen.seconds ? `, ${formatDuration(chosen.seconds)}` : ""}`;
    openEarlyAccess(`I ran ${tried} through the demo.`, { tried, onSent: begin });
  };

  const steps: StepView[] =
    phase.kind === "uploading" && chosen
      ? waitingSteps().map((s, i) => (i === 0 ? { ...s, state: "doing", detail: `${chosen.file.name}, ${formatBytes(chosen.file.size)}` } : s))
      : run && view
        ? view.steps
        : waitingSteps();

  const finished = run && view?.stage === "done";
  const failed = (run && view?.stage === "failed") || lost;

  return (
    <section className="try" id="try-it" aria-labelledby="try-title">
      <div className="wrap">
        <div className="sec-head">
          <h2 id="try-title">Drop in your first video, get early access sooner</h2>
          <p>
            Sign up and the real toolkit cuts your video at the pauses into vertical clips with captions, ready to download. Everyone who
            tries it moves to the front of the early-access list.
          </p>
        </div>
        <div className="try-in">
          <div
            className={`try-drop${over ? " over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!busy) setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              take(e.dataTransfer.files[0]);
            }}
          >
            <span className="try-drop-icon">
              <MovingIcon icon={UploadIcon} size={30} trigger=".try-drop" />
            </span>
            {chosen && phase.kind === "chosen" ? (
              <>
                <p className="try-drop-title">{chosen.file.name}</p>
                <p className="try-drop-note">
                  {formatBytes(chosen.file.size)}
                  {chosen.seconds ? `, ${formatDuration(chosen.seconds)}` : ""}
                </p>
                <div className="try-drop-actions">
                  <button type="button" className="btn primary" onClick={signUp}>
                    Sign up and run it
                  </button>
                  <button type="button" className="btn ghost" onClick={() => input.current?.click()}>
                    Pick another
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="try-drop-title">{busy ? fileName : "Drop a video here"}</p>
                <p className="try-drop-note">{busy ? "Your video is with the toolkit." : "Up to 10 minutes and 1 GB."}</p>
                {!busy && (
                  <div className="try-drop-actions">
                    <button type="button" className="btn primary" onClick={() => input.current?.click()}>
                      Choose a video
                    </button>
                  </div>
                )}
              </>
            )}
            {phase.kind === "error" && (
              <p className="try-error" role="alert">
                {phase.message}
              </p>
            )}
            <input
              ref={input}
              className="sr"
              type="file"
              accept="video/*"
              aria-label="Choose a video"
              tabIndex={-1}
              onChange={(e) => {
                take(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
          <DemoSteps steps={steps} uploadPercent={phase.kind === "uploading" ? phase.percent : null} />
        </div>
        {finished && view && (
          <div className="try-next" aria-live="polite">
            <p className="try-next-lead">
              Here are your clips, made by the toolkit.{emails ? " They’re in your email too." : ""} On the dashboard this runs by itself every
              time a new video comes in.
            </p>
            {view.partial && <p className="try-next-note">{view.partial}</p>}
            <DemoClips clips={view.clips} fileName={fileName ?? undefined} />
          </div>
        )}
        {failed && (
          <div className="try-next" role="alert">
            <p className="try-next-lead">{lost ?? view?.error ?? "The toolkit couldn’t finish this one."} You’re still on the list.</p>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                remember(null);
                setChosen(null);
                setPhase({ kind: "idle" });
              }}
            >
              Start over
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
