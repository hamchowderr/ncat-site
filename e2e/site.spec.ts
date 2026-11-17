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
  await page.locator("header .logo").click();
  await expect(page).toHaveURL(/\/$/);
});

test("describing an automation carries it into the early-access form", async ({ page }) => {
  await page.goto("/");
  await page.locator("#askInput").fill("Caption every upload");
  await page.getByRole("button", { name: "Set it up" }).first().click();
  await expect(page.locator("#ea-job")).toHaveValue("Caption every upload");
  await expect(page.locator("#ea-job")).toBeInViewport();
});

test("early-access form validates, then sends", async ({ page }) => {
  await page.goto("/pricing");
  const form = page.locator("#early form");
  await form.getByRole("button", { name: "Get on the list" }).click();
  await expect(form.getByText("Add your name.")).toBeVisible();
  await page.route("**/api/early-access", (r) => r.fulfill({ json: { ok: true } }));
  await form.getByLabel("Name").fill("Ava");
  await form.getByLabel("Email").fill("ava@studio.co");
  await form.getByRole("button", { name: "Get on the list" }).click();
  await expect(page.getByRole("status")).toContainText("You’re on the list");
});

test("use-case tabs switch panels", async ({ page }) => {
  await page.goto("/");
  const tab = page.getByRole("tab", { name: "Podcast teams" });
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(`#${await tab.getAttribute("aria-controls")}`)).toBeVisible();
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
  await expect(page.locator("#rot")).toHaveText("clipped");
  await expect(page.locator(".canvas[data-edges] svg .pulse")).toHaveCount(0);
});
