import { MovingIcon } from "@/components/MovingIcon";
import CheckedIcon from "@/components/itshover/checked-icon";
import ClockIcon from "@/components/itshover/clock-icon";
import LayersIcon from "@/components/itshover/layers-icon";
import LayoutDashboardIcon from "@/components/itshover/layout-dashboard-icon";
import PaintIcon from "@/components/itshover/paint-icon";
import RefreshIcon from "@/components/itshover/refresh-icon";
import SendIcon from "@/components/itshover/send-icon";
import UploadIcon from "@/components/itshover/upload-icon";
import { FeatureStory, type StoryRow } from "@/components/FeatureStory";
import { FeatureVideo } from "@/components/FeatureVideo";
import { PhoneFold } from "@/components/PhoneFold";
import { Reveal } from "@/components/Reveal";
import SpotlightCard from "@/components/reactbits/SpotlightCard/SpotlightCard";
import { PlatformLead, type LeadPhrase } from "@/components/PlatformLead";
import { BrandIcon, FileLogo, icons } from "@/components/brand/Logo";

const ROWS: StoryRow[] = [
  {
    id: "templates",
    step: "Pick",
    icon: <MovingIcon icon={LayoutDashboardIcon} size={18} trigger=".story-card" />,
    title: "Start from a ready-made automation",
    body: "Pick one for clips, captions, transcripts or audio and switch it on. It runs on every new upload with plain editing steps, so no AI tokens are spent on each video. Every step sits on a canvas you can read and change.",
    points: ["Ready-made automations for clips, captions, transcripts and audio", "Steps connect themselves, so there is nothing to wire up", "Need something else? Describe it and the agent builds it once"],
    video: "templates",
    alt: "Screen recording: New automation, pick Clips for social, choose TikTok in the clips step and switch the automation on.",
  },
  {
    id: "runs",
    step: "Runs by itself",
    icon: <MovingIcon icon={UploadIcon} size={18} trigger=".story-card" />,
    title: "Every new recording runs by itself",
    body: "Once it is on, an automation starts on its own when a file is uploaded, lands in a watched folder, a schedule comes round or another tool calls it. Plain editing steps do the work, so nothing is billed per video.",
    points: ["Starts from an upload, a folder, a schedule or a webhook", "Watch each step finish, or come back to a list of what happened", "Comes with its own automation builder, made for content"],
    video: "runs",
    alt: "Screen recording: Space interviews.mp4 is uploaded, the Clips for social run starts by itself, cuts 3 clips, captions them and pauses for approval. Sped up while the toolkit works.",
    extra: (
      <ul className="logo-chips" aria-label="Outside platforms">
        <li>
          <FileLogo name="n8n" size={22} /> Prefer an outside platform? n8n is available
        </li>
      </ul>
    ),
  },
  {
    id: "review",
    step: "Approve",
    icon: <MovingIcon icon={CheckedIcon} size={18} trigger=".story-card" />,
    title: "Nothing goes out until someone says yes",
    body: "Add an approval step anywhere. The run pauses, the right people get an alert, and they watch the clip, leave a comment pinned to the exact moment and approve it or ask for changes.",
    points: ["Choose who can approve each step", "Comments pinned to a moment in the clip", "Decide what happens if nobody answers in time"],
    video: "review",
    alt: "Screen recording: the Review list opens a review of three clips side by side, a captioned clip plays, a comment is pinned to the paused moment, and the clips are approved.",
  },
  {
    id: "editors",
    step: "Finish",
    icon: <MovingIcon icon={SendIcon} size={18} trigger=".story-card" />,
    title: "Finish it in the editor you already use",
    body: "The repeatable work happens automatically. Anything that still needs a human opens in your editing app with every cut adjustable, or goes to your editor already trimmed, captioned and labelled.",
    points: ["Timelines for Premiere Pro, DaVinci Resolve and Final Cut Pro", "CapCut-ready clip packs", "Caption files and the finished clips in one download"],
    video: "editors",
    alt: "Screen recording: a finished run's Open in editor window with timelines for Premiere Pro, DaVinci Resolve and Final Cut Pro, and the finished clips for CapCut.",
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

const TILE_SURFACE = { "--spotlight-card-surface": "transparent", "--spotlight-card-border": "transparent", "--spotlight-card-shadow": "none" } as React.CSSProperties;

const TILES: { title: string; icon: React.ReactNode; body: string; video: string; alt: string }[] = [
  {
    title: "Your brand, set once",
    icon: <MovingIcon icon={PaintIcon} size={18} trigger=".tile" />,
    body: "Logo, colour, font and music are saved in settings and used by every step that needs them. No step ever asks again.",
    video: "brand",
    alt: "Screen recording: the logo, brand colour and theme music are saved in Settings, then the Add a logo step shows it is handled for you.",
  },
  {
    title: "Organized in your own storage",
    icon: <MovingIcon icon={LayersIcon} size={18} trigger=".tile" />,
    body: "Every upload and every output is filed in your bucket, with its length, picture size and the run that made it.",
    video: "files",
    alt: "Screen recording: a new TikTok clips folder is made in the Files screen, a captioned clip is renamed and moved into it.",
  },
  {
    title: "Retries, then an alert",
    icon: <MovingIcon icon={RefreshIcon} size={18} trigger=".tile" />,
    body: "If the toolkit is busy or offline, the step waits and tries again. If it still fails you get an alert saying what went wrong.",
    video: "alerts",
    alt: "Screen recording: the toolkit is offline, the step waits and tries again twice, then the run fails, and the Inbox in the side menu says what went wrong. Sped up while it waits.",
  },
  {
    title: "On a schedule, in your time zone",
    icon: <MovingIcon icon={ClockIcon} size={18} trigger=".tile" />,
    body: "Run it every morning or every Friday at 9. The canvas shows what starts it and when it last ran.",
    video: "schedule",
    alt: "Screen recording: an automation's trigger is changed to a Schedule, every day at 09:00 America/Los_Angeles, and switched on.",
  },
];

/** The lead, read one platform at a time: each phrase takes that platform's colour, with its logo beside it. */
export const LEAD: LeadPhrase[] = [
  { platform: "tiktok", text: "Clipping apps run AI on every video" },
  { platform: "instagram", text: "and bill you for it," },
  { platform: "youtube", text: "and editing with an AI assistant spends tokens on every cut." },
  { platform: "facebook", text: "Most of that work is plain editing:" },
  { platform: "linkedin", text: "cut, resize, caption, join and level the audio." },
  { platform: "x", text: "Here it is set up once and runs the same way every time." },
];

export function Features() {
  return (
    <section className="features" id="features" aria-labelledby="features-title">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2 id="features-title">
            Ready-made automations. <span className="plat-ink">No AI on every video.</span>
          </h2>
          <PlatformLead phrases={LEAD} className="sec-lead" />
        </Reveal>
        <FeatureStory rows={ROWS} />
        <Reveal>
          <h3 className="tiles-title">And the parts you would otherwise do by hand</h3>
        </Reveal>
        <div className="tiles">
          {TILES.map((t, i) => (
            <Reveal key={t.title} delay={(i % 2) * 0.08}>
              <PhoneFold id={`tile-${t.video}`} title={t.title} icon={t.icon} level={4} defaultOpen={i === 0}>
                <SpotlightCard className="tile" theme="light" spotlightColor="rgba(91, 61, 245, 0.16)" style={TILE_SURFACE}>
                  <FeatureVideo name={t.video} label={t.alt} />
                  <div className="tile-text">
                    <div className="tile-head">
                      <span className="tile-icon" aria-hidden="true">
                        {t.icon}
                      </span>
                      <h4>{t.title}</h4>
                    </div>
                    <p>{t.body}</p>
                  </div>
                </SpotlightCard>
              </PhoneFold>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
