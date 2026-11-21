import { expect, test, type Page } from "@playwright/test";

const RATIO: Record<string, number> = { "9:16": 9 / 16, "4:5": 4 / 5, "1:1": 1, "16:9": 16 / 9, original: 16 / 9 };

/** Scrolls so the scroll scene is `p` of the way through (0 = just pinned, 1 = finished). */
async function scrollSplit(page: Page, p: number) {
  await page.evaluate((p) => {
    const el = document.querySelector<HTMLElement>(".split")!;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + p * (el.offsetHeight - window.innerHeight));
  }, p);
  // the scene eases to where the scroll is, so give it time to settle
  await page.waitForTimeout(1600);
}

test("one recording splits into clips that each take their platform's shape and land by its logo", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.locator(".split.is-live")).toHaveCount(1);
  const clips = page.locator(".split-clip");
  await expect(clips).toHaveCount(5);

  // at the start it is one long recording: the pieces sit side by side at one height
  await scrollSplit(page, 0.02);
  const start = await Promise.all((await clips.all()).map(async (c) => (await c.boundingBox())!));
  for (const b of start) {
    expect(Math.abs(b.y - start[0].y)).toBeLessThan(1);
    expect(Math.abs(b.height - start[0].height)).toBeLessThan(1);
  }
  for (let i = 1; i < start.length; i++) expect(start[i].x).toBeGreaterThanOrEqual(start[i - 1].x + start[i - 1].width - 1);
  await expect(page.locator(".split-dest").first()).toHaveCSS("opacity", "0");
  await expect(page.locator(".split-steps li.on")).toHaveCount(1);
  // the strip is frames of the real recording, and nothing plays yet
  for (const f of await page.locator(".split-film").all()) {
    await expect(f).toHaveCSS("opacity", "1");
    await expect(f).toHaveCSS("background-image", /recording\.jpg/);
  }
  expect(await page.locator(".split-video").evaluateAll((vs) => (vs as HTMLVideoElement[]).every((v) => v.paused))).toBe(true);
  // not approved yet, nothing about editors or tokens yet
  await expect(page.locator(".split-ok").first()).toHaveCSS("opacity", "0");
  await expect(page.locator(".split-foot")).toHaveCSS("opacity", "0");

  // once transcribed, each piece's words sit under it
  await scrollSplit(page, 0.12);
  const saidFirst = page.locator(".split-said").first();
  await expect(saidFirst).toHaveCSS("opacity", "1");
  const sb = (await saidFirst.boundingBox())!;
  const cb = (await clips.first().boundingBox())!;
  expect(sb.y).toBeGreaterThanOrEqual(cb.y + cb.height);
  expect(Math.abs(sb.x - cb.x)).toBeLessThan(2);

  // when they are ready, each clip has its platform's shape, sits inside the scene, and its logo shows under it
  await scrollSplit(page, 0.8);
  const stage = (await page.locator(".split-stage").boundingBox())!;
  for (const c of await clips.all()) {
    const b = (await c.boundingBox())!;
    const frame = (await c.getAttribute("data-frame"))!;
    expect(b.width / b.height).toBeCloseTo(RATIO[frame], 1);
    expect(b.x).toBeGreaterThanOrEqual(stage.x);
    expect(b.x + b.width).toBeLessThanOrEqual(stage.x + stage.width + 1);
    expect(b.y).toBeGreaterThanOrEqual(stage.y);
    const dest = page.locator(".split-dest").nth((await clips.all()).indexOf(c));
    await expect(dest).toHaveCSS("opacity", "1");
    const d = (await dest.boundingBox())!;
    expect(d.y).toBeGreaterThanOrEqual(b.y + b.height);
    expect(d.y + d.height).toBeLessThanOrEqual(stage.y + stage.height + 1);
  }
  await expect(page.locator(".split-steps li.on")).toHaveCount(5);
  for (const ok of await page.locator(".split-ok").all()) await expect(ok).toHaveCSS("opacity", "1");
  await expect(page.locator(".split-said").first()).toHaveCSS("opacity", "0");
  // the finished clips play (muted), and the strip of the recording has faded off them
  for (const f of await page.locator(".split-film").all()) await expect(f).toHaveCSS("opacity", "0");
  await expect
    .poll(() => page.locator(".split-video").evaluateAll((vs) => (vs as HTMLVideoElement[]).every((v) => !v.paused && v.currentTime > 0)), { timeout: 8000 })
    .toBe(true);
  // the editor route and the token count sit at the foot, under every logo
  const foot = (await page.locator(".split-foot").boundingBox())!;
  expect(foot.y + foot.height).toBeLessThanOrEqual(stage.y + stage.height + 1);
  for (const d of await page.locator(".split-dest").all()) {
    const b = (await d.boundingBox())!;
    expect(b.y + b.height).toBeLessThanOrEqual(foot.y + 2);
  }
  await expect(page.locator(".split-tokens b")).toHaveText("0");

  // at the end the next recording slides in along the top, inside the scene, above the clips
  await scrollSplit(page, 1);
  const next = (await page.locator(".split-next").boundingBox())!;
  const st2 = (await page.locator(".split-stage").boundingBox())!;
  expect(next.x).toBeGreaterThanOrEqual(st2.x);
  expect(next.x + next.width).toBeLessThanOrEqual(st2.x + st2.width + 1);
  const firstClip = (await clips.first().boundingBox())!;
  const top = Math.min(...(await Promise.all((await clips.all()).map(async (c) => (await c.boundingBox())!.y))));
  expect(next.y + next.height).toBeLessThanOrEqual(top + 1);
  expect(firstClip.width).toBeGreaterThan(0);
});

test("the scroll scene takes a long scroll and eases into each change instead of jumping", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.locator(".split.is-live")).toHaveCount(1);
  const [h, vh] = await page.evaluate(() => [document.querySelector<HTMLElement>(".split")!.offsetHeight, window.innerHeight]);
  expect(h).toBeGreaterThanOrEqual(vh * 4);
  await scrollSplit(page, 0);
  // jump straight to the end: a moment later the scene is still on its way there
  await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>(".split")!;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + el.offsetHeight - window.innerHeight);
  });
  await page.waitForTimeout(80);
  expect(await page.locator(".split-steps li.on").count()).toBeLessThan(5);
  await expect(page.locator(".split-steps li.on")).toHaveCount(5, { timeout: 4000 });
});

test("the scroll scene holds on its finished moment before the page scrolls on", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.locator(".split.is-live")).toHaveCount(1);
  const place = () => page.locator(".split-next").evaluate((el) => (el as HTMLElement).style.transform);
  // the scene follows the scroll with a lag, so read it only once it has come to rest
  const settled = async () => {
    let last = await place();
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(100);
      const now = await place();
      if (now === last) return now;
      last = now;
    }
    return last;
  };
  await scrollSplit(page, 0.82);
  const held = await settled();
  await scrollSplit(page, 0.95);
  expect(await settled()).toBe(held);
  await expect(page.locator(".split-steps li.on")).toHaveCount(5);
  // and it is still pinned on screen while it holds
  const box = (await page.locator(".split-stage").boundingBox())!;
  expect(box.y).toBeGreaterThan(0);
});

test.describe("with reduced motion, the scroll scene", () => {
  test.use({ reducedMotion: "reduce" });
  test("is a plain row of the finished clips, not a long pinned scroll", async ({ page, isMobile }) => {
    await page.goto("/");
    const split = page.locator(".split");
    await split.scrollIntoViewIfNeeded();
    await expect(page.locator(".split.is-live")).toHaveCount(0);
    // a phone shows the clips two to a row, large, so the section is taller there but still no pinned scroll
    expect((await split.boundingBox())!.height).toBeLessThan(isMobile ? 2000 : 1400);
    for (const c of await page.locator(".split-clip").all()) {
      const b = (await c.boundingBox())!;
      expect(b.width / b.height).toBeCloseTo(RATIO[(await c.getAttribute("data-frame"))!], 1);
    }
    await expect(page.locator(".split-steps li.on")).toHaveCount(5);
    await expect(page.locator(".split-foot")).toBeVisible();
    await expect(page.locator(".split-said").first()).toBeHidden();
    await expect(page.locator(".split-next")).toBeHidden();
    // the clips show their posters and do not play by themselves
    expect(await page.locator(".split-video").evaluateAll((vs) => (vs as HTMLVideoElement[]).every((v) => v.paused))).toBe(true);
    await expect(page.locator(".split-film").first()).toBeHidden();
  });
});

test("the clip changes shape for each platform you pick", async ({ page }) => {
  await page.goto("/");
  const frame = page.locator(".shift-frame");
  await frame.scrollIntoViewIfNeeded();
  await page.getByRole("tab", { name: "Instagram" }).click();
  await page.getByRole("button", { name: "Feed" }).click();
  await expect(page.locator(".shift-line")).toHaveText("Instagram Feed clips come out Portrait 4:5, up to 3 min each.");
  await expect.poll(async () => { const b = (await frame.boundingBox())!; return Math.round((b.width / b.height) * 100) / 100; }).toBe(0.8);
  await page.getByRole("tab", { name: "YouTube" }).click();
  await page.getByRole("button", { name: "YouTube" }).click();
  await expect.poll(async () => { const b = (await frame.boundingBox())!; return Math.round((b.width / b.height) * 100) / 100; }).toBe(1.78);
  // once picked, it stays put
  await page.waitForTimeout(2600);
  await expect(page.locator(".shift-line")).toContainText("YouTube clips come out Wide 16:9");
});

test("the falling logos drift from the cursor, and a click shows that platform's shapes beside it", async ({ page, isMobile }) => {
  test.skip(isMobile, "the falling logos only show on wide screens");
  await page.goto("/");
  await page.waitForTimeout(800);
  // a logo fully on screen in the left margin
  const target = await page.evaluate(() => {
    const els = [...document.querySelectorAll<HTMLElement>(".hi-left")];
    const i = els.findIndex((e) => {
      const r = e.getBoundingClientRect();
      return r.top > 140 && r.bottom < 560;
    });
    els.forEach((e, j) => e.toggleAttribute("data-target", j === i));
    const r = els[i].getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width };
  });
  const hi = page.locator(".hi[data-target]");
  // near the logo, but not on it: it moves out of the way
  await page.mouse.move(target.x + target.w * 0.55, target.y);
  await expect.poll(() => hi.locator(".hi-push").evaluate((e) => getComputedStyle(e).transform)).not.toBe("none");
  // click it: it stops, and a card lists every shape the Clips step makes for that platform
  // pointing at a logo stops it falling, as a person's cursor would, then click
  const now = (await hi.boundingBox())!;
  await page.mouse.move(now.x + now.width / 2, now.y + now.height / 2);
  await page.waitForTimeout(300);
  const held = (await hi.boundingBox())!;
  await page.mouse.click(held.x + held.width / 2, held.y + held.height / 2);
  await expect(hi).toHaveClass(/open/);
  const tag = hi.locator(".hi-tag");
  await expect(tag).toBeVisible();
  await expect(tag).toContainText(/Vertical 9:16|Portrait 4:5|Wide 16:9|Its own shape/);
  // the card stays in the margin, clear of the headline
  const h1 = await page.evaluate(() => {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector(".hero h1")!);
    return [...range.getClientRects()].map((r) => ({ x: r.x, w: r.width }));
  });
  const t = (await tag.boundingBox())!;
  for (const line of h1) expect(t.x + t.width <= line.x || t.x >= line.x + line.w).toBe(true);
  // clicking anywhere else lets it go
  await page.mouse.click(720, 800);
  await expect(hi).not.toHaveClass(/open/);
});

test("the caption under the hero recording lights up word by word as it plays", async ({ page }) => {
  await page.goto("/");
  const cap = page.locator(".stage-cap");
  await cap.scrollIntoViewIfNeeded();
  const total = await cap.locator(".cw").count();
  await expect.poll(() => cap.locator(".cw.on").count(), { timeout: 10_000 }).toBeGreaterThan(2);
  const some = await cap.locator(".cw.on").count();
  await expect.poll(() => cap.locator(".cw.on").count(), { timeout: 15_000 }).toBe(total);
  expect(some).toBeLessThan(total);
  await expect(cap).toHaveText(/A new upload starts the run/);
});

/**
 * Picks a real recording the way a visitor would, under the name a visitor's file might have.
 * It is a fixed 35-second file, so these tests don't move when the site's own videos are re-recorded.
 */
async function dropRecording(page: import("@playwright/test").Page) {
  const buffer = await (await import("node:fs/promises")).readFile("e2e/fixtures/first-video.mp4");
  await page.locator('.try input[type="file"]').setInputFiles({ name: "my-first-video.mp4", mimeType: "video/mp4", buffer });
}

type Step = { label: string; state: string; detail?: string };
const LABELS = ["Uploaded", "Read by the toolkit", "Cut at the pauses, made vertical", "Captioned", "Ready to download"];
const steps = (states: string[], details: (string | undefined)[] = []): Step[] =>
  LABELS.map((label, i) => ({ label, state: states[i], ...(details[i] ? { detail: details[i] } : {}) }));

/**
 * Stands in for the site's demo routes and Blob storage, so the browser side can be
 * checked end to end: booking, the upload, the start, and the toolkit's progress.
 */
async function fakeDemo(page: import("@playwright/test").Page, finish: "done" | "failed" = "done") {
  const calls: { path: string; body: unknown }[] = [];
  let asked = 0;
  await page.route("**/api/early-access", (r) => r.fulfill({ json: { ok: true } }));
  await page.route("**/api/demo", (r) => {
    calls.push({ path: "/api/demo", body: r.request().postDataJSON() });
    return r.fulfill({ json: { ok: true, id: "run1", key: "key1", path: "demos/run1/source.mp4" } });
  });
  await page.route("**/api/demo/upload", (r) => {
    calls.push({ path: "/api/demo/upload", body: r.request().postDataJSON() });
    return r.fulfill({ json: { type: "blob.generate-client-token", clientToken: "vercel_blob_client_teststore_x" } });
  });
  await page.route("https://vercel.com/api/blob/**", (r) => {
    calls.push({ path: "blob PUT", body: new URL(r.request().url()).searchParams.get("pathname") });
    const url = "https://teststore.private.blob.vercel-storage.com/demos/run1/source.mp4";
    return r.fulfill({ json: { url, downloadUrl: url, pathname: "demos/run1/source.mp4", contentType: "video/mp4", contentDisposition: "inline", etag: "e" } });
  });
  await page.route("**/api/demo/start", (r) => {
    calls.push({ path: "/api/demo/start", body: r.request().postDataJSON() });
    return r.fulfill({ json: { ok: true } });
  });
  const file = "my-first-video.mp4, 2 MB";
  await page.route("**/api/demo/status**", (r) => {
    asked++;
    const view =
      asked === 1
        ? { stage: "running", steps: steps(["done", "doing", "wait", "wait", "wait"], [file]), clips: [] }
        : asked === 2
          ? { stage: "running", steps: steps(["done", "done", "doing", "wait", "wait"], [file, "35 s long, 1440 × 900", "1 clip, up to a minute each, 1080 × 1920."]), clips: [] }
          : finish === "failed"
            ? { stage: "failed", steps: steps(["done", "failed", "wait", "wait", "wait"], [file]), clips: [], error: "The toolkit couldn’t read that video. Try another file, such as an MP4 or MOV." }
            : {
                stage: "done",
                steps: steps(["done", "done", "done", "done", "done"], [file, "35 s long, 1440 × 900", "1 clip, up to a minute each, 1080 × 1920.", "Every word transcribed and burned in."]),
                clips: [{ url: "/media/features/review.mp4", captioned: true }],
              };
    return r.fulfill({ json: { ok: true, view } });
  });
  return calls;
}

async function signUp(page: import("@playwright/test").Page) {
  const form = page.locator("dialog[open] form");
  await form.getByLabel("Your name").fill("Ava Reyes");
  await form.getByLabel("Email").fill("ava@studio.co");
  await form.getByLabel("Editing agency", { exact: true }).check();
  await form.getByLabel("2 to 5", { exact: true }).check();
  await form.getByRole("button", { name: "Next" }).click();
  await form.getByLabel("Podcasts", { exact: true }).check();
  await form.getByLabel("1 to 5 hours", { exact: true }).check();
  await form.getByRole("button", { name: "Next" }).click();
  await form.getByLabel("A rented server", { exact: true }).check();
  await form.getByRole("button", { name: "Next" }).click();
  await expect(form.getByLabel(/in your words/i)).toHaveValue("I ran my-first-video.mp4, 35 s through the demo.");
  await form.getByRole("button", { name: "Join early access" }).click();
  await expect(page.locator("dialog[open]").getByRole("status")).toContainText("You’re on the list");
  await page.locator("dialog[open]").getByRole("button", { name: "Close" }).click();
}

test("the section asks for their own first video, and nothing is sent before they sign up", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#try-it h2")).toHaveText("Drop in your first video, get early access sooner");
  await expect(page.locator("#try-it").getByRole("button", { name: /sample/i })).toHaveCount(0);
  await expect(page.locator("#try-it")).not.toContainText(/in your browser|nothing is uploaded|preview/i);
  const sent: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET" && r.method() !== "HEAD") sent.push(`${r.method()} ${r.url()}`);
  });
  await page.locator("#try-it").scrollIntoViewIfNeeded();
  await dropRecording(page);
  await expect(page.locator(".try-drop-title")).toHaveText("my-first-video.mp4");
  await expect(page.locator(".try-drop-note")).toHaveText(/^\d+ (KB|MB), 35 s$/);
  await expect(page.getByRole("button", { name: "Sign up and run it" })).toBeVisible();
  // said before they sign up: it takes a while, and they don't have to sit and watch
  await expect(page.locator(".try-drop-hint")).toHaveText("The toolkit can take a while on it, and you don’t have to wait on this page.");
  // every step waits: nothing has run, and nothing pretends to
  await expect(page.locator(".try-step.wait")).toHaveCount(5);
  expect(sent).toEqual([]);
});

test("signing up uploads the video to the real toolkit, shows its real steps, then the clips to watch and download", async ({ page }) => {
  const calls = await fakeDemo(page);
  await page.goto("/");
  await page.locator("#try-it").scrollIntoViewIfNeeded();
  await dropRecording(page);
  await page.getByRole("button", { name: "Sign up and run it" }).click();
  await signUp(page);
  // booked for this person and file, uploaded to the booked place, then started
  await expect.poll(() => calls.map((c) => c.path)).toEqual(expect.arrayContaining(["/api/demo", "/api/demo/upload", "blob PUT", "/api/demo/start"]));
  expect(calls.find((c) => c.path === "/api/demo")!.body).toMatchObject({ name: "Ava Reyes", email: "ava@studio.co", fileName: "my-first-video.mp4" });
  expect(calls.find((c) => c.path === "blob PUT")!.body).toBe("demos/run1/source.mp4");
  expect(calls.find((c) => c.path === "/api/demo/start")!.body).toEqual({ id: "run1", key: "key1" });
  // while it works: told not to wait, and given their own clips link to come back to
  const wait = page.locator(".try-wait");
  await expect(wait).toContainText("you don’t need to wait here");
  await expect(wait).not.toContainText("email");
  await expect(wait.getByRole("link", { name: "Your clips link" })).toHaveAttribute("href", "/clips/run1?k=key1");
  const steps = (await page.locator(".try-run").boundingBox())!;
  expect((await wait.boundingBox())!.y).toBeGreaterThanOrEqual(steps.y + steps.height - 1);
  // centred in its box, not pushed to the left
  const box = (await wait.boundingBox())!;
  const lead = (await wait.locator(".try-next-lead").boundingBox())!;
  expect(Math.abs(lead.x - box.x - (box.x + box.width - lead.x - lead.width))).toBeLessThan(4);
  const first = (await wait.getByRole("link", { name: "Your clips link" }).boundingBox())!;
  const last = (await wait.getByRole("button", { name: "Copy link" }).boundingBox())!;
  expect(Math.abs(first.x - box.x - (box.x + box.width - last.x - last.width))).toBeLessThan(4);
  // the toolkit's own answers, step by step
  await expect(page.locator('[data-step="Read by the toolkit"] .try-detail')).toHaveText("35 s long, 1440 × 900", { timeout: 15_000 });
  await expect(page.locator(".try-step.done")).toHaveCount(5, { timeout: 15_000 });
  const next = page.locator(".try-next");
  await expect(next).toContainText("Here are your clips, made by the toolkit.");
  await expect(wait).toHaveCount(0);
  // No email is promised while the site has no way to send one (toSend is not set up here).
  await expect(next).not.toContainText("in your email");
  // in the page's flow, under the steps, never over them
  const run = (await page.locator(".try-run").boundingBox())!;
  expect((await next.boundingBox())!.y).toBeGreaterThanOrEqual(run.y + run.height - 1);
  const clip = next.getByLabel("Clip 1");
  await expect(clip).toBeVisible();
  await expect.poll(() => clip.evaluate((v: HTMLVideoElement) => v.videoWidth)).toBeGreaterThan(0);
  await expect(next.getByRole("link", { name: "Download clip 1" })).toHaveAttribute("download", "my-first-video clip 1.mp4");
});

test("when the toolkit can't finish, it says why plainly and lets them start over", async ({ page }) => {
  await fakeDemo(page, "failed");
  await page.goto("/");
  await page.locator("#try-it").scrollIntoViewIfNeeded();
  await dropRecording(page);
  await page.getByRole("button", { name: "Sign up and run it" }).click();
  await signUp(page);
  const alert = page.locator(".try-next[role=alert]");
  await expect(alert).toContainText("The toolkit couldn’t read that video.", { timeout: 15_000 });
  await expect(alert).toContainText("You’re still on the list.");
  await alert.getByRole("button", { name: "Start over" }).click();
  await expect(page.locator(".try-drop .btn.primary")).toHaveText("Choose a video");
  await expect(page.locator(".try-step.wait")).toHaveCount(5);
});

test("every Get early access button opens the pop-up, and Escape closes it", async ({ page, isMobile }) => {
  await page.goto("/");
  if (!isMobile) {
    await page.locator(".nav-r").getByRole("link", { name: "Get early access" }).click();
    await expect(page.locator("dialog[open]")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
  }
  await page.locator(".hero-cta").getByRole("link", { name: "Get early access" }).click();
  await expect(page.locator("dialog[open] form")).toBeVisible();
  const box = (await page.locator("dialog[open]").boundingBox())!;
  const vp = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
  expect(box.height).toBeLessThanOrEqual(vp.height);
  await page.keyboard.press("Escape");
  await page.goto("/pricing#early");
  await expect(page.locator("dialog[open] form")).toBeVisible();
});

test("the features lead lights up one platform at a time in its own colour, with the logos in rails outside the text", async ({ page, isMobile }) => {
  await page.goto("/");
  const ink = page.locator("#features-title .plat-ink");
  await expect(ink).toHaveText("No AI on every video.");
  const lead = page.locator(".features .pl-lead");
  const phrase = (p: string) => lead.locator(`.pl-phrase[data-platform="${p}"]`);
  const logo = (p: string) => page.locator(`.features .pl-rail-logo[data-platform="${p}"]`);
  // before it scrolls in, it waits in grey with the logos tucked away
  await expect(phrase("youtube").locator(".pl-words")).toHaveCSS("opacity", "0.3");
  await expect(logo("youtube")).toHaveCSS("opacity", "0");
  await lead.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 300));
  const colours: Record<string, string> = { youtube: "rgb(255, 0, 0)", facebook: "rgb(8, 102, 255)", linkedin: "rgb(10, 102, 194)", tiktok: "rgb(0, 0, 0)", x: "rgb(0, 0, 0)" };
  for (const [p, rgb] of Object.entries(colours)) {
    await expect(phrase(p)).toHaveClass(/is-on/);
    await expect(phrase(p).locator(".pl-words")).toHaveCSS("color", rgb);
    await expect(phrase(p).locator(".pl-words")).toHaveCSS("opacity", "1");
  }
  await expect(phrase("instagram").locator(".pl-words")).toHaveCSS("background-clip", "text");
  // every logo shows, big enough to recognise, and none of them overlaps the text
  const text = (await lead.boundingBox())!;
  const sides = new Set<string>();
  for (const p of ["tiktok", "instagram", "youtube", "facebook", "linkedin", "x"]) {
    await expect(logo(p)).toHaveCSS("opacity", "1");
    const box = (await logo(p).boundingBox())!;
    expect(box.width).toBeGreaterThan(30);
    const outside = box.x + box.width <= text.x || box.x >= text.x + text.width || box.y + box.height <= text.y;
    expect(outside, p).toBe(true);
    sides.add(box.x + box.width <= text.x ? "left" : box.x >= text.x + text.width ? "right" : "above");
  }
  expect([...sides].sort()).toEqual(isMobile ? ["above"] : ["left", "right"]);
  // scattered, not stacked: each its own size and tilt, each coming in its own way
  const looks = await page.$$eval(".features .pl-rail-logo", (els) => els.map((e) => { const c = getComputedStyle(e); return { w: c.width, r: c.rotate, a: c.animationName }; }));
  expect(new Set(looks.map((l) => l.w)).size).toBeGreaterThanOrEqual(5);
  expect(new Set(looks.map((l) => l.r)).size).toBe(6);
  expect(new Set(looks.map((l) => l.a.split(",")[0].trim())).size).toBe(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
});

test("the team chat scene changes app, and its logo, each time the conversation replays", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  const chat = page.locator(".scene-chat .chat");
  await chat.scrollIntoViewIfNeeded();
  const seen: string[] = [];
  const said: string[] = [];
  for (let i = 0; i < 4; i++) {
    seen.push((await chat.getAttribute("data-app"))!);
    said.push((await chat.locator(".msg-bubble").first().textContent())!);
    await expect(chat.locator(".chat-chan svg")).toBeVisible();
    await expect(chat.locator(".ava-bot svg.lucide-bot")).toBeAttached();
    await page.clock.runFor(9000);
  }
  expect(seen).toEqual(["slack", "discord", "teams", "telegram"]);
  expect(new Set(said).size).toBe(4);
  await expect(chat).toHaveAttribute("data-app", "slack");
});

test("each step of one recording in has its own icon that moves in its own way", async ({ page }) => {
  await page.goto("/");
  const steps = page.locator(".split-steps .split-n");
  await expect(steps).toHaveCount(5);
  await page.locator(".split").scrollIntoViewIfNeeded();
  const anims = await steps.evaluateAll((els) => els.map((e) => getComputedStyle(e.querySelector("svg")!).animationName));
  const on = anims.filter((a) => a && a !== "none");
  expect(new Set(on).size).toBe(on.length);
  const colours = await steps.evaluateAll((els) => els.map((e) => getComputedStyle(e).getPropertyValue("--c").trim()));
  expect(new Set(colours).size).toBe(5);
});

test("a clips link without its key shows nothing", async ({ page }) => {
  const res = await page.goto("/clips/run1?k=wrong");
  expect(res?.status()).toBe(404);
});
