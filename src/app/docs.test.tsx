import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/sections/Footer";
import { CONTACT_EMAIL, MCP_URL } from "@/lib/contact";
import sitemap from "./sitemap";

const PAGES = [
  { path: "/privacy", load: () => import("./privacy/page"), title: "Privacy Policy" },
  { path: "/terms", load: () => import("./terms/page"), title: "Terms of Service" },
  { path: "/support", load: () => import("./support/page"), title: "Support" },
  { path: "/docs/ai-apps", load: () => import("./docs/ai-apps/page"), title: "Use Takewon from AI apps" },
];

describe("the privacy, terms, support and AI apps pages", () => {
  for (const page of PAGES) {
    it(`${page.path} has its title, a last-updated date, the contact address and its own canonical address`, async () => {
      const mod = await page.load();
      const { container } = render(<mod.default />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(page.title);
      expect(container.querySelector(".doc-updated time")?.getAttribute("dateTime")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(container).toHaveTextContent(CONTACT_EMAIL);
      expect(mod.metadata.alternates?.canonical).toBe(page.path);
      expect(String(mod.metadata.description).length).toBeGreaterThan(40);
    });
  }

  it("names the company that runs Takewon in the privacy policy and terms", async () => {
    for (const load of [() => import("./privacy/page"), () => import("./terms/page")]) {
      const { default: Page } = await load();
      const { container, unmount } = render(<Page />);
      expect(container).toHaveTextContent("Otaku Solutions");
      unmount();
    }
  });

  it("covers what directories ask a privacy policy to cover", async () => {
    const { default: Privacy } = await import("./privacy/page");
    render(<Privacy />);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    for (const topic of ["What we collect", "AI chat apps", "Who helps us run Takewon", "How long we keep it", "Your choices", "Contact"]) {
      expect(headings).toContain(topic);
    }
  });

  it("gives the AI apps the one MCP address and lists every tool", async () => {
    const { default: AiApps } = await import("./docs/ai-apps/page");
    const { container } = render(<AiApps />);
    expect(MCP_URL).toBe("https://mcp.takewon.com/mcp");
    expect(container).toHaveTextContent(MCP_URL);
    expect(container.querySelectorAll(".doc-table tbody tr")).toHaveLength(17);
  });

  it("has every app sign in, n8n included, and never asks for an API key", async () => {
    const { default: AiApps } = await import("./docs/ai-apps/page");
    const { container } = render(<AiApps />);
    expect(screen.getByRole("heading", { name: "n8n" })).toBeTruthy();
    expect(container).toHaveTextContent("MCP OAuth2");
    expect(container).toHaveTextContent("There are no API keys");
    expect(container).not.toHaveTextContent(/Bearer|makes one under Settings|need a key/);
  });

  it("are linked from the footer and listed in the sitemap", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Support" })).toHaveAttribute("href", "/support");
    expect(screen.getByRole("link", { name: "Use from AI apps" })).toHaveAttribute("href", "/docs/ai-apps");
    const paths = sitemap().map((entry) => new URL(entry.url).pathname);
    for (const page of PAGES) expect(paths).toContain(page.path);
  });
});
