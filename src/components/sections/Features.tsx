import Image, { type StaticImageData } from "next/image";
import alerts from "@/assets/screens/alerts.jpg";
import brand from "@/assets/screens/brand.jpg";
import exportShot from "@/assets/screens/export.jpg";
import files from "@/assets/screens/files.jpg";
import review from "@/assets/screens/review.jpg";
import run from "@/assets/screens/run.jpg";
import schedule from "@/assets/screens/schedule.jpg";
import templates from "@/assets/screens/templates.jpg";
import { BrandIcon, FileLogo, icons } from "@/components/brand/Logo";

type Row = { id: string; title: string; body: string; points: string[]; shot: StaticImageData; alt: string; extra?: React.ReactNode };

const ROWS: Row[] = [
  {
    id: "templates",
    title: "Start from a ready-made automation",
    body: "Pick one for clips, captions, transcripts or audio and switch it on. It runs on every new upload with plain editing steps, so no AI tokens are spent on each video. Every step sits on a canvas you can read and change.",
    points: ["Ready-made automations for clips, captions, transcripts and audio", "Steps connect themselves, so there is nothing to wire up", "Need something else? Describe it and the agent builds it once"],
    shot: templates,
    alt: "The New automation screen: a gallery of templates such as Clips for social, Caption every new upload and Episode to audio and transcript.",
  },
  {
    id: "runs",
    title: "Every new recording runs by itself",
    body: "Once it is on, an automation starts on its own when a file is uploaded, lands in a watched folder, a schedule comes round or another tool calls it. Plain editing steps do the work, so nothing is billed per video.",
    points: ["Starts from an upload, a folder, a schedule or a webhook", "Watch each step finish, or come back to a list of what happened", "Works with or without n8n"],
    shot: run,
    alt: "A run of the Clips for social automation in progress: New upload, then Clips for a platform done with 3 clips, then Caption video running, with a list of what happened below.",
    extra: (
      <ul className="logo-chips" aria-label="Also works with">
        <li>
          <FileLogo name="n8n" size={22} /> n8n, through a webhook
        </li>
      </ul>
    ),
  },
  {
    id: "review",
    title: "Nothing goes out until someone says yes",
    body: "Add an approval step anywhere. The run pauses, the right people get an alert, and they watch the clip, leave a comment pinned to the exact moment and approve it or ask for changes.",
    points: ["Choose who can approve each step", "Comments pinned to a moment in the clip", "Decide what happens if nobody answers in time"],
    shot: review,
    alt: "The Review screen: a captioned clip with Approve and Ask for changes buttons and a comments panel.",
  },
  {
    id: "editors",
    title: "Finish it in the editor you already use",
    body: "The repeatable work happens automatically. Anything that still needs a human opens in your editing app with every cut adjustable, or goes to your editor already trimmed, captioned and labelled.",
    points: ["Timelines for Premiere Pro, DaVinci Resolve and Final Cut Pro", "CapCut-ready clip packs", "Caption files and the finished clips in one download"],
    shot: exportShot,
    alt: "A finished run of Clips for Reels whose last step, Export for editors, made files for Premiere, Resolve and Final Cut.",
    extra: (
      <ul className="logo-chips" aria-label="Editors it exports to">
        <li>
          <FileLogo name="premiere" size={22} /> Premiere Pro
        </li>
        <li>
          <BrandIcon icon={icons.resolve} /> DaVinci Resolve
        </li>
        <li>
          <FileLogo name="finalcut" size={22} /> Final Cut Pro
        </li>
        <li>
          <FileLogo name="capcut" size={22} /> CapCut
        </li>
      </ul>
    ),
  },
];

const TILES: { title: string; body: string; shot: StaticImageData; alt: string }[] = [
  {
    title: "Your brand, set once",
    body: "Logo, colour, font and music are saved in settings and used by every step that needs them. No step ever asks again.",
    shot: brand,
    alt: "Settings, Brand section: logo, brand colour, font and music library.",
  },
  {
    title: "Organized in your own storage",
    body: "Every upload and every output is filed in your bucket, with its length, picture size and the run that made it.",
    shot: files,
    alt: "The Files screen: a folder of videos with type, length, picture size, size and date changed.",
  },
  {
    title: "Retries, then an alert",
    body: "If the toolkit is busy or a file is bad, the step tries again. If it still fails you get an alert saying what went wrong.",
    shot: alerts,
    alt: "An alert that Captions for every upload failed after 3 tries, with the error from the toolkit.",
  },
  {
    title: "On a schedule, in your time zone",
    body: "Run it every morning or every Friday at 9. The canvas shows what starts it and when it last ran.",
    shot: schedule,
    alt: "An automation started by a Schedule trigger set to every day at 09:00 America/Los_Angeles.",
  },
];

export function Features() {
  return (
    <section className="features" id="features" aria-labelledby="features-title">
      <div className="wrap">
        <header className="sec-head">
          <h2 id="features-title">Ready-made automations. No AI on every video.</h2>
          <p>
            Clipping apps run AI on every video and bill you for it, and editing with an AI assistant spends tokens on every cut. Most of that work
            is plain editing: cut, resize, caption, join and level the audio. Here it is set up once and runs the same way every time.
          </p>
        </header>
        <div className="rows">
          {ROWS.map((r, i) => (
            <article className={i % 2 ? "row flip" : "row"} key={r.id} id={r.id}>
              <div className="row-text">
                <h3>{r.title}</h3>
                <p>{r.body}</p>
                <ul className="ticks">
                  {r.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {r.extra}
              </div>
              <figure className="shot">
                <Image src={r.shot} alt={r.alt} sizes="(max-width: 900px) 92vw, 640px" quality={90} placeholder="blur" />
              </figure>
            </article>
          ))}
        </div>
        <h3 className="tiles-title">And the parts you would otherwise do by hand</h3>
        <div className="tiles">
          {TILES.map((t) => (
            <article className="tile" key={t.title}>
              <figure className="shot sm">
                <Image src={t.shot} alt={t.alt} sizes="(max-width: 700px) 92vw, 520px" quality={90} placeholder="blur" />
              </figure>
              <h4>{t.title}</h4>
              <p>{t.body}</p>
            </article>
          ))}
        </div>
        <p className="screens-note">Every screen on this page is the working dashboard. The team, people and files in them are demo data.</p>
      </div>
    </section>
  );
}
