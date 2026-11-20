import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AlsoScene } from "@/components/AlsoScenes";
import { ShapeShifter } from "@/components/ShapeShifter";
import { AboutHero, AboutQuote, AboutStory, AboutWho, CHAPTERS } from "./AboutStory";
import { ALSO, AroundTheClip } from "./AroundTheClip";
import { NoFees } from "./NoFees";
import { CASES } from "./UseCases";

const css = readFileSync("src/app/globals.css", "utf8");

describe("About page", () => {
  it("opens with why it exists", () => {
    render(<AboutHero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Built for everyone who hit the same wall.");
  });

  it("tells the story in five chapters, in order, from the talks' facts", () => {
    render(<AboutStory />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem").filter((li) => li.classList.contains("chapter"));
    expect(items.map((li) => li.querySelector("h3")!.textContent)).toEqual([
      "One video",
      "Everyone hit the same walls",
      "Built a free engine",
      "Two rooms full of creators",
      "Kontifi is the missing piece",
    ]);
    expect(CHAPTERS.map((c) => c.n)).toEqual(["01", "02", "03", "04", "05"]);
    const text = document.body.textContent!;
    expect(text).toMatch(/Stephen G\. Pope/);
    expect(text).toMatch(/GPL-2\.0/);
    expect(text).toMatch(/Edit and transform content for less/);
    expect(text).toMatch(/The KINN AI Cafe/);
    expect(text).toMatch(/pay once and own your version/);
    expect(text).not.toMatch(/no server required|Zapier|\bMake\b/);
  });

  it("keeps the drawn scenes away from screen readers and turns their motion off when asked", () => {
    const { container } = render(<AboutStory />);
    const scenes = container.querySelectorAll(".cs");
    expect(scenes).toHaveLength(5);
    for (const s of scenes) expect(s).toHaveAttribute("aria-hidden", "true");
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*\.cs-play,\s*\.cs-walls li,\s*\.shell-ring\s*\{\s*animation: none/);
  });

  it("names who is behind it, his time in Stephen's community, and credits the open-source work underneath", () => {
    render(
      <>
        <AboutQuote />
        <AboutWho />
      </>,
    );
    expect(screen.getByRole("heading", { level: 2, name: /Tylan “Chowderr” Miller/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /NCA Toolkit/ })).toHaveAttribute("href", "https://github.com/stephengpope/no-code-architects-toolkit");
    expect(screen.getByRole("link", { name: /FFmpeg/ })).toHaveAttribute("href", "https://ffmpeg.org");
    expect(document.querySelector(".about-fill")!.textContent).toMatch(/rent one more tool/);
    const who = document.querySelector(".who-text")!.textContent!;
    expect(who).toMatch(/worked for Stephen in his community/);
    expect(who).not.toMatch(/9th grade/);
  });
});

describe("Fixes from the 2026-11-19 review", () => {
  it("writes every use-case tab in Title Case", () => {
    for (const c of CASES) for (const w of c.tab.split(" ")) expect(w[0], c.tab).toBe(w[0].toUpperCase());
  });

  it("draws a scene for each of the five extras", () => {
    const { container } = render(<AroundTheClip />);
    expect(ALSO).toHaveLength(5);
    expect(container.querySelectorAll(".also-card .scene")).toHaveLength(5);
    for (const name of ["chat", "clients", "steps", "files", "tours"] as const) {
      const { container: c } = render(<AlsoScene name={name} />);
      expect(c.querySelector(`.scene-${name}`)).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("shows the monthly bill rolling on next to the one Kontifi payment", () => {
    const { container } = render(<NoFees />);
    expect(container.querySelector(".bill")).toHaveTextContent("Billed every month");
    expect(container.querySelector(".ours")).toHaveTextContent("Kontifi");
    expect(container.querySelector(".ours")).toHaveTextContent("No meter.");
  });

  it("keeps every feed's wave playing, each bar on its own beat, unless motion is off", () => {
    const { container } = render(<ShapeShifter />);
    const bars = Array.from(container.querySelectorAll<HTMLElement>(".shift-wave i"));
    expect(bars.length).toBeGreaterThan(4);
    expect(new Set(bars.map((b) => b.style.getPropertyValue("--d"))).size).toBeGreaterThan(1);
    expect(css).toMatch(/\.shift-wave i \{[^}]*animation: shift-play[^}]*infinite/);
  });
});
