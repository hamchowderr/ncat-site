"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Bot, Check, FileVideo, MessageSquareText, Mic, Upload } from "lucide-react";
import { DiscordMark, SlackMark, TeamsMark, TelegramMark } from "@/components/brand/AppLogos";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type AlsoSceneName = "chat" | "clients" | "steps" | "files" | "tours";

/**
 * Small drawn scenes of each feature, built from the same pieces the dashboard uses
 * (rows, pills, a progress bar, a tour bubble). Decorative: the card's words say it all.
 */
export function AlsoScene({ name }: { name: AlsoSceneName }) {
  return (
    <div className={`scene scene-${name}`} aria-hidden="true">
      {name === "chat" && <ChatScene />}
      {name === "clients" && <ClientsScene />}
      {name === "steps" && <StepsScene />}
      {name === "files" && <FilesScene />}
      {name === "tours" && <ToursScene />}
    </div>
  );
}

type ChatLine = { ava: string; who: string; ask: string; file?: string };
type ChatThird = { ava: string; voice: string } | { ava: string; who: string; ask: string };

/**
 * The chat apps the agent answers in. The scene replays once per app, and each app
 * carries its own short conversation, so the box says something new every loop.
 */
export const CHAT_APPS: readonly {
  app: "slack" | "discord" | "teams" | "telegram";
  channel: string;
  Mark: () => React.ReactNode;
  ask: ChatLine;
  reply: string;
  third: ChatThird;
}[] = [
  {
    app: "slack",
    channel: "# content-team",
    Mark: SlackMark,
    ask: { ava: "MO", who: "Maya", ask: "cut Monday’s stream into three TikTok clips" },
    reply: "Done. Three captioned clips are waiting in Review",
    third: { ava: "JR", voice: "0:08" },
  },
  {
    app: "discord",
    channel: "# clips",
    Mark: DiscordMark,
    ask: { ava: "DK", who: "Dev", ask: "what’s still waiting for review?" },
    reply: "Four clips from Tuesday’s podcast, all captioned",
    third: { ava: "DK", who: "Dev", ask: "make the second one 4:5 for Instagram" },
  },
  {
    app: "teams",
    channel: "Content Team › General",
    Mark: TeamsMark,
    ask: { ava: "PN", who: "Priya", ask: "clip every new Zoom recording for LinkedIn" },
    reply: "Set up. Each new Zoom recording now becomes captioned LinkedIn clips",
    third: { ava: "SA", voice: "0:12" },
  },
  {
    app: "telegram",
    channel: "Content Team",
    Mark: TelegramMark,
    ask: { ava: "LT", who: "Leo", ask: "YouTube Shorts from this, please", file: "interview.mp4" },
    reply: "On it. The Shorts will be in Review when the run finishes",
    third: { ava: "LT", who: "Leo", ask: "and a square one for LinkedIn too" },
  },
];

/** One full play of the conversation (matches the 9s msg-in animation in globals.css). */
export const CHAT_LOOP_MS = 9000;

function ChatScene() {
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setN((x) => (x + 1) % CHAT_APPS.length), CHAT_LOOP_MS);
    return () => window.clearInterval(id);
  }, [reduced]);
  const { app, channel, Mark, ask, reply, third } = CHAT_APPS[n];
  return (
    <div className="chat" key={app} data-app={app}>
      <p className="chat-chan">
        <Mark /> {channel}
      </p>
      <div className="msg">
        <span className="ava ava-you">{ask.ava}</span>
        <div>
          <p className="msg-who">{ask.who}</p>
          {ask.file && (
            <p className="msg-file">
              <FileVideo size={14} strokeWidth={2.2} /> {ask.file}
            </p>
          )}
          <p className="msg-bubble">
            <b>@Takewon</b> {ask.ask}
          </p>
        </div>
      </div>
      <div className="msg msg-bot">
        <span className="ava ava-bot">
          <Bot size={14} strokeWidth={2.2} />
        </span>
        <div>
          <p className="msg-who">Takewon</p>
          <p className="msg-bubble">
            {reply.slice(0, reply.lastIndexOf(" ") + 1)}
            <span className="nowrap">
              {reply.slice(reply.lastIndexOf(" ") + 1)} <ArrowRight size={13} strokeWidth={2.4} />
            </span>
          </p>
        </div>
      </div>
      {"voice" in third ? (
        <div className="msg msg-voice">
          <span className="ava ava-you">{third.ava}</span>
          <p className="voice">
            <Mic size={14} strokeWidth={2.2} />
            <span className="voice-wave">
              {Array.from({ length: 18 }, (_, i) => (
                <i key={i} style={{ height: `${28 + 72 * Math.abs(Math.sin(i * 1.7 + n))}%` }} />
              ))}
            </span>
            <span className="voice-len">{third.voice}</span>
          </p>
        </div>
      ) : (
        <div className="msg msg-voice msg-third">
          <span className="ava ava-you">{third.ava}</span>
          <div>
            <p className="msg-who">{third.who}</p>
            <p className="msg-bubble">
              <b>@Takewon</b> {third.ask}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Real captioned clips the site already shows, so the client portal plays actual work. */
export const PORTAL_CLIPS = ["tiktok", "instagram", "linkedin"] as const;

function ClientsScene() {
  return (
    <div className="portal">
      <p className="portal-top">
        <span className="portal-ava">NS</span>
        <span>
          <b>Northside Studio</b>
          <small>3 clips to review</small>
        </span>
      </p>
      <div className="portal-thumbs">
        {PORTAL_CLIPS.map((c) => (
          <video key={c} src={`/media/split/${c}.mp4`} poster={`/media/split/${c}.jpg`} autoPlay muted loop playsInline preload="metadata" />
        ))}
      </div>
      <p className="portal-acts">
        <span className="pa-yes">
          <Check size={13} strokeWidth={2.6} /> Approve
        </span>
        <span className="pa-ask">Ask for changes</span>
      </p>
    </div>
  );
}

function StepsScene() {
  return (
    <div className="steps-s">
      <p className="ask">
        <MessageSquareText size={14} strokeWidth={2.2} />
        <span className="ask-type">Fade in from black for two seconds</span>
      </p>
      <div className="made">
        <span className="made-icon">
          <Bot size={15} strokeWidth={2.2} />
        </span>
        <span>
          <b>Fade in</b>
          <small>
            <Check size={12} strokeWidth={2.6} /> Tried on a file
          </small>
        </span>
        <span className="made-save">Saved</span>
      </div>
    </div>
  );
}

/** Two cuts of the same recording, standing in for Version 1 and Version 2 of a review clip. */
export const VERSION_CLIPS = ["tiktok", "youtube"] as const;

function FilesScene() {
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setV((x) => 1 - x), 2800);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div className="files-s">
      <div className="files-main">
        <p className="file-row">
          <FileVideo size={16} strokeWidth={2} />
          <span className="file-name">full-day-shoot.mov</span>
          <Upload size={14} strokeWidth={2.2} className="file-up" />
        </p>
        <div className="parts">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} style={{ "--p": i } as React.CSSProperties} />
          ))}
        </div>
        <p className="vs" data-v={v + 1}>
          <span className={v === 0 ? "vs-on" : undefined}>Version 1</span>
          <span className={v === 1 ? "vs-on" : undefined}>Version 2</span>
        </p>
      </div>
      <div className="vs-preview">
        {VERSION_CLIPS.map((c, i) => (
          <video key={c} className={v === i ? "on" : undefined} src={`/media/split/${c}.mp4`} poster={`/media/split/${c}.jpg`} autoPlay muted loop playsInline preload="metadata" />
        ))}
      </div>
    </div>
  );
}

function ToursScene() {
  return (
    <div className="tour">
      <div className="tour-bar">
        <span className="tour-dot" />
        <span className="tour-line" />
        <span className="tour-line short" />
      </div>
      <div className="tour-tip">
        <p>Runs land here. Open one to see each step.</p>
        <p className="tour-foot">
          <span>2 of 5</span>
          <span className="tour-next">Next</span>
        </p>
      </div>
    </div>
  );
}
