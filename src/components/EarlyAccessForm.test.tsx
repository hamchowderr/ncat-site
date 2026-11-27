import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PICK_EVENT, PREFILL_EVENT } from "@/lib/prefill";
import { EarlyAccessForm } from "./EarlyAccessForm";

afterEach(() => vi.unstubAllGlobals());

const next = () => fireEvent.click(screen.getByRole("button", { name: "Next" }));
const pick = (group: string | RegExp, option: string) => fireEvent.click(within(screen.getByRole("group", { name: group })).getByLabelText(option));

/** Walks every screen with the required answers, ending on the last one. */
function fillAll() {
  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ava Reyes" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ava@studio.co" } });
  next();
  pick("What describes you best?", "Editing agency");
  next();
  pick("How many people would use it?", "6 to 20");
  next();
  pick("What do you make?", "Podcasts");
  pick("What do you make?", "Interviews and talks");
  next();
  pick(/Where does it get posted/, "TikTok");
  next();
  pick("Roughly how much do you record each week?", "5 to 20 hours");
  next();
  pick("Where would it run?", "My own always-on machine, like a Mac Mini");
  next();
  pick(/Where do you finish videos/, "Premiere Pro");
  next();
  pick(/Which jobs should run/, "Captions burned in");
  next();
  next();
}

describe("EarlyAccessForm", () => {
  it("asks one or two questions per screen and sends every answer", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<EarlyAccessForm />);
    expect(screen.getByRole("heading", { name: /Step 1 of 4:\s*About you/ })).toBeInTheDocument();
    expect(screen.getByText("1 of 11")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "What describes you best?" })).toBeNull();
    fillAll();
    expect(screen.getByText("11 of 11")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Step 4 of 4:\s*What to automate/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Join the beta" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Thanks, Ava. You’re on the beta list.");
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

  it("never names the toolkit on any screen", () => {
    // Chowderr 2026-11-26: the toolkit is not mentioned in the form at all
    const { container } = render(<EarlyAccessForm />);
    const seen: string[] = [container.textContent ?? ""];
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ava Reyes" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ava@studio.co" } });
    const answers: [string | RegExp, string][] = [
      ["What describes you best?", "Editing agency"],
      ["How many people would use it?", "6 to 20"],
      ["What do you make?", "Podcasts"],
      [/Where does it get posted/, "TikTok"],
      ["Roughly how much do you record each week?", "5 to 20 hours"],
      ["Where would it run?", "A rented server"],
      [/Where do you finish videos/, "Premiere Pro"],
      [/Which jobs should run/, "Captions burned in"],
    ];
    next();
    for (const [group, option] of answers) {
      seen.push(container.textContent ?? "");
      pick(group, option);
      next();
    }
    seen.push(container.textContent ?? "");
    next();
    seen.push(container.textContent ?? "");
    expect(screen.getByText("11 of 11")).toBeInTheDocument();
    for (const text of seen) expect(text).not.toMatch(/toolkit/i);
  });

  it("leaves the news box unticked, and sends it only when ticked", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<EarlyAccessForm />);
    fillAll();
    const box = screen.getByRole("checkbox", { name: /Send me Takewon news now and then/ });
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    fireEvent.click(screen.getByRole("button", { name: "Join the beta" }));
    await screen.findByRole("status");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).newsletter).toBe(true);
  });

  it("will not move on until the screen is answered, and says what is missing", () => {
    render(<EarlyAccessForm />);
    next();
    expect(screen.getByText("Add your name.")).toBeInTheDocument();
    expect(screen.getByLabelText("Your name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("heading", { name: /About you/ })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "not-an-email" } });
    next();
    expect(screen.getByText("That email address doesn’t look right.")).toBeInTheDocument();
  });

  it("counts a job typed in your own words, and asks on that screen when neither is given", () => {
    render(<EarlyAccessForm />);
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ava" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ava@studio.co" } });
    next();
    pick("What describes you best?", "Creator");
    next();
    pick("How many people would use it?", "Just me");
    next();
    pick("What do you make?", "Podcasts");
    next();
    next();
    pick("Roughly how much do you record each week?", "5 to 20 hours");
    next();
    pick("Where would it run?", "A rented server");
    next();
    next();
    next(); // no job picked: that is fine here, they can type it next
    expect(screen.getByLabelText(/in your words/)).toBeInTheDocument();
    next();
    expect(screen.getByText("Go back and pick a job, or describe it here.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/in your words/), { target: { value: "Captions on every upload" } });
    expect(screen.queryByText("Go back and pick a job, or describe it here.")).toBeNull();
    next();
    expect(screen.getByRole("group", { name: /Where did you hear about it/ })).toBeInTheDocument();
  });

  it("goes back without losing answers", () => {
    render(<EarlyAccessForm />);
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ava" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ava@studio.co" } });
    next();
    pick("What describes you best?", "Creator");
    next();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(within(screen.getByRole("group", { name: "What describes you best?" })).getByLabelText("Creator")).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Your name")).toHaveValue("Ava");
  });

  it("takes the job typed in the ask bar", () => {
    render(<EarlyAccessForm />);
    act(() => {
      window.dispatchEvent(new CustomEvent(PREFILL_EVENT, { detail: "Caption every upload" }));
    });
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText(/The first automation you’d want/)).toHaveValue("Caption every upload");
  });

  it("starts with the answers picked on the page already ticked, and never unticks them", () => {
    render(<EarlyAccessForm />);
    act(() => {
      window.dispatchEvent(new CustomEvent(PICK_EVENT, { detail: { field: "content", value: "streams" } }));
      window.dispatchEvent(new CustomEvent(PICK_EVENT, { detail: { field: "content", value: "streams" } }));
      window.dispatchEvent(new CustomEvent(PICK_EVENT, { detail: { field: "hosting", value: "machine" } }));
    });
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ava" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ava@studio.co" } });
    next();
    pick("What describes you best?", "Editing agency");
    next();
    pick("How many people would use it?", "6 to 20");
    next();
    expect(within(screen.getByRole("group", { name: "What do you make?" })).getByLabelText("Livestreams")).toBeChecked();
    next();
    next();
    pick("Roughly how much do you record each week?", "5 to 20 hours");
    next();
    expect(within(screen.getByRole("group", { name: "Where would it run?" })).getByLabelText("My own always-on machine, like a Mac Mini")).toBeChecked();
  });

  it("sends people back to the step the server flagged", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, errors: { email: "Add an email address I can reply to." } }), { status: 422 })));
    render(<EarlyAccessForm />);
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: "Join the beta" }));
    expect(await screen.findByText("Add an email address I can reply to.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /About you/ })).toBeInTheDocument();
  });

  it("shows the server's reason when the list is not open", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, error: "The list is not open yet." }), { status: 503 })));
    render(<EarlyAccessForm />);
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: "Join the beta" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("The list is not open yet."));
  });

  it("explains when it cannot reach the server", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<EarlyAccessForm />);
    fillAll();
    fireEvent.click(screen.getByRole("button", { name: "Join the beta" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("couldn’t reach the server"));
  });
});
