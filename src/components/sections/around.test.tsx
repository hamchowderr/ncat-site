import { existsSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ALSO, AROUND_TILES, AroundTheClip } from "./AroundTheClip";

describe("Everything around the clip", () => {
  it("shows each newer feature with its own screen recording", () => {
    render(<AroundTheClip />);
    const section = screen.getByRole("region", { name: "Everything around the clip, too" });
    for (const t of AROUND_TILES) {
      // the tile's own heading, plus the phone's fold row that opens it
      const hs = within(section).getAllByRole("heading", { level: 3, name: t.title });
      expect(hs.some((h) => h.closest(".tile"))).toBe(true);
      expect(hs.some((h) => h.classList.contains("fold-title"))).toBe(true);
      const video = within(section).getByLabelText(t.alt);
      expect(video.getAttribute("src")).toBe(`/media/features/${t.video}.mp4`);
      expect(existsSync(`public/media/features/${t.video}.mp4`), t.video).toBe(true);
      expect(existsSync(`public/media/features/${t.video}.jpg`), t.video).toBe(true);
    }
    // the parts you would otherwise do by hand come first, in the same section (one list, not two)
    expect(AROUND_TILES.map((t) => t.id)).toEqual(["brand", "files", "alerts", "schedule", "meetings", "library", "calendar", "moments", "follow", "steps", "mcp"]);
    expect(document.querySelectorAll(".around .tiles")).toHaveLength(1);
  });

  it("names the real apps each one works with", () => {
    render(<AroundTheClip />);
    const meetings = screen.getByRole("list", { name: "Meeting recordings come in by themselves: apps" });
    expect(within(meetings).getAllByRole("listitem").map((li) => li.textContent?.trim())).toEqual(["Zoom", "Google Meet", "Microsoft Teams"]);
    const mcp = screen.getByRole("list", { name: "Use it from the AI apps you already use: apps" });
    expect(within(mcp).getAllByRole("listitem").map((li) => li.textContent?.trim())).toEqual(["Claude", "ChatGPT", "Cursor", "n8n"]);
    for (const li of within(mcp).getAllByRole("listitem")) expect(li.querySelector("svg, img")).not.toBeNull();
  });

  it("lists the rest plainly, with Slack, Discord, Microsoft Teams and Telegram marks on the team chat", () => {
    render(<AroundTheClip />);
    const also = screen.getByRole("list", { name: "Also in the dashboard" });
    expect(within(also).getAllByRole("listitem")).toHaveLength(ALSO.length);
    const chat = within(also).getByRole("heading", { name: "The agent in your team chat" });
    expect(chat.querySelectorAll("svg")).toHaveLength(4);
    expect(ALSO[0].logos!.map((l) => l.name)).toEqual(["Slack", "Discord", "Microsoft Teams", "Telegram"]);
    expect(within(also).getByText(/Slack, Discord, Microsoft Teams or Telegram/)).toBeInTheDocument();
    // review alerts reach every chat app the dashboard supports
    expect(within(also).getByText(/post to your Slack, Discord, Teams or Telegram channel, with Approve and Send back/)).toBeInTheDocument();
  });

  it("never frames MCP as one app's feature, and keeps to the site's wording rules", () => {
    const { container } = render(<AroundTheClip />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/any MCP client/);
    expect(text).not.toMatch(/Zapier|Make\.com|no server required/i);
    expect(text).toMatch(/Picking uses AI once per video/);
  });
});

describe("Your own steps", () => {
  it("is a real recording of the agent writing, trying, saving and using a step, not a drawing", () => {
    const tile = AROUND_TILES.find((t) => t.id === "steps")!;
    expect(tile.video).toBe("steps");
    expect(tile.alt).toMatch(/^Screen recording:/);
    expect(tile.body).toMatch(/tries it on one of your files/);
    const { container } = render(<AroundTheClip />);
    expect(container.querySelector(".scene-steps")).toBeNull();
  });
});
