import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Engine, WAYS } from "./Engine";
import { FAQ, Faq } from "./Faq";
import { NoFees } from "./NoFees";
import { PricingHero } from "./PricingHero";
import { CASES, UseCases } from "./UseCases";

const text = (n: React.ReactNode) => (typeof n === "string" ? n : "");

describe("Engine and shell", () => {
  it("says the engine is free and the price is for the shell, never the processing", () => {
    render(<Engine />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Free engine. Fine-tuned shell.");
    const copy = document.querySelector(".engine-text")!.textContent!;
    expect(copy).toMatch(/free and open source/);
    expect(copy).toMatch(/no screens/);
    expect(copy).toMatch(/You pay for the shell, never for the processing/);
  });

  it("lays out the five ways in order, from doing the work yourself to the shell", () => {
    render(<Engine />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items.map((li) => li.querySelector("h4")!.textContent)).toEqual([
      "The engine alone",
      "An AI agent on your computer",
      "n8n with the engine",
      "social-clips, our free version",
      "The fine-tuned shell",
    ]);
    expect(items.filter((li) => li.classList.contains("ours"))).toEqual([items[4]]);
    expect(WAYS.filter((w) => w.ours)).toHaveLength(1);
  });

  it("names the AI agent way's real costs and says n8n comes with the toolkit", () => {
    render(<Engine />);
    expect(screen.getByText(/using up your plan's limits or API credits/)).toBeInTheDocument();
    expect(screen.getByText(/It comes with the toolkit, though many people never set it up/)).toBeInTheDocument();
  });

  it("never calls it just a dashboard or says no server is needed", () => {
    const { container } = render(
      <>
        <Engine />
        <NoFees />
        <PricingHero />
        <Faq />
      </>,
    );
    const all = container.textContent!;
    expect(all).not.toMatch(/just a dashboard/i);
    expect(all).not.toMatch(/no server required/i);
    expect(all).not.toMatch(/Make|Zapier/);
    expect(all).not.toMatch(/through a webhook|with a webhook/);
  });
});

describe("Use cases", () => {
  it("has a tab for people editing with AI on their own computer", () => {
    render(<UseCases />);
    fireEvent.click(screen.getByRole("tab", { name: "Editing with AI" }));
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByRole("heading", { level: 3 })).toHaveTextContent("Stop spending your AI limits on the same edit.");
    expect(panel).toHaveTextContent(/no AI used per video/);
    expect(panel).toHaveTextContent(/server or always-on machine/);
  });

  it("shows what each profile does without the shell", () => {
    render(<UseCases />);
    for (const c of CASES) {
      expect(c.without.length).toBeGreaterThan(20);
      fireEvent.click(screen.getByRole("tab", { name: c.tab }));
      const line = document.querySelector(".case-without")!;
      expect(line).toHaveTextContent("Without the shell");
      expect(line).toHaveTextContent(c.without);
    }
  });
});

describe("FAQ and pricing", () => {
  it("answers what you pay for, the AI agent question and the n8n question", () => {
    const qs = FAQ.map((f) => f.q);
    expect(qs).toContain("If the NCA Toolkit is free, what am I paying for?");
    expect(qs).toContain("Can’t I just edit with an AI agent and the toolkit?");
    expect(qs).toContain("Doesn’t the toolkit come with n8n?");
    const pay = text(FAQ.find((f) => f.q.startsWith("If the NCA Toolkit is free"))!.a);
    expect(pay).toMatch(/You never pay for the processing itself/);
    const agent = text(FAQ.find((f) => f.q.startsWith("Can’t I just"))!.a);
    expect(agent).toMatch(/many MCP clients/);
  });

  it("puts the free engine on the fees and pricing copy without inventing a price", () => {
    const { container } = render(
      <>
        <NoFees />
        <PricingHero />
      </>,
    );
    expect(container).toHaveTextContent(/You pay once for the shell around it, never for the processing/);
    expect(container).toHaveTextContent(/never pay for processing, only for the fine-tuned shell/);
    expect(container.textContent).not.toMatch(/\$\d/);
  });
});
