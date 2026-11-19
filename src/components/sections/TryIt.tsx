"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MovingIcon } from "@/components/MovingIcon";
import UploadIcon from "@/components/itshover/upload-icon";
import { openEarlyAccess } from "@/lib/prefill";
import { describeTry } from "@/lib/preview";
import { TRIAL_LABEL, TRIAL_NOTE, trialUrl } from "@/lib/trial";
import { formatBytes, formatDuration, planCuts } from "@/lib/tryIt";

const SHOWN_CLIPS = 6;
const STEP_PAUSE = 650;
/** Each saved preview, at a size worth keeping: a quarter of 1080 × 1920. */
const SAVE_W = 270;
const SAVE_H = 480;
const TRIAL = trialUrl();

type Source = { url: string; name: string; size: number; local: boolean };
type Details = { duration: number; width: number; height: number } | null;

export const TRY_STEPS = ["Filed", "Details read", "Cut into clips", "Made vertical", "Captioned", "Waiting in Review"] as const;

/** Draws one moment of the video the way the Clips step reshapes it: the whole picture, fitted, over a blurred copy filling the frame. */
function drawVertical(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const cover = Math.max(W / vw, H / vh);
  ctx.save();
  ctx.filter = "blur(10px) brightness(0.7)";
  ctx.drawImage(video, (W - vw * cover) / 2, (H - vh * cover) / 2, vw * cover, vh * cover);
  ctx.restore();
  const fit = Math.min(W / vw, H / vh);
  ctx.drawImage(video, (W - vw * fit) / 2, (H - vh * fit) / 2, vw * fit, vh * fit);
}

/** Lays the saved previews side by side on one picture and hands it to the browser to save. */
function savePreviews(frames: HTMLCanvasElement[], name: string) {
  if (!frames.length) return;
  const gap = 24;
  const sheet = document.createElement("canvas");
  sheet.width = frames.length * SAVE_W + (frames.length + 1) * gap;
  sheet.height = SAVE_H + gap * 2;
  const ctx = sheet.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#f4f3f8";
  ctx.fillRect(0, 0, sheet.width, sheet.height);
  frames.forEach((f, i) => ctx.drawImage(f, gap + i * (SAVE_W + gap), gap, SAVE_W, SAVE_H));
  sheet.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\.[^.]+$/, "") || "video"} clip previews.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

function seek(video: HTMLVideoElement, t: number) {
  return new Promise<void>((resolve) => {
    const done = () => {
      video.removeEventListener("seeked", done);
      resolve();
    };
    video.addEventListener("seeked", done);
    video.currentTime = t;
  });
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Drop in a video and watch what a ready-made automation does with it, step by
 * step. It all happens in the browser: the file is read here and never uploaded. The size, length,
 * picture size and the vertical frames are real; captions are written on the toolkit, so the
 * preview says so instead of making any up.
 */
export function TryIt() {
  const [source, setSource] = useState<Source | null>(null);
  const [details, setDetails] = useState<Details>(null);
  const [step, setStep] = useState(-1);
  const [unreadable, setUnreadable] = useState(false);
  const [over, setOver] = useState(false);
  const [thumbs, setThumbs] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const run = useRef(0);
  const saved = useRef<HTMLCanvasElement[]>([]);

  const start = useCallback((next: Source) => {
    run.current += 1;
    setSource((old) => {
      if (old?.local) URL.revokeObjectURL(old.url);
      return next;
    });
    setDetails(null);
    setUnreadable(false);
    setThumbs(0);
    saved.current = [];
    setStep(0);
  }, []);

  useEffect(() => () => {
    if (source?.local) URL.revokeObjectURL(source.url);
  }, [source]);

  const takeFile = (file: File | undefined) => {
    if (!file) return;
    start({ url: URL.createObjectURL(file), name: file.name, size: file.size, local: true });
  };

  // walks the steps once the video's details are known
  useEffect(() => {
    if (!source) return;
    const id = run.current;
    const v = video.current;
    if (!v) return;
    const live = () => run.current === id;
    const go = async () => {
      await new Promise<void>((resolve) => {
        if (v.readyState >= 1) return resolve();
        const ok = () => resolve();
        v.addEventListener("loadedmetadata", ok, { once: true });
        v.addEventListener("error", ok, { once: true });
      });
      if (!live()) return;
      if (v.error || !v.videoWidth) {
        setUnreadable(true);
        setStep(1);
        return;
      }
      const d = { duration: v.duration, width: v.videoWidth, height: v.videoHeight };
      setDetails(d);
      await wait(STEP_PAUSE);
      if (!live()) return;
      setStep(1);
      await wait(STEP_PAUSE);
      if (!live()) return;
      setStep(2);
      await wait(STEP_PAUSE);
      if (!live()) return;
      setStep(3);
      const cuts = planCuts(d.duration).slice(0, SHOWN_CLIPS);
      for (let i = 0; i < cuts.length; i++) {
        await seek(v, Math.min(d.duration - 0.1, cuts[i].start + cuts[i].seconds / 2));
        if (!live()) return;
        const c = canvases.current[i];
        if (c) drawVertical(v, c);
        const keep = document.createElement("canvas");
        keep.width = SAVE_W;
        keep.height = SAVE_H;
        drawVertical(v, keep);
        saved.current[i] = keep;
        setThumbs(i + 1);
        await wait(160);
      }
      await wait(STEP_PAUSE);
      if (!live()) return;
      setStep(4);
      await wait(STEP_PAUSE);
      if (!live()) return;
      setStep(5);
      await wait(STEP_PAUSE);
      if (live()) setStep(6);
    };
    go();
  }, [source?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  const cuts = details ? planCuts(details.duration) : [];
  const detail = (i: number): string => {
    if (!source) return "";
    switch (i) {
      case 0:
        return `${source.name}, ${formatBytes(source.size)}`;
      case 1:
        return unreadable
          ? "This browser can’t open that file to preview it. The toolkit reads far more formats, so it would still go through."
          : details
            ? `${formatDuration(details.duration)} long, ${details.width} × ${details.height}`
            : "";
      case 2:
        return `${cuts.length} ${cuts.length === 1 ? "clip" : "clips"} of about ${formatDuration(cuts[0]?.seconds ?? 0)}. The real step cuts at the pauses in speech.`;
      case 3:
        return "The whole picture, fitted over a blurred copy so nothing is cropped away.";
      case 4:
        return "Written on your toolkit, so this preview skips them.";
      default:
        return `${cuts.length} ${cuts.length === 1 ? "clip waits" : "clips wait"} for someone on the team to approve.`;
    }
  };

  return (
    <section className="try" id="try-it" aria-labelledby="try-title">
      <div className="wrap">
        <div className="sec-head">
          <h2 id="try-title">Drop in your first video, get early access sooner</h2>
          <p>
            Watch what a ready-made automation does with one of your own videos. It all happens in your browser, so nothing is uploaded, and
            everyone who tries it moves to the front of the early-access list.
          </p>
        </div>
        <div className="try-in">
          <div
            className={`try-drop${over ? " over" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              takeFile(e.dataTransfer.files[0]);
            }}
          >
            <span className="try-drop-icon">
              <MovingIcon icon={UploadIcon} size={30} trigger=".try-drop" />
            </span>
            <p className="try-drop-title">Drop a video here</p>
            <p className="try-drop-note">Any length. It stays on your computer.</p>
            <div className="try-drop-actions">
              <button type="button" className="btn primary" onClick={() => input.current?.click()}>
                Choose a video
              </button>
            </div>
            <input ref={input} className="sr" type="file" accept="video/*" aria-label="Choose a video" tabIndex={-1} onChange={(e) => takeFile(e.target.files?.[0])} />
          </div>
          <ol className="try-run" aria-label="What the automation does" aria-live="polite">
            {TRY_STEPS.map((label, i) => {
              const state = !source || step < i ? "wait" : step === i ? "doing" : "done";
              const skipped = unreadable && i > 1;
              return (
                <li key={label} className={`try-step ${skipped ? "wait" : state}${i === 4 ? " try-later" : ""}`} data-step={label}>
                  <span className="try-dot" aria-hidden="true" />
                  <span className="try-text">
                    <span className="try-label">{label}</span>
                    {source && !skipped && step >= i && <span className="try-detail">{detail(i)}</span>}
                    {i === 3 && source && !unreadable && step >= 3 && (
                      <span className="try-thumbs">
                        {cuts.slice(0, SHOWN_CLIPS).map((_, j) => (
                          <canvas
                            key={`${source.url}-${j}`}
                            ref={(el) => {
                              canvases.current[j] = el;
                            }}
                            width={108}
                            height={192}
                            className={j < thumbs ? "on" : undefined}
                            aria-label={`Clip ${j + 1}, vertical`}
                            role="img"
                          />
                        ))}
                        {cuts.length > SHOWN_CLIPS && <span className="try-more">+{cuts.length - SHOWN_CLIPS} more</span>}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        {source && step >= TRY_STEPS.length && details && (
          <TryNext
            key={source.url}
            seconds={details.duration}
            clips={cuts.length}
            canSave={!unreadable && thumbs > 0}
            onSave={() => savePreviews(saved.current.slice(0, thumbs), source.name)}
          />
        )}
        {/* the preview reads the file with a hidden player; nothing is sent anywhere */}
        {source && <video ref={video} key={source.url} src={source.url} muted playsInline preload="auto" className="try-video" aria-hidden="true" />}
      </div>
    </section>
  );
}

/**
 * What to do once the preview has run: start the trial, or open early access with what they
 * tried already written in. Signing up also saves the clip previews to their computer, so
 * the email is asked for once. The video itself never leaves.
 */
export function TryNext({ seconds, clips, canSave, onSave }: { seconds: number; clips: number; canSave: boolean; onSave: () => void }) {
  const [saved, setSaved] = useState(false);
  const tried = describeTry(Math.round(seconds), clips);
  const signUp = () =>
    openEarlyAccess(`I tried the preview on ${tried}.`, {
      tried,
      onSent: canSave
        ? () => {
            onSave();
            setSaved(true);
          }
        : undefined,
    });

  return (
    <div className="try-next" aria-live="polite">
      <p className="try-next-lead">
        That was {tried}. On the dashboard it runs by itself every time a video comes in, cut at the pauses and captioned. Sign up now and
        you’re at the front of the list.
      </p>
      <div className="try-next-actions">
        {TRIAL ? (
          <>
            <a className="btn primary" href={TRIAL}>
              {TRIAL_LABEL}
            </a>
            <button type="button" className="btn ghost" onClick={signUp}>
              Get early access first
            </button>
            <span className="try-next-note">{TRIAL_NOTE}</span>
          </>
        ) : (
          <button type="button" className="btn primary" onClick={signUp}>
            Get early access first
          </button>
        )}
        {canSave && !saved && <span className="try-next-note">Your clip previews save to your computer when you sign up.</span>}
        {saved && (
          <span className="try-next-note" role="status">
            Your clip previews are in your downloads folder.
          </span>
        )}
      </div>
    </div>
  );
}
