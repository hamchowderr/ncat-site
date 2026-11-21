"use client";

import { useRef, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { AudioLines, BadgeCheck, FileText, Play, SquarePen } from "lucide-react";
import { MovingIcon } from "@/components/MovingIcon";
import CameraIcon from "@/components/itshover/camera-icon";
import UsersGroupIcon from "@/components/itshover/users-group-icon";
import Volume2Icon from "@/components/itshover/volume-2-icon";
import VinylIcon from "@/components/itshover/vinyl-icon";
import UsersIcon from "@/components/itshover/users-icon";
import PlayerIcon from "@/components/itshover/player-icon";
import RefreshIcon from "@/components/itshover/refresh-icon";
import { Logo } from "@/components/brand/Logo";

type LogoName = Parameters<typeof Logo>[0]["name"];

type Shape = "tall" | "wide" | "square" | "audio" | "doc" | "approve" | "edit";
type Out = { label: string; shape: Shape; logos?: LogoName[] };

export const CASES: { id: string; tab: string; icon: typeof CameraIcon; title: string; body: string; without: string; input: string; outputs: Out[] }[] = [
  {
    id: "creators",
    tab: "Creators",
    icon: CameraIcon,
    title: "Hit record. The clips make themselves.",
    body: "Drop in one long video and walk away. It is filed, transcribed and cut into captioned clips shaped for every feed, with no per-minute fees. The ones that need your touch open straight in your editor.",
    without: "An hour each upload in an editor or an AI chat, or a clipping app billing you by the minute.",
    input: "One long video",
    outputs: [
      { label: "Captioned vertical clips", shape: "tall", logos: ["tiktok", "instagram", "youtube"] },
      { label: "Square cut for the feed", shape: "square", logos: ["instagram", "facebook"] },
      { label: "Thumbnail", shape: "wide", logos: ["youtube"] },
      { label: "Searchable transcript", shape: "doc" },
    ],
  },
  {
    id: "agencies",
    tab: "Editing Agencies",
    icon: UsersGroupIcon,
    title: "Every client on autopilot. Nothing ships unapproved.",
    body: "Give each client their own automation with their logo, colours and font built in, plus an approval step before anything goes out. Your editors spend their time on the creative work, and more clients doesn’t mean a bigger software bill.",
    without: "A script or n8n flow per client, approvals lost in email, and a bigger bill with every client you sign.",
    input: "Raw footage from each client",
    outputs: [
      { label: "Clips in the client’s brand", shape: "tall", logos: ["tiktok", "instagram", "youtube"] },
      { label: "Waiting for the client’s yes", shape: "approve" },
      { label: "Timeline for your editor", shape: "edit", logos: ["premiere", "resolve", "finalcut"] },
      { label: "Every run in one list", shape: "doc" },
    ],
  },
  {
    id: "podcasts",
    tab: "Podcast Teams",
    icon: Volume2Icon,
    title: "The call ends. The episode gets to work.",
    body: "Every new episode gets the same treatment, every time: audio, transcript, captioned clips and the full video, filed where the team expects them.",
    without: "The same upload, pick, caption, crop and rename routine, every single episode.",
    input: "Episode recording",
    outputs: [
      { label: "Audio for every podcast app", shape: "audio", logos: ["spotify", "applepodcasts"] },
      { label: "Captioned clips", shape: "tall", logos: ["tiktok", "instagram", "youtube"] },
      { label: "Full episode video", shape: "wide", logos: ["youtube"] },
      { label: "Transcript for show notes", shape: "doc" },
    ],
  },
  {
    id: "music",
    tab: "Music Video Teams",
    icon: VinylIcon,
    title: "Drop the master. Get the whole rollout.",
    body: "Hand over the finished track and the artwork. Every version a release needs is made the same way each time, so the team stays on the shoot and the edit.",
    without: "Every version of every release made by hand, one at a time.",
    input: "Finished track and cover art",
    outputs: [
      { label: "Cover art video with a waveform", shape: "wide", logos: ["youtube"] },
      { label: "Vertical short for every feed", shape: "tall", logos: ["tiktok", "instagram", "youtube"] },
      { label: "Lyric video from your lyrics", shape: "wide", logos: ["youtube"] },
      { label: "Spotify Canvas loop", shape: "tall", logos: ["spotify"] },
    ],
  },
  {
    id: "coaches",
    tab: "Coaches",
    icon: UsersIcon,
    title: "Teach the session. The replay builds itself.",
    body: "Connect Zoom, Google Meet or Microsoft Teams once and every recorded session comes in on its own. It is split into chapters, the strongest moments become clips, and the notes are written for the replay, so your next lesson is the only thing you prepare.",
    without: "Someone downloads each call from Zoom, uploads it again somewhere else, and writes the notes by hand.",
    input: "A recorded coaching call or class",
    outputs: [
      { label: "Chapters and notes for the replay", shape: "doc" },
      { label: "Best moments as vertical clips", shape: "tall", logos: ["tiktok", "instagram", "youtube"] },
      { label: "Full replay for your course", shape: "wide", logos: ["youtube"] },
      { label: "Searchable by what was said", shape: "doc" },
    ],
  },
  {
    id: "webinars",
    tab: "Webinars",
    icon: PlayerIcon,
    title: "The stream ends. The week of posts is planned.",
    body: "The recording arrives by itself and gets chapters and show notes ready for YouTube. Wide shots of a panel become tall clips that keep whoever is talking in frame, and the posts go onto your content calendar for the days ahead.",
    without: "The recording sits on the landing page because nobody has time to cut it.",
    input: "The webinar or live show recording",
    outputs: [
      { label: "Chapters and show notes for YouTube", shape: "wide", logos: ["youtube"] },
      { label: "Clips that follow the speaker", shape: "tall", logos: ["tiktok", "instagram", "linkedin"] },
      { label: "Posts planned on the calendar", shape: "approve" },
      { label: "Timeline for your editor", shape: "edit", logos: ["premiere", "resolve", "finalcut"] },
    ],
  },
  {
    id: "local-ai",
    tab: "Editing With AI",
    icon: RefreshIcon,
    title: "Stop spending your AI limits on the same edit.",
    body: "Editing with an AI agent on your own computer works while you sit with it. Describe the edit once here instead: the agent sets it up and tests it, then plain editing runs it on every new recording, with no AI used per video. It runs on your server or always-on machine, so your laptop can close.",
    without: "Open the agent, explain the style again, wait, fix, re-run, and use up your plan’s limits or credits doing it, every week.",
    input: "This week’s recordings, and next week’s",
    outputs: [
      { label: "The same edit on every new recording", shape: "tall", logos: ["tiktok", "instagram", "youtube"] },
      { label: "Your settings, remembered", shape: "doc" },
      { label: "Organized in your library", shape: "doc" },
      { label: "Timeline for your editor", shape: "edit", logos: ["premiere", "resolve", "finalcut"] },
    ],
  },
];

function ShapeArt({ shape }: { shape: Shape }) {
  if (shape === "audio") return <AudioLines size={22} />;
  if (shape === "doc") return <FileText size={22} />;
  if (shape === "approve") return <BadgeCheck size={22} />;
  if (shape === "edit") return <SquarePen size={22} />;
  return <Play size={16} fill="currentColor" />;
}

export function UseCases() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const c = CASES[active];
  const CaseIcon = c.icon;
  return (
    <section className="cases" id="use-cases" aria-labelledby="cases-title">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2 id="cases-title">Built for the people who were in the room</h2>
        </Reveal>
        <div
          className="seg"
          role="tablist"
          aria-label="Who it is for"
          onKeyDown={(e) => {
            const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
            if (!d) return;
            e.preventDefault();
            const n = (active + d + CASES.length) % CASES.length;
            setActive(n);
            tabs.current[n]?.focus();
          }}
        >
          {CASES.map((x, i) => (
            <button
              key={x.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`case-${x.id}`}
              aria-selected={i === active}
              aria-controls="case-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
            >
              <MovingIcon icon={x.icon} size={17} trigger="button" />
              {x.tab}
            </button>
          ))}
        </div>
        <div className="case" id="case-panel" role="tabpanel" aria-labelledby={`case-${c.id}`}>
          <div className="case-text" key={c.id}>
            <span className="case-icon" aria-hidden="true">
              <MovingIcon icon={CaseIcon} size={22} trigger=".case-text" />
            </span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <p className="case-without">
              <span>Without Takewon</span>
              {c.without}
            </p>
          </div>
          <div className="case-flow" key={`flow-${c.id}`}>
            <p className="case-in">
              <span className="case-in-label">In</span>
              {c.input}
            </p>
            <ul className="case-outs" aria-label="What comes out">
              {c.outputs.map((o, i) => (
                <li key={o.label} style={{ animationDelay: `${0.08 * i + 0.1}s` }}>
                  <span className={`case-shape ${o.shape}`} aria-hidden="true">
                    <ShapeArt shape={o.shape} />
                  </span>
                  <span className="case-out-text">
                    <span className="case-out-label">{o.label}</span>
                    {o.logos && (
                      <span className="case-logos">
                        {o.logos.map((l) => (
                          <Logo key={l} name={l} />
                        ))}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
