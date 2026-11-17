"use client";

import { useRef, useState } from "react";

export const CASES = [
  {
    id: "creators",
    tab: "Creators",
    title: "Record once. Clips all week.",
    body: "Upload your long video and it is filed, transcribed and cut into captioned clips for every platform on its own. Open the ones that need a touch in your editor. No per-minute fees.",
    timeline: [
      ["Mon", "Long video up, transcript done"],
      ["Tue", "Clip 1, vertical, captioned, ready"],
      ["Wed", "Clip 2 plus a thumbnail"],
      ["Thu", "Clip 3 and an audio version"],
    ],
  },
  {
    id: "agencies",
    tab: "Editing agencies",
    title: "One automation per client. Running forever.",
    body: "Set up each client’s automation once, add an approval step, and let it run. Your editors spend their time on the creative work, and more clients doesn’t mean a bigger software bill.",
    timeline: [
      ["Client A", "12 shorts captioned, waiting for approval"],
      ["Client B", "Podcast cut to clips, sent to the editor"],
      ["Client C", "Thumbnails for 6 videos"],
      ["You", "Every run in one list"],
    ],
  },
  {
    id: "podcasts",
    tab: "Podcast teams",
    title: "Every episode, handled the same way.",
    body: "Transcript, audio, clips and captions on every new episode, every time, filed where the team expects them.",
    timeline: [
      ["Lands", "Episode arrives in your folder"],
      ["Then", "Transcript and MP3 ready"],
      ["Then", "Captioned vertical clips"],
      ["Last", "Waiting in the review queue"],
    ],
  },
  {
    id: "music",
    tab: "Music video teams",
    title: "One master and one cover. The whole release.",
    body: "Drop in the finished track and the artwork. Every version a release needs is made the same way each time, so the team stays on the shoot and the edit.",
    timeline: [
      ["16:9", "Cover art video with a waveform"],
      ["9:16", "Vertical short for every feed"],
      ["Lyric", "Lyric video from your own lyrics"],
      ["Loop", "Spotify Canvas loop and a thumbnail"],
    ],
  },
] as const;

export function UseCases() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const c = CASES[active];
  return (
    <section className="cases" id="use-cases" aria-labelledby="cases-title">
      <div className="wrap">
        <header className="sec-head">
          <h2 id="cases-title">Built for the people who were in the room</h2>
        </header>
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
              {x.tab}
            </button>
          ))}
        </div>
        <div className="case" id="case-panel" role="tabpanel" aria-labelledby={`case-${c.id}`}>
          <div className="case-text">
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
          <ol className="case-line">
            {c.timeline.map(([k, v]) => (
              <li key={k + v}>
                <span className="when">{k}</span>
                <span>{v}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
