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

test("describing an automation carries it into the early-access form", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Describe an automation").fill("Caption every upload in /Raw");
  await page.getByRole("button", { name: "Set it up" }).click();
  const form = page.locator("#early form");
  await expect(form).toBeInViewport();
  await answerFirstSteps(form);
  await expect(form.getByLabel(/The first automation you’d want/)).toHaveValue("Caption every upload in /Raw");
});

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
  await expect(video).toHaveAttribute("src", "/media/agent-builds.mp4");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(1);
  await page.getByRole("tab", { name: "It runs by itself" }).click();
  await expect(video).toHaveAttribute("src", "/media/live-run.mp4");
  for (const f of ["agent-builds", "live-run", "review", "outputs"]) {
    expect((await request.get(`/media/${f}.mp4`)).status(), f).toBe(200);
    expect((await request.get(`/media/${f}.jpg`)).status(), f).toBe(200);
  }
});

test("every logo and screenshot loads", async ({ page }) => {
  await page.goto("/");
  for (const img of await page.locator("img").all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0), { message: await img.getAttribute("src") ?? "" }).toBe(true);
  }
});

test("every dashboard screen is shown whole, in the same shape and frame", async ({ page }) => {
  await page.goto("/");
  const shots = page.locator("#features .shot img");
  await expect(shots).toHaveCount(8);
  const ratios: number[] = [];
  for (const img of await shots.all()) {
    await img.scrollIntoViewIfNeeded();
    const box = (await img.boundingBox())!;
    ratios.push(box.width / box.height);
    const frame = (await img.locator("..").boundingBox())!;
    // the screen sits centred on its mat, with the same space on each side
    const left = box.x - frame.x;
    const right = frame.x + frame.width - (box.x + box.width);
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1.5);
  }
  for (const r of ratios) expect(Math.abs(r - ratios[0])).toBeLessThan(0.02);
});

test("platform tiles keep the logo centred beside the name and formats", async ({ page }) => {
  await page.goto("/");
  for (const li of await page.locator(".plat-grid li").all()) {
    const logo = (await li.locator(".plat-logo").boundingBox())!;
    const text = (await li.locator(".plat-text").boundingBox())!;
    expect(Math.abs(logo.y + logo.height / 2 - (text.y + text.height / 2))).toBeLessThanOrEqual(2);
  }
});

test("use-case tabs switch panels", async ({ page }) => {
  await page.goto("/");
  const tab = page.getByRole("tab", { name: "Podcast teams" });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel").filter({ hasText: "Every episode, handled the same way." })).toBeVisible();
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
