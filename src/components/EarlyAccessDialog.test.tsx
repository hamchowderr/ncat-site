import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { isEarlyAccessLink, openEarlyAccess } from "@/lib/prefill";
import { EarlyAccessDialog } from "./EarlyAccessDialog";

// jsdom has <dialog> but not its methods.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

const dialog = () => document.querySelector("dialog")!;

describe("early access as a pop-up", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    history.replaceState(null, "", "/");
  });

  it("knows the site's early-access links", () => {
    expect(isEarlyAccessLink("#early")).toBe(true);
    expect(isEarlyAccessLink("/#early")).toBe(true);
    expect(isEarlyAccessLink("#templates")).toBe(false);
    expect(isEarlyAccessLink(null)).toBe(false);
  });

  it("opens from any Get early access link, without jumping down the page", () => {
    render(
      <>
        <a href="#early">Get early access</a>
        <EarlyAccessDialog />
      </>,
    );
    expect(dialog().open).toBe(false);
    const click = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
    act(() => {
      screen.getByRole("link", { name: "Get early access" }).dispatchEvent(click);
    });
    expect(click.defaultPrevented).toBe(true);
    expect(dialog().open).toBe(true);
    expect(screen.getByRole("heading", { name: "Get early access" })).toBeTruthy();
    expect(dialog().querySelector("form")).not.toBeNull();
  });

  it("opens when the page is opened at #early", () => {
    history.replaceState(null, "", "/#early");
    render(<EarlyAccessDialog />);
    expect(dialog().open).toBe(true);
  });

  it("keeps a half-filled form between openings, and starts fresh after a sign-up", async () => {
    render(<EarlyAccessDialog />);
    act(() => openEarlyAccess());
    fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Ava" } });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    act(() => openEarlyAccess());
    expect((screen.getByLabelText("Your name") as HTMLInputElement).value).toBe("Ava");
  });

  it("closes from its button", () => {
    render(<EarlyAccessDialog />);
    act(() => openEarlyAccess());
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(dialog().open).toBe(false);
  });

  it("writes in what was passed and runs the after-sign-up step once it is sent", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"ok":true}', { status: 200 })));
    const onSent = vi.fn();
    render(<EarlyAccessDialog />);
    act(() => openEarlyAccess("I tried the preview on a 35 s video, cut into 5 clips.", { onSent }));
    const form = dialog().querySelector("form")!;
    const fill = (label: RegExp | string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fill("Your name", "Ava");
    fill("Email", "ava@studio.co");
    fireEvent.click(screen.getByLabelText("Editing agency"));
    fireEvent.click(screen.getByLabelText("2 to 5"));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByLabelText("Podcasts"));
    fireEvent.click(screen.getByLabelText("1 to 5 hours"));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByLabelText("A rented server"));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect((screen.getByLabelText(/in your words/i) as HTMLTextAreaElement).value).toBe("I tried the preview on a 35 s video, cut into 5 clips.");
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(onSent).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").textContent).toContain("You’re on the list");
  });
});
