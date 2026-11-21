import { type Demo, type DemoView, type Job, look, MAX_BYTES, MAX_SECONDS, newDemo, recordResult, send, sent, startRun, viewOf } from "./run";
import { type DemoStore, keyFor, keyMatches, sourcePath } from "./store";
import { readEnvelope, type Toolkit } from "./toolkit";

/** Everything a demo route needs, passed in so tests can stand in for each. */
export type DemoDeps = {
  store: DemoStore;
  /** Null while the site has no toolkit to run on. */
  toolkit: Toolkit | null;
  secret: string;
  /** The site's own address, for the link in the email and the toolkit's post-backs. */
  siteUrl: string;
  now: () => number;
  /** Emails the visitor the link to their clips. */
  sendReady: (demo: Demo, link: string) => Promise<boolean>;
  dailyLimit: number;
};

type Fail = { ok: false; status: number; error: string };
const no = (status: number, error: string): Fail => ({ ok: false, status, error });

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function resultsLink(deps: Pick<DemoDeps, "siteUrl" | "secret">, id: string) {
  return `${deps.siteUrl}/clips/${id}?k=${keyFor(id, deps.secret)}`;
}

function hookUrl(deps: DemoDeps, id: string) {
  return `${deps.siteUrl}/api/demo/hook?id=${id}&k=${keyFor(id, deps.secret)}`;
}

/** After sign-up: book a run for this email and file, before anything is uploaded. */
export async function createDemo(input: unknown, deps: DemoDeps): Promise<{ ok: true; id: string; key: string; path: string } | Fail> {
  if (!deps.toolkit) return no(503, "Real runs aren’t switched on yet. You’re still on the list.");
  const i = (input ?? {}) as Record<string, unknown>;
  const name = typeof i.name === "string" ? i.name.trim().slice(0, 120) : "";
  const email = typeof i.email === "string" ? i.email.trim().slice(0, 200) : "";
  const fileName = typeof i.fileName === "string" ? i.fileName.trim().slice(0, 200) : "";
  const size = Number(i.size), seconds = Number(i.seconds);
  if (!EMAIL.test(email) || !fileName) return no(422, "That did not come through. Try again.");
  if (!(size > 0) || size > MAX_BYTES) return no(422, "The demo takes files up to 1 GB.");
  if (Number.isFinite(seconds) && seconds > MAX_SECONDS + 1) return no(422, "The demo takes videos up to 10 minutes.");
  if (!(await deps.store.countToday(deps.dailyLimit, new Date(deps.now())))) {
    return no(429, "Today’s demo runs are all used. You’re still on the list, and I’ll be in touch.");
  }
  const id = crypto.randomUUID().replace(/-/g, "");
  if (!(await deps.store.claimEmail(email, id))) return no(409, "That email has already had its free run. You’re on the list.");
  const demo = newDemo(id, { name, email }, { name: fileName, size }, deps.now());
  if (!(await deps.store.save(demo, null))) return no(500, "That did not come through. Try again.");
  return { ok: true, id, key: keyFor(id, deps.secret), path: sourcePath(id, fileName) };
}

/** Whether this browser may upload to `pathname`: its own run, still waiting for the video. */
export async function mayUpload(pathname: string, payload: unknown, deps: DemoDeps): Promise<Demo | null> {
  const p = (payload ?? {}) as { id?: unknown; key?: unknown };
  const id = typeof p.id === "string" ? p.id : "";
  if (!keyMatches(id, p.key, deps.secret)) return null;
  const found = await deps.store.load(id);
  if (!found || found.demo.stage !== "upload" || pathname !== sourcePath(id, found.demo.fileName)) return null;
  return found.demo;
}

/** Saves a changed run; when someone else got there first, the run is read again. */
async function settle(id: string, change: (demo: Demo) => Promise<Demo | null>, deps: DemoDeps): Promise<Demo | null> {
  for (let tries = 0; tries < 3; tries++) {
    const found = await deps.store.load(id);
    if (!found) return null;
    const next = await change(found.demo);
    if (!next) return found.demo;
    if (await deps.store.save(next, found.version)) return next;
    console.warn(`demo ${id}: save refused for version ${found.version} (try ${tries + 1})`);
  }
  return (await deps.store.load(id))?.demo ?? null;
}

/**
 * Changes the run (`change` answers null to leave it), then looks at it and moves it on. Jobs
 * are claimed in a saved run before they are sent, and only the look whose claims were saved
 * sends them, so a job can't go to the toolkit twice however many people look at once.
 */
async function moveOn(id: string, deps: DemoDeps, change: (demo: Demo) => Promise<Demo | null>): Promise<Demo | null> {
  const toolkit = deps.toolkit;
  const now = deps.now();
  let claimed: Job[] = [];
  const demo = await settle(
    id,
    async (d) => {
      claimed = [];
      const changed = await change(d);
      const base = changed ?? d;
      if (!toolkit || base.stage !== "running") return changed;
      const looked = await look(base, toolkit, now);
      claimed = looked.claimed;
      return looked.demo;
    },
    deps,
  );
  if (!demo || !toolkit) return demo;
  // Only claims that made it into the saved run are ours to send.
  const mine = claimed.filter((c) => [...demo.probe, ...demo.cuts, ...demo.captions].some((j) => j.id === c.id && j.state === "sending" && j.claimedAt === c.claimedAt));
  if (mine.length === 0) return demo;
  const outcomes = await send(mine, toolkit, hookUrl(deps, id));
  return (await settle(id, async (d) => (sent(d, outcomes, deps.now()) ? d : null), deps)) ?? demo;
}

/** The upload is in: hand it to the toolkit. */
export async function startDemo(id: string, key: unknown, deps: DemoDeps): Promise<{ ok: true; view: DemoView } | Fail> {
  if (!keyMatches(id, key, deps.secret)) return no(404, "That run is not here.");
  if (!deps.toolkit) return no(503, "Real runs aren’t switched on yet.");
  const demo = await moveOn(id, deps, async (d) => {
    if (d.stage !== "upload") return null;
    const path = sourcePath(id, d.fileName);
    if (!(await deps.store.exists(path))) return null;
    const now = deps.now();
    return startRun(d, path, await deps.store.readLink(path, now), now);
  });
  if (!demo) return no(404, "That run is not here.");
  if (demo.stage === "upload") return no(409, "The video hasn’t finished uploading.");
  return { ok: true, view: viewOf(demo) };
}

/** Moves the run on and says where it is. Emails the visitor once it is done. */
export async function demoStatus(id: string, key: unknown, deps: DemoDeps): Promise<{ ok: true; view: DemoView } | Fail> {
  if (!keyMatches(id, key, deps.secret)) return no(404, "That run is not here.");
  const demo = await moveOn(id, deps, async () => null);
  if (!demo) return no(404, "That run is not here.");
  await emailWhenDone(demo, deps);
  return { ok: true, view: viewOf(demo) };
}

/** A result the toolkit posted back. */
export async function demoHook(id: string, key: unknown, jobId: string, envelope: unknown, deps: DemoDeps): Promise<boolean> {
  if (!keyMatches(id, key, deps.secret)) return false;
  let known = false;
  const demo = await moveOn(id, deps, async (d) => {
    known = d.stage === "running" && recordResult(d, jobId, readEnvelope(envelope), deps.now());
    return known ? d : null;
  });
  if (demo && known) await emailWhenDone(demo, deps);
  return !!demo && known;
}

async function emailWhenDone(demo: Demo, deps: DemoDeps) {
  if (demo.stage !== "done" || demo.emailed) return;
  // Marked first, so two people looking at once never send it twice.
  let mine = false;
  const marked = await settle(
    demo.id,
    async (d) => {
      mine = !d.emailed;
      return d.emailed ? null : { ...d, emailed: true };
    },
    deps,
  );
  if (marked && mine) await deps.sendReady(marked, resultsLink(deps, demo.id));
}
