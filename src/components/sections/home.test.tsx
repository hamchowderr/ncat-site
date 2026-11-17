import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroStage, STAGE } from "@/components/HeroStage";
import { PREFILL_EVENT } from "@/lib/prefill";
import { Features } from "./Features";
import { Hero } from "./Hero";
import { PlatformExpert } from "./PlatformExpert";
import { Proof } from "./Proof";
import { UseCases } from "./UseCases";

describe("Hero", () => {
  it("names the product promise and hands the typed job to the form", () => {
    const seen = vi.fn();
    window.addEventListener(PREFILL_EVENT, (e) => seen((e as CustomEvent).detail));
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Your content, organized and.*automatically/);
    fireEvent.click(screen.getByRole("button", { name: "Caption every upload" }));
    expect(screen.getByLabelText("Describe an automation")).toHaveValue("Caption every upload");
    fireEvent.click(screen.getByRole("button", { name: "Set it up" }));
    expect(seen).toHaveBeenCalledWith("Caption every upload");
  });
});

describe("HeroStage", () => {
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
  it("shows the event and platform marks with their names", () => {
    render(<Proof />);
    for (const name of ["Claude Code Creators Summit", "Tech Week Los Angeles", "The KINN", "TikTok", "LinkedIn", "Apple Podcasts"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(document.querySelectorAll(".feeds svg, .feeds img").length).toBe(9);
  });

  it("gives every platform a logo", () => {
    render(<PlatformExpert />);
    const items = screen.getAllByRole("listitem");
    for (const li of items) expect(li.querySelector("svg, img")).not.toBeNull();
  });
});

describe("Features", () => {
  it("shows real dashboard screens with descriptions", () => {
    render(<Features />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBe(8);
    for (const img of imgs) expect(img.getAttribute("alt")!.length).toBeGreaterThan(30);
    expect(screen.getByText(/demo data/)).toBeInTheDocument();
  });
});

describe("UseCases", () => {
  it("switches who it is for", () => {
    render(<UseCases />);
    fireEvent.click(screen.getByRole("tab", { name: "Podcast teams" }));
    expect(within(screen.getByRole("tabpanel")).getByRole("heading")).toHaveTextContent("Every episode, handled the same way.");
  });
});
