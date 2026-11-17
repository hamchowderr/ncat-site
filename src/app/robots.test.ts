import { describe, expect, it } from "vitest";
import { isIndexable } from "./robots";

describe("isIndexable", () => {
  it("only indexes production on a chosen domain", () => {
    expect(isIndexable({ VERCEL_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://example.com" })).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "production" })).toBe(false);
    expect(isIndexable({ VERCEL_ENV: "preview", NEXT_PUBLIC_SITE_URL: "https://example.com" })).toBe(false);
    expect(isIndexable({})).toBe(false);
  });
});
