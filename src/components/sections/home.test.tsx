import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroStage, STAGE } from "@/components/HeroStage";
import { PREFILL_EVENT } from "@/lib/prefill";
import { Features } from "./Features";
import { Hero, PRESETS } from "./Hero";
import { PlatformExpert } from "./PlatformExpert";
import { Proof } from "./Proof";
import { UseCases } from "./UseCases";

describe("Hero", () => {
  it("leads with ready-made automations and hands the picked one to the form", () => {
    const seen = vi.fn();
    window.addEventListener(PREFILL_EVENT, (e) => seen((e as CustomEvent).detail));
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Your content, organized and.*automatically/);
    expect(screen.getByText(/Pick a ready-made automation and switch it on/)).toBeInTheDocument();
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
    expect(within(screen.getByRole("tabpanel")).getByRole("heading")).toHaveTextContent("Every episode, handled the same way.");
  });
});
