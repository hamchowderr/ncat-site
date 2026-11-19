import { describe, expect, it } from "vitest";
import { trialUrl } from "./trial";

describe("the trial address", () => {
  it("is used only when it is a full https address", () => {
    expect(trialUrl("https://app.example/sign-up")).toBe("https://app.example/sign-up");
    expect(trialUrl("  https://app.example  ")).toBe("https://app.example");
    expect(trialUrl("http://app.example")).toBeNull();
    expect(trialUrl("javascript:alert(1)")).toBeNull();
    expect(trialUrl("")).toBeNull();
    expect(trialUrl(undefined)).toBeNull();
  });
});
