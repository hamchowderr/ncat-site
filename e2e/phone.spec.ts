import { expect, test } from "@playwright/test";

/** The home page on a phone: its own layout, with nothing that scrolls sideways. */
test.describe("home page on a phone", () => {
  test.skip(({ isMobile }) => !isMobile, "phone layout only");

  test("nothing on the page scrolls sideways", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
    const sideways = await page.evaluate(() =>
      [...document.querySelectorAll("main *")]
        .filter((e) => /auto|scroll/.test(getComputedStyle(e).overflowX) && e.scrollWidth > e.clientWidth + 2)
        .map((e) => e.className),
    );
    expect(sideways).toEqual([]);
  });

  test("one recording in shows the finished clips large, the wide one on top and the tall ones two to a row", async ({ page }) => {
    await page.goto("/");
    const split = page.locator(".split");
    await expect(split).not.toHaveClass(/is-live/);
    const vw = page.viewportSize()!.width;
    const clips = page.locator(".split-clip");
    await expect(clips).toHaveCount(5);
    await clips.first().scrollIntoViewIfNeeded();
    const boxes = await Promise.all((await clips.all()).map((c) => c.boundingBox()));
    // LinkedIn spans the stage; the four tall clips are each almost half the screen wide
    expect(boxes[0]!.width / vw).toBeGreaterThan(0.8);
    for (const b of boxes.slice(1)) expect(b!.width / vw).toBeGreaterThan(0.38);
    // two to a row, side by side, tops level
    expect(Math.abs(boxes[1]!.y - boxes[2]!.y)).toBeLessThan(2);
    expect(boxes[2]!.x).toBeGreaterThan(boxes[1]!.x + boxes[1]!.width);
    expect(boxes[3]!.y).toBeGreaterThan(boxes[1]!.y + boxes[1]!.height);
    // each names its platform beside its logo
    for (const d of await page.locator(".split-dest").all()) {
      await expect(d.locator(".split-ready")).toBeVisible();
      await expect(d.locator(".split-logo")).toBeVisible();
    }
    // and the clips play while they are on screen
    const v = page.locator(".split-video").nth(1);
    await v.scrollIntoViewIfNeeded();
    await expect.poll(() => v.evaluate((x: HTMLVideoElement) => !x.paused && x.currentTime > 0), { timeout: 15_000 }).toBe(true);
    // the section is not a long pinned scroll
    const [h, vh] = await page.evaluate(() => [document.querySelector<HTMLElement>(".split")!.offsetHeight, window.innerHeight]);
    expect(h).toBeLessThan(vh * 3);
  });

  test("the feature tiles are one list of rows that open one by one, the first already open", async ({ page }) => {
    await page.goto("/");
    for (const sel of ["#features .tiles", "#around .tiles"]) {
      const heads = page.locator(`${sel} .fold-head`);
      const n = await heads.count();
      expect(n, sel).toBeGreaterThan(3);
      await expect(heads.first()).toHaveAttribute("aria-expanded", "true");
      for (let i = 1; i < n; i++) await expect(heads.nth(i)).toHaveAttribute("aria-expanded", "false");
      // a closed row hides its recording; opening it shows the whole-window recording and its words
      const second = page.locator(`${sel} .fold`).nth(1);
      await expect(second.locator(".shot video")).toBeHidden();
      await heads.nth(1).click();
      await expect(heads.nth(1)).toHaveAttribute("aria-expanded", "true");
      await expect(second.locator(".shot video")).toBeVisible();
      await expect(second.locator(".tile p")).toBeVisible();
      const b = (await second.locator(".shot video").boundingBox())!;
      expect(Math.abs(b.width / b.height - 16 / 10)).toBeLessThan(0.02);
      // and closes again
      await heads.nth(1).click();
      await expect(second.locator(".shot video")).toBeHidden();
      // the rows sit one under another
      const ys = await heads.evaluateAll((hs) => hs.map((h) => h.getBoundingClientRect().top));
      for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThan(ys[i - 1]!);
    }
  });

  test("each recording has a Watch full screen button, and the four main features drop their tick lists", async ({ page }) => {
    await page.goto("/");
    const row = page.locator("#templates");
    await row.scrollIntoViewIfNeeded();
    const btn = row.getByRole("button", { name: "Watch full screen" });
    await expect(btn).toBeVisible();
    const v = (await row.locator(".shot video").boundingBox())!;
    const b = (await btn.boundingBox())!;
    // under the recording, never on top of it
    expect(b.y).toBeGreaterThanOrEqual(v.y + v.height);
    for (const id of ["templates", "runs", "review", "editors"]) {
      await expect(page.locator(`#${id} .row-text > p`).first()).toBeVisible();
      await expect(page.locator(`#${id} .ticks`)).toBeHidden();
    }
  });
});

test("a wide screen keeps the scroll scene, the tiles in full and no fold rows or full-screen buttons", async ({ page, isMobile }) => {
  test.skip(isMobile, "wide screen only");
  await page.goto("/");
  await expect(page.locator(".split.is-live")).toHaveCount(1);
  await expect(page.locator(".fold-head").first()).toBeHidden();
  await expect(page.getByRole("button", { name: "Watch full screen" }).first()).toBeHidden();
  const tiles = page.locator("#features .tiles");
  await tiles.scrollIntoViewIfNeeded();
  expect(await tiles.evaluate((el) => getComputedStyle(el).display)).toBe("grid");
  for (const v of await page.locator("#features .tiles .shot video").all()) await expect(v).toBeVisible();
  expect(await page.locator(".story-row .ticks").first().evaluate((el) => getComputedStyle(el).display)).not.toBe("none");
});
