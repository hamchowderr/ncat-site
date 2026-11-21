import { readFileSync } from "node:fs";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app/globals.css", "utf8");
const phone = css.slice(css.indexOf("/* ---------- Phones: a shorter page"));

describe("where the engine section lives", () => {
  it("is not on the home page", () => {
    const home = readFileSync("src/app/page.tsx", "utf8");
    expect(home).not.toMatch(/Engine/);
  });

  it("is on the About page, after the quote and before early access", () => {
    const about = readFileSync("src/app/about/page.tsx", "utf8");
    const order = ["<AboutQuote />", "<Engine />", "<EarlyAccess />"].map((t) => about.indexOf(t));
    expect(order.every((i) => i > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("renders on the About page with its heading", async () => {
    const { default: AboutPage } = await import("./about/page");
    const { container } = render(<AboutPage />);
    expect(container.querySelector("#engine h2")).toHaveTextContent("Free engine. Fine-tuned shell.");
  });
});

describe("the home page on a phone", () => {
  it("keeps every phone rule inside one phone-width block, so desktop is untouched", () => {
    expect(phone).toMatch(/^\/\* ---------- Phones[^]*?\*\/\s*@media \(max-width: 640px\) \{/);
    // the block is the last thing in the stylesheet and closes cleanly
    const opens = (phone.match(/\{/g) ?? []).length;
    const closes = (phone.match(/\}/g) ?? []).length;
    expect(opens).toBe(closes);
  });

  it("crops recordings to the working area in a square frame", () => {
    expect(phone).toMatch(/\.shot video \{\s*aspect-ratio: 1 \/ 1;\s*object-fit: cover;\s*object-position: var\(--focus, 80%\) 50%;/);
  });

  it("turns the feature tiles and the 'Also in the dashboard' cards into swipe rows", () => {
    expect(phone).toMatch(/\.tiles,\s*\.also \{[^}]*overflow-x: auto;[^}]*scroll-snap-type: x mandatory;/);
    expect(phone).toMatch(/\.tiles > \*,\s*\.also > li \{\s*flex: 0 0 86%;\s*scroll-snap-align: start;/);
  });

  it("hides the tick lists under each feature and plays the split scene over less scroll", () => {
    expect(phone).toMatch(/\.story-row \.ticks \{\s*display: none;/);
    expect(phone).toMatch(/\.split\.is-live \{\s*height: 320vh;/);
  });
});
