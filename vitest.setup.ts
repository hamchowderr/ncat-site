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

// jsdom has no matchMedia; the scroll animations (gsap) ask for it when they load.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList;
}

// jsdom has no IntersectionObserver either; the spotlight tiles watch whether they are on screen.
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  class NoObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.assign(window, { IntersectionObserver: NoObserver });
}

// Nor ResizeObserver; the scroll scene and the shape demo measure their boxes with it.
if (typeof window !== "undefined" && !("ResizeObserver" in window)) {
  class NoResize {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.assign(window, { ResizeObserver: NoResize });
}
