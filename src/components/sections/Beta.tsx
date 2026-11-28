import Link from "next/link";
import { Mail } from "lucide-react";
import { EarlyAccessForm } from "@/components/EarlyAccessForm";
import { Reveal } from "@/components/Reveal";
import { APP_URL, CONTACT_EMAIL, CONTACT_HREF } from "@/lib/contact";

const APP_HOST = APP_URL.replace("https://", "");

/** What a tester gets from the beta. */
export const GETS: { title: string; body: string }[] = [
  {
    title: "The full app, early",
    body: "Ready-made automations you switch on, the agent that sets up your own, your library with transcripts, captions, clips for each platform and hand-off to your editor.",
  },
  { title: "Free while it’s in beta", body: "No card and no trial clock. You use Takewon for nothing while we build it together." },
  { title: "A direct line to me", body: "Questions and problems come straight to me, and I answer every one myself." },
  { title: "A say in what’s built next", body: "What testers run into decides what I build next." },
];

/** What the beta asks of a tester in return. */
export const ASKS: { title: string; body: string }[] = [
  { title: "Use it on real content", body: "Your actual recordings, podcasts, streams or client work, not a test file. That’s where the real problems show up." },
  { title: "Tell me what breaks", body: "And what’s missing, confusing or slow. A quick email or a reply to one of mine is plenty." },
  { title: "Maybe a short call", body: "If you’re up for it, a short call so I can see how you work. Never required." },
];

/** What happens after someone applies, in order. */
export const AFTER: { title: string; body: string }[] = [
  { title: "I read your application", body: "Every one, myself. I invite a few people at a time so I can help each of them properly." },
  { title: "You get an invite email", body: "It comes from Takewon and has the link to create your account." },
  { title: "You create your account", body: `With the email you were invited on, at ${APP_HOST}. Only invited addresses can sign up during the beta.` },
  { title: "I check in after 3 days", body: "One email to ask how it’s going and what got in your way." },
];

/** What Takewon is for. These don't change between releases. */
export const GOALS: { title: string; body: string }[] = [
  {
    title: "Automations that run on their own",
    body: "Every new upload is handled the same way, on a server, with nobody watching. Ready-made automations come first; switch one on and it runs.",
  },
  {
    title: "AI sets it up, plain editing runs it",
    body: "Describe a job and the agent builds the automation, tests it on a real recording and turns it on. The automation itself runs on plain editing steps, so no AI is spent on every video.",
  },
  { title: "No fee for every video", body: "Cutting, captioning and reframing shouldn’t cost per minute or per credit. Processing on your own server has no meter." },
  { title: "Content organized and ready to clip", body: "One library of everything you’ve recorded, with transcripts and details, ready for the next clip or your editor." },
  {
    title: "Yours to own",
    body: "Open source under AGPL-3.0. Pay once and run it on a rented server or your own always-on machine, such as a Mac Mini.",
  },
  {
    title: "Works with what you already use",
    body: "n8n can start an automation if you use it, but you don’t need it. AI apps such as Claude, ChatGPT and Cursor connect through the MCP server.",
  },
];

/** Where things stand, from what testers can use today to what Takewon will never do. */
export const ROADMAP: { stage: string; note: string; items: string[] }[] = [
  {
    stage: "In the beta now",
    note: "What you can use the day you’re invited.",
    items: [
      "Ready-made automations, plus the agent that builds your own",
      "Your library, with a transcript for every upload",
      "Captions, including translated captions",
      "Clips made for each platform",
      "Export to Premiere Pro, DaVinci Resolve, Final Cut Pro and CapCut",
      "Recordings that come in from Zoom, Google Meet and Microsoft Teams",
      "Approvals before anything goes out",
      "AI apps connected through the MCP server",
    ],
  },
  {
    stage: "Next",
    note: "Prices are announced at launch.",
    items: [
      "A one-time purchase: your own version, with a 4-week group cohort to build it out",
      "A hosted version, so you don’t have to run a server",
      "Monthly plans beside the one-time purchase",
    ],
  },
  {
    stage: "Later",
    note: "After the editing, export and automation work.",
    items: ["The app in more languages", "Posting to social platforms, which comes last"],
  },
  {
    stage: "Not planned",
    note: "Takewon works on footage and audio you really recorded.",
    items: ["Text-to-video", "AI dubbing", "AI avatars"],
  },
];

export const BETA_FAQ: { q: string; a: React.ReactNode }[] = [
  { q: "What does the beta cost?", a: "Nothing. There’s no card to enter and no trial that runs out." },
  { q: "How long does the beta run?", a: "There’s no end date yet. It runs until Takewon is ready to launch." },
  {
    q: "What happens to my files?",
    a: "They stay in your account, and you can download them at any time. You can delete your account and everything in it yourself, from Settings.",
  },
  {
    q: "Who can apply?",
    a: "Anyone who makes video or audio content: creators, podcasters, streamers, agencies and in-house teams. I invite a few people at a time, so it can take a little while to hear back.",
  },
  {
    q: "Do I need my own server for the beta?",
    a: `No. Beta testers use Takewon at ${APP_HOST}, and it runs for you. Running it on your own server comes with the one-time purchase.`,
  },
  { q: "Is it open source?", a: "Yes, under AGPL-3.0. Owning your version means you can read the code and change it." },
  {
    q: "Can I just sign up?",
    a: (
      <>
        Not during the beta. Accounts can only be made by people I’ve invited, so apply <a href="#early">below</a> and watch for the invite email.
      </>
    ),
  },
];

export function BetaHero() {
  return (
    <section className="beta-hero" aria-labelledby="beta-title">
      <div className="wrap">
        <p className="about-kicker">Closed beta</p>
        <h1 id="beta-title">Help build Takewon.</h1>
        <p className="hero-sub">
          Your content, social media ready. Takewon is free while it’s in beta, and I’m inviting testers a few at a time to use it on real content
          and shape what comes next.
        </p>
        <div className="beta-hero-cta">
          <a className="btn primary lg" href="#early">
            Apply for the beta
          </a>
          <a className="btn ghost lg" href="#roadmap">
            See where it’s going
          </a>
        </div>
      </div>
    </section>
  );
}

function Cards({ list, label, three }: { list: { title: string; body: string }[]; label: string; three?: boolean }) {
  return (
    <ul className={three ? "beta-cards three" : "beta-cards"} aria-label={label}>
      {list.map((g) => (
        <li key={g.title}>
          <h3>{g.title}</h3>
          <p>{g.body}</p>
        </li>
      ))}
    </ul>
  );
}

export function BetaDeal() {
  return (
    <section className="beta-sec" id="deal" aria-labelledby="deal-title">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2 id="deal-title">What the beta is</h2>
          <p>A small group using Takewon early, for free, in exchange for honest feedback.</p>
        </Reveal>
        <div className="beta-deal">
          <div>
            <h3 className="beta-sub">What you get</h3>
            <Cards list={GETS} label="What you get" />
          </div>
          <div>
            <h3 className="beta-sub">What I ask</h3>
            <Cards list={ASKS} label="What I ask" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function BetaAfter() {
  return (
    <section className="beta-sec" id="after" aria-labelledby="after-title">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2 id="after-title">After you apply</h2>
        </Reveal>
        <ol className="beta-after">
          {AFTER.map((s, i) => (
            <li key={s.title}>
              <span className="beta-n" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function BetaRoadmap() {
  return (
    <section className="beta-sec" id="roadmap" aria-labelledby="roadmap-title">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2 id="roadmap-title">Where Takewon is going</h2>
          <p>The goals stay the same. The roadmap moves with what testers tell me.</p>
        </Reveal>
        <h3 className="beta-sub center">What it’s for</h3>
        <Cards list={GOALS} label="Goals" three />
        <h3 className="beta-sub center">The roadmap</h3>
        <ol className="beta-road">
          {ROADMAP.map((r) => (
            <li key={r.stage} className={r.stage === "Not planned" ? "is-never" : undefined}>
              <h4>{r.stage}</h4>
              <p className="beta-road-note">{r.note}</p>
              <ul>
                {r.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <p className="beta-more">
          Plans and what’s included are on the <Link href="/pricing">pricing page</Link>.
        </p>
      </div>
    </section>
  );
}

export function BetaFaq() {
  return (
    <section className="faq" id="beta-faq" aria-labelledby="beta-faq-title">
      <div className="wrap faq-in">
        <Reveal className="sec-head">
          <h2 id="beta-faq-title">Beta questions</h2>
          <p>
            Anything else, email <a href={CONTACT_HREF}>{CONTACT_EMAIL}</a>.
          </p>
        </Reveal>
        <div className="faq-list">
          {BETA_FAQ.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>
                <span>{f.q}</span>
                <span className="faq-plus" aria-hidden="true" />
              </summary>
              <div className="faq-a">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The beta form itself, right on the page. Every "Join the beta" link (#early) lands here. */
export function BetaApply() {
  return (
    <section className="early beta-apply" id="early" aria-labelledby="apply-title">
      <div className="wrap">
        <div className="beta-apply-in">
          <h2 id="apply-title">Apply for the beta</h2>
          <p className="early-lede">Three short steps, about two minutes. I reply to everyone myself.</p>
          <EarlyAccessForm />
          <div className="socials">
            <p>Questions first? Send an email.</p>
            <a href={CONTACT_HREF}>
              <Mail size={18} aria-hidden="true" /> {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
