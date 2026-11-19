import { describe, expect, it, vi } from "vitest";
import { planClips, verticalClipRequest } from "./clips";
import { advance, type Demo, MAX_CLIPS, newDemo, startRun, viewOf } from "./run";
import { createDemo, type DemoDeps, demoHook, demoStatus, mayUpload, resultsLink, startDemo } from "./service";
import { keyFor, memoryStore } from "./store";
import { httpToolkit, type JobState, type Toolkit } from "./toolkit";

/** A toolkit that queues everything and finishes jobs when the test says so. */
function fakeToolkit() {
  const sent: { endpoint: string; body: Record<string, unknown>; webhookUrl: string; id: string }[] = [];
  const results = new Map<string, JobState>();
  const toolkit: Toolkit = {
    async send(endpoint, body, webhookUrl, id) {
      sent.push({ endpoint, body, webhookUrl, id });
      return { kind: "queued", toolkitJobId: `tk-${id}` };
    },
    async status(toolkitJobId) {
      return results.get(toolkitJobId.replace(/^tk-/, "")) ?? { state: "working" };
    },
  };
  const finish = (id: string, result: unknown) => results.set(id, { state: "finished", ok: true, result });
  const fail = (id: string, error: string) => results.set(id, { state: "finished", ok: false, error });
  return { toolkit, sent, finish, fail };
}

const SECRET = "test-secret";

function setUp() {
  const store = memoryStore();
  const tk = fakeToolkit();
  let now = 1_000_000;
  const sendReady = vi.fn(async (_demo: Demo, _link: string) => true); // eslint-disable-line @typescript-eslint/no-unused-vars
  const deps: DemoDeps = { store, toolkit: tk.toolkit, secret: SECRET, siteUrl: "https://site.example", now: () => now, sendReady, dailyLimit: 3 };
  const later = (ms: number) => (now += ms);
  return { store, tk, deps, sendReady, later };
}

const who = { name: "Ava Reyes", email: "ava@studio.co" };
const file = { fileName: "podcast.mp4", size: 40_000_000, seconds: 150 };

async function booked(s: ReturnType<typeof setUp>) {
  const made = await createDemo({ ...who, ...file }, s.deps);
  if (!made.ok) throw new Error(made.error);
  s.store.files.set(made.path, s.deps.now());
  return made;
}

describe("cutting like the dashboard does", () => {
  it("cuts at the pause nearest each even split, never over a minute", () => {
    const plan = planClips(150, [{ start: 49, end: 50 }, { start: 101, end: 102 }], 60);
    expect(plan.map((c) => c.start)).toEqual([0, 49.5, 101.5]);
    expect(plan.every((c) => c.seconds <= 60)).toBe(true);
  });
  it("makes each clip vertical, the whole picture over a blurred copy", () => {
    const req = verticalClipRequest("https://f/a.mp4", { start: 3, seconds: 20 }) as { inputs: { options: unknown[] }[]; filters: { filter: string }[] };
    expect(req.inputs[0].options).toEqual([{ option: "-ss", argument: 3 }, { option: "-t", argument: 20 }]);
    expect(req.filters[0].filter).toContain("crop=270:480");
    expect(req.filters[0].filter).toContain("overlay=(W-w)/2:(H-h)/2");
    expect(req.filters[0].filter).toContain("boxblur");
  });
});

describe("a real run of the visitor's video", () => {
  it("reads the video, cuts it at the pauses into vertical clips, captions each, then emails the link once", async () => {
    const s = setUp();
    const { id, key } = await booked(s);
    const started = await startDemo(id, key, s.deps);
    expect(started.ok).toBe(true);
    // first the toolkit reads it and finds the pauses, from a private link that lasts a day
    expect(s.tk.sent.map((j) => j.endpoint)).toEqual(["/v1/media/metadata", "/v1/media/silence"]);
    expect(s.tk.sent[0].body.media_url).toBe(`https://blob.example/demos/${id}/source.mp4?signed=1`);
    expect(s.tk.sent[0].webhookUrl).toBe(`https://site.example/api/demo/hook?id=${id}&k=${key}&job=${id}-meta`);

    s.tk.finish(`${id}-meta`, { duration: 150, width: 1920, height: 1080 });
    s.tk.finish(`${id}-pauses`, [{ start: 49, end: 50 }, { start: 101, end: 102 }]);
    s.later(5000);
    let view = await demoStatus(id, key, s.deps);
    if (!view.ok) throw new Error();
    expect(view.view.steps[1]).toMatchObject({ label: "Read by the toolkit", state: "done", detail: "2 min 30 s long, 1920 × 1080" });
    const cuts = s.tk.sent.filter((j) => j.endpoint === "/v1/ffmpeg/compose");
    expect(cuts).toHaveLength(3);
    expect(view.view.steps[2]).toMatchObject({ state: "doing", detail: "3 clips, up to a minute each, 1080 × 1920." });

    cuts.forEach((c, i) => s.tk.finish(c.id, [{ file_url: `https://media.example/cut-${i + 1}.mp4` }]));
    s.later(5000);
    await demoStatus(id, key, s.deps);
    const captions = s.tk.sent.filter((j) => j.endpoint === "/v1/video/caption");
    expect(captions.map((c) => c.body.video_url)).toEqual(["https://media.example/cut-1.mp4", "https://media.example/cut-2.mp4", "https://media.example/cut-3.mp4"]);
    expect(captions[0].body.settings).toMatchObject({ style: "highlight", all_caps: true });

    // the toolkit posts two results back, and the third is found by asking
    await demoHook(id, key, captions[0].id, { code: 200, response: "https://media.example/cap-1.mp4" }, s.deps);
    await demoHook(id, key, captions[1].id, { code: 200, response: "https://media.example/cap-2.mp4" }, s.deps);
    s.tk.finish(captions[2].id, "https://media.example/cap-3.mp4");
    s.later(5000);
    view = await demoStatus(id, key, s.deps);
    if (!view.ok) throw new Error();
    expect(view.view.stage).toBe("done");
    expect(view.view.clips).toEqual([1, 2, 3].map((n) => ({ url: `https://media.example/cap-${n}.mp4`, captioned: true })));
    expect(view.view.steps.every((step) => step.state === "done")).toBe(true);
    await demoStatus(id, key, s.deps);
    expect(s.sendReady).toHaveBeenCalledTimes(1);
    expect(s.sendReady.mock.calls[0][1]).toBe(`https://site.example/clips/${id}?k=${key}`);
  });

  it("makes only the first few clips of a long video, and says the dashboard makes them all", async () => {
    const s = setUp();
    const { id, key } = await booked(s);
    await startDemo(id, key, s.deps);
    s.tk.finish(`${id}-meta`, { duration: 590 });
    s.tk.finish(`${id}-pauses`, []);
    s.later(5000);
    const view = await demoStatus(id, key, s.deps);
    if (!view.ok) throw new Error();
    expect(s.tk.sent.filter((j) => j.endpoint === "/v1/ffmpeg/compose")).toHaveLength(MAX_CLIPS);
    expect(view.view.steps[2].detail).toBe("The first 3 of 10 clips, up to a minute each. On the dashboard every clip is made.");
  });

  it("shows clips without captions, and says so, when captioning fails", async () => {
    const s = setUp();
    const { id, key } = await booked(s);
    await startDemo(id, key, s.deps);
    s.tk.finish(`${id}-meta`, { duration: 40 });
    s.tk.finish(`${id}-pauses`, []);
    s.later(5000);
    await demoStatus(id, key, s.deps);
    s.tk.finish(`${id}-cut-1`, { outputs: [{ file_url: "https://media.example/cut-1.mp4" }] });
    s.later(5000);
    await demoStatus(id, key, s.deps);
    s.tk.fail(`${id}-captions-1`, "no speech");
    s.later(5000);
    const view = await demoStatus(id, key, s.deps);
    if (!view.ok) throw new Error();
    expect(view.view.clips).toEqual([{ url: "https://media.example/cut-1.mp4", captioned: false }]);
    expect(view.view.partial).toBe("The captions didn’t finish, so that clip is shown without them.");
    expect(view.view.steps[3].state).toBe("failed");
  });

  it("stops with a plain reason when the video is over 10 minutes or can't be read", async () => {
    const s = setUp();
    const { id, key } = await booked(s);
    await startDemo(id, key, s.deps);
    s.tk.finish(`${id}-meta`, { duration: 900 });
    s.tk.finish(`${id}-pauses`, []);
    s.later(5000);
    const view = await demoStatus(id, key, s.deps);
    if (!view.ok) throw new Error();
    expect(view.view).toMatchObject({ stage: "failed", error: "That video is 15 min long. The demo takes videos up to 10 minutes." });
    expect(s.tk.sent.some((j) => j.endpoint === "/v1/ffmpeg/compose")).toBe(false);
  });

  it("gives up on a job the toolkit lost, instead of waiting forever", async () => {
    const s = setUp();
    const demo = startRun(newDemo("d1", who, { name: "a.mp4", size: 1 }, 0), "demos/d1/source.mp4", "https://blob.example/a", 0);
    const lostToolkit: Toolkit = { send: async () => ({ kind: "queued", toolkitJobId: "x" }), status: async () => ({ state: "unknown" }) };
    let d: Demo = await advance(demo, lostToolkit, "https://site.example/hook?id=d1", 0);
    d = await advance(d, lostToolkit, "https://site.example/hook?id=d1", 6 * 60_000);
    expect(viewOf(d)).toMatchObject({ stage: "failed", error: "The toolkit couldn’t read that video. Try another file, such as an MP4 or MOV." });
    void s;
  });
});

describe("never flooding the toolkit", () => {
  it("sends each job once, however many people look at the same moment", async () => {
    const s = setUp();
    const { id, key } = await booked(s);
    await startDemo(id, key, s.deps);
    s.tk.finish(`${id}-meta`, { duration: 150 });
    s.tk.finish(`${id}-pauses`, []);
    s.later(5000);
    await Promise.all(Array.from({ length: 6 }, () => demoStatus(id, key, s.deps)));
    s.later(5000);
    await Promise.all(Array.from({ length: 6 }, () => demoStatus(id, key, s.deps)));
    const cuts = s.tk.sent.filter((j) => j.endpoint === "/v1/ffmpeg/compose").map((j) => j.id);
    expect(cuts).toEqual([...new Set(cuts)]);
    expect(cuts).toHaveLength(3);
  });

  it("sends nothing when the run can't be saved, so a broken store can't flood the toolkit", async () => {
    const s = setUp();
    const { id, key } = await booked(s);
    await startDemo(id, key, s.deps);
    s.tk.finish(`${id}-meta`, { duration: 150 });
    s.tk.finish(`${id}-pauses`, []);
    s.deps.store.save = async () => false;
    for (let i = 0; i < 10; i++) {
      s.later(5000);
      await demoStatus(id, key, s.deps);
    }
    expect(s.tk.sent.filter((j) => j.endpoint === "/v1/ffmpeg/compose")).toHaveLength(0);
  });

  it("hands a job over at most a few times when its answer keeps getting lost", async () => {
    const s = setUp();
    const { id, key } = await booked(s);
    let sends = 0;
    s.deps.toolkit = { send: async () => (sends++, new Promise(() => {})), status: async () => ({ state: "working" }) };
    void startDemo(id, key, s.deps);
    for (let i = 0; i < 20; i++) {
      s.later(3 * 60_000);
      await Promise.race([demoStatus(id, key, s.deps), new Promise((r) => setTimeout(r, 5))]);
    }
    expect(sends).toBeLessThanOrEqual(2 * 4);
  });
});

describe("limits", () => {
  it("one run per email, a daily cap, files up to 1 GB and 10 minutes", async () => {
    const s = setUp();
    expect((await createDemo({ ...who, ...file }, s.deps)).ok).toBe(true);
    expect(await createDemo({ ...who, email: "AVA@studio.co", ...file }, s.deps)).toMatchObject({ ok: false, status: 409 });
    expect(await createDemo({ ...who, email: "b@x.co", ...file, size: 2 * 1024 ** 3 }, s.deps)).toMatchObject({ ok: false, status: 422 });
    expect(await createDemo({ ...who, email: "b@x.co", ...file, seconds: 700 }, s.deps)).toMatchObject({ ok: false, status: 422 });
    expect((await createDemo({ ...who, email: "c@x.co", ...file }, s.deps)).ok).toBe(true);
    expect(await createDemo({ ...who, email: "d@x.co", ...file }, s.deps)).toMatchObject({ ok: false, status: 429 });
  });

  it("refuses runs while the site has no toolkit", async () => {
    const s = setUp();
    expect(await createDemo({ ...who, ...file }, { ...s.deps, toolkit: null })).toMatchObject({ ok: false, status: 503 });
  });

  it("only lets a visitor upload to their own run, once, and only see it with its key", async () => {
    const s = setUp();
    const { id, key, path } = await booked(s);
    expect(await mayUpload(path, { id, key }, s.deps)).not.toBeNull();
    expect(await mayUpload(path, { id, key: "wrong" }, s.deps)).toBeNull();
    expect(await mayUpload(`demos/${id}/other.mp4`, { id, key }, s.deps)).toBeNull();
    expect(await demoStatus(id, "wrong", s.deps)).toMatchObject({ ok: false, status: 404 });
    await startDemo(id, key, s.deps);
    expect(await mayUpload(path, { id, key }, s.deps)).toBeNull();
    expect(resultsLink(s.deps, id)).toBe(`https://site.example/clips/${id}?k=${keyFor(id, SECRET)}`);
  });

  it("won't start before the upload has arrived", async () => {
    const s = setUp();
    const made = await createDemo({ ...who, ...file }, s.deps);
    if (!made.ok) throw new Error();
    expect(await startDemo(made.id, made.key, s.deps)).toMatchObject({ ok: false, status: 409 });
    expect(s.tk.sent).toHaveLength(0);
  });
});

describe("talking to the toolkit", () => {
  it("queues with a post-back address, and reads a job's status", async () => {
    const calls: { url: string; body: Record<string, unknown>; key: string }[] = [];
    const fake = (async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)), key: (init.headers as Record<string, string>)["X-API-Key"] });
      if (url.endsWith("/v1/toolkit/job/status")) {
        return new Response(JSON.stringify({ response: { job_status: "done", response: { code: 200, response: "https://m/x.mp4" } } }));
      }
      return new Response(JSON.stringify({ code: 202, job_id: "j1" }), { status: 202 });
    }) as unknown as typeof fetch;
    const tk = httpToolkit({ baseUrl: "https://media.example", apiKey: "k" }, fake);
    expect(await tk.send("/v1/media/metadata", { media_url: "u" }, "https://site/hook", "d-meta")).toEqual({ kind: "queued", toolkitJobId: "j1" });
    expect(calls[0]).toEqual({ url: "https://media.example/v1/media/metadata", body: { media_url: "u", webhook_url: "https://site/hook", id: "d-meta" }, key: "k" });
    expect(await tk.status("j1")).toEqual({ state: "finished", ok: true, result: "https://m/x.mp4" });
  });

  it("counts a busy toolkit as try again, and a refusal as failed", async () => {
    const answer = (status: number) => (async () => new Response("nope", { status })) as unknown as typeof fetch;
    expect(await httpToolkit({ baseUrl: "https://m", apiKey: "k" }, answer(429)).send("/x", {}, "h", "i")).toEqual({ kind: "busy" });
    expect((await httpToolkit({ baseUrl: "https://m", apiKey: "k" }, answer(400)).send("/x", {}, "h", "i")).kind).toBe("refused");
  });

  it("takes a step the toolkit ran straight away and could not do as failed, not as busy", async () => {
    const failed = (async () =>
      new Response(JSON.stringify({ endpoint: "/v1/media/metadata", code: 500, job_id: "j", response: null, message: "ffprobe error: " }), { status: 500 })) as unknown as typeof fetch;
    expect(await httpToolkit({ baseUrl: "https://m", apiKey: "k" }, failed).send("/v1/media/metadata", {}, "h", "i")).toEqual({ kind: "answered", ok: false, error: "ffprobe error: " });
    const queued = (async () => new Response(JSON.stringify({ endpoint: "/v1/media/silence", code: 202, job_id: "j2" }), { status: 202 })) as unknown as typeof fetch;
    expect(await httpToolkit({ baseUrl: "https://m", apiKey: "k" }, queued).send("/v1/media/silence", {}, "h", "i")).toEqual({ kind: "queued", toolkitJobId: "j2" });
  });

  it("stops asking a toolkit that stays too busy, and says so", async () => {
    const s = setUp();
    const { id, key } = await booked(s);
    s.deps.toolkit = { send: async () => ({ kind: "busy" }), status: async () => ({ state: "working" }) };
    await startDemo(id, key, s.deps);
    s.later(5 * 60_000);
    let view = await demoStatus(id, key, s.deps);
    expect(view.ok && view.view.stage).toBe("running");
    s.later(6 * 60_000);
    await demoStatus(id, key, s.deps);
    s.later(5000);
    view = await demoStatus(id, key, s.deps);
    if (!view.ok) throw new Error();
    expect(view.view.stage).toBe("failed");
  });
});
