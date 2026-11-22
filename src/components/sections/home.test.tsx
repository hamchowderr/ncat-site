import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroStage, STAGE } from "@/components/HeroStage";
import { Features, LEAD_TEXT } from "./Features";
import { Hero } from "./Hero";
import { PlatformExpert } from "./PlatformExpert";
import { Proof } from "./Proof";
import { AroundTheClip } from "./AroundTheClip";
import { MidCta } from "./MidCta";
import { CASES, UseCases } from "./UseCases";

describe("Hero", () => {
  it("fills the line under the headline in as you scroll, with the work it does in colour", () => {
    const { container } = render(<Hero />);
    const line = container.querySelector(".hero-sub.fill-text")!;
    expect(line).toHaveTextContent(/every new recording is filed, transcribed, cut and captioned by itself/);
    const marks = [...line.querySelectorAll(".hl")].map((w) => w.textContent);
    expect(marks).toEqual(["ready-made automation", "filed, transcribed, cut and captioned", "server you own", "no AI tokens"]);
    // only the first few words are filled when the page opens; the rest wait for the scroll
    const lit = line.querySelectorAll(".fw.on").length;
    expect(lit).toBeGreaterThan(0);
    expect(lit).toBeLessThan(line.querySelectorAll(".fw").length / 4);
    expect(line.querySelectorAll(".hl.on")).toHaveLength(0);
  });
  it("leads with the motto as the headline, with the rotating line above it", () => {
    const { container } = render(<Hero />);
    const slogan = container.querySelector(".slogan")!;
    expect(slogan.textContent).toMatch(/^Organized and .*automatically$/);
    const h1 = container.querySelector("h1")!;
    expect(slogan.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // sentence case, with no pulsing dot
    expect(slogan.querySelector(".slogan-dot")).toBeNull();
  });

  it("keeps the hero to the headline, the line under it and the two buttons, with no list of automations", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Your content, social media ready.");
    expect(document.querySelector(".hero-sub")).toHaveTextContent(/Pick a ready-made automation and switch it on/);
    expect(screen.queryByText(/ready to switch on/)).toBeNull();
    expect(screen.queryByRole("button", { name: "Caption every new upload" })).toBeNull();
    expect(screen.getByRole("link", { name: "Get early access" })).toBeInTheDocument();
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

  it("puts every platform in the one shape-changing clip, each with a logo and the formats it knows, and no second grid", () => {
    const { container } = render(<PlatformExpert />);
    expect(container.querySelector(".plat-grid")).toBeNull();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.getAttribute("aria-label"))).toEqual(["TikTok", "YouTube", "X", "Instagram", "LinkedIn", "Facebook", "Spotify", "Apple Podcasts"]);
    for (const t of tabs) {
      expect(t.querySelector("svg, img")).not.toBeNull();
      fireEvent.click(t);
      expect(container.querySelector(".shift-formats")!.textContent).toMatch(/^Formats it knows .{10,}/);
    }
  });
});

describe("Features", () => {
  it("reads as one heading, with its second line in the one accent colour, never a gradient", () => {
    render(<Features />);
    const h = screen.getByRole("heading", {
      level: 2,
      name: "Ready-made automations. No AI on every video.",
    });
    expect(h.querySelector(".accent-ink")).toHaveTextContent("No AI on every video.");
    expect(h.querySelector(".plat-ink")).toBeNull();
  });

  it("gives the lead as one calm paragraph, not a phrase per platform colour", () => {
    const { container } = render(<Features />);
    const lead = container.querySelector(".features .sec-lead")!;
    expect(lead).toHaveTextContent(LEAD_TEXT);
    expect(LEAD_TEXT).toMatch(/^Clipping apps run AI on every video/);
    expect(lead.querySelector("span, svg, img")).toBeNull();
    expect(container.querySelector(".pl-lead, .pl-rail")).toBeNull();
  });

  it("shows a silent, described screen recording for every feature", () => {
    const { container } = render(
      <>
        <Features />
        <AroundTheClip />
      </>,
    );
    const videos = Array.from(container.querySelectorAll<HTMLVideoElement>(".story-row video, .around .tiles video"));
    // four story rows, then the eleven tiles of the one "around the clip" list
    expect(videos.length).toBe(15);
    for (const v of videos) {
      expect(v.getAttribute("aria-label")).toMatch(/^Screen recording: .{30,}/);
      expect(v.getAttribute("src")).toMatch(/^\/media\/features\/[a-z]+\.mp4$/);
      expect(v.getAttribute("poster")).toBe(v.getAttribute("src")!.replace(".mp4", ".jpg"));
      expect(v.muted).toBe(true);
      expect(v.hasAttribute("playsinline")).toBe(true);
    }
    expect(container.querySelectorAll(".shot img").length).toBe(0);
    expect(screen.queryByText(/screen recording of the working dashboard/)).toBeNull();
  });

  it("describes the current dashboard: the Inbox for failed runs and the Review list", () => {
    const { container } = render(
      <>
        <Features />
        <AroundTheClip />
      </>,
    );
    const label = (name: string) => container.querySelector(`video[src="/media/features/${name}.mp4"]`)!.getAttribute("aria-label");
    expect(label("alerts")).toMatch(/Inbox/);
    expect(label("alerts")).not.toMatch(/bell/i);
    expect(label("review")).toMatch(/Review list/);
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
  it("also renders every case as a card for the phone stack, in order, with what goes in and comes out", () => {
    const { container } = render(<UseCases />);
    const cards = Array.from(container.querySelectorAll(".case-stack > .case-card"));
    expect(cards.map((c) => c.querySelector(".case-card-tab")!.textContent)).toEqual(CASES.map((c) => c.tab));
    cards.forEach((card, i) => {
      expect(card.querySelector("h3")!.textContent).toBe(CASES[i].title);
      expect(card.querySelectorAll(".case-card-outs li")).toHaveLength(CASES[i].outputs.length);
      expect((card as HTMLElement).style.getPropertyValue("--i")).toBe(String(i));
    });
  });

  it("switches who it is for", () => {
    render(<UseCases />);
    fireEvent.click(screen.getByRole("tab", { name: "Podcast Teams" }));
    expect(within(screen.getByRole("tabpanel")).getByRole("heading")).toHaveTextContent("The call ends. The episode gets to work.");
  });
  it("shows what goes in and what comes out for each team, and every tab has an icon", () => {
    render(<UseCases />);
    for (const tab of screen.getAllByRole("tab")) expect(tab.querySelector("svg")).not.toBeNull();
    for (const name of ["Creators", "Editing Agencies", "Podcast Teams", "Music Video Teams", "Coaches", "Webinars"]) {
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
  it("tells the features in order by their titles alone, with no uppercase label above each", () => {
    const { container } = render(<Features />);
    expect(container.querySelector(".story-step")).toBeNull();
    expect([...container.querySelectorAll(".story-row h3")].map((h) => h.textContent)).toEqual([
      "Start from a ready-made automation",
      "Every new recording runs by itself",
      "Nothing goes out until someone says yes",
      "Finish it in the editor you already use",
    ]);
  });
  it("uses moving icons that play when their card is hovered", () => {
    const hero = render(<Hero />).container;
    expect(hero.querySelectorAll(".hero-icons .hi .mi svg")).toHaveLength(12);
    expect(hero.querySelector(".hero-icons")).toHaveAttribute("aria-hidden", "true");
  });
  it("uses only social platform logos for the big hero icons", () => {
    const hero = render(<Hero />).container;
    const names = Array.from(hero.querySelectorAll(".hero-icons .hi")).map((el) => el.getAttribute("data-platform"));
    expect(new Set(names)).toEqual(new Set(["TikTok", "YouTube", "X", "Instagram", "LinkedIn", "Facebook"]));
    // each logo falls once down each side
    for (const name of new Set(names)) expect(names.filter((n) => n === name)).toHaveLength(2);
  });
  it("gives every use case an icon", () => {
    const cases = render(<UseCases />).container;
    expect(cases.querySelector(".case-icon svg")).not.toBeNull();
  });
});

describe("the feeds section is clearly about the agent, and shows the brand", () => {
  it("wears a robot agent badge and says every clip comes out in your brand", () => {
    const { container } = render(<PlatformExpert />);
    const badge = container.querySelector(".agent-badge")!;
    expect(badge).toHaveTextContent("Takewon’s agent");
    expect(badge.querySelector("svg.lucide-bot")).not.toBeNull();
    expect(container.querySelector(".sec-head")).toHaveTextContent("your caption style, logo, colours and font");
    expect([...container.querySelectorAll(".shift-brand li")].map((l) => l.textContent?.trim())).toEqual([
      expect.stringContaining("Caption style"),
      "Logo",
      "Colours",
      expect.stringContaining("Font"),
    ]);
    expect(container.querySelector(".shift-cap")).toHaveTextContent("Your content, social media ready");
    expect(container.querySelector(".shift-team")).not.toBeNull();
  });
});

describe("the ask straight after the scene", () => {
  it("says use AI once, then every recording runs by itself, and opens early access", () => {
    const { container } = render(<MidCta />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Use AI once. Every recording after that runs by itself.");
    expect(container.querySelector("p")).toHaveTextContent("Build your content factory once");
    expect(container.querySelector("p")).toHaveTextContent("server or an always-on machine you own");
    expect(screen.getByRole("link", { name: "Get early access" })).toHaveAttribute("href", "#early");
    expect(container.textContent).not.toMatch(/Set it up once|no server required/i);
  });

  it("shows the content factory as a line: one recording, the five steps, every feed out", () => {
    const { container } = render(<MidCta />);
    expect(screen.getByRole("img", { name: /One recording goes through five steps and out to TikTok, Instagram, YouTube, LinkedIn, Facebook and X/ })).toBeInTheDocument();
    expect(container.querySelectorAll(".fline-st")).toHaveLength(5);
    expect(container.querySelectorAll(".fline-feed")).toHaveLength(6);
  });
});

describe("use cases from the newer features", () => {
  it("adds coaches and webinars, built on meeting recordings, chapters, best moments, follow the speaker and the calendar", () => {
    render(<UseCases />);
    fireEvent.click(screen.getByRole("tab", { name: "Coaches" }));
    let panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Zoom, Google Meet or Microsoft Teams");
    expect(panel).toHaveTextContent("Best moments as vertical clips");
    fireEvent.click(screen.getByRole("tab", { name: "Webinars" }));
    panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("Clips that follow the speaker");
    expect(panel).toHaveTextContent("Posts planned on the calendar");
  });
});
