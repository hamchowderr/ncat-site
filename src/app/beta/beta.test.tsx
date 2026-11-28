import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BetaPage from "./page";
import sitemap from "../sitemap";
import { EarlyAccess } from "@/components/sections/EarlyAccess";
import { Footer } from "@/components/sections/Footer";
import { ROADMAP } from "@/components/sections/Beta";

describe("the beta page", () => {
  it("has one heading and the motto, word for word", () => {
    render(<BetaPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Help build Takewon.");
    expect(document.body.textContent).toContain("Your content, social media ready.");
  });

  it("has every section in order: the deal, after you apply, the roadmap, questions, then the form", () => {
    const { container } = render(<BetaPage />);
    const ids = [...container.querySelectorAll("section[id]")].map((s) => s.id);
    expect(ids).toEqual(["deal", "after", "roadmap", "beta-faq", "early"]);
    for (const h of ["What you get", "What I ask", "After you apply", "Where Takewon is going", "Beta questions", "Apply for the beta"]) {
      expect(screen.getAllByRole("heading", { name: h }).length).toBeGreaterThan(0);
    }
  });

  it("puts the beta form right on the page, where every Join the beta link lands", () => {
    const { container } = render(<BetaPage />);
    const apply = container.querySelector("section#early")!;
    expect(apply.querySelector("form.ea")).not.toBeNull();
    // no pop-up on this page: the form is already here
    expect(container.querySelector("dialog")).toBeNull();
  });

  it("says what happens after applying, ending with the 3-day check-in", () => {
    render(<BetaPage />);
    const steps = within(document.querySelector(".beta-after")! as HTMLElement).getAllByRole("listitem");
    expect(steps.map((s) => s.querySelector("h3")!.textContent)).toEqual([
      "I read your application",
      "You get an invite email",
      "You create your account",
      "I check in after 3 days",
    ]);
  });

  it("lists text-to-video, AI dubbing and AI avatars as not planned, and posting last", () => {
    expect(ROADMAP.at(-1)).toMatchObject({ stage: "Not planned", items: ["Text-to-video", "AI dubbing", "AI avatars"] });
    expect(ROADMAP.find((r) => r.stage === "Later")!.items.at(-1)).toMatch(/Posting.*last/);
  });

  it("never names the toolkit, Make or Zapier, never says no server required, and invents no price", () => {
    const { container } = render(<BetaPage />);
    const text = container.textContent!;
    expect(text).not.toMatch(/toolkit/i);
    expect(text).not.toMatch(/\bMake\b|Zapier/);
    expect(text).not.toMatch(/no server required/i);
    expect(text).not.toMatch(/[$€£]\s?\d/);
    expect(text).not.toMatch(/Otaku Solutions|chowderr\.dev/i);
  });

  it("has no sparkle icon", () => {
    expect(readFileSync("src/components/sections/Beta.tsx", "utf8")).not.toMatch(/Sparkle/);
  });
});

describe("finding the beta page", () => {
  it("is in the sitemap", () => {
    expect(sitemap().map((e) => new URL(e.url).pathname)).toContain("/beta");
  });

  it("is linked from the footer", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Beta" })).toHaveAttribute("href", "/beta");
  });

  it("is linked from the Join the beta section on every other page", () => {
    render(<EarlyAccess />);
    expect(screen.getByRole("link", { name: "What the beta involves" })).toHaveAttribute("href", "/beta");
  });
});
