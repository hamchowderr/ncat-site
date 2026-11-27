import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Chowderr (2026-11-26): on a phone the beta form should never need scrolling. Every
 * screen fits, and Next takes you to the next questions until it's done. This walks all
 * eleven screens on four phones and fails if any screen scrolls, or if the buttons sit
 * far below the questions (2026-11-26: "It does not need to be a giant gap"), or if the
 * pop-up leaves an empty half-screen under the buttons (2026-11-26, a screenshot of it).
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
  // let the pop-up's entrance slide finish before measuring where it sits
  await page.waitForFunction(() => document.querySelector("dialog[open]")!.getAnimations({ subtree: true }).every((a) => a.playState !== "running"));
  return page.evaluate(() => {
    const dialog = document.querySelector("dialog[open]")!;
    const body = dialog.querySelector(".ea-body")!;
    const nav = dialog.querySelector(".ea-nav")!.getBoundingClientRect();
    const lastQuestion = [...body.children].at(-1)!.getBoundingClientRect();
    return {
      // Back / Next sit right under the questions, not at the bottom of the screen
      gapAboveButtons: nav.top - lastQuestion.bottom <= 48,
      bodyOverflow: body.scrollHeight - body.clientHeight,
      dialogOverflow: dialog.scrollHeight - dialog.clientHeight,
      navOnScreen: nav.bottom <= innerHeight + 1,
      // a sheet along the bottom, only as tall as what it holds: no empty space under the buttons
      atBottom: Math.abs(dialog.getBoundingClientRect().bottom - innerHeight) <= 1,
      noSpaceBelowButtons: dialog.getBoundingClientRect().bottom - nav.bottom <= 40,
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
      expect(await fits(page), `screen ${i + 1}`).toEqual({ gapAboveButtons: true, bodyOverflow: 0, dialogOverflow: 0, navOnScreen: true, atBottom: true, noSpaceBelowButtons: true });
      await ANSWERS[i](form);
      if (i < ANSWERS.length - 1) await form.getByRole("button", { name: "Next" }).click();
    }
    await expect(form.getByRole("button", { name: "Join the beta" })).toBeVisible();
    await context.close();
  });
}
