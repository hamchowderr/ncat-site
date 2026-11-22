import { siClaude, siCursor } from "simple-icons";
import { MovingIcon } from "@/components/MovingIcon";
import CameraIcon from "@/components/itshover/camera-icon";
import ClockIcon from "@/components/itshover/clock-icon";
import FileDescriptionIcon from "@/components/itshover/file-description-icon";
import LayersIcon from "@/components/itshover/layers-icon";
import Stack3Icon from "@/components/itshover/stack-3-icon";
import PaintIcon from "@/components/itshover/paint-icon";
import PlayerIcon from "@/components/itshover/player-icon";
import PlugConnectedIcon from "@/components/itshover/plug-connected-icon";
import RefreshIcon from "@/components/itshover/refresh-icon";
import UsersIcon from "@/components/itshover/users-icon";
import { FeatureVideo } from "@/components/FeatureVideo";
import { PhoneFold } from "@/components/PhoneFold";
import { Reveal } from "@/components/Reveal";
import SpotlightCard from "@/components/reactbits/SpotlightCard/SpotlightCard";
import { BrandIcon, FileLogo } from "@/components/brand/Logo";
import { ChatGptMark, DiscordMark, GoogleMeetMark, SlackMark, TeamsMark, TelegramMark, ZoomMark } from "@/components/brand/AppLogos";
import { AlsoScene, type AlsoSceneName } from "@/components/AlsoScenes";

const TILE_SURFACE = { "--spotlight-card-surface": "transparent", "--spotlight-card-border": "transparent", "--spotlight-card-shadow": "none" } as React.CSSProperties;

type Tile = { id: string; title: string; icon: React.ReactNode; body: string; video: string; alt: string; logos?: { name: string; mark: React.ReactNode }[] };

/** The parts you would otherwise do by hand, first, then everything around the clip. */
const HAND_TILES: Tile[] = [
  {
    id: "brand",
    title: "Your brand, set once",
    icon: <MovingIcon icon={PaintIcon} size={18} trigger=".tile" />,
    body: "Logo, colour, font and music are saved in settings and used by every step that needs them. No step ever asks again.",
    video: "brand",
    alt: "Screen recording: the logo, brand colour and theme music are saved in Settings, then the Add a logo step shows it is handled for you.",
  },
  {
    id: "files",
    title: "Organized in your own storage",
    icon: <MovingIcon icon={LayersIcon} size={18} trigger=".tile" />,
    body: "Every upload and every output is filed in your bucket, with its length, picture size and the run that made it.",
    video: "files",
    alt: "Screen recording: a new TikTok clips folder is made in the Files screen, a captioned clip is renamed and moved into it.",
  },
  {
    id: "alerts",
    title: "Retries, then an alert",
    icon: <MovingIcon icon={RefreshIcon} size={18} trigger=".tile" />,
    body: "If the toolkit is busy or offline, the step waits and tries again. If it still fails you get an alert saying what went wrong.",
    video: "alerts",
    alt: "Screen recording: the toolkit is offline, the step waits and tries again twice, then the run fails, and the Inbox in the side menu says what went wrong. Sped up while it waits.",
  },
  {
    id: "schedule",
    title: "On a schedule, in your time zone",
    icon: <MovingIcon icon={ClockIcon} size={18} trigger=".tile" />,
    body: "Run it every morning or every Friday at 9. The canvas shows what starts it and when it last ran.",
    video: "schedule",
    alt: "Screen recording: an automation's trigger is changed to a Schedule, every day at 09:00 America/Los_Angeles, and switched on.",
  },
];

const CLIP_TILES: Tile[] = [
  {
    id: "meetings",
    title: "Meeting recordings come in by themselves",
    icon: <MovingIcon icon={CameraIcon} size={18} trigger=".tile" />,
    body: "Connect Zoom, Google Meet or Microsoft Teams once. When a recorded meeting ends, its video lands in Uploads and starts whatever automation is set to run on an upload. An owner can connect a whole Zoom account, and past recordings can be brought in by hand.",
    video: "zoom",
    alt: "Screen recording: Zoom is connected in Settings, a past recording called Client Kickoff is brought in, and it appears in Uploads ready to clip.",
    logos: [
      { name: "Zoom", mark: <ZoomMark /> },
      { name: "Google Meet", mark: <GoogleMeetMark /> },
      { name: "Microsoft Teams", mark: <TeamsMark /> },
    ],
  },
  {
    id: "library",
    title: "Find any moment by what was said",
    icon: <MovingIcon icon={FileDescriptionIcon} size={18} trigger=".tile" />,
    body: "The library holds every upload and everything your automations made. Files are transcribed once on your own toolkit, so you can search the words, jump to the moment, and tag, star and sort what you keep.",
    video: "library",
    alt: "Screen recording: the Library is searched for the word history, the result opens the video at the moment it was said, then it gets five stars and two tags.",
  },
  {
    id: "calendar",
    title: "Plan what goes out on a calendar",
    icon: <MovingIcon icon={ClockIcon} size={18} trigger=".tile" />,
    body: "See what posts when, what is due and when your automations run, by month or week. Set repeating slots like Mondays at 10 on Instagram, queue posts into them and drag anything to another day.",
    video: "calendar",
    alt: "Screen recording: the content calendar, a repeating Monday slot for Instagram is added, posts are queued and dragged between days, and the week view opens.",
  },
  {
    id: "moments",
    title: "Best moments and chapters",
    icon: <MovingIcon icon={PlayerIcon} size={18} trigger=".tile" />,
    body: "One step writes chapters and show notes you can paste into a YouTube description. Another picks the strongest moments as clips, each starting and ending on whole words. Picking uses AI once per video; the cutting is plain editing.",
    video: "moments",
    alt: "Screen recording: an automation with Chapters and show notes and Best moments steps runs on an interview, then shows four chapters with notes and three vertical clips.",
  },
  {
    id: "follow",
    title: "Vertical clips that follow the speaker",
    icon: <MovingIcon icon={UsersIcon} size={18} trigger=".tile" />,
    body: "Turn a wide recording into a tall one that keeps whoever is talking in frame, moving gently when they move and switching when someone else speaks.",
    video: "follow",
    alt: "Screen recording: a Follow the speaker automation runs on a news conference recording and the finished vertical clip plays, keeping the astronaut who is talking in frame.",
  },
  {
    id: "steps",
    title: "Your own steps",
    icon: <MovingIcon icon={Stack3Icon} size={18} trigger=".tile" />,
    body: "When no ready-made step does what you need, describe it. The agent writes the step, tries it on one of your files, saves it for your team and adds it to an automation. From then on it runs on every video with no AI used.",
    video: "steps",
    alt: "Screen recording: someone asks the agent for a step that draws a progress bar along the bottom of a video. The agent writes it, tries it on Crew interview, saves it for the team, then adds it to the Clips from new recordings automation after Caption video.",
  },
  {
    id: "mcp",
    title: "Use it from the AI apps you already use",
    icon: <MovingIcon icon={PlugConnectedIcon} size={18} trigger=".tile" />,
    body: "The dashboard is an MCP server. Connect any MCP client to see your uploads and runs, build automations as drafts for you to publish, and start runs, signed in as you on the team you pick.",
    video: "mcp",
    alt: "Screen recording: the MCP settings page with the server address and the steps for Claude, ChatGPT, Cursor, Claude Code, n8n and other apps.",
    logos: [
      { name: "Claude", mark: <BrandIcon icon={siClaude} /> },
      { name: "ChatGPT", mark: <ChatGptMark /> },
      { name: "Cursor", mark: <BrandIcon icon={siCursor} /> },
      { name: "n8n", mark: <FileLogo name="n8n" size={22} /> },
    ],
  },
];

export const AROUND_TILES: Tile[] = [...HAND_TILES, ...CLIP_TILES];

/** Shipped features without their own recording here, said plainly. */
export const ALSO: { title: string; body: string; scene: AlsoSceneName; logos?: { name: string; mark: React.ReactNode }[] }[] = [
  {
    title: "The agent in your team chat",
    scene: "chat",
    body: "Tag it in Slack, Discord, Microsoft Teams or Telegram and it answers there. Reviews, client notes and mentions post to your Slack, Discord, Teams or Telegram channel, with Approve and Send back on each alert and replies brought back, and you can talk to it in voice notes.",
    logos: [
      { name: "Slack", mark: <SlackMark /> },
      { name: "Discord", mark: <DiscordMark /> },
      { name: "Microsoft Teams", mark: <TeamsMark /> },
      { name: "Telegram", mark: <TelegramMark /> },
    ],
  },
  { title: "Clients and a client portal", scene: "clients", body: "Group work by client, track each project's deliverables, and give clients one link to review and approve their own." },
  { title: "Big files and versions", scene: "files", body: "Upload files over 5 GB in parts, and compare two versions of a review clip side by side." },
  { title: "Guided tours", scene: "tours", body: "New teammates get a short tour of each page the first time they open it." },
];

export function AroundTheClip() {
  return (
    <section className="around" id="around" aria-labelledby="around-title">
      <div className="wrap">
        <Reveal className="sec-head">
          <h2 id="around-title">Everything around the clip, too</h2>
          <p className="sec-lead">
            The parts you would otherwise do by hand are done for you. Recordings arrive on their own, get filed and searchable, and go out on a plan.
          </p>
        </Reveal>
        {/* the list fades in as one, so no row waits invisible inside the panel while you scroll */}
        <Reveal className="tiles">
          {AROUND_TILES.map((t, i) => (
            <div key={t.id}>
              <PhoneFold id={`tile-${t.id}`} title={t.title} icon={t.icon} level={3} defaultOpen={i === 0}>
                <SpotlightCard className="tile" theme="light" spotlightColor="rgba(91, 61, 245, 0.16)" style={TILE_SURFACE}>
                  <FeatureVideo name={t.video} label={t.alt} />
                  <div className="tile-text">
                    <div className="tile-head">
                      <span className="tile-icon" aria-hidden="true">
                        {t.icon}
                      </span>
                      <h3>{t.title}</h3>
                    </div>
                    <p>{t.body}</p>
                    {t.logos && (
                      <ul className="logo-chips" aria-label={`${t.title}: apps`}>
                        {t.logos.map((l) => (
                          <li key={l.name}>
                            {l.mark} {l.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </SpotlightCard>
              </PhoneFold>
            </div>
          ))}
        </Reveal>
        <Reveal>
          <h3 className="tiles-title">Also in the dashboard</h3>
        </Reveal>
        <ul className="also" aria-label="Also in the dashboard">
          {ALSO.map((a, i) => (
            <li key={a.title} className={`also-card also-${a.scene}`}>
              <Reveal className="also-in" delay={(i % 3) * 0.06}>
              <AlsoScene name={a.scene} />
              <div className="also-text">
                <h4>
                  {a.logos && (
                    <span className="also-logos" aria-hidden="true">
                      {a.logos.map((l) => (
                        <span key={l.name}>{l.mark}</span>
                      ))}
                    </span>
                  )}
                  {a.title}
                </h4>
                <p>{a.body}</p>
              </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
