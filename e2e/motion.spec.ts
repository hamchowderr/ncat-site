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

test("one recording splits into clips that each take their platform's shape and land by its logo", async ({ page }) => {
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

test("the scroll scene takes a long scroll and eases into each change instead of jumping", async ({ page }) => {
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

test("the scroll scene holds on its finished moment before the page scrolls on", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".split.is-live")).toHaveCount(1);
  const place = () => page.locator(".split-next").evaluate((el) => (el as HTMLElement).style.transform);
  await scrollSplit(page, 0.82);
  const held = await place();
  await scrollSplit(page, 0.95);
  expect(await place()).toBe(held);
  await expect(page.locator(".split-steps li.on")).toHaveCount(5);
  // and it is still pinned on screen while it holds
  const box = (await page.locator(".split-stage").boundingBox())!;
  expect(box.y).toBeGreaterThan(0);
});

test.describe("with reduced motion, the scroll scene", () => {
  test.use({ reducedMotion: "reduce" });
  test("is a plain row of the finished clips, not a long pinned scroll", async ({ page }) => {
    await page.goto("/");
    const split = page.locator(".split");
    await split.scrollIntoViewIfNeeded();
    await expect(page.locator(".split.is-live")).toHaveCount(0);
    expect((await split.boundingBox())!.height).toBeLessThan(1400);
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

/** True when a canvas has a picture on it, not just blank. */
const drawn = (c: HTMLCanvasElement) => {
  const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
  let lit = 0;
  for (let i = 0; i < d.length; i += 16) if (d[i + 3] > 0 && d[i] + d[i + 1] + d[i + 2] > 30) lit++;
  return lit > 50;
};

test("trying the sample walks every step and makes real vertical frames from the video", async ({ page }) => {
  await page.goto("/");
  await page.locator("#try-it").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Use a sample" }).click();
  await expect(page.locator(".try-step.done")).toHaveCount(6, { timeout: 15_000 });
  await expect(page.locator('[data-step="Filed"] .try-detail')).toHaveText(/^sample-recording\.mp4, \d+ KB$/);
  await expect(page.locator('[data-step="Details read"] .try-detail')).toHaveText("35 s long, 1440 × 900");
  await expect(page.locator('[data-step="Cut into clips"] .try-detail')).toContainText("5 clips of about 7 s");
  await expect(page.locator('[data-step="Captioned"] .try-detail')).toContainText("skips them");
  const thumbs = page.locator(".try-thumbs canvas");
  await expect(thumbs).toHaveCount(5);
  for (const c of await thumbs.all()) {
    expect(await c.evaluate(drawn)).toBe(true);
    const b = (await c.boundingBox())!;
    expect(b.width / b.height).toBeCloseTo(9 / 16, 1);
  }
});

test("a video you choose is read in the browser and never sent anywhere", async ({ page }) => {
  await page.goto("/");
  await page.locator("#try-it").scrollIntoViewIfNeeded();
  const sent: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET" && r.method() !== "HEAD") sent.push(`${r.method()} ${r.url()}`);
  });
  await page.locator('.try input[type="file"]').setInputFiles("public/media/features/review.mp4");
  await expect(page.locator(".try-step.done")).toHaveCount(6, { timeout: 15_000 });
  await expect(page.locator('[data-step="Filed"] .try-detail')).toHaveText(/^review\.mp4, \d+ KB$/);
  await expect(page.locator('[data-step="Details read"] .try-detail')).toHaveText("34 s long, 1280 × 800");
  expect(await page.locator(".try-thumbs canvas").first().evaluate(drawn)).toBe(true);
  expect(sent).toEqual([]);
});

test("a file the browser can't open still gets filed, with a plain note", async ({ page }) => {
  await page.goto("/");
  await page.locator("#try-it").scrollIntoViewIfNeeded();
  await page.locator('.try input[type="file"]').setInputFiles({ name: "broken.mp4", mimeType: "video/mp4", buffer: Buffer.from("not really a video") });
  await expect(page.locator('[data-step="Details read"] .try-detail')).toContainText("can’t open that file", { timeout: 10_000 });
  await expect(page.locator('[data-step="Filed"] .try-detail')).toHaveText("broken.mp4, 1 KB");
  await expect(page.locator(".try-thumbs")).toHaveCount(0);
});

test("the features heading runs through the platforms' colours, and the lead's words glow in them as they appear", async ({ page }) => {
  await page.goto("/");
  const ink = page.locator("#features-title .plat-ink");
  await expect(ink).toHaveText("No AI on every video.");
  await expect(ink).toHaveCSS("animation-name", "plat-ink");
  await expect(ink).toHaveCSS("color", "rgba(0, 0, 0, 0)");
  const lead = page.locator(".features .sec-lead");
  // scroll so the lead is part way through appearing, and look for words lit in a platform's colour
  const seen = new Set<string>();
  const y0 = await lead.evaluate((el) => el.getBoundingClientRect().top + window.scrollY - window.innerHeight);
  for (let i = 0; i < 24; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), y0 + i * 25);
    await page.waitForTimeout(60);
    for (const c of await lead.locator(".scroll-reveal-piece").evaluateAll((ps) => ps.map((p) => (p as HTMLElement).style.color)))
      for (const rgb of ["rgb(254, 44, 85)", "rgb(225, 48, 108)", "rgb(255, 0, 0)", "rgb(8, 102, 255)", "rgb(10, 102, 194)"]) if (c.includes(rgb)) seen.add(rgb);
  }
  expect(seen.size).toBeGreaterThanOrEqual(3);
  // once it has all appeared, every word keeps its platform's colour, taken in turn
  await page.evaluate((y) => window.scrollTo(0, y), y0 + 2000);
  await page.waitForTimeout(400);
  const colours = await lead.locator(".scroll-reveal-piece").evaluateAll((ps) => ps.map((p) => getComputedStyle(p).color));
  const inks = ["rgb(254, 44, 85)", "rgb(225, 48, 108)", "rgb(255, 0, 0)", "rgb(8, 102, 255)", "rgb(10, 102, 194)"];
  colours.forEach((c, i) => expect(c).toBe(inks[i % inks.length]));
});
