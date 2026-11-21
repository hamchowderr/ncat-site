import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Faq, FAQ } from "./Faq";
import { Footer } from "./Footer";

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

  it("points anything else to a direct message", () => {
    render(<Faq />);
    for (const name of ["Instagram", "LinkedIn", "X"]) expect(screen.getByRole("link", { name })).toHaveAttribute("href", expect.stringMatching(/instagram\.com\/hamchowderr|linkedin\.com\/in\/tylanmiller|x\.com\/hamchowderr/));
  });
});
