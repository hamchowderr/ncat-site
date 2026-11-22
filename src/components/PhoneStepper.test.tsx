import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PhoneStepper } from "./PhoneStepper";

const ITEMS = [
  { id: "a", label: "Creators" },
  { id: "b", label: "Podcast Teams" },
  { id: "c", label: "Coaches" },
];

function Harness() {
  const [i, setI] = useState(0);
  return <PhoneStepper items={ITEMS} active={i} onChange={setI} label="Who it is for" controls="panel" />;
}

describe("the phone stepper", () => {
  it("shows one choice, steps back and forward around the ends, and has a dot for each", () => {
    render(<Harness />);
    const group = screen.getByRole("group", { name: "Who it is for" });
    expect(group).toHaveTextContent("Creators");
    fireEvent.click(screen.getByRole("button", { name: "Next: Podcast Teams" }));
    expect(group.querySelector(".stepper-now")).toHaveTextContent("Podcast Teams");
    fireEvent.click(screen.getByRole("button", { name: "Previous: Creators" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous: Coaches" }));
    expect(group.querySelector(".stepper-now")).toHaveTextContent("Coaches");
    const dots = screen.getAllByRole("button", { name: /\(\d of 3\)$/ });
    expect(dots).toHaveLength(3);
    expect(dots[2]).toHaveAttribute("aria-current", "true");
    fireEvent.click(dots[0]);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
  });
});
