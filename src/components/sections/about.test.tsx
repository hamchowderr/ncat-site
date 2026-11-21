import { readFileSync, statSync } from "node:fs";
import { act, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlsoScene, CHAT_APPS, CHAT_LOOP_MS, PORTAL_CLIPS, VERSION_CLIPS } from "@/components/AlsoScenes";
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
      "Kontentifi is the missing piece",
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
    expect(container.querySelectorAll(".cs")).toHaveLength(5);
    for (const s of container.querySelectorAll(".cs:not(.cs-video)")) expect(s).toHaveAttribute("aria-hidden", "true");
    expect(css).toMatch(/\.cs-engine \{\s*justify-items: center;/);
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*\.cs-walls li,\s*\.shell-ring\s*\{\s*animation: none/);
  });

  it("shows the real thumbnail of Stephen's video, linking to it, with the Make box cropped off", () => {
    render(<AboutStory />);
    const link = screen.getByRole("link", { name: /Watch “FACELESS Videos 100% Automated”/ });
    expect(link).toHaveAttribute("href", "https://youtu.be/ZHeDsV7diMw");
    expect(link.querySelector("img")!.getAttribute("src")).toContain("faceless-videos.jpg");
    expect(statSync("public/media/about/faceless-videos.jpg").size).toBeGreaterThan(20_000);
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

  it("plays real captioned clips in the client portal scene, muted and looping", () => {
    const { container } = render(<AlsoScene name="clients" />);
    const videos = Array.from(container.querySelectorAll("video"));
    expect(videos.map((v) => v.getAttribute("src"))).toEqual(PORTAL_CLIPS.map((c) => `/media/split/${c}.mp4`));
    for (const v of videos) {
      expect(v.muted).toBe(true);
      expect(v.loop).toBe(true);
      expect(v.hasAttribute("playsinline")).toBe(true);
      expect(statSync(`public${v.getAttribute("src")}`).size).toBeGreaterThan(20_000);
    }
  });

  it("switches between Version 1 and Version 2 by itself, swapping the clip shown", async () => {
    vi.useFakeTimers();
    const { container } = render(<AlsoScene name="files" />);
    const on = () => container.querySelector(".vs .vs-on")!.textContent;
    const shown = () => container.querySelector(".vs-preview video.on")!.getAttribute("src");
    expect(on()).toBe("Version 1");
    expect(shown()).toBe(`/media/split/${VERSION_CLIPS[0]}.mp4`);
    act(() => vi.advanceTimersByTime(2800));
    expect(on()).toBe("Version 2");
    expect(shown()).toBe(`/media/split/${VERSION_CLIPS[1]}.mp4`);
    act(() => vi.advanceTimersByTime(2800));
    expect(on()).toBe("Version 1");
    vi.useRealTimers();
  });

  it("replays the chat in Slack, Discord, Microsoft Teams and Telegram, changing the app logo each time", () => {
    vi.useFakeTimers();
    const { container } = render(<AlsoScene name="chat" />);
    const seen: string[] = [];
    for (const a of CHAT_APPS) {
      const chat = container.querySelector(".chat")!;
      expect(chat.getAttribute("data-app")).toBe(a.app);
      expect(container.querySelector(".chat-chan svg")).not.toBeNull();
      seen.push(container.querySelector(".chat-chan")!.innerHTML);
      expect(chat).toHaveTextContent(a.ask.ask);
      expect(chat).toHaveTextContent(a.reply);
      act(() => vi.advanceTimersByTime(CHAT_LOOP_MS));
    }
    expect(new Set(seen).size).toBe(4);
    expect(new Set(CHAT_APPS.map((a) => a.ask.ask)).size).toBe(4);
    expect(new Set(CHAT_APPS.map((a) => a.reply)).size).toBe(4);
    expect(CHAT_APPS.map((a) => a.app)).toEqual(["slack", "discord", "teams", "telegram"]);
    expect(container.querySelector(".chat")!.getAttribute("data-app")).toBe("slack");
    expect(container.querySelector(".ava-bot svg")).toHaveClass("lucide-bot");
    vi.useRealTimers();
  });

  it("marks Kontentifi's agent with a robot, never the sparkle star", () => {
    for (const name of ["chat", "steps"] as const) {
      const { container } = render(<AlsoScene name={name} />);
      expect(container.querySelector(".lucide-bot"), name).not.toBeNull();
      expect(container.querySelector(".lucide-sparkles"), name).toBeNull();
    }
    expect(readFileSync("src/components/AlsoScenes.tsx", "utf8")).not.toMatch(/Sparkles/);
  });

  it("shows the monthly bill rolling on next to the one Kontentifi payment", () => {
    const { container } = render(<NoFees />);
    expect(container.querySelector(".bill")).toHaveTextContent("Billed every month");
    expect(container.querySelector(".ours")).toHaveTextContent("Kontentifi");
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
