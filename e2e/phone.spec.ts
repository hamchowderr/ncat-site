import { expect, test } from "@playwright/test";

/** The home page on a phone: shorter, with recordings large enough to read and the card rows swiped sideways. */
test.describe("home page on a phone", () => {
  test.skip(({ isMobile }) => !isMobile, "phone layout only");

  test("feature cards and 'Also in the dashboard' are swipe rows, one card at a time with the next peeking in", async ({ page }) => {
    await page.goto("/");
    const vw = page.viewportSize()!.width;
    for (const sel of ["#features .tiles", "#around .tiles", "#around .also"]) {
      const row = page.locator(sel);
      await row.scrollIntoViewIfNeeded();
      const style = await row.evaluate((el) => {
        const s = getComputedStyle(el);
        return { display: s.display, overflowX: s.overflowX, snap: s.scrollSnapType };
      });
      expect(style, sel).toEqual({ display: "flex", overflowX: "auto", snap: "x mandatory" });
      const cards = row.locator(":scope > *");
      const first = (await cards.first().boundingBox())!;
      const second = (await cards.nth(1).boundingBox())!;
      // the first card fills most of the screen and the next one starts inside it, so there is clearly more
      expect(first.width / vw, sel).toBeGreaterThan(0.75);
      expect(first.width / vw, sel).toBeLessThan(0.92);
      expect(second.x, sel).toBeLessThan(vw);
      // the cards sit side by side, not stacked (a card still fading in may sit a few pixels low)
      expect(Math.abs(second.y - first.y), sel).toBeLessThan(40);
      // and the row really scrolls sideways
      const before = await row.evaluate((el) => el.scrollLeft);
      await row.evaluate((el) => el.scrollBy({ left: el.clientWidth, behavior: "instant" as ScrollBehavior }));
      await expect.poll(() => row.evaluate((el) => el.scrollLeft), { message: sel }).toBeGreaterThan(before);
    }
    // the page itself never scrolls sideways
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  });

  test("recordings are cropped to the working area so the dashboard reads larger", async ({ page }) => {
    await page.goto("/");
    const v = page.locator("#templates .shot video");
    await v.scrollIntoViewIfNeeded();
    await expect.poll(() => v.evaluate((x: HTMLVideoElement) => x.videoWidth)).toBe(1600);
    const box = (await v.boundingBox())!;
    // a square frame showing the 16:10 recording at its full height: 1.6 times the scale it had shown whole
    expect(Math.abs(box.width - box.height)).toBeLessThan(2);
    const scale = box.height / 1000;
    const wholeScale = box.width / 1600;
    expect(scale / wholeScale).toBeGreaterThan(1.55);
    // the side menu is cropped off: the frame is focused on the right-hand part of the window
    expect(await v.evaluate((x) => getComputedStyle(x).objectPosition)).toBe("80% 50%");
  });

  test("each feature keeps its paragraph but drops the tick list, and the page is far shorter", async ({ page }) => {
    await page.goto("/");
    for (const id of ["templates", "runs", "review", "editors"]) {
      const row = page.locator(`#${id}`);
      await expect(row.locator(".row-text > p").first()).toBeVisible();
      await expect(row.locator(".ticks")).toBeHidden();
    }
    // the phone page used to run about 26,000px; with the engine gone and the swipe rows it is well under 20,000
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(h).toBeLessThan(20000);
  });
});

test("a wide screen keeps the stacked tiles, whole-window recordings and tick lists", async ({ page, isMobile }) => {
  test.skip(isMobile, "wide screen only");
  await page.goto("/");
  const tiles = page.locator("#features .tiles");
  await tiles.scrollIntoViewIfNeeded();
  expect(await tiles.evaluate((el) => getComputedStyle(el).display)).toBe("grid");
  expect(await page.locator("#around .also").evaluate((el) => getComputedStyle(el).display)).toBe("grid");
  const v = page.locator("#features .tiles .shot video").first();
  const box = (await v.boundingBox())!;
  expect(Math.abs(box.width / box.height - 16 / 10)).toBeLessThan(0.02);
  await expect(page.locator(".story-row .ticks").first()).toBeAttached();
  expect(await page.locator(".story-row .ticks").first().evaluate((el) => getComputedStyle(el).display)).not.toBe("none");
});
