import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PREFILL_EVENT } from "@/lib/prefill";
import { TryNext } from "./TryIt";

describe("after the preview runs", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("says what was tried and asks for early access with it written in", () => {
    const heard: string[] = [];
    const on = (e: Event) => heard.push((e as CustomEvent<string>).detail);
    window.addEventListener(PREFILL_EVENT, on);
    Element.prototype.scrollIntoView = vi.fn();
    render(<TryNext seconds={840} clips={14} canSave onSave={() => {}} />);
    expect(screen.getByText(/That was a 14 min video, cut into 14 clips\./)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Get early access" }));
    expect(heard).toEqual(["I tried the preview on a 14 min video, cut into 14 clips."]);
    window.removeEventListener(PREFILL_EVENT, on);
  });

  it("saves the previews after an email, sending only the email and two numbers", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const onSave = vi.fn();
    render(<TryNext seconds={34.6} clips={5} canSave onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Save these previews" }));
    const field = screen.getByLabelText(/Your email/);
    expect(document.activeElement).toBe(field);
    fireEvent.change(field, { target: { value: "ava@studio.co" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save previews" }));
    });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/preview");
    expect(JSON.parse(String(init.body))).toEqual({ email: "ava@studio.co", seconds: 35, clips: 5, website: "" });
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").textContent).toContain("Saved");
  });

  it("asks again when the address is wrong, without saving", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "That email address doesn’t look right." }), { status: 422 })));
    const onSave = vi.fn();
    render(<TryNext seconds={60} clips={5} canSave onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Save these previews" }));
    fireEvent.change(screen.getByLabelText(/Your email/), { target: { value: "nope" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save previews" }));
    });
    expect(screen.getByText("That email address doesn’t look right.")).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("still saves when the site cannot be reached: the previews are theirs", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const onSave = vi.fn();
    render(<TryNext seconds={60} clips={5} canSave onSave={onSave} />);
    fireEvent.click(screen.getByRole("button", { name: "Save these previews" }));
    fireEvent.change(screen.getByLabelText(/Your email/), { target: { value: "ava@studio.co" } });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Save previews" }));
    });
    expect(onSave).toHaveBeenCalled();
  });

  it("offers no saving when there were no frames to save", () => {
    render(<TryNext seconds={60} clips={5} canSave={false} onSave={() => {}} />);
    expect(screen.queryByRole("button", { name: "Save these previews" })).toBeNull();
  });
});
