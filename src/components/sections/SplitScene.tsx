"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { BadgeCheck, Captions, FileAudio, Scissors, Send } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { BrandIcon, FileLogo, icons } from "@/components/brand/Logo";
import { MovingIcon } from "@/components/MovingIcon";
import CheckedIcon from "@/components/itshover/checked-icon";
import { fitFrame, frameName, frameRatio, type Frame } from "@/lib/clipShapes";

/**
 * One recording in, a clip for every feed out, played by the scroll: the recording is transcribed and
 * cut in the quiet gaps, each piece takes the shape its platform wants and its words become its
 * captions, someone approves them in Review, and they land by their logos. Then the editor route,
 * the AI tokens it spent (none), and the next recording coming in to run the same way.
 * The shapes are the ones the dashboard's Clips step makes. With motion off (or before the page's
 * script runs) it shows the finished row of clips.
 */
/** The recording: a real interview from LA Tech Week, 3 min 7 s, run through the clips steps. */
export const SPLIT_RECORDING = { label: "Interview at LA Tech Week, 3 min 7 s, filed and transcribed", seconds: 187.26, film: "/media/split/recording.jpg", frames: 24 };

/**
 * The five clips the run made from it, in the order they were said. `from`/`to` is the stretch of
 * the recording each piece of the strip covers (cut in the quiet gaps between answers); `said` is a
 * line of what was actually said in that clip, and the clip itself has those words burned in as captions.
 */
export const SPLIT_CLIPS: { platform: string; place: string; frame: Frame; said: string; from: number; to: number; video: string; poster: string }[] = [
  { platform: "LinkedIn", place: "LinkedIn", frame: "original", said: "Hello, my name is Tylan Miller.", from: 0, to: 42, video: "/media/split/linkedin.mp4", poster: "/media/split/linkedin.jpg" },
  { platform: "TikTok", place: "TikTok", frame: "9:16", said: "clipping, overlaying, captions", from: 42, to: 73, video: "/media/split/tiktok.mp4", poster: "/media/split/tiktok.jpg" },
  { platform: "Instagram", place: "Instagram feed", frame: "4:5", said: "how can we make this cheaper?", from: 73, to: 99, video: "/media/split/instagram.mp4", poster: "/media/split/instagram.jpg" },
  { platform: "YouTube", place: "YouTube Shorts", frame: "9:16", said: "they don’t have to be tech adjacent", from: 99, to: 133, video: "/media/split/youtube.mp4", poster: "/media/split/youtube.jpg" },
  { platform: "Facebook", place: "Facebook Reels", frame: "9:16", said: "come out and learn", from: 133, to: 187.26, video: "/media/split/facebook.mp4", poster: "/media/split/facebook.jpg" },
];

/** Each step has its own icon, colour and way of moving in when the scroll reaches it. */
export const SPLIT_STEPS = [
  { at: 0, label: "Filed and transcribed", icon: FileAudio, move: "file" },
  { at: 0.11, label: "Cut at the pauses", icon: Scissors, move: "snip" },
  { at: 0.24, label: "Reshaped and captioned", icon: Captions, move: "shape" },
  { at: 0.46, label: "Approved in Review", icon: BadgeCheck, move: "check" },
  { at: 0.58, label: "Ready for every feed", icon: Send, move: "send" },
] as const;

/** The editors a run's cuts can go to as a timeline, for anyone finishing by hand. */
export const SPLIT_EDITORS = ["Premiere Pro", "DaVinci Resolve", "Final Cut Pro"] as const;

// a fixed waveform for the next recording, so the server and the browser draw the same bars
const BARS = Array.from({ length: 40 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43)));

function DestLogo({ platform }: { platform: string }) {
  if (platform === "LinkedIn") return <FileLogo name="linkedin" size={26} />;
  const key = platform.toLowerCase() as "tiktok" | "instagram" | "youtube" | "facebook";
  return <BrandIcon icon={icons[key]} />;
}

/** How far through the section's scroll the scene finishes; the rest is a pause on the finished scene. */
export const HOLD_AT = 0.8;

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
    const said = Array.from(st.querySelectorAll<HTMLElement>(".split-said"));
    const films = Array.from(st.querySelectorAll<HTMLElement>(".split-film"));
    const videos = Array.from(st.querySelectorAll<HTMLVideoElement>(".split-video"));
    const playhead = st.querySelector<HTMLElement>(".split-playhead");
    const name = st.querySelector<HTMLElement>(".split-name");
    const foot = st.querySelector<HTMLElement>(".split-foot");
    const next = st.querySelector<HTMLElement>(".split-next");
    const head = el.querySelector<HTMLElement>(".split-head");
    const now = st.querySelector<HTMLElement>(".split-now");
    let raf = 0;
    // the scene follows the scroll with a little lag, so each change eases in rather than jumping
    let shown = -1;

    const paint = () => {
      raf = 0;
      const box = el.getBoundingClientRect();
      // the scene finishes at 80% of the scroll and holds its last moment for the rest, before the page moves on
      // on a phone only the stage pins (the headline scrolls away first, so the clips get the whole screen),
      // and the scene starts once the stage is pinned
      const lead = st.clientWidth < 600 && head ? head.offsetHeight : 0;
      const target = clamp((-box.top - lead) / Math.max(1, box.height - lead - window.innerHeight) / HOLD_AT);
      shown = shown < 0 || Math.abs(target - shown) < 0.0005 ? target : shown + (target - shown) * 0.09;
      const p = shown;
      if (p !== target) raf = requestAnimationFrame(paint);
      const W = st.clientWidth;
      const H = st.clientHeight;
      const narrow = W < 600;
      const pad = narrow ? 12 : 24;
      const gapCards = narrow ? 12 : 22;
      const cols = narrow ? 3 : 5;
      const rows = Math.ceil(SPLIT_CLIPS.length / cols);
      // on a phone the logo and shape under each clip, and the editor line, are measured so the clips get every pixel left
      const destH = narrow ? (dests[0]?.offsetHeight ?? 48) + 12 : 92;
      const rowGap = narrow ? 14 : 18;
      // room above for the next recording, and below for the editor route and the token count
      const topBand = narrow ? 44 : 52;
      const footH = narrow ? (foot?.offsetHeight ?? 96) + 10 : 72;

      // the long recording, across the middle
      const SW = W - 2 * pad;
      const stripH = Math.min(narrow ? 64 : 96, H * 0.18);
      const stripY = H * 0.42 - stripH / 2;
      const g = ease(local(p, 0.11, 0.22)) * (narrow ? 8 : 16);

      // the clips, in one row (three and two on a phone), centred in the scene
      const boxW = Math.min(190, (W - 2 * pad - (cols - 1) * gapCards) / cols);
      const room = H - topBand - footH;
      const boxH = Math.min(boxW * 1.65, (room - 16 - rows * destH - (rows - 1) * rowGap) / rows);
      const total = rows * (boxH + destH) + (rows - 1) * rowGap;
      const top = topBand + (room - total) / 2;

      let x = pad;
      const onScreen = box.bottom > 0 && box.top < window.innerHeight;
      SPLIT_CLIPS.forEach((c, i) => {
        const share = (c.to - c.from) / SPLIT_RECORDING.seconds;
        const sw = share * (SW - 4 * g);
        const from = { x, y: stripY, w: sw, h: stripH };
        x += sw + g;
        const row = Math.floor(i / cols);
        const inRow = Math.min(cols, SPLIT_CLIPS.length - row * cols);
        const left = (W - (inRow * boxW + (inRow - 1) * gapCards)) / 2;
        const cx = left + boxW / 2 + (i % cols) * (boxW + gapCards);
        const cardBottom = top + row * (boxH + destH + rowGap) + boxH;
        const fit = fitFrame(c.frame, boxW, boxH);
        const to = { x: cx - fit.width / 2, y: cardBottom - fit.height, w: fit.width, h: fit.height };
        const t = ease(local(p, 0.24 + i * 0.035, 0.38 + i * 0.035));
        const s = clips[i].style;
        s.transform = `translate(${mix(from.x, to.x, t)}px, ${mix(from.y, to.y, t)}px)`;
        s.width = `${mix(from.w, to.w, t)}px`;
        s.height = `${mix(from.h, to.h, t)}px`;
        // the strip shows frames of the recording itself, each piece starting at its own moment
        const frameW = (mix(from.h, to.h, t) * 16) / 9;
        const fs = films[i].style;
        fs.backgroundSize = `${frameW * SPLIT_RECORDING.frames}px 100%`;
        fs.backgroundPosition = `${-(c.from / SPLIT_RECORDING.seconds) * frameW * SPLIT_RECORDING.frames}px 0`;
        fs.opacity = String(1 - local(p, 0.3 + i * 0.035, 0.38 + i * 0.035));
        // once a piece has its shape it plays as the finished clip, and stops when the scene is gone
        const v = videos[i];
        const playing = t > 0.9 && onScreen;
        if (playing && v.paused) v.play().catch(() => {});
        if (!playing && !v.paused) v.pause();
        s.setProperty("--lift", String(t));
        s.setProperty("--ok", String(local(p, 0.46 + i * 0.02, 0.5 + i * 0.02)));

        // the words spoken in this piece, under it, until they turn into its captions
        const w = said[i].style;
        w.transform = `translate(${from.x}px, ${stripY + stripH + 10}px)`;
        w.width = `${sw}px`;
        w.opacity = String(local(p, 0.01 + i * 0.015, 0.05 + i * 0.015) * (1 - local(p, 0.24 + i * 0.035, 0.3 + i * 0.035)));

        const d = local(p, 0.58 + i * 0.025, 0.66 + i * 0.025);
        const ds = dests[i].style;
        ds.transform = `translate(${cx - boxW / 2}px, ${cardBottom + 14 + (1 - d) * 14}px)`;
        ds.width = `${boxW}px`;
        ds.opacity = String(d);
      });

      const sweep = local(p, 0, 0.1);
      if (playhead) {
        playhead.style.transform = `translate(${pad + sweep * SW}px, ${stripY - 10}px)`;
        playhead.style.height = `${stripH + 20}px`;
        playhead.style.opacity = String(1 - local(p, 0.1, 0.14));
      }
      if (name) {
        name.style.transform = `translate(${pad}px, ${stripY - 34}px)`;
        name.style.opacity = String(1 - local(p, 0.2, 0.26));
      }
      if (foot) {
        const f = local(p, 0.7, 0.8);
        foot.style.opacity = String(f);
        foot.style.transform = `translateY(${(1 - f) * 12}px)`;
      }
      if (next) {
        // the next recording slides in along the top and starts the same run
        const n = ease(local(p, 0.84, 0.97));
        next.style.width = `${Math.min(SW, 520)}px`;
        next.style.transform = `translate(${mix(W, pad, n)}px, ${narrow ? 6 : 10}px)`;
        next.style.opacity = String(local(p, 0.84, 0.88));
      }
      let current = 0;
      SPLIT_STEPS.forEach((s, i) => {
        if (p >= s.at) current = i;
      });
      setStep(current);
      if (now) {
        // the step it is on, written across the top of the stage on a phone, until the next recording takes that place
        now.textContent = SPLIT_STEPS[current].label;
        now.style.opacity = String(1 - local(p, 0.8, 0.84));
      }
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
                <span className="split-n" data-move={s.move} aria-hidden="true">
                  <s.icon size={14} strokeWidth={2.4} />
                </span>
                {s.label}
              </li>
            ))}
          </ol>
          <p className="sr">
            A real interview from LA Tech Week is filed, transcribed and cut at the pauses into five clips. Each one is reshaped and captioned with its own words: {SPLIT_CLIPS.map((c) => `${frameName(c.frame)} for ${c.place}`).join(", ")}. Someone approves them in Review, and they are ready for every feed. Anyone finishing by hand gets the cuts as a timeline for {SPLIT_EDITORS.join(", ")}, or as a numbered clip pack with captions for CapCut. No AI tokens are spent on these clips, and the next recording runs the same way.
          </p>
        </div>
        <div className="wrap">
          <div className="split-stage" ref={stage} aria-hidden="true">
            <span className="split-now" />
            <span className="split-name">{SPLIT_RECORDING.label}</span>
            <span className="split-playhead" />
            <span className="split-next">
              <span className="split-next-wave">
                {BARS.map((h, i) => (
                  <i key={i} style={{ height: `${Math.round(h * 100)}%` }} />
                ))}
              </span>
              <span className="split-next-text">Next recording came in. Same steps, nobody touching it.</span>
            </span>
            <div className="split-row">
              {SPLIT_CLIPS.map((c) => {
                return (
                  <div key={c.platform} className="split-col">
                    <div className="split-clip" data-frame={c.frame} data-platform={c.platform} style={{ "--r": frameRatio(c.frame) } as CSSProperties}>
                      <video className="split-video" src={c.video} poster={c.poster} muted playsInline loop preload="none" tabIndex={-1} />
                      <span className="split-film" style={{ backgroundImage: `url(${SPLIT_RECORDING.film})` }} />
                      <span className="split-ok">
                        <MovingIcon icon={CheckedIcon} size={14} strokeWidth={2.6} />
                        <span>Approved</span>
                      </span>
                    </div>
                    <span className="split-said">“{c.said}”</span>
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
            <div className="split-foot">
              <p className="split-editors">
                <span>Finishing by hand? Get a timeline for</span>
                <span className="split-editor-logos">
                  <span title="Premiere Pro">
                    <FileLogo name="premiere" size={22} />
                  </span>
                  <span title="DaVinci Resolve">
                    <BrandIcon icon={icons.resolve} />
                  </span>
                  <span title="Final Cut Pro">
                    <FileLogo name="finalcut" size={22} />
                  </span>
                </span>
                <span>or a clip pack for</span>
                <span className="split-editor-logos">
                  <span title="CapCut">
                    <FileLogo name="capcut" size={22} />
                  </span>
                </span>
              </p>
              <p className="split-tokens">
                AI tokens spent on these clips <b>0</b>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
