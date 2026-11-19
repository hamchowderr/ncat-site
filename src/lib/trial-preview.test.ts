import { describe, expect, it } from "vitest";
import { checkPreviewLead, describeTry } from "./preview";
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

describe("what someone tried", () => {
  it("reads like a sentence", () => {
    expect(describeTry(35, 5)).toBe("a 35 s video, cut into 5 clips");
    expect(describeTry(840, 14)).toBe("a 14 min video, cut into 14 clips");
    expect(describeTry(3780, 63)).toBe("a 1 h 3 min video, cut into 63 clips");
    expect(describeTry(6, 1)).toBe("a 6 s video, cut into 1 clip");
  });

  it("keeps only an email, a name and two numbers in range", () => {
    const r = checkPreviewLead({ email: " ava@studio.co ", seconds: -4, clips: 999, extra: "x" });
    expect(r).toEqual({ ok: true, value: { email: "ava@studio.co", name: "", seconds: 0, clips: 100, website: "" } });
    expect(checkPreviewLead({ email: "a@b" }).ok).toBe(false);
    expect(checkPreviewLead(null).ok).toBe(false);
  });
});
