/**
 * The early-access intake: the questions, their allowed answers, validation, and the
 * email Chowderr receives. Shared by the form, the API route and the tests, so the
 * three can never disagree about what a valid sign-up is.
 */

type Option = { value: string; label: string };
const opts = <T extends readonly Option[]>(o: T) => o;

export const ROLES = opts([
  { value: "creator", label: "Creator" },
  { value: "agency", label: "Editing agency" },
  { value: "podcast", label: "Podcast team" },
  { value: "media-team", label: "In-house media team" },
  { value: "educator", label: "Educator or course creator" },
  { value: "music", label: "Musician or music video team" },
  { value: "other", label: "Something else" },
] as const);

export const TEAM_SIZES = opts([
  { value: "solo", label: "Just me" },
  { value: "2-5", label: "2 to 5" },
  { value: "6-20", label: "6 to 20" },
  { value: "21+", label: "More than 20" },
] as const);

export const CONTENT = opts([
  { value: "podcasts", label: "Podcasts" },
  { value: "long-video", label: "Long-form video" },
  { value: "streams", label: "Livestreams" },
  { value: "short-video", label: "Short-form video" },
  { value: "courses", label: "Lectures and courses" },
  { value: "interviews", label: "Interviews and talks" },
  { value: "music", label: "Music and music videos" },
  { value: "client-work", label: "Client edits" },
] as const);

export const PLATFORMS = opts([
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "twitch", label: "Twitch" },
  { value: "podcast-apps", label: "Spotify and Apple Podcasts" },
] as const);

export const VOLUMES = opts([
  { value: "lt1", label: "Under 1 hour" },
  { value: "1-5", label: "1 to 5 hours" },
  { value: "5-20", label: "5 to 20 hours" },
  { value: "20+", label: "More than 20 hours" },
] as const);

export const HOSTING = opts([
  { value: "server", label: "A rented server" },
  { value: "machine", label: "My own always-on machine, like a Mac Mini" },
  { value: "hosted", label: "I'd rather you host it" },
  { value: "unsure", label: "Not sure yet" },
] as const);

export const TOOLKIT = opts([
  { value: "running", label: "Yes, I already run it" },
  { value: "tried", label: "I've tried it" },
  { value: "new", label: "No, new to me" },
] as const);

export const EDITORS = opts([
  { value: "premiere", label: "Premiere Pro" },
  { value: "resolve", label: "DaVinci Resolve" },
  { value: "final-cut", label: "Final Cut Pro" },
  { value: "capcut", label: "CapCut" },
  { value: "descript", label: "Descript" },
  { value: "editor", label: "A human editor" },
  { value: "none", label: "None, I want it finished automatically" },
] as const);

export const JOBS = opts([
  { value: "captions", label: "Captions burned in" },
  { value: "silences", label: "Cut out silences" },
  { value: "vertical", label: "Vertical clips from long videos" },
  { value: "transcripts", label: "Transcripts and show notes" },
  { value: "resize", label: "Every shape (9:16, 1:1, 16:9)" },
  { value: "audio", label: "Clean up and level the audio" },
  { value: "mp3", label: "MP3 and audio versions" },
  { value: "organize", label: "File and organize recordings" },
  { value: "handoff", label: "Hand clips to my editor or editing app" },
  { value: "join", label: "Add intros, outros and music" },
] as const);

export const SOURCES = opts([
  { value: "creators-summit", label: "Claude Code Creators Summit" },
  { value: "tech-week", label: "a16z Tech Week Los Angeles" },
  { value: "kinn", label: "The KINN" },
  { value: "social", label: "Social media" },
  { value: "friend", label: "A friend or colleague" },
  { value: "other", label: "Somewhere else" },
] as const);

export type EarlyAccessInput = {
  name: string;
  email: string;
  link: string;
  role: string;
  teamSize: string;
  content: string[];
  platforms: string[];
  volume: string;
  hosting: string;
  toolkit: string;
  editors: string[];
  jobs: string[];
  details: string;
  source: string;
  /** What they tried in the demo first ("a 35 s video, cut into 5 clips"). They go to the front of the list. */
  tried?: string;
  /** The unticked box on the last step: they want Takewon news by email (confirmed by email first). */
  newsletter?: boolean;
  /** Hidden field. People leave it empty; bots fill it in. */
  website?: string;
};

/** The exact words beside the newsletter box. They are kept with the consent record in the app. */
export const NEWSLETTER_WORDING =
  "Send me Takewon news now and then. I’ll confirm by email first, and can stop any time.";

export type Field = keyof EarlyAccessInput;
export type Errors = Partial<Record<Field, string>>;
export type Checked = { ok: true; value: EarlyAccessInput } | { ok: false; errors: Errors };

const EMAIL = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

/** Which fields each step of the form asks, in order. The form validates one step at a time. */
export const STEPS: { title: string; fields: Field[] }[] = [
  { title: "About you", fields: ["name", "email", "role", "teamSize", "link"] },
  { title: "Your content", fields: ["content", "platforms", "volume"] },
  { title: "Your setup", fields: ["hosting", "toolkit", "editors"] },
  { title: "What to automate", fields: ["jobs", "details", "source"] },
];

const REQUIRED_MESSAGES: Partial<Record<Field, string>> = {
  name: "Add your name.",
  email: "Add an email address I can reply to.",
  role: "Pick what describes you best.",
  teamSize: "Pick your team size.",
  content: "Pick at least one kind of content.",
  volume: "Pick roughly how much you record.",
  hosting: "Pick where it would run, or “Not sure yet”.",
  jobs: "Pick at least one job, or describe it below.",
};

export function checkEarlyAccess(raw: unknown, only?: Field[]): Checked {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (k: string, max: number) => (typeof r[k] === "string" ? (r[k] as string).trim().slice(0, max) : "");
  const one = (k: string, o: readonly Option[]) => { const v = str(k, 40); return o.some((x) => x.value === v) ? v : ""; };
  const many = (k: string, o: readonly Option[]) => {
    const v = r[k];
    const list = Array.isArray(v) ? v : typeof v === "string" && v ? [v] : [];
    return [...new Set(list.filter((x): x is string => typeof x === "string" && o.some((y) => y.value === x)))];
  };
  const value: EarlyAccessInput = {
    name: str("name", 120),
    email: str("email", 200),
    link: str("link", 300),
    role: one("role", ROLES),
    teamSize: one("teamSize", TEAM_SIZES),
    content: many("content", CONTENT),
    platforms: many("platforms", PLATFORMS),
    volume: one("volume", VOLUMES),
    hosting: one("hosting", HOSTING),
    toolkit: one("toolkit", TOOLKIT),
    editors: many("editors", EDITORS),
    jobs: many("jobs", JOBS),
    details: str("details", 2000),
    source: one("source", SOURCES),
    website: str("website", 200),
    ...(str("tried", 200) ? { tried: str("tried", 200) } : {}),
    ...(r.newsletter === true ? { newsletter: true } : {}),
  };
  const errors: Errors = {};
  const want = (f: Field) => !only || only.includes(f);
  for (const [f, msg] of Object.entries(REQUIRED_MESSAGES) as [Field, string][]) {
    if (!want(f)) continue;
    const v = value[f];
    if (f === "jobs") { if (!value.jobs.length && !value.details) errors.jobs = msg; continue; }
    if (Array.isArray(v) ? !v.length : !v) errors[f] = msg;
  }
  if (want("email") && value.email && !EMAIL.test(value.email)) errors.email = "That email address doesn’t look right.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

const label = (o: readonly Option[], v: string) => o.find((x) => x.value === v)?.label ?? "";
const labels = (o: readonly Option[], vs: string[]) => vs.map((v) => label(o, v)).join(", ");
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** The email Chowderr gets: tagged subject for sorting, then every answer grouped by step. */
export function earlyAccessEmail(v: EarlyAccessInput) {
  const sections: [string, [string, string][]][] = [
    ["About them", [["Name", v.name], ["Email", v.email], ["Who", label(ROLES, v.role)], ["Team size", label(TEAM_SIZES, v.teamSize)], ["Link", v.link]]],
    ["Their content", [["Makes", labels(CONTENT, v.content)], ["Posts to", labels(PLATFORMS, v.platforms)], ["Records per week", label(VOLUMES, v.volume)]]],
    ["Their setup", [["Would run it on", label(HOSTING, v.hosting)], ["NCA Toolkit", label(TOOLKIT, v.toolkit)], ["Finishes in", labels(EDITORS, v.editors)]]],
    ["What to automate", [["Jobs", labels(JOBS, v.jobs)], ["In their words", v.details], ["Heard about it from", label(SOURCES, v.source)], ["Product news", v.newsletter ? "Ticked the box (confirms by email)" : "No"]]],
    ...(v.tried ? ([["Tried the demo first", [["On", v.tried]]]] as [string, [string, string][]][]) : []),
  ];
  const tags = [v.tried ? "Tried the demo" : "", label(ROLES, v.role), label(TEAM_SIZES, v.teamSize), label(HOSTING, v.hosting)].filter(Boolean);
  const text = sections
    .map(([h, rows]) => [h.toUpperCase(), ...rows.filter(([, x]) => x).map(([k, x]) => `${k}: ${x}`)].join("\n"))
    .join("\n\n");
  const html = sections
    .map(([h, rows]) => `<h3 style="margin:18px 0 6px">${esc(h)}</h3><table cellpadding="4">${rows.filter(([, x]) => x).map(([k, x]) => `<tr><td style="color:#666;vertical-align:top">${esc(k)}</td><td>${esc(x)}</td></tr>`).join("")}</table>`)
    .join("");
  return { subject: `[${tags.join(" · ")}] Takewon beta sign-up: ${v.name}`, text, html, tags };
}
