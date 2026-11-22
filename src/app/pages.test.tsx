import { readFileSync } from "node:fs";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PhoneFold } from "@/components/PhoneFold";
import { FeatureVideo } from "@/components/FeatureVideo";

const css = readFileSync("src/app/globals.css", "utf8");
const phone = css.slice(css.indexOf("/* ---------- Phones: a layout made for the phone"));

describe("where the engine section lives", () => {
  it("is not on the home page", () => {
    expect(readFileSync("src/app/page.tsx", "utf8")).not.toMatch(/Engine/);
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

describe("a feature tile on a phone", () => {
  it("is a row that opens and closes its recording and words", () => {
    render(
      <PhoneFold id="t" title="Your brand, set once" icon={<span />} level={4}>
        <p>Logo, colour, font and music</p>
      </PhoneFold>,
    );
    const head = screen.getByRole("button", { name: "Your brand, set once" });
    expect(head.closest("h4")).not.toBeNull();
    expect(head).toHaveAttribute("aria-expanded", "false");
    expect(head).toHaveAttribute("aria-controls", "t-fold");
    expect(document.querySelector(".fold")).not.toHaveAttribute("data-open");
    fireEvent.click(head);
    expect(head).toHaveAttribute("aria-expanded", "true");
    expect(document.querySelector(".fold")).toHaveAttribute("data-open");
    fireEvent.click(head);
    expect(head).toHaveAttribute("aria-expanded", "false");
  });

  it("can start open", () => {
    render(
      <PhoneFold id="t" title="Meeting recordings" icon={<span />} level={3} defaultOpen>
        <p>x</p>
      </PhoneFold>,
    );
    expect(screen.getByRole("button", { name: "Meeting recordings" })).toHaveAttribute("aria-expanded", "true");
  });
});

describe("a feature recording", () => {
  it("has a Watch full screen button under it", () => {
    render(<FeatureVideo name="brand" label="Screen recording: brand" />);
    const fig = document.querySelector("figure.shot")!;
    const btn = screen.getByRole("button", { name: "Watch full screen" });
    expect(fig.contains(btn)).toBe(true);
    expect(fig.querySelector("video")!.compareDocumentPosition(btn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe("the phone stylesheet", () => {
  it("keeps every phone rule after one marker, inside phone-width blocks, so desktop is untouched", () => {
    expect(phone.length).toBeGreaterThan(100);
    const outside = phone.replace(/@media \(max-width: 640px\)[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
    // only the comment and the rule hiding the phone-only pieces on wide screens sit outside them
    expect(outside.replace(/\/\*[^]*?\*\//g, "").trim()).toMatch(/^\.fold-title,\s*\.shot-full \{\s*display: none;\s*\}$/);
  });

  it("never scrolls anything sideways on a phone and never crops a recording", () => {
    expect(phone).not.toMatch(/overflow-x: auto|scroll-snap/);
    expect(phone).not.toMatch(/object-fit: cover/);
  });

  it("folds the tiles, hides closed rows' bodies and the tick lists", () => {
    expect(phone).toMatch(/\.fold:not\(\[data-open\]\) \.fold-body \{\s*display: none;/);
    expect(phone).toMatch(/\.story-row \.ticks \{\s*display: none;/);
  });
});

describe("names on the site", () => {
  it("never mentions Otaku Solutions or chowderr.dev in the footer, About page or FAQ", async () => {
    const { Footer } = await import("@/components/sections/Footer");
    const { AboutWho } = await import("@/components/sections/AboutStory");
    const { Faq } = await import("@/components/sections/Faq");
    const { container } = render(
      <>
        <Footer />
        <AboutWho />
        <Faq />
      </>,
    );
    expect(container.innerHTML).not.toMatch(/Otaku Solutions|otakusolutions\.io|chowderr\.dev/i);
    expect(container.querySelector(".foot-about p")).toHaveTextContent(/^Your content, social media ready\.$/);
  });
});

describe("the Impeccable review fixes", () => {
  it("asks for sign-ups straight after the scene and tells the set-up-once story only once", () => {
    const page = readFileSync("src/app/page.tsx", "utf8");
    expect(page).not.toMatch(/HowItWorks/);
    expect(page.indexOf("<MidCta />")).toBe(page.indexOf("<SplitScene />") + "<SplitScene />\n      ".length);
  });
  it("shows the hero line in readable colours from the first paint, with no gradient text", () => {
    expect(css).toMatch(/\.fill-text \.fw \{\s*color: var\(--soft\);/);
    expect(css).not.toMatch(/#c4c4ce/);
    expect(css).not.toMatch(/\.fill-text \.fw\.hot \{[^}]*background-clip: text/);
  });
  it("drops the pulsing dot and the uppercase hero label", () => {
    expect(css).not.toMatch(/slogan-pulse|\.slogan-dot/);
    expect(css).not.toMatch(/\.slogan \{[^}]*text-transform: uppercase/);
  });
  it("gives every phone control at least 44px and keeps the tile's words unclipped", () => {
    const phone = css.slice(css.indexOf("/* ---------- Phones: a layout made for the phone"));
    expect(phone).toMatch(/\.shot-full \{[^}]*height: 44px;/);
    expect(phone).toMatch(/\.seg button \{[^}]*min-height: 44px;/);
    expect(phone).toMatch(/\.foot-social a \{\s*width: 44px;\s*height: 44px;/);
    expect(phone).toMatch(/\.tiles \.tile\.spotlight-card \{[^}]*overflow: visible;/);
  });
});
