import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Faq, FAQ } from "./Faq";
import { Footer } from "./Footer";
import { EarlyAccess } from "./EarlyAccess";
import { CONTACT_EMAIL, TALKS } from "@/lib/contact";

describe("Footer", () => {
  it("is the mark, one line and short link columns, with no small print underneath", () => {
    const { container } = render(<Footer />);
    expect(screen.getAllByRole("navigation").map((n) => n.getAttribute("aria-label"))).toEqual(["Product", "Resources", "Company"]);
    expect(container.querySelector(".legal")).toBeNull();
    expect(container).not.toHaveTextContent("demo data");
    expect(container).not.toHaveTextContent("©");
  });

  it("links to Chowderr's socials with their real marks", () => {
    render(<Footer />);
    const social = screen.getByRole("list", { name: "Follow" });
    for (const name of ["Instagram", "X", "LinkedIn"]) expect(screen.getByRole("link", { name })).toBeInTheDocument();
    expect(social.querySelectorAll("svg, img")).toHaveLength(3);
  });

  it("has a Contact link that emails the Takewon address", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);
  });
});

describe("Footer resources", () => {
  it("lists only the two talks: the Claude Code Creators Summit and The KINN", () => {
    render(<Footer />);
    const links = Array.from(screen.getByRole("navigation", { name: "Resources" }).querySelectorAll("a"));
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["Claude Code Creators Summit Talk", TALKS.summit],
      ["The KINN Talk", TALKS.kinn],
    ]);
  });
});

describe("no workshop page", () => {
  it("never links the workshop prep page from the footer or the questions", () => {
    const { container } = render(<><Footer /><Faq /></>);
    expect(container.innerHTML).not.toContain("Y8og6PdvJ3D4y9VjdHRMX1");
    expect(container.innerHTML).not.toMatch(/luma/i);
  });
});

describe("FAQ", () => {
  it("lists every question as its own disclosure, the first one open", () => {
    const { container } = render(<Faq />);
    const items = Array.from(container.querySelectorAll("details"));
    expect(items).toHaveLength(FAQ.length);
    expect(items[0].open).toBe(true);
    expect(items.slice(1).every((d) => !d.open)).toBe(true);
    for (const d of items) expect(d.querySelector("summary .faq-plus")).not.toBeNull();
  });

  it("points anything else to the email address, not social messages", () => {
    const { container } = render(<Faq />);
    expect(screen.getByRole("link", { name: CONTACT_EMAIL })).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);
    expect(container.querySelector('a[href*="instagram.com"], a[href*="linkedin.com"], a[href*="x.com"]')).toBeNull();
    expect(container).not.toHaveTextContent(/message me/i);
  });
});

describe("Early access close", () => {
  it("offers the email address as the second route, with no social messaging", () => {
    const { container } = render(<EarlyAccess />);
    const link = container.querySelector(".socials a")!;
    expect(link).toHaveAttribute("href", `mailto:${CONTACT_EMAIL}`);
    expect(container.querySelectorAll(".socials a")).toHaveLength(1);
    expect(container).not.toHaveTextContent(/message Chowderr/i);
  });

  it("shows the form's four steps with real answers, and tapping one opens the form with it picked", () => {
    // jsdom has <dialog> but not its methods
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    const { container } = render(<EarlyAccess />);
    const steps = container.querySelectorAll(".early-step");
    expect([...steps].map((s) => s.querySelector(".early-step-n")!.textContent)).toEqual(["1 About you", "2 Your content", "3 Your setup", "4 Last thing"]);
    const seen: unknown[] = [];
    const onPick = (e: Event) => seen.push((e as CustomEvent).detail);
    const onOpen = () => seen.push("open");
    window.addEventListener("early-access:pick", onPick);
    window.addEventListener("early-access:open", onOpen);
    fireEvent.click(screen.getByRole("button", { name: "Livestreams" }));
    fireEvent.click(screen.getByRole("button", { name: "The KINN" }));
    window.removeEventListener("early-access:pick", onPick);
    window.removeEventListener("early-access:open", onOpen);
    expect(seen).toEqual([{ field: "content", value: "streams" }, "open", { field: "source", value: "kinn" }, "open"]);
    expect(container.querySelector("dialog")).toHaveAttribute("open");
    expect(container).not.toHaveTextContent(/no server required/i);
  });
});
