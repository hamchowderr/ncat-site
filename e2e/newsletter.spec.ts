import { expect, test } from "@playwright/test";

// The footer's product news box on desktop and phone: it fits without sideways scroll,
// sends the address to the app's double opt-in endpoint (answered here by the test), and
// asks the visitor to confirm from their inbox.

const ENDPOINT = "http://127.0.0.1:9/email/news/subscribe";

test("the footer box sends an address and asks the visitor to confirm by email", async ({ page }) => {
  const sent: unknown[] = [];
  await page.route(ENDPOINT, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } });
    sent.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ outcome: "ok" }) });
  });
  await page.goto("/");
  const box = page.getByRole("region", { name: "Product news" });
  await box.scrollIntoViewIfNeeded();
  await expect(box.getByText("We'll ask you to confirm first, and you can stop any time.", { exact: false })).toBeVisible();
  const wide = await page.evaluate(() => document.scrollingElement!.scrollWidth > innerWidth + 1);
  expect(wide, "the page scrolls sideways").toBe(false);
  const field = box.getByRole("textbox", { name: "Email address" });
  expect(await field.evaluate((el) => getComputedStyle(el).fontSize)).toBe("16px");
  await field.fill("rosa@example.com");
  await box.getByRole("button", { name: "Subscribe" }).click();
  await expect(box.getByRole("status")).toContainText("Check your inbox");
  expect(sent).toEqual([{ email: "rosa@example.com", website: "" }]);
});

test("a wrong address is answered next to the box", async ({ page }) => {
  await page.route(ENDPOINT, (route) =>
    route.request().method() === "OPTIONS"
      ? route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } })
      : route.fulfill({ status: 400, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ outcome: "invalid" }) }),
  );
  await page.goto("/pricing");
  const box = page.getByRole("region", { name: "Product news" });
  await box.getByRole("textbox", { name: "Email address" }).fill("not-an-address");
  await box.getByRole("button", { name: "Subscribe" }).click();
  await expect(box.getByRole("alert")).toHaveText("That address doesn't look right.");
});
