"use client";

import { useEffect, useRef, useState } from "react";
import { BrandIcon, FileLogo, icons } from "@/components/brand/Logo";
import {
  CHECKED,
  CLIP_SHAPES,
  fitFrame,
  formatLimit,
  frameName,
  type Place,
  type SocialPlatform,
} from "@/lib/clipShapes";

type Podcast = "Spotify" | "Apple Podcasts";
type ShiftPlatform = SocialPlatform | Podcast;
/** A place a clip goes. Podcast apps take the episode in its own shape, with its sound levelled to `level`. */
type ShiftPlace = Place & { level?: string };

/**
 * Podcast apps: no clip shapes, the episode keeps its own and its sound is levelled (the dashboard's
 * Level the sound step). Spotify gives no loudness target for podcasts, so only Apple's is quoted as its own.
 */
const PODCASTS: Record<Podcast, ShiftPlace[]> = {
  Spotify: [
    {
      place: "Spotify",
      frame: "original",
      maxSeconds: 0,
      level: "−14 LUFS",
      takes:
        "MP3, M4A or WAV episodes, mono or stereo. It gives no loudness target for podcasts; music plays at −14 LUFS.",
      source:
        "https://support.spotify.com/us/creators/article/publishing-audio-episodes/",
    },
  ],
  "Apple Podcasts": [
    {
      place: "Apple Podcasts",
      frame: "original",
      maxSeconds: 0,
      level: "−16 LUFS",
      takes:
        "Episodes around −16 LKFS (±1 dB), with peaks no higher than −1 dBFS.",
      source: "https://podcasters.apple.com/support/893-audio-requirements",
    },
  ],
};

const SHAPES: Record<ShiftPlatform, ShiftPlace[]> = {
  ...CLIP_SHAPES,
  ...PODCASTS,
};

/** Every kind of post the agent knows for each platform, beyond the clip shapes. */
export const SHIFT_FORMATS: Record<ShiftPlatform, string> = {
  TikTok: "Short videos, carousels, Stories",
  YouTube: "Long-form, Shorts, thumbnails, chapters",
  X: "Video clips, posts, threads",
  Instagram: "Reels, Stories, carousels, posts",
  LinkedIn: "Native video, document carousels",
  Facebook: "Reels, video posts, Stories",
  Spotify: "Audio and video podcast episodes",
  "Apple Podcasts": "Episodes, chapters, transcripts",
};

export const SHIFT_PLATFORMS = Object.keys(SHAPES) as ShiftPlatform[];
// every platform and place in order, so the cycle is one counter
const ALL = SHIFT_PLATFORMS.flatMap((p, pi) =>
  SHAPES[p].map((_, qi) => ({ pi, qi })),
);

function PlatLogo({ name, size = 22 }: { name: ShiftPlatform; size?: number }) {
  if (name === "LinkedIn") return <FileLogo name="linkedin" size={size} />;
  if (name === "Apple Podcasts")
    return <BrandIcon icon={icons.applepodcasts} />;
  return (
    <BrandIcon
      icon={
        icons[
          name.toLowerCase() as
            | "tiktok"
            | "youtube"
            | "x"
            | "instagram"
            | "facebook"
            | "spotify"
        ]
      }
    />
  );
}

/**
 * One clip that changes shape for each place it goes: pick a platform (or let it cycle on its own)
 * and the frame turns into the shape the dashboard's Clips step makes for it, with the longest
 * length it cuts. Stops cycling as soon as someone picks one.
 */
export function ShapeShifter() {
  const [k, setK] = useState(0);
  const { pi, qi } = ALL[k];
  const [auto, setAuto] = useState(true);
  const [box, setBox] = useState(280);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const platform = SHIFT_PLATFORMS[pi];
  const places = SHAPES[platform];
  const place = places[qi];
  const size = fitFrame(place.frame, box, box);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setBox(Math.min(el.clientWidth, el.clientHeight) - 8),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // cycles through every place while it is on screen, until someone picks one
  useEffect(() => {
    if (
      !auto ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const el = root.current;
    if (!el) return;
    let seen = false;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(el);
    const id = window.setInterval(() => {
      if (!seen) return;
      setK((n) => (n + 1) % ALL.length);
    }, 2200);
    return () => {
      io.disconnect();
      window.clearInterval(id);
    };
  }, [auto]);

  const pick = (i: number) => {
    setAuto(false);
    setK(ALL.findIndex((a) => a.pi === i));
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (pi + step + SHIFT_PLATFORMS.length) % SHIFT_PLATFORMS.length;
    pick(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="shift" ref={root}>
      <div className="shift-stage" ref={stage} aria-hidden="true">
        <div
          className="shift-frame"
          data-frame={place.frame}
          style={{ width: `${size.width}px`, height: `${size.height}px` }}
        >
          <span className="shift-logo">
            <PlatLogo name={platform} size={18} />
          </span>
          <span className="shift-wave">
            {Array.from({ length: 22 }, (_, i) => (
              <i
                key={i}
                style={{
                  height: `${30 + 70 * Math.abs(Math.sin(i * 1.3) * Math.cos(i * 0.4))}%`,
                }}
              />
            ))}
          </span>
          <span className="shift-ratio">
            {place.level
              ? place.level
              : place.frame === "original"
                ? "Its own shape"
                : place.frame}
          </span>
        </div>
      </div>
      <div className="shift-side">
        <p className="shift-kicker">One clip, the right shape everywhere</p>
        <div
          className="shift-tabs"
          role="tablist"
          aria-label="Platform"
          onKeyDown={onKey}
        >
          {SHIFT_PLATFORMS.map((name, i) => (
            <button
              key={name}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              aria-selected={i === pi}
              aria-controls="shift-panel"
              tabIndex={i === pi ? 0 : -1}
              aria-label={name}
              title={name}
              onClick={() => pick(i)}
            >
              <PlatLogo name={name} />
            </button>
          ))}
        </div>
        <div
          className="shift-panel"
          id="shift-panel"
          role="tabpanel"
          aria-label={platform}
        >
          {places.length > 1 && (
            <div className="shift-places">
              {places.map((q, i) => (
                <button
                  key={q.place}
                  type="button"
                  aria-pressed={q === place}
                  onClick={() => {
                    setAuto(false);
                    setK(ALL.findIndex((a) => a.pi === pi && a.qi === i));
                  }}
                >
                  {q.place}
                </button>
              ))}
            </div>
          )}
          <p className="shift-line" aria-live="polite">
            {place.level ? (
              <>
                {platform} episodes keep <b>their own shape</b>, with the sound
                levelled to {place.level.replace(/ /g, "\u00a0")}.
              </>
            ) : (
              <>
                {platform === place.place
                  ? platform
                  : `${platform} ${place.place}`}{" "}
                {place.frame === "original" ? (
                  <>
                    clips keep <b>their own shape</b>
                  </>
                ) : (
                  <>
                    clips come out <b>{frameName(place.frame)}</b>
                  </>
                )}
                , up to {formatLimit(place.maxSeconds).replace(/ /g, "\u00a0")}{" "}
                each.
              </>
            )}
          </p>
          <p className="shift-formats">
            <span>Formats it knows</span> {SHIFT_FORMATS[platform]}
          </p>
          <p className="shift-takes">
            {SHIFT_PLATFORMS[pi]} itself takes: {place.takes}
          </p>
          <p className="shift-note">
            Checked on {CHECKED} against{" "}
            <a href={place.source} target="_blank" rel="noreferrer">
              {platform}’s own specs
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
