import { MovingIcon } from "@/components/MovingIcon";
import CheckedIcon from "@/components/itshover/checked-icon";
import LayoutDashboardIcon from "@/components/itshover/layout-dashboard-icon";
import SendIcon from "@/components/itshover/send-icon";
import UploadIcon from "@/components/itshover/upload-icon";
import { FeatureStory, type StoryRow } from "@/components/FeatureStory";
import { Reveal } from "@/components/Reveal";
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
    alt: "Screen recording: Space interviews.mp4 is uploaded, the Clips for social run starts by itself, cuts 3 clips, captions them and pauses for approval. Sped up while it works.",
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

/** The lead: why most of the work needs no AI once it is set up. */
export const LEAD_TEXT =
  "Clipping apps run AI on every video and bill you for it, and editing with an AI assistant spends tokens on every cut. Most of that work is plain editing: cut, resize, caption, join and level the audio. Here it is set up once and runs the same way every time.";

export function Features() {
  return (
    <section className="features" id="features" aria-labelledby="features-title">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2 id="features-title">
            Ready-made automations. <span className="accent-ink">No AI on every video.</span>
          </h2>
          <p className="sec-lead">{LEAD_TEXT}</p>
        </Reveal>
        <FeatureStory rows={ROWS} />
      </div>
    </section>
  );
}
