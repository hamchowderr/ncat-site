import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EarlyAccessForm } from "./EarlyAccessForm";

afterEach(() => vi.unstubAllGlobals());

const fill = () => {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ava" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ava@studio.co" } });
  fireEvent.click(screen.getByLabelText("My team"));
};

describe("EarlyAccessForm", () => {
  it("sends the form and thanks the person", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<EarlyAccessForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Get on the list" }));
    expect(await screen.findByRole("status")).toHaveTextContent("You’re on the list");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ name: "Ava", email: "ava@studio.co", who: "team" });
  });

  it("shows field errors from the server", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false, errors: { email: "Add an email address I can reply to." } }), { status: 422 })));
    render(<EarlyAccessForm />);
    fireEvent.click(screen.getByRole("button", { name: "Get on the list" }));
    expect(await screen.findByText("Add an email address I can reply to.")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("aria-invalid", "true");
  });

  it("explains when sending fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<EarlyAccessForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Get on the list" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("did not send"));
  });
});
