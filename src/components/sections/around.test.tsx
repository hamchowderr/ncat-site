import { existsSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ALSO, AROUND_TILES, AroundTheClip } from "./AroundTheClip";

describe("Everything around the clip", () => {
  it("shows each newer feature with its own screen recording", () => {
    render(<AroundTheClip />);
    const section = screen.getByRole("region", { name: "Everything around the clip, too" });
    for (const t of AROUND_TILES) {
      expect(within(section).getByRole("heading", { level: 3, name: t.title })).toBeInTheDocument();
      const video = within(section).getByLabelText(t.alt);
      expect(video.getAttribute("src")).toBe(`/media/features/${t.video}.mp4`);
      expect(existsSync(`public/media/features/${t.video}.mp4`), t.video).toBe(true);
      expect(existsSync(`public/media/features/${t.video}.jpg`), t.video).toBe(true);
    }
    expect(AROUND_TILES.map((t) => t.id)).toEqual(["meetings", "library", "calendar", "moments", "follow", "mcp"]);
  });

  it("names the real apps each one works with", () => {
    render(<AroundTheClip />);
    const meetings = screen.getByRole("list", { name: "Meeting recordings come in by themselves: apps" });
    expect(within(meetings).getAllByRole("listitem").map((li) => li.textContent?.trim())).toEqual(["Zoom", "Google Meet", "Microsoft Teams"]);
    const mcp = screen.getByRole("list", { name: "Use it from the AI apps you already use: apps" });
    expect(within(mcp).getAllByRole("listitem").map((li) => li.textContent?.trim())).toEqual(["Claude", "ChatGPT", "Cursor", "n8n"]);
    for (const li of within(mcp).getAllByRole("listitem")) expect(li.querySelector("svg, img")).not.toBeNull();
  });

  it("lists the rest plainly, with Slack and Discord marks on the team chat", () => {
    render(<AroundTheClip />);
    const also = screen.getByRole("list", { name: "Also in the dashboard" });
    expect(within(also).getAllByRole("listitem")).toHaveLength(ALSO.length);
    const chat = within(also).getByRole("heading", { name: "The agent in your team chat" });
    expect(chat.querySelectorAll("svg")).toHaveLength(2);
  });

  it("never frames MCP as one app's feature, and keeps to the site's wording rules", () => {
    const { container } = render(<AroundTheClip />);
    const text = container.textContent ?? "";
    expect(text).toMatch(/any MCP client/);
    expect(text).not.toMatch(/Zapier|Make\.com|no server required/i);
    expect(text).toMatch(/Picking uses AI once per video/);
  });
});
