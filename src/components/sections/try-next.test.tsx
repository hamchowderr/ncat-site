import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OPEN_EVENT, type OpenDetail, PREFILL_EVENT } from "@/lib/prefill";
import { TryNext } from "./TryIt";

function listen() {
  const prefilled: string[] = [];
  const opened: OpenDetail[] = [];
  const onPrefill = (e: Event) => prefilled.push((e as CustomEvent<string>).detail);
  const onOpen = (e: Event) => opened.push((e as CustomEvent<OpenDetail>).detail);
  window.addEventListener(PREFILL_EVENT, onPrefill);
  window.addEventListener(OPEN_EVENT, onOpen);
  return {
    prefilled,
    opened,
    stop: () => {
      window.removeEventListener(PREFILL_EVENT, onPrefill);
      window.removeEventListener(OPEN_EVENT, onOpen);
    },
  };
}

describe("after the preview runs", () => {
  it("says what was tried and opens early access with it written in", () => {
    const heard = listen();
    render(<TryNext seconds={840} clips={14} canSave onSave={() => {}} />);
    expect(screen.getByText(/That was a 14 min video, cut into 14 clips\./)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Get early access" }));
    expect(heard.prefilled).toEqual(["I tried the preview on a 14 min video, cut into 14 clips."]);
    expect(heard.opened).toHaveLength(1);
    heard.stop();
  });

  it("asks for the email once: signing up saves the previews", () => {
    const heard = listen();
    const onSave = vi.fn();
    render(<TryNext seconds={60} clips={5} canSave onSave={onSave} />);
    expect(screen.getByText("Your clip previews save to your computer when you sign up.")).toBeTruthy();
    expect(screen.queryByRole("textbox")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Get early access" }));
    expect(onSave).not.toHaveBeenCalled();
    act(() => heard.opened[0].onSent?.());
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").textContent).toBe("Your clip previews are in your downloads folder.");
    heard.stop();
  });

  it("promises no previews when there were no frames to save", () => {
    const heard = listen();
    render(<TryNext seconds={60} clips={5} canSave={false} onSave={() => {}} />);
    expect(screen.queryByText(/clip previews/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Get early access" }));
    expect(heard.opened[0].onSent).toBeUndefined();
    heard.stop();
  });
});
