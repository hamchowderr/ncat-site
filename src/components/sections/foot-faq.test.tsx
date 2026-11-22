import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Faq, FAQ } from "./Faq";
import { Footer } from "./Footer";
import { EarlyAccess } from "./EarlyAccess";
import { CONTACT_EMAIL } from "@/lib/contact";

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
});
