import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroIcons } from "@/components/HeroIcons";
import { HeroStage, STAGE } from "@/components/HeroStage";
import { SHIFT_PLATFORMS, ShapeShifter } from "@/components/ShapeShifter";
import { CLIP_SHAPES, fitFrame, formatLimit, frameName } from "@/lib/clipShapes";
import { formatBytes, formatDuration, planCuts } from "@/lib/tryIt";
import { SPLIT_CLIPS, SPLIT_STEPS, SplitScene } from "./SplitScene";
import { TRY_STEPS, TryIt } from "./TryIt";

describe("clip shapes", () => {
  it("fits each shape inside a box and writes lengths the way the dashboard does", () => {
    expect(fitFrame("9:16", 200, 200)).toEqual({ width: 112.5, height: 200 });
    expect(fitFrame("16:9", 160, 200)).toEqual({ width: 160, height: 90 });
    expect(fitFrame("original", 160, 90)).toEqual({ width: 160, height: 90 });
    expect(formatLimit(60)).toBe("60 s");
    expect(formatLimit(180)).toBe("3 min");
    expect(formatLimit(140)).toBe("2 min 20 s");
    expect(frameName("4:5")).toBe("Portrait 4:5");
    expect(frameName("original")).toBe("Its own shape");
  });
});

describe("one recording in, a clip for every feed out", () => {
  it("cuts one recording into five clips, each in a shape the Clips step makes for its platform", () => {
    const { container } = render(<SplitScene />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("One recording in. A clip for every feed out.");
    expect(within(screen.getByRole("list", { name: "What the automation does" })).getAllByRole("listitem").map((li) => li.textContent)).toEqual(
      SPLIT_STEPS.map((s, i) => `${i + 1}${s.label}`),
    );
    const clips = [...container.querySelectorAll(".split-clip")];
    expect(clips).toHaveLength(5);
    for (const c of SPLIT_CLIPS) {
      const shapes = CLIP_SHAPES[c.platform as keyof typeof CLIP_SHAPES];
      expect(shapes.map((s) => s.frame)).toContain(c.frame);
      expect(container.querySelector(`.split-clip[data-platform="${c.platform}"]`)).toHaveAttribute("data-frame", c.frame);
    }
    expect([...container.querySelectorAll(".split-ready")].map((e) => e.textContent)).toEqual(SPLIT_CLIPS.map((c) => `Ready for ${c.place}`));
    for (const d of container.querySelectorAll(".split-dest")) expect(d.querySelector("svg, img")).not.toBeNull();
    // the moving picture is decoration; the sentence under the heading says the same in words
    expect(container.querySelector(".split-stage")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector(".split-head .sr")).toHaveTextContent("Vertical 9:16 for TikTok");
  });
});

describe("one clip that changes shape", () => {
  it("shows the shape and longest length the Clips step makes for whichever platform is picked", () => {
    render(<ShapeShifter />);
    expect(screen.getAllByRole("tab").map((t) => t.getAttribute("aria-label"))).toEqual(SHIFT_PLATFORMS);
    const line = () => document.querySelector(".shift-line")!.textContent;
    expect(line()).toBe("TikTok clips come out Vertical 9:16, up to 3 min each.");
    fireEvent.click(screen.getByRole("tab", { name: "Instagram" }));
    expect(line()).toBe("Instagram Reels clips come out Vertical 9:16, up to 3 min each.");
    fireEvent.click(screen.getByRole("button", { name: "Feed" }));
    expect(line()).toBe("Instagram Feed clips come out Portrait 4:5, up to 3 min each.");
    expect(document.querySelector(".shift-frame")).toHaveAttribute("data-frame", "4:5");
    fireEvent.keyDown(screen.getByRole("tablist"), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "LinkedIn" })).toHaveFocus();
    expect(line()).toBe("LinkedIn clips come out Its own shape, up to 15 min each.");
  });
});

describe("falling logos", () => {
  it("open on click to show that platform's clip shapes, and close when you click elsewhere", () => {
    const { container } = render(<HeroIcons />);
    const tiktok = container.querySelector<HTMLElement>('.hi[data-platform="TikTok"]')!;
    expect(tiktok.querySelector(".hi-tag")).toHaveTextContent("TikTokVertical 9:16, up to 3 min");
    const ig = container.querySelector('.hi[data-platform="Instagram"] .hi-tag')!;
    expect(ig).toHaveTextContent("Reels: Vertical 9:16, up to 3 min");
    expect(ig).toHaveTextContent("Feed: Portrait 4:5, up to 3 min");
    fireEvent.click(tiktok);
    expect(tiktok).toHaveClass("open");
    fireEvent.click(document.body);
    expect(tiktok).not.toHaveClass("open");
  });
});

describe("hero captions", () => {
  it("splits the caption under each recording into words that light up as it plays, keeping the sentence whole", () => {
    const { container } = render(<HeroStage />);
    const cap = container.querySelector(".stage-cap")!;
    expect(cap.textContent).toBe(STAGE[0].caption);
    expect(cap.querySelectorAll(".cw")).toHaveLength(STAGE[0].caption.split(" ").length);
    // nothing is lit before the recording plays
    expect(cap.querySelectorAll(".cw.on")).toHaveLength(0);
  });
});

describe("try it on your own video", () => {
  it("plans even cuts of five seconds to a minute, about five of them", () => {
    expect(planCuts(0)).toEqual([]);
    expect(planCuts(35).map((c) => Math.round(c.seconds))).toEqual([7, 7, 7, 7, 7]);
    expect(planCuts(3)).toEqual([{ start: 0, seconds: 3 }]);
    const hour = planCuts(3600);
    expect(hour).toHaveLength(60);
    expect(hour.every((c) => c.seconds <= 60)).toBe(true);
    expect(planCuts(4 * 3600)).toHaveLength(100);
    expect(planCuts(600).every((c) => c.seconds <= 60)).toBe(true);
  });
  it("writes sizes and lengths plainly", () => {
    expect(formatBytes(970_000)).toBe("970 KB");
    expect(formatBytes(48_200_000)).toBe("48 MB");
    expect(formatBytes(1_230_000_000)).toBe("1.2 GB");
    expect(formatDuration(35)).toBe("35 s");
    expect(formatDuration(724)).toBe("12 min 4 s");
    expect(formatDuration(3780)).toBe("1 h 3 min");
  });
  it("offers a file picker for videos and a sample, with every step waiting", () => {
    const { container } = render(<TryIt />);
    expect(screen.getByLabelText("Choose a video")).toHaveAttribute("accept", "video/*");
    expect(screen.getByRole("button", { name: "Use a sample" })).toBeInTheDocument();
    expect(screen.getByText(/nothing is uploaded/)).toBeInTheDocument();
    const steps = within(screen.getByRole("list", { name: "What the automation does" })).getAllByRole("listitem");
    expect(steps.map((s) => s.getAttribute("data-step"))).toEqual([...TRY_STEPS]);
    expect(container.querySelectorAll(".try-step.wait")).toHaveLength(TRY_STEPS.length);
  });
});
