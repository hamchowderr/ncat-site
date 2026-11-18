import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroStage, STAGE } from "@/components/HeroStage";
import { PREFILL_EVENT } from "@/lib/prefill";
import { Features } from "./Features";
import { Hero, PRESETS } from "./Hero";
import { PlatformExpert } from "./PlatformExpert";
import { Proof } from "./Proof";
import { HowItWorks } from "./HowItWorks";
import { UseCases } from "./UseCases";

describe("Hero", () => {
  it("fills the line under the headline in as you scroll, with the work it does in colour", () => {
    const { container } = render(<Hero />);
    const line = container.querySelector(".hero-sub.fill-text")!;
    expect(line).toHaveTextContent(/every new recording is filed, transcribed, cut and captioned by itself/);
    const hot = [...line.querySelectorAll(".fw.hot")].map((w) => w.textContent);
    expect(hot).toEqual(["filed,", "transcribed,", "cut", "captioned"]);
    // it starts part filled, so the line is never all grey
    const lit = line.querySelectorAll(".fw.on").length;
    expect(lit).toBeGreaterThan(0);
    expect(lit).toBeLessThan(line.querySelectorAll(".fw").length);
  });
  it("carries the Social Media Ready slogan above the headline", () => {
    const { container } = render(<Hero />);
    const slogan = screen.getByText("Social Media Ready");
    const h1 = container.querySelector("h1")!;
    expect(slogan.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("leads with ready-made automations and hands the picked one to the form", () => {
    const seen = vi.fn();
    window.addEventListener(PREFILL_EVENT, (e) => seen((e as CustomEvent).detail));
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Your content, organized and.*automatically/);
    expect(document.querySelector(".hero-sub")).toHaveTextContent(/Pick a ready-made automation and switch it on/);
    expect(screen.queryByLabelText("Describe an automation")).toBeNull();
    const presets = within(screen.getByRole("list", { name: /Ready-made automations/ })).getAllByRole("button");
    expect(presets.map((b) => b.textContent)).toEqual([...PRESETS]);
    fireEvent.click(screen.getByRole("button", { name: "Caption every new upload" }));
    expect(seen).toHaveBeenCalledWith("Caption every new upload");
  });
});

describe("HeroStage", () => {
  it("opens on an automation running by itself, with building your own last", () => {
    render(<HeroStage />);
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["It runs by itself", "Review", "Outputs", "Or build your own"]);
    expect(screen.getByRole("tab", { name: "It runs by itself" })).toHaveAttribute("aria-selected", "true");
  });

  it("plays a real recording for each tab and moves with the arrow keys", () => {
    render(<HeroStage />);
    const video = () => document.querySelector("video")!;
    expect(video()).toHaveAttribute("src", STAGE[0].video);
    expect(video().muted).toBe(true);
    fireEvent.click(screen.getByRole("tab", { name: "Review" }));
    expect(screen.getByRole("tab", { name: "Review" })).toHaveAttribute("aria-selected", "true");
    expect(video()).toHaveAttribute("src", "/media/review.mp4");
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Outputs" })).toHaveFocus();
    expect(video()).toHaveAttribute("src", "/media/outputs.mp4");
  });

  it("moves to the next recording when one ends", () => {
    render(<HeroStage />);
    fireEvent.ended(document.querySelector("video")!);
    expect(screen.getByRole("tab", { name: STAGE[1].tab })).toHaveAttribute("aria-selected", "true");
  });
});

describe("logos", () => {
  it("shows the events as one clean row and the platforms as logos only", () => {
    render(<Proof />);
    for (const name of ["Claude Code Creators Summit", "Tech Week Los Angeles", "The KINN"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    const feeds = within(screen.getByRole("list", { name: "Platforms" })).getAllByRole("listitem");
    expect(feeds).toHaveLength(9);
    for (const li of feeds) {
      expect(li.querySelector("svg, img")).not.toBeNull();
      // the name is there for screen readers only, not printed beside the logo
      expect(li.querySelector(".sr")).not.toBeNull();
      expect(li.querySelectorAll("span:not(.sr)")).toHaveLength(0);
    }
    expect(within(screen.getByRole("list", { name: "Platforms" })).getByText("Apple Podcasts")).toHaveClass("sr");
  });

  it("gives every platform a logo, with its name and formats kept together", () => {
    render(<PlatformExpert />);
    const items = screen.getAllByRole("listitem");
    for (const li of items) {
      expect(li.querySelector("svg, img")).not.toBeNull();
      expect(li.querySelector(".plat-text .plat-name")).not.toBeNull();
      expect(li.querySelector(".plat-text .plat-formats")).not.toBeNull();
    }
  });
});

describe("Features", () => {
  it("shows a silent, described screen recording for every feature", () => {
    const { container } = render(<Features />);
    const videos = Array.from(container.querySelectorAll("video"));
    expect(videos.length).toBe(8);
    for (const v of videos) {
      expect(v.getAttribute("aria-label")).toMatch(/^Screen recording: .{30,}/);
      expect(v.getAttribute("src")).toMatch(/^\/media\/features\/[a-z]+\.mp4$/);
      expect(v.getAttribute("poster")).toBe(v.getAttribute("src")!.replace(".mp4", ".jpg"));
      expect(v.muted).toBe(true);
      expect(v.hasAttribute("playsinline")).toBe(true);
    }
    expect(container.querySelectorAll(".shot img").length).toBe(0);
    expect(screen.getByText(/screen recording of the working dashboard/)).toBeInTheDocument();
    expect(screen.getByText(/demo data/)).toBeInTheDocument();
  });

  it("names each editor and n8n next to its real logo", () => {
    render(<Features />);
    const editors = within(screen.getByRole("list", { name: "Editors it exports to" })).getAllByRole("listitem");
    expect(editors.map((li) => li.textContent?.trim())).toEqual(["Premiere Pro", "DaVinci Resolve", "Final Cut Pro", "CapCut"]);
    for (const li of editors) expect(li.querySelector("svg, img")).not.toBeNull();
    const n8n = within(screen.getByRole("list", { name: "Outside platforms" })).getByRole("listitem");
    expect(n8n.querySelector("img")!.getAttribute("src")).toContain("/logos/n8n.png");
    expect(n8n).toHaveTextContent("Prefer an outside platform? n8n is available");
    expect(screen.queryByText(/through a webhook/)).toBeNull();
    expect(screen.getByText("Comes with its own automation builder, made for content")).toBeInTheDocument();
  });
});

describe("UseCases", () => {
  it("switches who it is for", () => {
    render(<UseCases />);
    fireEvent.click(screen.getByRole("tab", { name: "Podcast teams" }));
    expect(within(screen.getByRole("tabpanel")).getByRole("heading")).toHaveTextContent("The call ends. The episode gets to work.");
  });
  it("shows what goes in and what comes out for each team, and every tab has an icon", () => {
    render(<UseCases />);
    for (const tab of screen.getAllByRole("tab")) expect(tab.querySelector("svg")).not.toBeNull();
    for (const name of ["Creators", "Editing agencies", "Podcast teams", "Music video teams"]) {
      fireEvent.click(screen.getByRole("tab", { name }));
      const panel = screen.getByRole("tabpanel");
      expect(panel.querySelector(".case-in")?.textContent).toMatch(/^In.+/);
      const outs = within(within(panel).getByRole("list", { name: "What comes out" })).getAllByRole("listitem");
      expect(outs).toHaveLength(4);
      for (const o of outs) expect(o.querySelector(".case-shape svg")).not.toBeNull();
    }
    expect(screen.queryByText("Record once. Clips all week.")).toBeNull();
  });
});

describe("story and icons", () => {
  it("tells the features as numbered steps, each with an icon", () => {
    const { container } = render(<Features />);
    const steps = [...container.querySelectorAll(".story-step")].map((s) => s.textContent);
    expect(steps).toEqual(["Pick", "Runs by itself", "Approve", "Finish"]);
    for (const s of container.querySelectorAll(".story-step")) expect(s.querySelector("svg")).not.toBeNull();
    for (const t of container.querySelectorAll(".tile h4")) expect(t.querySelector("svg")).not.toBeNull();
  });
  it("gives every how-it-works step and every use case an icon", () => {
    const { container } = render(<HowItWorks />);
    const items = container.querySelectorAll(".steps li");
    expect(items.length).toBe(3);
    for (const li of items) expect(li.querySelector(".step-icon svg")).not.toBeNull();
    const cases = render(<UseCases />).container;
    expect(cases.querySelector(".case-icon svg")).not.toBeNull();
  });
});
