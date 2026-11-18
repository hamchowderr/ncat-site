"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { BrandIcon, FileLogo, icons } from "@/components/brand/Logo";
import { fitFrame, frameName, frameRatio, type Frame } from "@/lib/clipShapes";

/**
 * One recording in, a clip for every feed out, played by the scroll: the recording is cut at the
 * pauses, each piece takes the shape its platform wants and gets captions, then lands by its logo.
 * The shapes are the ones the dashboard's Clips step makes. With motion off (or before the page's
 * script runs) it shows the finished row of clips.
 */
export const SPLIT_CLIPS: { platform: string; place: string; frame: Frame; caption: string; share: number }[] = [
  { platform: "TikTok", place: "TikTok", frame: "9:16", caption: "nobody edits this by hand", share: 0.22 },
  { platform: "Instagram", place: "Instagram feed", frame: "4:5", caption: "it cuts at the pauses", share: 0.17 },
  { platform: "YouTube", place: "YouTube Shorts", frame: "9:16", caption: "captions land by themselves", share: 0.24 },
  { platform: "Facebook", place: "Facebook Reels", frame: "9:16", caption: "every feed gets its shape", share: 0.18 },
  { platform: "LinkedIn", place: "LinkedIn", frame: "original", caption: "set it up once", share: 0.19 },
];

export const SPLIT_STEPS = [
  { at: 0, label: "Filed" },
  { at: 0.15, label: "Cut at the pauses" },
  { at: 0.36, label: "Reshaped and captioned" },
  { at: 0.72, label: "Ready for every feed" },
];

// A fixed, pause-shaped waveform so the server and the browser draw the same bars.
const BARS = Array.from({ length: 96 }, (_, i) => {
  const pause = [21, 37, 61, 78].some((c) => Math.abs(i - c) < 2);
  return pause ? 0.08 : 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43));
});

// each clip's share of the bars, worked out once
const CLIP_BARS = SPLIT_CLIPS.reduce<{ from: number; bars: number[][] }>(
  (acc, c) => {
    const count = Math.round(c.share * BARS.length);
    return { from: acc.from + count, bars: [...acc.bars, BARS.slice(acc.from, acc.from + count)] };
  },
  { from: 0, bars: [] },
).bars;

function DestLogo({ platform }: { platform: string }) {
  if (platform === "LinkedIn") return <FileLogo name="linkedin" size={26} />;
  const key = platform.toLowerCase() as "tiktok" | "instagram" | "youtube" | "facebook";
  return <BrandIcon icon={icons[key]} />;
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const local = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export function SplitScene() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  // plays only in the browser, and only for people who have not turned motion off
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const reduce = useReducedMotion();
  const live = mounted && !reduce;
  const [step, setStep] = useState(SPLIT_STEPS.length - 1);

  useEffect(() => {
    if (!live) return;
    const el = root.current;
    const st = stage.current;
    if (!el || !st) return;
    const clips = Array.from(st.querySelectorAll<HTMLElement>(".split-clip"));
    const dests = Array.from(st.querySelectorAll<HTMLElement>(".split-dest"));
    const playhead = st.querySelector<HTMLElement>(".split-playhead");
    const name = st.querySelector<HTMLElement>(".split-name");
    let raf = 0;

    const paint = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      const p = clamp(-box.top / Math.max(1, box.height - window.innerHeight));
      const W = st.clientWidth;
      const H = st.clientHeight;
      const narrow = W < 600;
      const pad = narrow ? 12 : 24;
      const gapCards = narrow ? 12 : 22;
      const cols = narrow ? 3 : 5;
      const rows = Math.ceil(SPLIT_CLIPS.length / cols);
      const destH = narrow ? 64 : 92;
      const rowGap = 18;

      // the long recording, across the middle
      const SW = W - 2 * pad;
      const stripH = Math.min(narrow ? 64 : 96, H * 0.18);
      const stripY = H / 2 - stripH / 2;
      const g = ease(local(p, 0.15, 0.32)) * (narrow ? 8 : 16);

      // the clips, in one row (three and two on a phone), centred in the scene
      const boxW = Math.min(190, (W - 2 * pad - (cols - 1) * gapCards) / cols);
      const boxH = Math.min(boxW * 1.65, (H - 40 - rows * destH - (rows - 1) * rowGap) / rows);
      const total = rows * (boxH + destH) + (rows - 1) * rowGap;
      const top = (H - total) / 2;

      let x = pad;
      SPLIT_CLIPS.forEach((c, i) => {
        const sw = c.share * (SW - 4 * g);
        const from = { x, y: stripY, w: sw, h: stripH };
        x += sw + g;
        const row = Math.floor(i / cols);
        const inRow = Math.min(cols, SPLIT_CLIPS.length - row * cols);
        const left = (W - (inRow * boxW + (inRow - 1) * gapCards)) / 2;
        const cx = left + boxW / 2 + (i % cols) * (boxW + gapCards);
        const cardBottom = top + row * (boxH + destH + rowGap) + boxH;
        const fit = fitFrame(c.frame, boxW, boxH);
        const to = { x: cx - fit.width / 2, y: cardBottom - fit.height, w: fit.width, h: fit.height };
        const t = ease(local(p, 0.36 + i * 0.05, 0.56 + i * 0.05));
        const s = clips[i].style;
        s.transform = `translate(${mix(from.x, to.x, t)}px, ${mix(from.y, to.y, t)}px)`;
        s.width = `${mix(from.w, to.w, t)}px`;
        s.height = `${mix(from.h, to.h, t)}px`;
        s.setProperty("--cap", String(local(p, 0.52 + i * 0.05, 0.62 + i * 0.05)));
        s.setProperty("--lift", String(t));

        const d = local(p, 0.7 + i * 0.035, 0.8 + i * 0.035);
        const ds = dests[i].style;
        ds.transform = `translate(${cx - boxW / 2}px, ${cardBottom + 14 + (1 - d) * 14}px)`;
        ds.width = `${boxW}px`;
        ds.opacity = String(d);
      });

      const sweep = local(p, 0, 0.15);
      if (playhead) {
        playhead.style.transform = `translate(${pad + sweep * SW}px, ${stripY - 10}px)`;
        playhead.style.height = `${stripH + 20}px`;
        playhead.style.opacity = String(1 - local(p, 0.14, 0.2));
      }
      if (name) {
        name.style.transform = `translate(${pad}px, ${stripY - 40}px)`;
        name.style.opacity = String(1 - local(p, 0.3, 0.38));
      }
      let current = 0;
      SPLIT_STEPS.forEach((s, i) => {
        if (p >= s.at) current = i;
      });
      setStep(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    const ro = new ResizeObserver(onScroll);
    ro.observe(st);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [live]);

  return (
    <section ref={root} className={`split${live ? " is-live" : ""}`} aria-labelledby="split-title">
      <div className="split-pin">
        <div className="wrap split-head">
          <h2 id="split-title">One recording in. A clip for every feed out.</h2>
          <ol className="split-steps" aria-label="What the automation does">
            {SPLIT_STEPS.map((s, i) => (
              <li key={s.label} className={i <= step ? "on" : undefined} aria-current={i === step ? "step" : undefined}>
                <span className="split-n">{i + 1}</span>
                {s.label}
              </li>
            ))}
          </ol>
          <p className="sr">
            A recording is cut at the pauses into five clips. Each one is reshaped and captioned: {SPLIT_CLIPS.map((c) => `${frameName(c.frame)} for ${c.place}`).join(", ")}.
          </p>
        </div>
        <div className="wrap">
          <div className="split-stage" ref={stage} aria-hidden="true">
            <span className="split-name">Your recording</span>
            <span className="split-playhead" />
            <div className="split-row">
              {SPLIT_CLIPS.map((c, ci) => {
                const bars = CLIP_BARS[ci];
                return (
                  <div key={c.platform} className="split-col">
                    <div className="split-clip" data-frame={c.frame} data-platform={c.platform} style={{ "--r": frameRatio(c.frame) } as CSSProperties}>
                      <span className="split-wave">
                        {bars.map((h, i) => (
                          <i key={i} style={{ height: `${Math.round(h * 100)}%` }} />
                        ))}
                      </span>
                      <span className="split-cap">{c.caption}</span>
                    </div>
                    <div className="split-dest">
                      <span className="split-logo">
                        <DestLogo platform={c.platform} />
                      </span>
                      <span className="split-ready">Ready for {c.place}</span>
                      <span className="split-shape">{frameName(c.frame)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
