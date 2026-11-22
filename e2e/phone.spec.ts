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
    // the finished clips take turns at full size: one is large enough to read its captions, the rest wait small
    const big = page.locator(".split-clip.is-big");
    await expect(big).toHaveCount(1);
    const vw = page.viewportSize()!.width;
    await expect.poll(async () => (await big.boundingBox())!.height, { timeout: 8000 }).toBeGreaterThan(vh * 0.35);
    await page.waitForTimeout(800);
    const bb = (await big.boundingBox())!;
    if ((await big.getAttribute("data-frame")) !== "original") expect(bb.width / vw).toBeGreaterThan(0.4);
    await expect(page.locator(".split-dest.is-big .split-ready")).toBeVisible();
    // and the turn moves on to the next clip by itself
    const first = await big.getAttribute("data-platform");
    await expect.poll(async () => page.locator(".split-clip.is-big").getAttribute("data-platform"), { timeout: 6000 }).not.toBe(first);
    await page.waitForTimeout(900);
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

  test("while pinned, the five step icons ride across the top of the stage like on desktop, lighting up as they are reached", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".split.is-live")).toHaveCount(1);
    const at = (f: number) =>
      page.evaluate((f) => {
        const el = document.querySelector<HTMLElement>(".split")!;
        const top = el.getBoundingClientRect().top + scrollY;
        scrollTo(0, top + (el.offsetHeight - innerHeight) * f);
      }, f);
    await at(0.3);
    const rail = page.locator(".split-rail");
    await expect(rail).toBeVisible();
    await expect(rail.locator(".split-n")).toHaveCount(5);
    await expect(rail.locator("li.on").first()).toBeVisible();
    const before = await rail.locator("li.on").count();
    await at(0.62);
    await expect.poll(() => rail.locator("li.on").count()).toBeGreaterThan(before);
    // the icons and the step's name sit side by side, inside the stage, the name never cut off
    const r = (await rail.boundingBox())!;
    const n = (await page.locator(".split-now").boundingBox())!;
    const st = (await page.locator(".split-stage").boundingBox())!;
    expect(r.x + r.width).toBeLessThanOrEqual(n.x);
    expect(n.x + n.width).toBeLessThanOrEqual(st.x + st.width);
    expect(await page.locator(".split-now").evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true);
  });

  test("the five steps show once on a phone: in the scene, not again in the heading above it", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".split.is-live")).toHaveCount(1);
    await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>(".split")!;
      const top = el.getBoundingClientRect().top + scrollY;
      scrollTo(0, top + (el.offsetHeight - innerHeight) * 0.1);
    });
    await expect(page.locator(".split-rail")).toBeVisible();
    // the heading list is still there for screen readers, but takes no room and shows nothing
    const list = page.locator(".split-head .split-steps");
    await expect(list).toHaveAttribute("aria-label", "What the automation does");
    const b = (await list.boundingBox())!;
    expect(b.width * b.height).toBeLessThanOrEqual(1);
    const visibleSets = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>(".split-steps, .split-rail")].filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 1 && r.height > 1 && getComputedStyle(e).display !== "none";
      }).length
    );
    expect(visibleSets).toBe(1);
  });

  test("the feature tiles are one list of rows that open one by one, the first already open", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#features .tiles")).toHaveCount(0);
    for (const sel of ["#around .tiles"]) {
      const heads = page.locator(`${sel} .fold-head`);
      const n = await heads.count();
      expect(n, sel).toBe(11);
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
  test("the recording's name sits above the film strip, never on it, and the next recording's line is never cut off", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".split.is-live")).toHaveCount(1);
    const at = (f: number) =>
      page.evaluate((f) => {
        const el = document.querySelector<HTMLElement>(".split")!;
        const top = el.getBoundingClientRect().top + scrollY;
        scrollTo(0, top + (el.offsetHeight - innerHeight) * f);
      }, f);
    await at(0.12);
    await page.waitForTimeout(1500);
    const name = (await page.locator(".split-name").boundingBox())!;
    const strip = (await page.locator(".split-clip").first().boundingBox())!;
    expect(name.y + name.height).toBeLessThanOrEqual(strip.y);
    await at(0.99);
    await page.waitForTimeout(2500);
    const text = page.locator(".split-next-text");
    expect(await text.evaluate((e) => e.scrollWidth - e.clientWidth)).toBeLessThanOrEqual(1);
    const stage = (await page.locator(".split-stage").boundingBox())!;
    const banner = (await page.locator(".split-next").boundingBox())!;
    expect(banner.x + banner.width).toBeLessThanOrEqual(stage.x + stage.width + 1);
  });

  test("every button a thumb presses is at least 44px tall, and an opened tile's words are never clipped", async ({ page }) => {
    await page.goto("/");
    for (const sel of [
      ".nav .btn",
      ".menu-btn",
      ".hero-cta .btn",
      ".stage-tabs button",
      ".seg button",
      ".shot-full >> visible=true",
      ".foot-social a",
      ".socials a",
      ".mid-cta .btn",
    ]) {
      for (const el of await page.locator(sel).all()) {
        const b = await el.boundingBox();
        if (b) expect(b.height, sel).toBeGreaterThanOrEqual(43.5);
      }
    }
    const tile = page.locator("#around .fold").first().locator(".tile");
    await tile.scrollIntoViewIfNeeded();
    await expect(tile).toHaveCSS("overflow", "visible");
    await expect(tile).toHaveCSS("border-radius", "0px");
  });

  test("when the clips swap places, no label ever passes over the editor line", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".split.is-live")).toHaveCount(1);
    await page.evaluate(() => {
      const el = document.querySelector<HTMLElement>(".split")!;
      const top = el.getBoundingClientRect().top + scrollY;
      scrollTo(0, top + (el.offsetHeight - innerHeight) * 0.7);
    });
    await expect(page.locator(".split-stage.is-turns")).toHaveCount(1);
    // watch through more than one turn, every 80ms
    const hits: string[] = [];
    for (let t = 0; t < 60; t++) {
      const hit = await page.evaluate(() => {
        const foot = document.querySelector(".split-foot")!.getBoundingClientRect();
        for (const d of document.querySelectorAll<HTMLElement>(".split-dest")) {
          const r = d.getBoundingClientRect();
          if (Number(getComputedStyle(d).opacity) > 0.05 && r.bottom > foot.top + 1) return d.dataset.platform ?? d.textContent;
        }
        return null;
      });
      if (hit) hits.push(hit);
      await page.waitForTimeout(80);
    }
    expect(hits).toEqual([]);
  });

  test("the hero switcher is one stepper row: back, the choice, next, and a dot for each", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".stage-tabs")).toBeHidden();
    const hero = page.locator(".stage .stepper");
    await hero.scrollIntoViewIfNeeded();
    await expect(hero.locator(".stepper-now")).toHaveText("It runs by itself");
    await expect(hero.locator(".stepper-dot")).toHaveCount(4);
    await hero.getByRole("button", { name: /^Next/ }).click();
    await expect(hero.locator(".stepper-now")).toHaveText("Review");
    await expect(page.locator(".stage video")).toHaveAttribute("src", "/media/review.mp4");
    await hero.getByRole("button", { name: /^Previous/ }).click();
    await hero.getByRole("button", { name: /^Previous/ }).click();
    await expect(hero.locator(".stepper-now")).toHaveText("Or build your own");
    for (const b of await hero.locator("button").all()) expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(43.5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });

  test("use cases are a stack of cards: each slides up over the one before, with the earlier tabs still showing", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#use-cases .seg")).toBeHidden();
    await expect(page.locator("#case-panel")).toBeHidden();
    const cards = page.locator(".case-stack > .case-card");
    await expect(cards).toHaveCount(7);
    const vh = page.viewportSize()!.height;
    // every card fits on the screen under the bar, so none is covered before it has been read
    for (const c of await cards.all()) expect((await c.boundingBox())!.height).toBeLessThan(vh - 80 - 6 * 14);
    // scroll until the third card has stuck: the first two sit just above it, each 14px further down
    await cards.nth(0).scrollIntoViewIfNeeded();
    const start = await page.evaluate(() => document.querySelector(".case-stack")!.getBoundingClientRect().top + scrollY);
    await page.evaluate((y) => scrollTo(0, y + 1200), start);
    await page.waitForTimeout(400);
    const tops = await cards.evaluateAll((els) => els.slice(0, 3).map((e) => Math.round(e.getBoundingClientRect().top)));
    expect(tops).toEqual([80, 94, 108]);
    await expect(cards.nth(2).locator("h3")).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBe(0);
  });

  test("the tile rows never wait invisible inside their panel: the list shows as one", async ({ page }) => {
    await page.goto("/");
    const tiles = page.locator("#around .tiles");
    await tiles.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    for (const row of await tiles.locator(":scope > div").all()) expect(await row.evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
  });
});

test("a wide screen keeps the scroll scene, the tiles in full and no fold rows or full-screen buttons", async ({ page, isMobile }) => {
  test.skip(isMobile, "wide screen only");
  await page.goto("/");
  await expect(page.locator(".split.is-live")).toHaveCount(1);
  await expect(page.locator(".fold-head").first()).toBeHidden();
  await expect(page.getByRole("button", { name: "Watch full screen" }).first()).toBeHidden();
  const tiles = page.locator("#around .tiles");
  await tiles.scrollIntoViewIfNeeded();
  expect(await tiles.evaluate((el) => getComputedStyle(el).display)).toBe("grid");
  for (const v of (await page.locator("#around .tiles .shot video").all()).slice(0, 2)) await expect(v).toBeVisible();
  expect(
    await page
      .locator(".story-row .ticks")
      .first()
      .evaluate((el) => getComputedStyle(el).display),
  ).not.toBe("none");
});
