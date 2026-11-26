import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Chowderr (2026-11-26): on a phone the beta form should never need scrolling. Every
 * screen fits, and Next takes you to the next questions until it's done. This walks all
 * eleven screens on a small, a mid and a large phone and fails if any screen scrolls.
 */
const PHONES = [
  { name: "small phone (360 x 640)", width: 360, height: 640 },
  { name: "iPhone SE (375 x 667)", width: 375, height: 667 },
  { name: "iPhone 15 (390 x 844)", width: 390, height: 844 },
  { name: "large phone (430 x 932)", width: 430, height: 932 },
];

/** The answer each screen needs before Next, in order. */
const ANSWERS: ((f: Locator) => Promise<void>)[] = [
  async (f) => {
    await f.getByLabel("Your name").fill("Ava Reyes");
    await f.getByLabel("Email").fill("ava@studio.co");
  },
  (f) => f.getByLabel("Editing agency", { exact: true }).check(),
  (f) => f.getByLabel("2 to 5", { exact: true }).check(),
  (f) => f.getByLabel("Podcasts", { exact: true }).check(),
  async () => {},
  (f) => f.getByLabel("5 to 20 hours", { exact: true }).check(),
  (f) => f.getByLabel("A rented server", { exact: true }).check(),
  async () => {},
  (f) => f.getByLabel("Cut out silences", { exact: true }).check(),
  async () => {},
  async () => {},
];

async function fits(page: Page) {
  return page.evaluate(() => {
    const dialog = document.querySelector("dialog[open]")!;
    const body = dialog.querySelector(".ea-body")!;
    const nav = dialog.querySelector(".ea-nav")!.getBoundingClientRect();
    return {
      bodyOverflow: body.scrollHeight - body.clientHeight,
      dialogOverflow: dialog.scrollHeight - dialog.clientHeight,
      navOnScreen: nav.bottom <= innerHeight + 1,
      fullScreen: Math.abs(dialog.getBoundingClientRect().height - innerHeight) <= 1,
    };
  });
}

for (const phone of PHONES) {
  test(`every beta form screen fits a ${phone.name} with no scrolling`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: phone.width, height: phone.height }, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    await page.goto("/#early");
    const form = page.locator("dialog[open] form");
    await expect(form).toBeVisible();
    for (let i = 0; i < ANSWERS.length; i++) {
      await expect(form.getByText(`${i + 1} of ${ANSWERS.length}`)).toBeVisible();
      expect(await fits(page), `screen ${i + 1}`).toEqual({ bodyOverflow: 0, dialogOverflow: 0, navOnScreen: true, fullScreen: true });
      await ANSWERS[i](form);
      if (i < ANSWERS.length - 1) await form.getByRole("button", { name: "Next" }).click();
    }
    await expect(form.getByRole("button", { name: "Join the beta" })).toBeVisible();
    await context.close();
  });
}
