import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", h1: "Your content, social media ready." },
  { path: "/pricing", h1: "Pay once. Own your version." },
  { path: "/about", h1: "Built for everyone who hit the same wall." },
];

/** On a phone the feature tiles are folded rows; open them all so every recording can be measured. */
async function openFolds(page: import("@playwright/test").Page) {
  await page.locator(".fold:not([data-open]) .fold-head").evaluateAll((bs) => bs.forEach((b) => (b as HTMLButtonElement).click()));
  await expect(page.locator(".fold:not([data-open])")).toHaveCount(0);
}

for (const { path, h1 } of pages) {
  test(`${path} renders without errors or sideways scroll`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
    await expect(page.locator(".early-cta a")).toBeVisible();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("every internal link points at a real page or section", async ({ page, request }) => {
  for (const path of ["/", "/pricing", "/about"]) {
    await page.goto(path);
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")!));
    for (const href of new Set(hrefs)) {
      if (/^https?:/.test(href)) continue;
      const [p, hash] = href.split("#");
      if (p) expect((await request.get(p)).status(), href).toBe(200);
      if (hash) {
        await page.goto(p || path);
        expect(await page.locator(`#${hash}`).count(), href).toBeGreaterThan(0);
      }
    }
  }
});

test("share image, icon, sitemap and robots are served", async ({ request }) => {
  for (const url of ["/opengraph-image", "/icon.svg", "/sitemap.xml", "/robots.txt"]) expect((await request.get(url)).status(), url).toBe(200);
  const map = await (await request.get("/sitemap.xml")).text();
  expect(map).toContain("/pricing");
  expect(map).toContain("/about");
});

test("unknown pages show the not-found page", async ({ page }) => {
  const res = await page.goto("/nope");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "That page isn’t here." })).toBeVisible();
});

test("navigation reaches pricing and back home", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await page.locator("#mnav").getByRole("link", { name: "Pricing" }).click();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
  } else {
    await expect(page.locator("#mnav")).toBeHidden();
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Pricing" }).click();
  }
  await expect(page).toHaveURL(/\/pricing$/);
  await page.locator("header .brand").click();
  await expect(page).toHaveURL(/\/$/);
});

/** Answers the required questions on the first three steps. */
async function answerFirstSteps(form: import("@playwright/test").Locator) {
  await form.getByLabel("Your name").fill("Ava Reyes");
  await form.getByLabel("Email").fill("ava@studio.co");
  await form.getByLabel("Editing agency", { exact: true }).check();
  await form.getByLabel("2 to 5", { exact: true }).check();
  await form.getByRole("button", { name: "Next" }).click();
  await form.getByLabel("Podcasts", { exact: true }).check();
  await form.getByLabel("5 to 20 hours", { exact: true }).check();
  await form.getByRole("button", { name: "Next" }).click();
  await form.getByLabel("A rented server", { exact: true }).check();
  await form.getByRole("button", { name: "Next" }).click();
}

test("early-access form checks each step, then sends", async ({ page }) => {
  await page.goto("/pricing");
  await page.locator(".early-cta").getByRole("link", { name: "Get early access" }).click();
  const form = page.locator("dialog[open] form");
  await form.getByRole("button", { name: "Next" }).click();
  await expect(form.getByText("Add your name.")).toBeVisible();
  await expect(form.getByRole("heading", { name: /About you/ })).toBeVisible();
  let sent: Record<string, unknown> = {};
  await page.route("**/api/early-access", async (r) => {
    sent = r.request().postDataJSON();
    await r.fulfill({ json: { ok: true } });
  });
  await answerFirstSteps(form);
  await expect(form.getByRole("heading", { name: /What to automate/ })).toBeVisible();
  await form.getByLabel("Cut out silences", { exact: true }).check();
  await form.getByRole("button", { name: "Join early access" }).click();
  await expect(page.getByRole("status")).toContainText("You’re on the list");
  expect(sent).toMatchObject({ role: "agency", teamSize: "2-5", content: ["podcasts"], hosting: "server", jobs: ["silences"] });
});

test("the hero plays real dashboard recordings", async ({ page, request }) => {
  await page.goto("/");
  const video = page.locator(".stage video");
  await expect(video).toHaveAttribute("src", "/media/live-run.mp4");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(1);
  await page.getByRole("tab", { name: "Or build your own" }).click();
  await expect(video).toHaveAttribute("src", "/media/agent-builds.mp4");
  for (const f of ["agent-builds", "live-run", "review", "outputs"]) {
    expect((await request.get(`/media/${f}.mp4`)).status(), f).toBe(200);
    expect((await request.get(`/media/${f}.jpg`)).status(), f).toBe(200);
  }
});

test("every logo and picture loads", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await openFolds(page);
  for (const img of await page.locator("img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0), { message: await img.getAttribute("src") ?? "" }).toBe(true);
  }
});

test("every feature is a dashboard recording, shown whole, the whole app window uncropped, all the same shape", async ({ page, request, isMobile }) => {
  await page.goto("/");
  if (isMobile) await openFolds(page);
  // on desktop the stack replaces the plain rows once it has loaded; measure the final ones
  if (!isMobile) await expect(page.locator("#features .scroll-stack")).toHaveCount(1);
  const shots = page.locator("#features .shot video");
  await expect(shots).toHaveCount(8);
  const ratios: number[] = [];
  for (const img of await shots.all()) {
    await img.scrollIntoViewIfNeeded();
    const box = (await img.boundingBox())!;
    ratios.push(box.width / box.height);
    const frame = (await img.locator("..").boundingBox())!;
    // the recording sits centred on its surface, with the same space on each side
    const left = box.x - frame.x;
    const right = frame.x + frame.width - (box.x + box.width);
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1.5);
    // no grey mat or padding around it: the recording is the surface
    expect(Math.abs(box.width - frame.width)).toBeLessThanOrEqual(1.5);
    expect(await img.locator("..").evaluate((f) => getComputedStyle(f).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
    // its rounded corners are cut with a clip-path, so no dark hairline shows round it while the story cards tilt
    expect(await img.evaluate((v) => getComputedStyle(v).clipPath)).toMatch(/^inset\(.*round/);
    // and is a recording made to be read at this size
    await expect.poll(() => img.evaluate((v: HTMLVideoElement) => [v.videoWidth, v.videoHeight])).toEqual([1600, 1000]);
  }
  for (const r of ratios) expect(Math.abs(r - 16 / 10)).toBeLessThan(0.02);
  // never cropped, on any screen
  for (const v of await shots.all()) expect(await v.evaluate((x) => getComputedStyle(x).objectFit)).not.toBe("cover");
  for (const v of await shots.all()) {
    for (const attr of ["src", "poster"]) {
      const url = (await v.getAttribute(attr))!;
      expect((await request.get(url)).status(), url).toBe(200);
    }
    await expect(v).toHaveAttribute("aria-label", /^Screen recording: /);
  }
});

test("each feature recording takes most of its row, alternating sides, so its text is readable", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await openFolds(page);
  for (const id of ["#features .tiles", "#around .tiles"]) {
    const tiles = page.locator(`${id} .tile`);
    const n = await tiles.count();
    if (!n) continue;
    const sides: string[] = [];
    for (let i = 0; i < n; i++) {
      const tile = tiles.nth(i);
      await tile.scrollIntoViewIfNeeded();
      const t = (await tile.boundingBox())!;
      const v = (await tile.locator(".shot video").boundingBox())!;
      if (isMobile) {
        expect(v.width / t.width).toBeGreaterThan(0.85);
      } else {
        expect(v.width / t.width, `${id} tile ${i}`).toBeGreaterThan(0.55);
        sides.push(v.x - t.x < t.width / 4 ? "left" : "right");
      }
    }
    if (!isMobile) for (let i = 1; i < sides.length; i++) expect(sides[i]).not.toBe(sides[i - 1]);
  }
});

test("a feature recording plays while it is on screen and pauses when scrolled away", async ({ page, isMobile }) => {
  await page.goto("/");
  // on wide screens the features swap to the scroll stack once the page is live
  if (!isMobile) await expect(page.locator("#features .scroll-stack")).toHaveCount(1);
  const v = page.locator("#review .shot video");
  await v.scrollIntoViewIfNeeded();
  await expect.poll(() => v.evaluate((x: HTMLVideoElement) => !x.paused && x.currentTime > 0), { timeout: 15_000 }).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(() => v.evaluate((x: HTMLVideoElement) => x.paused)).toBe(true);
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("feature recordings stay still and offer controls instead", async ({ page }) => {
    await page.goto("/");
    const v = page.locator("#review .shot video");
    await v.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    expect(await v.evaluate((x: HTMLVideoElement) => x.paused && x.controls)).toBe(true);
  });
});

test("event marks sit on one even row and platform logos are all the same size", async ({ page, isMobile }) => {
  await page.goto("/");
  const venues = await page.locator(".venues li").all();
  const boxes = await Promise.all(venues.map(async (v) => (await v.boundingBox())!));
  if (!isMobile) {
    for (const b of boxes) expect(Math.abs(b.y + b.height / 2 - (boxes[0].y + boxes[0].height / 2))).toBeLessThanOrEqual(1);
    // evenly spread: the middle event sits on the page's centre line and the gaps either side of it are equal
    const vw = page.viewportSize()!.width;
    expect(Math.abs(boxes[1].x + boxes[1].width / 2 - vw / 2)).toBeLessThanOrEqual(2);
    const gapLeft = boxes[1].x - (boxes[0].x + boxes[0].width);
    const gapRight = boxes[2].x - (boxes[1].x + boxes[1].width);
    expect(Math.abs(gapLeft - gapRight)).toBeLessThanOrEqual(2);
    expect(boxes[0].x).toBeGreaterThanOrEqual(0);
  } else {
    // stacked on a phone: every event centred under the heading
    for (const b of boxes) expect(Math.abs(b.x + b.width / 2 - page.viewportSize()!.width / 2)).toBeLessThanOrEqual(2);
  }
  for (const b of boxes) expect(b.height).toBeLessThanOrEqual(34);
  // each event mark in its own brand colour, not a shared grey
  const fills = await page.locator(".venues .mark").evaluateAll((ms) => ms.map((m) => getComputedStyle(m).fill));
  expect(fills).toEqual(["rgb(217, 119, 87)", "rgb(154, 96, 36)", "rgb(17, 17, 17)"]);
  const logos = await page.locator(".feeds li").locator("svg, img").all();
  expect(logos).toHaveLength(9);
  for (const l of logos) {
    const b = (await l.boundingBox())!;
    expect(Math.round(b.width)).toBe(28);
    expect(Math.round(b.height)).toBe(28);
  }
  for (const li of await page.locator(".feeds li").all()) expect((await li.boundingBox())!.width).toBeLessThanOrEqual(34);
});

test("every platform lives in the shape-changing clip, with no second grid of tiles below it", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".plat-grid")).toHaveCount(0);
  const tabs = page.locator(".shift-tabs [role=tab]");
  await expect(tabs).toHaveCount(8);
  // all eight logos fit in the panel without spilling out
  const panel = (await page.locator(".shift-side").boundingBox())!;
  for (const t of await tabs.all()) {
    const b = (await t.boundingBox())!;
    expect(b.x + b.width).toBeLessThanOrEqual(panel.x + panel.width + 1);
  }
  await page.getByRole("tab", { name: "Apple Podcasts" }).click();
  await expect(page.locator(".shift-formats")).toContainText("Episodes, chapters, transcripts");
  await expect(page.locator(".shift-ratio")).toHaveText("−16 LUFS");
});

test("every tab label fits inside its tab track, with nothing cut off", async ({ page }) => {
  await page.goto("/");
  for (const track of [page.locator(".stage-tabs"), page.locator(".seg")]) {
    await track.scrollIntoViewIfNeeded();
    expect(await track.evaluate((t) => t.scrollWidth - t.clientWidth)).toBe(0);
    const box = (await track.boundingBox())!;
    for (const tab of await track.getByRole("tab").all()) {
      const b = (await tab.boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(box.x - 0.5);
      expect(b.x + b.width).toBeLessThanOrEqual(box.x + box.width + 0.5);
      expect(await tab.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
    }
  }
});

test("use-case tabs switch panels", async ({ page }) => {
  await page.goto("/");
  const tab = page.getByRole("tab", { name: "Podcast Teams" });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel").filter({ hasText: "The call ends. The episode gets to work." })).toBeVisible();
});

test("each use case shows what goes in and what comes out as styled cards, logos small", async ({ page, isMobile }) => {
  await page.goto("/");
  const panel = page.getByRole("tabpanel").filter({ has: page.locator(".case-flow") });
  await panel.scrollIntoViewIfNeeded();
  const input = panel.locator(".case-in");
  // the input is a dark pill, not plain text
  expect(await input.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toMatch(/rgba?\(0, 0, 0, 0\)|transparent/);
  const outs = panel.locator(".case-outs li");
  await expect(outs).toHaveCount(4);
  // let the cards finish sliding in before measuring them
  await page.waitForTimeout(1200);
  const boxes = await Promise.all((await outs.all()).map((o) => o.boundingBox()));
  // two cards per row on wide screens, one per row on phones
  const rows = new Set(boxes.map((b) => Math.round(b!.y)));
  expect(rows.size).toBe(isMobile ? 4 : 2);
  for (const o of await outs.all()) {
    expect(await o.evaluate((el) => getComputedStyle(el).display)).toBe("flex");
    for (const logo of await o.locator(".case-logos svg, .case-logos img").all()) expect((await logo.boundingBox())!.width).toBeLessThanOrEqual(20);
  }
});

test("the FAQ opens and closes", async ({ page }) => {
  await page.goto("/");
  const q = page.locator("details").filter({ hasText: "Do I need n8n?" });
  await q.locator("summary").click();
  await expect(q.getByText(/Automations run inside the shell itself/)).toBeVisible();
  await expect(q).toHaveAttribute("open", "");
  await q.locator("summary").click();
  await expect(q).not.toHaveAttribute("open", "");
});

test("the FAQ is one centred column with no boxes, and the footer has nothing under it", async ({ page }) => {
  await page.goto("/");
  const list = page.locator(".faq-list");
  await list.scrollIntoViewIfNeeded();
  const box = (await list.boundingBox())!;
  const vw = page.viewportSize()!.width;
  expect(Math.abs(box.x + box.width / 2 - vw / 2)).toBeLessThan(4);
  const first = list.locator("details").first();
  await expect(first).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  const q = (await first.locator("summary").boundingBox())!;
  expect(q.height).toBeGreaterThanOrEqual(56);
  const foot = page.locator("footer.foot");
  await expect(foot.locator(".legal")).toHaveCount(0);
  await expect(foot).not.toContainText("demo data");
  await expect(foot.getByRole("link", { name: "Instagram" })).toBeVisible();
  expect(await page.evaluate(() => document.scrollingElement!.scrollWidth > innerWidth + 1)).toBe(false);
});

test("motion is skipped for people who turn it off", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForTimeout(3000);
  await expect(page.locator(".rot-word")).toHaveText("clipped");
  const video = page.locator(".stage video");
  await expect(video).toHaveAttribute("controls", "");
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test("the slogan sits above the headline", async ({ page }) => {
  await page.goto("/");
  const slogan = page.locator(".hero .slogan");
  await expect(slogan).toContainText("automatically");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Your content, social media ready.");
  const s = (await slogan.boundingBox())!;
  const h = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  expect(s.y + s.height).toBeLessThanOrEqual(h.y);
  // one line that fits the screen, even with the longest rotating word
  await expect(slogan.locator(".rot-word")).toHaveText("transcribed", { timeout: 9000 });
  const t = (await slogan.boundingBox())!;
  expect(t.height).toBeLessThan(40);
  expect(t.x + t.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test("features stack as cards while you scroll on a wide screen", async ({ page, isMobile }) => {
  test.skip(isMobile, "the stack is for wide screens; phones get plain rows");
  await page.goto("/");
  await expect(page.locator("#features .scroll-stack")).toHaveCount(1);
  await expect(page.locator("#features .story-card")).toHaveCount(4);
  const first = page.locator("#features .story-card").first();
  await page.locator("#features .story-card").nth(1).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(800);
  // the first card stays pinned near the top while the next one slides over it
  const top = (await first.boundingBox())!.y;
  expect(top).toBeGreaterThan(40);
  expect(top).toBeLessThan(200);
});

test("sections fade in as they come into view", async ({ page }) => {
  await page.goto("/");
  const head = page.locator("#use-cases .sec-head");
  await head.scrollIntoViewIfNeeded();
  await expect.poll(() => head.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.95);
});

test.describe("with reduced motion, nothing waits to appear", () => {
  test.use({ reducedMotion: "reduce" });
  test("features are plain rows and every section is already visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#features .scroll-stack")).toHaveCount(0);
    for (const sel of ["#features .sec-head", "#use-cases .sec-head", ".steps .step-in"]) {
      const el = page.locator(sel).first();
      expect(await el.evaluate((e) => Number(getComputedStyle(e).opacity)), sel).toBe(1);
    }
  });
});

test("the line under the headline fills in as you scroll", async ({ page, isMobile }) => {
  await page.goto("/");
  // let the page settle: on wide screens the features swap to the scroll stack once it is live
  if (!isMobile) await expect(page.locator("#features .scroll-stack")).toHaveCount(1);
  await expect.poll(() => page.locator(".hero-sub .fw.on").count()).toBeGreaterThan(0);
  const words = page.locator(".hero-sub .fw");
  const total = await words.count();
  const lit = () => page.locator(".hero-sub .fw.on").count();
  const before = await lit();
  expect(before).toBeGreaterThan(0);
  expect(before).toBeLessThan(total / 4);
  await expect(page.locator(".hero-sub .hl.on")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo({ top: 120, behavior: "instant" }));
  await expect.poll(lit).toBeGreaterThan(before);
  await page.evaluate(() => window.scrollTo({ top: 700, behavior: "instant" }));
  await expect.poll(lit).toBe(total);
  await expect(page.locator(".hero-sub .hl.on")).toHaveCount(4);
});

test("social logos rain down beside the headline, never across it, and move when hovered", async ({ page, isMobile }) => {
  await page.goto("/");
  const icons = page.locator(".hero-icons .hi");
  if (isMobile) {
    await expect(page.locator(".hero-icons")).toBeHidden();
    return;
  }
  await expect(icons).toHaveCount(12);
  await page.waitForTimeout(1500);
  // the boxes of the words themselves, not of the full-width blocks they sit in
  const text = await page.evaluate(() => {
    const boxes: { x: number; y: number; width: number; height: number }[] = [];
    for (const el of document.querySelectorAll(".hero h1, .hero-sub, .slogan")) {
      const range = document.createRange();
      range.selectNodeContents(el);
      for (const r of range.getClientRects()) boxes.push({ x: r.x, y: r.y, width: r.width, height: r.height });
    }
    for (const el of document.querySelectorAll(".hero-cta .btn")) {
      const r = el.getBoundingClientRect();
      boxes.push({ x: r.x, y: r.y, width: r.width, height: r.height });
    }
    return boxes;
  });
  for (const icon of await icons.all()) {
    const b = (await icon.locator("svg").boundingBox())!;
    for (const t of text) {
      // they fall the whole height, so their lane must stay clear of every line of text
      const overlap = b.x < t.x + t.width && b.x + b.width > t.x;
      expect(overlap).toBe(false);
    }
  }
  await expect(icons).toHaveCount(12);
  // they keep falling
  const first = icons.first();
  const y0 = (await first.boundingBox())!.y;
  await page.waitForTimeout(800);
  expect((await first.boundingBox())!.y).toBeGreaterThan(y0);
  for (const name of ["TikTok", "YouTube", "X", "Instagram", "LinkedIn", "Facebook"]) {
    const drop = page.locator(`.hi[data-platform="${name}"]`).first();
    const logo = drop.locator("svg");
    const before = await logo.innerHTML();
    // a falling logo may be above or below the visible band right now, so point at it directly
    await drop.dispatchEvent("pointerenter");
    await expect.poll(() => logo.innerHTML(), { message: name }).not.toBe(before);
  }
});

test("the newer features each show a whole-window recording that plays on screen, with real app logos", async ({ page, request, isMobile }) => {
  await page.goto("/");
  if (isMobile) await openFolds(page);
  const section = page.getByRole("region", { name: "Everything around the clip, too" });
  const shots = section.locator(".shot video");
  await expect(shots).toHaveCount(6);
  for (const v of await shots.all()) {
    await v.scrollIntoViewIfNeeded();
    await expect.poll(() => v.evaluate((x: HTMLVideoElement) => [x.videoWidth, x.videoHeight])).toEqual([1600, 1000]);
    const box = (await v.boundingBox())!;
    expect(Math.abs(box.width / box.height - 16 / 10)).toBeLessThan(0.02);
    for (const attr of ["src", "poster"]) {
      const url = (await v.getAttribute(attr))!;
      expect((await request.get(url)).status(), url).toBe(200);
    }
    await expect(v).toHaveAttribute("aria-label", /^Screen recording: /);
  }
  const zoom = section.locator(".shot video").first();
  await zoom.scrollIntoViewIfNeeded();
  await expect.poll(() => zoom.evaluate((x: HTMLVideoElement) => !x.paused && x.currentTime > 0), { timeout: 15_000 }).toBe(true);
  // every app chip carries a drawn mark, and none renders at zero size
  for (const mark of await section.locator(".logo-chips li .bi, .logo-chips li .fl, .also-logos .bi").all()) {
    const b = (await mark.boundingBox())!;
    expect(b.width).toBeGreaterThan(14);
    expect(b.height).toBeGreaterThan(14);
  }
  await expect(section.getByRole("list", { name: "Also in the dashboard" }).getByRole("listitem")).toHaveCount(5);
  // the meeting apps sit side by side, Microsoft Teams next to Google Meet, each chip only as wide as its name
  const meet = section.getByRole("list", { name: /Meeting recordings.*: apps/ });
  const chips = await Promise.all(["Zoom", "Google Meet", "Microsoft Teams"].map((n) => meet.getByRole("listitem").filter({ hasText: n }).boundingBox()));
  if ((page.viewportSize()?.width ?? 0) >= 900) {
    expect(Math.abs(chips[2]!.y - chips[1]!.y)).toBeLessThan(2);
    expect(chips[2]!.x).toBeGreaterThan(chips[1]!.x + chips[1]!.width);
  }
  expect(chips[0]!.width).toBeLessThan(chips[2]!.width);
  // the AI apps sit in one row too
  const ai = section.getByRole("list", { name: /AI apps you already use: apps/ }).getByRole("listitem");
  if ((page.viewportSize()?.width ?? 0) >= 900) {
    const ys = await ai.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(new Set(ys).size).toBe(1);
  }
  expect(await page.evaluate(() => document.scrollingElement!.scrollWidth > innerWidth + 1)).toBe(false);
});

test("the engine section lives on the About page, not the home page", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#engine")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Free engine. Fine-tuned shell." })).toHaveCount(0);
  await page.goto("/about");
  await expect(page.locator("#engine")).toHaveCount(1);
});

test("the engine section lays the five ways on one rail, ending on the shell, with nothing overflowing", async ({ page, isMobile }) => {
  await page.goto("/about");
  const ways = page.locator(".ways");
  await ways.scrollIntoViewIfNeeded();
  await expect(page.getByRole("heading", { name: "Free engine. Fine-tuned shell." })).toBeVisible();
  const items = ways.locator(".ways-list > li");
  await expect(items).toHaveCount(5);
  await expect(items.last()).toHaveClass(/ours/);
  await expect(items.last()).toContainText("Kontifi, the fine-tuned shell");
  const boxes = await Promise.all((await items.all()).map((i) => i.boundingBox()));
  if (isMobile) {
    // one under another on a phone
    for (let i = 1; i < boxes.length; i++) expect(boxes[i]!.y).toBeGreaterThan(boxes[i - 1]!.y);
  } else {
    // side by side on a wide screen, left to right
    for (let i = 1; i < boxes.length; i++) expect(boxes[i]!.x).toBeGreaterThan(boxes[i - 1]!.x);
  }
  for (const item of await items.all()) expect(await item.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
});

test("the Editing with AI tab says what it costs today and what changes", async ({ page }) => {
  await page.goto("/");
  const tab = page.getByRole("tab", { name: "Editing With AI" });
  await tab.scrollIntoViewIfNeeded();
  await tab.click();
  const panel = page.locator("#case-panel");
  await expect(panel).toContainText("Stop spending your AI limits on the same edit.");
  await expect(panel.locator(".case-without")).toContainText("Without Kontifi");
  await expect(panel.locator(".case-outs li")).toHaveCount(4);
});

test("the FAQ answers what you pay for when the toolkit is free", async ({ page }) => {
  await page.goto("/");
  const q = page.getByText("If the NCA Toolkit is free, what am I paying for?");
  await q.scrollIntoViewIfNeeded();
  await q.click();
  await expect(page.getByText(/You never pay for the processing itself/)).toBeVisible();
});

test("the About page is in the menu and tells the five chapters", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: /menu/i }).click();
  await page.getByRole("navigation", { name: isMobile ? "Menu" : "Main" }).getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator(".chapter")).toHaveCount(5);
  await page.locator(".chapter-shell").scrollIntoViewIfNeeded();
  await expect(page.locator(".chapter-shell h3")).toBeVisible();
});

test("the how-it-works section says use AI once, not on every video, and ends ready or handed off", async ({ page }) => {
  await page.goto("/");
  const how = page.locator("#how-it-works");
  await how.scrollIntoViewIfNeeded();
  await expect(how.getByRole("heading", { level: 2 })).toHaveText("Use AI once. Not on every video.");
  await expect(how.locator(".steps li")).toHaveCount(3);
  await expect(how.locator(".step-ends span")).toHaveText(["Ready to post", "Ready for your editor"]);
  const box = await how.locator(".step-ends").boundingBox();
  const vw = page.viewportSize()!.width;
  expect(box!.x + box!.width).toBeLessThanOrEqual(vw);
});

test("the feeds section shows the agent badge and the brand every clip carries, inside the screen", async ({ page }) => {
  await page.goto("/");
  const sec = page.locator(".platforms");
  await sec.scrollIntoViewIfNeeded();
  await expect(sec.locator(".agent-badge")).toBeVisible();
  await expect(sec.locator(".agent-badge svg.lucide-bot")).toBeVisible();
  await expect(sec.locator(".shift-brand li")).toHaveCount(4);
  await expect(sec.locator(".shift-cap")).toBeVisible();
  const frame = (await sec.locator(".shift-frame").boundingBox())!;
  const team = (await sec.locator(".shift-team").boundingBox())!;
  const plat = (await sec.locator(".shift-logo").boundingBox())!;
  expect(team.x - frame.x).toBeLessThan(frame.width / 4);
  expect(frame.x + frame.width - (plat.x + plat.width)).toBeLessThan(frame.width / 4);
  const vw = page.viewportSize()!.width;
  for (const li of await sec.locator(".shift-brand li").all()) {
    const b = (await li.boundingBox())!;
    expect(b.x + b.width).toBeLessThanOrEqual(vw);
  }
});

test("the early-access form asks a flood from one address to wait", async ({ page }) => {
  await page.goto("/");
  // Six quick sign-ups from one browser, through the real route: the sixth waits.
  // Each run is its own visitor, so the desktop, phone and retry runs don't share an allowance.
  const address = `198.51.100.${Math.floor(Math.random() * 250) + 1}-${Date.now()}`;
  const statuses = await page.evaluate(async (from) => {
    const seen: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await fetch("/api/early-access", { method: "POST", headers: { "content-type": "application/json", "x-real-ip": from }, body: "{}" });
      seen.push(res.status);
    }
    return seen;
  }, address);
  expect(statuses.slice(0, 5).every((status) => status !== 429)).toBe(true);
  expect(statuses[5]).toBe(429);
});
