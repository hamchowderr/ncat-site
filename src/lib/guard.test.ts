import { afterEach, describe, expect, it } from "vitest";
import { addressOf, forgetSignUps, takeSignUp, takeDemoRun } from "./guard";

afterEach(() => forgetSignUps());

describe("the sign-up allowance", () => {
  it("comes back after ten minutes", () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) expect(takeSignUp("203.0.113.9", now)).toBe(true);
    expect(takeSignUp("203.0.113.9", now + 60_000)).toBe(false);
    expect(takeSignUp("203.0.113.9", now + 10 * 60_000 + 1)).toBe(true);
  });

  it("has a ceiling for everyone together", () => {
    const now = Date.now();
    for (let i = 0; i < 100; i++) expect(takeSignUp(`198.51.100.${i}`, now)).toBe(true);
    expect(takeSignUp("192.0.2.1", now)).toBe(false);
  });

  it("reads the visitor's address as Vercel passes it", () => {
    expect(addressOf(new Request("http://x", { headers: { "x-real-ip": "203.0.113.9" } }))).toBe("203.0.113.9");
    expect(addressOf(new Request("http://x", { headers: { "x-forwarded-for": "203.0.113.9, 10.0.0.1" } }))).toBe("203.0.113.9");
    expect(addressOf(new Request("http://x"))).toBe("unknown");
  });
});

describe("the real demo's allowance", () => {
  it("lets one address book three runs in ten minutes, then again after", () => {
    const at = 1_000_000;
    for (let i = 0; i < 3; i++) expect(takeDemoRun("203.0.113.5", at)).toBe(true);
    expect(takeDemoRun("203.0.113.5", at)).toBe(false);
    expect(takeDemoRun("198.51.100.2", at)).toBe(true);
    expect(takeDemoRun("203.0.113.5", at + 10 * 60 * 1000)).toBe(true);
  });

  it("is kept apart from the sign-up allowance", () => {
    for (let i = 0; i < 3; i++) takeDemoRun("203.0.113.6", 5);
    expect(takeSignUp("203.0.113.6", 5)).toBe(true);
  });
});
