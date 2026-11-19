import { advance, type Demo, type DemoView, MAX_BYTES, MAX_SECONDS, newDemo, recordResult, startRun, viewOf } from "./run";
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
  }
  return (await deps.store.load(id))?.demo ?? null;
}

/** The upload is in: hand it to the toolkit. */
export async function startDemo(id: string, key: unknown, deps: DemoDeps): Promise<{ ok: true; view: DemoView } | Fail> {
  if (!keyMatches(id, key, deps.secret)) return no(404, "That run is not here.");
  if (!deps.toolkit) return no(503, "Real runs aren’t switched on yet.");
  const toolkit = deps.toolkit;
  const demo = await settle(
    id,
    async (d) => {
      if (d.stage !== "upload") return null;
      const path = sourcePath(id, d.fileName);
      if (!(await deps.store.exists(path))) return null;
      const now = deps.now();
      return advance(startRun(d, path, await deps.store.readLink(path, now), now), toolkit, hookUrl(deps, id), now);
    },
    deps,
  );
  if (!demo) return no(404, "That run is not here.");
  if (demo.stage === "upload") return no(409, "The video hasn’t finished uploading.");
  return { ok: true, view: viewOf(demo) };
}

/** Moves the run on and says where it is. Emails the visitor once it is done. */
export async function demoStatus(id: string, key: unknown, deps: DemoDeps): Promise<{ ok: true; view: DemoView } | Fail> {
  if (!keyMatches(id, key, deps.secret)) return no(404, "That run is not here.");
  const toolkit = deps.toolkit;
  const demo = await settle(id, async (d) => (d.stage === "running" && toolkit ? advance(d, toolkit, hookUrl(deps, id), deps.now()) : null), deps);
  if (!demo) return no(404, "That run is not here.");
  await emailWhenDone(demo, deps);
  return { ok: true, view: viewOf(demo) };
}

/** A result the toolkit posted back. */
export async function demoHook(id: string, key: unknown, jobId: string, envelope: unknown, deps: DemoDeps): Promise<boolean> {
  if (!keyMatches(id, key, deps.secret)) return false;
  const toolkit = deps.toolkit;
  const demo = await settle(
    id,
    async (d) => {
      if (d.stage !== "running" || !recordResult(d, jobId, readEnvelope(envelope), deps.now())) return null;
      return toolkit ? advance(d, toolkit, hookUrl(deps, id), deps.now()) : d;
    },
    deps,
  );
  if (demo) await emailWhenDone(demo, deps);
  return !!demo;
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
