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

  test("one recording in still plays by the scroll, with the stage given the whole screen so the finished clips come out large", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".split.is-live")).toHaveCount(1);
    const vh = page.viewportSize()!.height;
    // jump to the end of the scene and let it ease in
    await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>(".split")!;
      const top = el.getBoundingClientRect().top + scrollY;
      scrollTo(0, top + (el.offsetHeight - innerHeight) * 0.86);
    });
    const stage = page.locator(".split-stage");
    // only the stage is pinned: the headline has scrolled away and the stage fills nearly all the screen under the bar
    await expect.poll(async () => (await stage.boundingBox())!.height).toBeGreaterThan((vh - 68) * 0.85);
    await expect(page.locator(".split-head h2")).not.toBeInViewport();
    // the finished tall clips are large: well over a sixth of the screen wide and a sixth of it tall
    const tiktok = page.locator('.split-clip[data-platform="TikTok"]');
    await expect.poll(async () => (await tiktok.boundingBox())!.height, { timeout: 8000 }).toBeGreaterThan(vh / 6);
    const vw = page.viewportSize()!.width;
    expect((await tiktok.boundingBox())!.width / vw).toBeGreaterThan(0.16);
    // every clip and its logo stays inside the stage, with nothing overlapping
    const sb = (await stage.boundingBox())!;
    const boxes = await page.locator(".split-clip, .split-dest, .split-foot").evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, y: r.y, w: r.width, h: r.height })));
    for (const b of boxes) {
      expect(b.y).toBeGreaterThanOrEqual(sb.y - 1);
      expect(b.y + b.h).toBeLessThanOrEqual(sb.y + sb.height + 1);
    }
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]!, b = boxes[j]!;
        const overlap = a.x < b.x + b.w - 1 && b.x < a.x + a.w - 1 && a.y < b.y + b.h - 1 && b.y < a.y + a.h - 1;
        expect(overlap, `boxes ${i} and ${j} overlap`).toBe(false);
      }
  });

  test("while the stage is pinned, the step it is on is written across its top", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".split.is-live")).toHaveCount(1);
    await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>(".split")!;
      const top = el.getBoundingClientRect().top + scrollY;
      scrollTo(0, top + (el.offsetHeight - innerHeight) * 0.3);
    });
    const now = page.locator(".split-now");
    await expect(now).toBeVisible();
    await expect(now).toHaveText(/Cut at the pauses|Reshaped and captioned|Filed and transcribed/);
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
