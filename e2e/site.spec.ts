import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", h1: /Your content, organized and/ },
  { path: "/pricing", h1: "Pay once. Own your version." },
];

for (const { path, h1 } of pages) {
  test(`${path} renders without errors or sideways scroll`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(h1);
    await expect(page.locator("#early form")).toBeVisible();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    expect(errors).toEqual([]);
  });
}

test("every internal link points at a real page or section", async ({ page, request }) => {
  for (const path of ["/", "/pricing"]) {
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
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/pricing");
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
  const form = page.locator("#early form");
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

test("every logo and picture loads", async ({ page }) => {
  await page.goto("/");
  for (const img of await page.locator("img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0), { message: await img.getAttribute("src") ?? "" }).toBe(true);
  }
});

test("every feature is a dashboard recording, shown whole, the whole app window uncropped, all the same shape", async ({ page, request, isMobile }) => {
  await page.goto("/");
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
    expect(await img.evaluate((v) => getComputedStyle(v).boxShadow)).toBe("none");
    // and is a zoomed-in recording, not a shrunk whole screen
    await expect.poll(() => img.evaluate((v: HTMLVideoElement) => [v.videoWidth, v.videoHeight])).toEqual([1280, 800]);
  }
  for (const r of ratios) expect(Math.abs(r - 16 / 10)).toBeLessThan(0.02);
  for (const v of await shots.all()) {
    for (const attr of ["src", "poster"]) {
      const url = (await v.getAttribute(attr))!;
      expect((await request.get(url)).status(), url).toBe(200);
    }
    await expect(v).toHaveAttribute("aria-label", /^Screen recording: /);
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
  }
  for (const b of boxes) expect(b.height).toBeLessThanOrEqual(34);
  const logos = await page.locator(".feeds li").locator("svg, img").all();
  expect(logos).toHaveLength(9);
  for (const l of logos) {
    const b = (await l.boundingBox())!;
    expect(Math.round(b.width)).toBe(28);
    expect(Math.round(b.height)).toBe(28);
  }
  for (const li of await page.locator(".feeds li").all()) expect((await li.boundingBox())!.width).toBeLessThanOrEqual(34);
});

test("platform tiles keep the logo centred beside the name and formats", async ({ page }) => {
  await page.goto("/");
  for (const li of await page.locator(".plat-grid li").all()) {
    const logo = (await li.locator(".plat-logo").boundingBox())!;
    const text = (await li.locator(".plat-text").boundingBox())!;
    expect(Math.abs(logo.y + logo.height / 2 - (text.y + text.height / 2))).toBeLessThanOrEqual(2);
  }
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
  const tab = page.getByRole("tab", { name: "Podcast teams" });
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
  await expect(q.getByText("Automations run inside the dashboard")).toBeVisible();
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
  await expect(slogan).toHaveText("Social Media Ready");
  const s = (await slogan.boundingBox())!;
  const h = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  expect(s.y + s.height).toBeLessThanOrEqual(h.y);
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

test("big hero icons sit beside the headline, never on it, and move when hovered", async ({ page, isMobile }) => {
  await page.goto("/");
  const icons = page.locator(".hero-icons .hi");
  if (isMobile) {
    await expect(page.locator(".hero-icons")).toBeHidden();
    return;
  }
  await expect(icons).toHaveCount(6);
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
      const overlap = b.x < t.x + t.width && b.x + b.width > t.x && b.y < t.y + t.height && b.y + b.height > t.y;
      expect(overlap).toBe(false);
    }
  }
  await expect(icons).toHaveCount(6);
  for (const name of ["TikTok", "YouTube", "X", "Instagram", "LinkedIn", "Facebook"]) {
    const logo = page.locator(`.hi[data-platform="${name}"] svg`);
    const before = await logo.innerHTML();
    await logo.hover();
    await expect.poll(() => logo.innerHTML(), { message: name }).not.toBe(before);
  }
});
