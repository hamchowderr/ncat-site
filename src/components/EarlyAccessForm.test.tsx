import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PREFILL_EVENT } from "@/lib/prefill";
import { EarlyAccessForm } from "./EarlyAccessForm";

afterEach(() => vi.unstubAllGlobals());

const next = () => fireEvent.click(screen.getByRole("button", { name: "Next" }));
const pick = (group: string | RegExp, option: string) => fireEvent.click(within(screen.getByRole("group", { name: group })).getByLabelText(option));

/** Walks all four steps with the required answers. */
function fillAll() {
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ava Reyes" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ava@studio.co" } });
  pick("What describes you best?", "Editing agency");
  pick("How many people would use it?", "6 to 20");
  next();
  pick("What do you make?", "Podcasts");
  pick("What do you make?", "Interviews and talks");
  pick(/Where does it get posted/, "TikTok");
  pick("Roughly how much do you record each week?", "5 to 20 hours");
  next();
  pick("Where would it run?", "My own always-on machine, like a Mac Mini");
  pick(/Where do you finish videos/, "Premiere Pro");
  next();
  pick(/Which jobs should run/, "Captions burned in");
}

describe("EarlyAccessForm", () => {
  it("walks four steps and sends every answer", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<EarlyAccessForm />);
    expect(screen.getByRole("heading", { name: /Step 1 of 4:\s*About you/ })).toBeInTheDocument();
    fillAll();
    expect(screen.getByRole("heading", { name: /Step 4 of 4:\s*What to automate/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Join early access" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Thanks, Ava. You’re on the list.");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({
      name: "Ava Reyes",
      email: "ava@studio.co",
      role: "agency",
      teamSize: "6-20",
      content: ["podcasts", "interviews"],
      platforms: ["tiktok"],
      volume: "5-20",
      hosting: "machine",
      editors: ["premiere"],
      jobs: ["captions"],
    });
  });

  it("will not move on until the step is answered, and says what is missing", () => {
    render(<EarlyAccessForm />);
    next();
    expect(screen.getByText("Add your name.")).toBeInTheDocument();
    expect(screen.getByText("Pick what describes you best.")).toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("heading", { name: /About you/ })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
    next();
    expect(screen.getByText("That email address doesn’t look right.")).toBeInTheDocument();
  });

  it("goes back without losing answers", () => {
    render(<EarlyAccessForm />);
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ava" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ava@studio.co" } });
    pick("What describes you best?", "Creator");
    pick("How many people would use it?", "Just me");
    next();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Your name")).toHaveValue("Ava");
    expect(within(screen.getByRole("group", { name: "What describes you best?" })).getByLabelText("Creator")).toBeChecked();
  });

  it("takes the job typed in the ask bar", () => {
    render(<EarlyAccessForm />);
    act(() => {
      window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: "Caption every upload" }));
    });
    fillAll();
    expect(screen.getByLabelText(/The first automation you’d want/)).toHaveValue("Caption every upload");
  });

  it("sends people back to the step the server flagged", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, errors: { email: "Add an email address I can reply to." } }), { status: 422 })));
    render(<EarlyAccessForm />);
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: "Join early access" }));
    expect(await screen.findByText("Add an email address I can reply to.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /About you/ })).toBeInTheDocument();
  });

  it("shows the server's reason when the list is not open", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, error: "The list is not open yet." }), { status: 503 })));
    render(<EarlyAccessForm />);
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: "Join early access" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("The list is not open yet."));
  });

  it("explains when it cannot reach the server", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<EarlyAccessForm />);
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: "Join early access" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("couldn’t reach the server"));
  });
});
