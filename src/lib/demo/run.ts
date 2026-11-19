import { collectUrls, DEMO_CAPTION_LOOK, durationOf, parseSilences, planClips, sizeOf, verticalClipRequest } from "./clips";
import type { Toolkit } from "./toolkit";
import { formatBytes, formatDuration } from "@/lib/tryIt";

/**
 * One visitor's video going through the real toolkit: read it, cut it at the pauses into
 * vertical clips, caption each clip. The run is moved on whenever someone looks at it (the
 * page asks every few seconds) or the toolkit posts a result back, so nothing has to run
 * in the background.
 */

/** The longest video the demo takes. */
export const MAX_SECONDS = 10 * 60;
/** The biggest file the demo takes. */
export const MAX_BYTES = 1024 * 1024 * 1024;
/** Clips are made for the shortest common limit, a minute. */
export const CLIP_SECONDS = 60;
/** The demo makes at most this many clips, to keep each run small. */
export const MAX_CLIPS = 3;
/** Ask the toolkit about a job no more often than this. */
const ASK_EVERY_MS = 4_000;
/** A job the toolkit has no record of this long after it was sent is lost. */
const LOST_AFTER_MS = 5 * 60_000;
/** A job that never comes back gives up after this. */
const GIVE_UP_MS = 30 * 60_000;
/** A job the toolkit keeps saying it is too busy to take gives up after this. */
const BUSY_GIVE_UP_MS = 10 * 60_000;

export type Job = {
  id: string;
  endpoint: string;
  body: Record<string, unknown>;
  state: "pending" | "running" | "done" | "failed";
  toolkitJobId?: string | null;
  sentAt?: number;
  askedAt?: number;
  /** When the toolkit first said it was too busy to take this job. */
  busySince?: number;
  result?: unknown;
  error?: string;
};

export type Demo = {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  email: string;
  fileName: string;
  size: number;
  stage: "upload" | "running" | "done" | "failed";
  /** Where the upload lives in the site's private Blob store. */
  source?: string;
  facts?: { duration: number; width?: number; height?: number };
  /** How many clips the whole video would make; the demo makes the first few. */
  plannedClips?: number;
  probe: Job[];
  cuts: Job[];
  captions: Job[];
  clips: { url: string; captioned: boolean }[];
  error?: string;
  emailed?: boolean;
};

export function newDemo(id: string, who: { name: string; email: string }, file: { name: string; size: number }, now: number): Demo {
  return { id, createdAt: now, updatedAt: now, ...who, fileName: file.name, size: file.size, stage: "upload", probe: [], cuts: [], captions: [], clips: [] };
}

const job = (id: string, endpoint: string, body: Record<string, unknown>): Job => ({ id, endpoint, body, state: "pending" });

/** The upload is in: ask the toolkit how long the video is and where the pauses are. */
export function startRun(demo: Demo, source: string, sourceUrl: string, now: number): Demo {
  return {
    ...demo,
    stage: "running",
    source,
    updatedAt: now,
    probe: [
      job(`${demo.id}-meta`, "/v1/media/metadata", { media_url: sourceUrl }),
      job(`${demo.id}-pauses`, "/v1/media/silence", { media_url: sourceUrl, duration: 0.4, noise: "-30dB" }),
    ],
  };
}

const settled = (jobs: Job[]) => jobs.length > 0 && jobs.every((j) => j.state === "done" || j.state === "failed");
const fail = (demo: Demo, error: string): Demo => ({ ...demo, stage: "failed", error });

/** Records a result the toolkit posted back. Answers false when the job is not this run's. */
export function recordResult(demo: Demo, jobId: string, outcome: { ok: boolean; result?: unknown; error?: string }, now: number): boolean {
  for (const list of [demo.probe, demo.cuts, demo.captions]) {
    const found = list.find((j) => j.id === jobId);
    if (!found) continue;
    if (found.state === "done" || found.state === "failed") return true;
    Object.assign(found, outcome.ok ? { state: "done", result: outcome.result } : { state: "failed", error: outcome.error });
    demo.updatedAt = now;
    return true;
  }
  return false;
}

/** Moves the run on as far as it can go right now. */
export async function advance(demo: Demo, toolkit: Toolkit, hookUrl: string, now: number): Promise<Demo> {
  if (demo.stage !== "running") return demo;
  const d: Demo = structuredClone(demo);
  const all = () => [...d.probe, ...d.cuts, ...d.captions];

  // Find out about jobs that are out with the toolkit.
  for (const j of all()) {
    if (j.state !== "running") continue;
    if (j.toolkitJobId && now - (j.askedAt ?? j.sentAt ?? 0) >= ASK_EVERY_MS) {
      j.askedAt = now;
      const answer = await toolkit.status(j.toolkitJobId).catch(() => ({ state: "working" as const }));
      if (answer.state === "finished") recordResult(d, j.id, answer, now);
      else if (answer.state === "unknown" && now - (j.sentAt ?? now) > LOST_AFTER_MS) {
        recordResult(d, j.id, { ok: false, error: "The toolkit lost this job, most likely because it restarted." }, now);
      }
    }
    if (j.state === "running" && now - (j.sentAt ?? now) > GIVE_UP_MS) {
      recordResult(d, j.id, { ok: false, error: "The toolkit took too long." }, now);
    }
  }

  // A step the toolkit answers at once can let the run move on again, so go round a few times.
  for (let round = 0; round < 4; round++) {
    const before = JSON.stringify(all().map((j) => j.state));
    const moved = nextStage(d);
    if (moved) return { ...moved, updatedAt: now };
    for (const j of all()) {
      if (j.state !== "pending") continue;
      const sent = await toolkit.send(j.endpoint, j.body, `${hookUrl}&job=${encodeURIComponent(j.id)}`, j.id).catch(() => ({ kind: "busy" as const }));
      if (sent.kind === "busy") {
        j.busySince ??= now;
        if (now - j.busySince > BUSY_GIVE_UP_MS) Object.assign(j, { state: "failed", error: "The toolkit was too busy to take this video." });
        continue;
      }
      if (sent.kind === "refused") Object.assign(j, { state: "failed", error: sent.error });
      else if (sent.kind === "answered") Object.assign(j, sent.ok ? { state: "done", result: sent.result } : { state: "failed", error: sent.error });
      else Object.assign(j, { state: "running", toolkitJobId: sent.toolkitJobId, sentAt: now });
    }
    if (JSON.stringify(all().map((j) => j.state)) === before) break;
  }
  return { ...d, updatedAt: now };
}

/** Adds the next stage's jobs once a stage is finished. Returns the run when it has ended. */
function nextStage(d: Demo): Demo | null {
  if (settled(d.probe) && d.cuts.length === 0) {
    const [meta, pauses] = d.probe;
    const duration = meta.state === "done" ? durationOf(meta.result) : null;
    if (duration === null) return fail(d, "The toolkit couldn’t read that video. Try another file, such as an MP4 or MOV.");
    if (duration > MAX_SECONDS + 1) return fail(d, `That video is ${formatDuration(duration)} long. The demo takes videos up to 10 minutes.`);
    d.facts = { duration, ...(sizeOf(meta.result) ?? {}) };
    // Without the pauses the video is still cut, just evenly.
    const plan = planClips(duration, pauses.state === "done" ? parseSilences(pauses.result) : [], CLIP_SECONDS);
    d.plannedClips = plan.length;
    const sourceUrl = String(meta.body.media_url);
    d.cuts = plan.slice(0, MAX_CLIPS).map((clip, i) => job(`${d.id}-cut-${i + 1}`, "/v1/ffmpeg/compose", verticalClipRequest(sourceUrl, clip)));
  }
  if (settled(d.cuts) && d.captions.length === 0) {
    const made = d.cuts.filter((j) => j.state === "done" && collectUrls(j.result)[0]);
    if (made.length === 0) return fail(d, d.cuts.find((j) => j.error)?.error ?? "The toolkit couldn’t cut the clips.");
    d.captions = made.map((j, i) =>
      job(`${d.id}-captions-${i + 1}`, "/v1/video/caption", { video_url: collectUrls(j.result)[0], settings: DEMO_CAPTION_LOOK }),
    );
  }
  if (settled(d.captions)) {
    d.clips = d.captions.map((c) => {
      const captioned = c.state === "done" ? collectUrls(c.result)[0] : undefined;
      return captioned ? { url: captioned, captioned: true } : { url: String(c.body.video_url), captioned: false };
    });
    return { ...d, stage: "done" };
  }
  return null;
}

export type StepView = { label: string; state: "wait" | "doing" | "done" | "failed"; detail?: string };
export type DemoView = { stage: Demo["stage"]; steps: StepView[]; clips: Demo["clips"]; error?: string; partial?: string };

const stateOf = (jobs: Job[]): StepView["state"] =>
  jobs.length === 0 ? "wait" : jobs.every((j) => j.state === "failed") ? "failed" : jobs.every((j) => j.state === "done" || j.state === "failed") ? "done" : "doing";

/** What the visitor sees: each real step with what the toolkit reported. */
export function viewOf(d: Demo): DemoView {
  const uploaded: StepView = {
    label: "Uploaded",
    state: d.stage === "upload" ? "doing" : "done",
    detail: `${d.fileName}, ${formatBytes(d.size)}`,
  };
  const meta = d.probe[0];
  const read: StepView = {
    label: "Read by the toolkit",
    state: !meta ? "wait" : meta.state === "done" && d.facts ? "done" : meta.state === "failed" ? "failed" : d.stage === "failed" && !d.cuts.length ? "failed" : "doing",
    detail: d.facts ? `${formatDuration(d.facts.duration)} long${d.facts.width ? `, ${d.facts.width} × ${d.facts.height}` : ""}` : undefined,
  };
  const n = d.cuts.length;
  const cut: StepView = {
    label: "Cut at the pauses, made vertical",
    state: stateOf(d.cuts),
    detail: n
      ? (d.plannedClips ?? n) > n
        ? `The first ${n} of ${d.plannedClips} clips, up to a minute each. On the dashboard every clip is made.`
        : `${n} ${n === 1 ? "clip" : "clips"}, up to a minute each, 1080 × 1920.`
      : undefined,
  };
  const captioned: StepView = { label: "Captioned", state: stateOf(d.captions), detail: d.captions.length ? "Every word transcribed and burned in." : undefined };
  const ready: StepView = { label: "Ready to download", state: d.stage === "done" ? "done" : "wait" };
  const missed = d.stage === "done" ? d.clips.filter((c) => !c.captioned).length : 0;
  return {
    stage: d.stage,
    steps: [uploaded, read, cut, captioned, ready],
    clips: d.stage === "done" ? d.clips : [],
    ...(d.error ? { error: d.error } : {}),
    ...(missed ? { partial: `${missed === d.clips.length ? "The captions" : `Captions on ${missed} ${missed === 1 ? "clip" : "clips"}`} didn’t finish, so ${missed === 1 ? "that clip is" : "those clips are"} shown without them.` } : {}),
  };
}
