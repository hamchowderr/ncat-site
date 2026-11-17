import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

// Vite imports images as plain URLs, so next/image's static-import checks do not apply here.
// Render a plain <img> that keeps the alt text and source the tests look at.
vi.mock("next/image", () => ({
  default: (props: { src: string | { src: string }; alt: string; className?: string }) =>
    createElement("img", { src: typeof props.src === "string" ? props.src : props.src.src, alt: props.alt, className: props.className }),
}));
