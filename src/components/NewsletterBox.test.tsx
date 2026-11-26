import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsletterBox } from "./NewsletterBox";
import { Footer } from "./sections/Footer";
import { NEWS_WORDING, newsSignupUrl, subscribe } from "@/lib/newsletter";

const URL = "https://backend.example/email/news/subscribe";
const answer = (outcome: string, status = 200) => new Response(JSON.stringify({ outcome }), { status });

afterEach(() => vi.unstubAllGlobals());

describe("NewsletterBox", () => {
  it("is left off the page until the sign-up address is set", () => {
    const { container } = render(<NewsletterBox url={null} />);
    expect(container).toBeEmptyDOMElement();
    expect(newsSignupUrl(undefined)).toBeNull();
    expect(newsSignupUrl("  ")).toBeNull();
    expect(newsSignupUrl("ftp://x")).toBeNull();
    expect(newsSignupUrl(` ${URL} `)).toBe(URL);
  });

  it("shows the exact words the app records, tied to the address field", () => {
    render(<NewsletterBox url={URL} />);
    expect(screen.getByRole("heading", { name: "Product news" })).toBeInTheDocument();
    const field = screen.getByRole("textbox", { name: "Email address" });
    expect(field).toHaveAccessibleDescription(NEWS_WORDING);
    expect(NEWS_WORDING).toBe("Get Takewon product news by email. We'll ask you to confirm first, and you can stop any time.");
    // nothing is ticked or sent for anyone who doesn't type an address and press the button
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("sends the address with the empty bot trap, then asks them to confirm from their inbox", async () => {
    const fetchMock = vi.fn().mockResolvedValue(answer("ok"));
    vi.stubGlobal("fetch", fetchMock);
    render(<NewsletterBox url={URL} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), { target: { value: " rosa@example.com " } });
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/Check your inbox\. Click the button in our email to confirm/);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(URL);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: "rosa@example.com", website: "" });
  });

  it("says plainly when the address is wrong, the list is busy, or the request failed", async () => {
    for (const [reply, text] of [
      [answer("invalid", 400), "That address doesn't look right."],
      [answer("busy", 429), "Too many sign-ups right now. Try again in a few minutes."],
      [new Response("oops", { status: 500 }), "That didn't go through. Try again."],
    ] as const) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(reply));
      const { unmount } = render(<NewsletterBox url={URL} />);
      fireEvent.change(screen.getByRole("textbox", { name: "Email address" }), { target: { value: "x@example.com" } });
      fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
      expect(await screen.findByRole("alert")).toHaveTextContent(text);
      expect(screen.getByRole("textbox", { name: "Email address" })).toHaveAttribute("aria-invalid", "true");
      unmount();
    }
  });

  it("does nothing for an empty address", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<NewsletterBox url={URL} />);
    fireEvent.click(screen.getByRole("button", { name: "Subscribe" }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never throws when the network is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(subscribe(URL, "x@example.com")).resolves.toBe("failed");
  });

  it("sits in the footer, beside the mark, when the address is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_NEWS_SIGNUP_URL", URL);
    render(<Footer />);
    await waitFor(() => expect(screen.getByRole("heading", { name: "Product news" })).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: "Product news" }).closest(".foot-about")).not.toBeNull();
    vi.unstubAllEnvs();
  });
});
