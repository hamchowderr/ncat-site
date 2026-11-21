import Image from "next/image";
import { siFfmpeg, siGithub, siYoutube } from "simple-icons";
import { BrandIcon, FileLogo } from "@/components/brand/Logo";
import { A16zMark, ClaudeMark, KinnMark } from "@/components/brand/Venues";
import { FillText } from "@/components/FillText";
import { Reveal } from "@/components/Reveal";

/** The story behind Kontentifi, told as five chapters. Every fact here comes from the two talks. */
export const CHAPTERS: { n: string; when: string; title: string; body: string; scene: "video" | "walls" | "engine" | "rooms" | "shell" }[] = [
  {
    n: "01",
    when: "It started with",
    title: "One video",
    body: "Stephen G. Pope posted “FACELESS Videos 100% Automated”. More than 237,000 people watched it, and a community grew around the idea that content could make itself.",
    scene: "video",
  },
  {
    n: "02",
    when: "Then",
    title: "Everyone hit the same walls",
    body: "Cost, above all. Every step was another paid tool, pieced together with the next one, each with its own monthly bill. Working for Stephen inside that community, I saw it every day.",
    scene: "walls",
  },
  {
    n: "03",
    when: "So Stephen",
    title: "Built a free engine",
    body: "He worked it through with Claude and made the NCA Toolkit: free, open source under GPL-2.0, built on FFmpeg and Whisper. It does the heavy lifting on your own server, with no fee per video.",
    scene: "engine",
  },
  {
    n: "04",
    when: "Then came",
    title: "Two rooms full of creators",
    body: "I gave the talk “Edit and transform content for less” at the Claude Code Creators Summit during Tech Week Los Angeles, to more than 400 creators and builders, and again at The KINN AI Cafe in Venice. After both, people asked the same thing.",
    scene: "rooms",
  },
  {
    n: "05",
    when: "Which is why",
    title: "Kontentifi is the missing piece",
    body: "The engine has no interface. You either wire it up in n8n or write scripts. Kontentifi is the fine-tuned shell around it: ready-made automations, an agent that sets up new ones, review before anything goes out. You pay once and own your version.",
    scene: "shell",
  },
];

export function AboutHero() {
  return (
    <section className="about-hero" aria-labelledby="about-title">
      <div className="wrap">
        <p className="about-kicker">Why this exists</p>
        <h1 id="about-title">
          Built for everyone who hit <span className="about-wall">the same wall</span>.
        </h1>
        <p className="hero-sub">
          Kontentifi didn’t start as a product. It started as a free engine, a community of creators tired of paying for every step, and two talks that kept
          ending with the same question.
        </p>
      </div>
    </section>
  );
}

export function AboutStory() {
  return (
    <section className="story" aria-labelledby="story-title">
      <div className="wrap">
        <h2 id="story-title" className="sr">
          The story
        </h2>
        <ol className="chapters">
          {CHAPTERS.map((c) => (
            <li key={c.n} className={`chapter chapter-${c.scene}`}>
              <span className="ch-n" aria-hidden="true">
                {c.n}
              </span>
              <Reveal className="ch-text">
                <p className="ch-when">{c.when}</p>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </Reveal>
              <Reveal className="ch-scene" delay={0.08}>
                <ChapterScene name={c.scene} />
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ChapterScene({ name }: { name: (typeof CHAPTERS)[number]["scene"] }) {
  if (name === "video")
    return (
      <a className="cs cs-video" href="https://youtu.be/ZHeDsV7diMw" aria-label="Watch “FACELESS Videos 100% Automated” by Stephen G. Pope on YouTube">
        <span className="cs-thumb">
          <Image src="/media/about/faceless-videos.jpg" alt="" width={1280} height={480} sizes="(max-width: 860px) 90vw, 460px" />
        </span>
        <span className="cs-vtitle">FACELESS Videos 100% Automated</span>
        <span className="cs-views">
          <BrandIcon icon={siYoutube} /> Stephen G. Pope · <b>237,000+</b> views
        </span>
      </a>
    );
  if (name === "walls")
    return (
      <ul className="cs cs-walls" aria-hidden="true">
        {["Captions", "Clipping", "Resizing", "Transcripts", "Scheduling"].map((t, i) => (
          <li key={t} style={{ "--i": i } as React.CSSProperties}>
            <span>{t}</span>
            <i>per month</i>
          </li>
        ))}
      </ul>
    );
  if (name === "engine")
    return (
      <div className="cs cs-engine" aria-hidden="true">
        <p className="cs-repo">
          <BrandIcon icon={siGithub} /> no-code-architects-toolkit
        </p>
        <p className="cs-tags">
          <span>Free</span>
          <span>Open source</span>
          <span>GPL-2.0</span>
        </p>
        <p className="cs-built">
          <BrandIcon icon={siFfmpeg} /> FFmpeg <span className="cs-plus">+</span> Whisper
        </p>
      </div>
    );
  if (name === "rooms")
    return (
      <div className="cs cs-rooms" aria-hidden="true">
        <div className="room">
          <p className="room-date">
            <b>Oct 15</b> 2026
          </p>
          <p className="room-marks">
            <ClaudeMark className="mark claude" />
            <A16zMark className="mark a16z" />
          </p>
          <p className="room-where">Verizon Innovation Center, Los Angeles</p>
        </div>
        <div className="room">
          <p className="room-date">
            <b>Nov 5</b> 2026
          </p>
          <p className="room-marks">
            <KinnMark className="mark kinn" />
          </p>
          <p className="room-where">The KINN AI Cafe, Venice</p>
        </div>
      </div>
    );
  return (
    <div className="cs cs-shell" aria-hidden="true">
      <span className="shell-ring">
        <span className="shell-core">
          <BrandIcon icon={siFfmpeg} />
          <small>Free engine</small>
        </span>
      </span>
      <span className="shell-label">Kontentifi</span>
      <span className="shell-alt">
        <FileLogo name="n8n" size={20} /> or scripts, without it
      </span>
    </div>
  );
}

export function AboutQuote() {
  return (
    <section className="about-quote" aria-label="What creators told me">
      <div className="wrap">
        <FillText className="about-fill" text="After every talk I heard the same thing: creators don’t want to [rent one more tool]. So you pay once and [own your version]." />
      </div>
    </section>
  );
}

export function AboutWho() {
  return (
    <section className="who" aria-labelledby="who-title">
      <div className="wrap who-in">
        <Reveal className="who-text">
          <p className="about-kicker">Who’s behind it</p>
          <h2 id="who-title">Tylan “Chowderr” Miller</h2>
          <p>
            Founder and CTO of Otaku Solutions. I worked for Stephen in his community, so I know the NCA Toolkit and the tools around it inside out,
            along with the walls people hit with them. Kontentifi is everything I kept seeing people need around that free engine.
          </p>
          <p className="who-links">
            <a href="https://otakusolutions.io">Otaku Solutions</a>
            <a href="https://chowderr.dev">chowderr.dev</a>
          </p>
        </Reveal>
        <Reveal className="credits" delay={0.08}>
          <h3>Standing on</h3>
          <ul>
            <li>
              <a href="https://github.com/stephengpope/no-code-architects-toolkit">
                <BrandIcon icon={siGithub} />
                <span>
                  <b>NCA Toolkit</b>
                  <small>by Stephen G. Pope, the free engine underneath</small>
                </span>
              </a>
            </li>
            <li>
              <a href="https://ffmpeg.org">
                <BrandIcon icon={siFfmpeg} />
                <span>
                  <b>FFmpeg</b>
                  <small>the cutting, encoding and captions</small>
                </span>
              </a>
            </li>
            <li>
              <a href="https://n8n.io">
                <FileLogo name="n8n" size={20} />
                <span>
                  <b>n8n</b>
                  <small>bundled with the toolkit, optional with Kontentifi</small>
                </span>
              </a>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
