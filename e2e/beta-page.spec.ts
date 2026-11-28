import { expect, test } from "@playwright/test";

test("the beta page renders without errors or sideways scroll", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/beta");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Help build Takewon.");
  await expect(page.locator("#early form.ea")).toBeVisible();
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  expect(errors).toEqual([]);
});

test("Apply for the beta brings the form into view, with no pop-up", async ({ page }) => {
  await page.goto("/beta");
  await page.getByRole("link", { name: "Apply for the beta" }).click();
  await expect(page.locator("#early")).toBeInViewport();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await expect(page.getByLabel(/name/i).first()).toBeVisible();
});

test("arriving at /beta#early lands on the form", async ({ page }) => {
  await page.goto("/beta#early");
  await expect(page.locator("#early")).toBeInViewport();
});

test("the form on the beta page takes the first step", async ({ page }) => {
  await page.goto("/beta#early");
  const form = page.locator("#early form.ea");
  await form.getByRole("button", { name: /next|continue/i }).first().click();
  // an empty first step says what is missing instead of moving on
  await expect(form.locator(".ea-err").first()).toBeVisible();
});

test("every link on the beta page points at a real page or section", async ({ page, request }) => {
  await page.goto("/beta");
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")!));
  for (const href of new Set(hrefs)) {
    if (/^(https?|mailto):/.test(href)) continue;
    const [p, hash] = href.split("#");
    if (p) expect((await request.get(p)).status(), href).toBe(200);
    if (hash && !p) expect(await page.locator(`#${hash}`).count(), href).toBeGreaterThan(0);
  }
});

test("the beta page cards sit side by side on wide screens and stack on phones", async ({ page, isMobile }) => {
  await page.goto("/beta");
  const cols = await page.locator(".beta-after").evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
  expect(cols).toBe(isMobile ? 1 : 4);
});
