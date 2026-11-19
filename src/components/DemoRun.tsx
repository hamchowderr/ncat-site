"use client";

import { useEffect, useState } from "react";
import type { DemoView, StepView } from "@/lib/demo/run";

/** The real steps, in order, before anything has run. */
export const DEMO_STEPS = ["Uploaded", "Read by the toolkit", "Cut at the pauses, made vertical", "Captioned", "Ready to download"] as const;

export const waitingSteps = (): StepView[] => DEMO_STEPS.map((label) => ({ label, state: "wait" }));

const POLL_MS = 4000;

/** The list of steps, each with what the toolkit reported. */
export function DemoSteps({ steps, uploadPercent }: { steps: StepView[]; uploadPercent?: number | null }) {
  return (
    <ol className="try-run" aria-label="What the toolkit does with your video" aria-live="polite">
      {steps.map((s, i) => (
        <li key={s.label} className={`try-step ${s.state}`} data-step={s.label}>
          <span className="try-dot" aria-hidden="true" />
          <span className="try-text">
            <span className="try-label">{s.label}</span>
            {i === 0 && uploadPercent != null && s.state === "doing" && (
              <span className="try-detail">
                <span className="try-bar" role="progressbar" aria-label="Uploading" aria-valuenow={uploadPercent} aria-valuemin={0} aria-valuemax={100}>
                  <span style={{ width: `${uploadPercent}%` }} />
                </span>
                {s.detail} · {uploadPercent}%
              </span>
            )}
            {s.detail && !(i === 0 && uploadPercent != null && s.state === "doing") && s.state !== "wait" && <span className="try-detail">{s.detail}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** The finished clips: watch each one, or download it. */
export function DemoClips({ clips, fileName }: { clips: DemoView["clips"]; fileName?: string }) {
  const stem = (fileName ?? "video").replace(/\.[^.]+$/, "");
  return (
    <ul className="demo-clips" aria-label="Your clips">
      {clips.map((c, i) => (
        <li key={c.url}>
          <video src={c.url} controls playsInline preload="metadata" aria-label={`Clip ${i + 1}`} />
          <a className="btn ghost" href={c.url} download={`${stem} clip ${i + 1}.mp4`} target="_blank" rel="noreferrer">
            Download clip {i + 1}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Asks where a run is every few seconds until it ends. Asking is also what moves it on. */
export function useDemoRun(id: string | null, k: string | null, initial: DemoView | null = null) {
  const [view, setView] = useState<DemoView | null>(initial);
  const [lost, setLost] = useState<string | null>(null);
  useEffect(() => {
    if (!id || !k) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const ask = async () => {
      try {
        const res = await fetch(`/api/demo/status?id=${encodeURIComponent(id)}&k=${encodeURIComponent(k)}`, { cache: "no-store" });
        const json = (await res.json()) as { ok: boolean; view?: DemoView; error?: string };
        if (stop) return;
        if (json.ok && json.view) {
          setView(json.view);
          if (json.view.stage === "done" || json.view.stage === "failed") return;
        } else if (res.status === 404) {
          setLost(json.error ?? "That run is not here.");
          return;
        }
      } catch {
        // Out of reach for a moment: ask again.
      }
      if (!stop) timer = setTimeout(ask, POLL_MS);
    };
    ask();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [id, k]);
  return { view, lost };
}
