import { describe, expect, it } from "vitest";
import { checkEarlyAccess, earlyAccessEmail } from "./early-access";

describe("checkEarlyAccess", () => {
  it("accepts a name and email and trims them", () => {
    const r = checkEarlyAccess({ name: "  Ava ", email: "ava@studio.co ", who: "team", job: "Caption every upload" });
    expect(r).toEqual({ ok: true, value: { name: "Ava", email: "ava@studio.co", who: "team", job: "Caption every upload", website: "" } });
  });
  it("asks for a name and a real email", () => {
    const r = checkEarlyAccess({ name: "", email: "not-an-email" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["email", "name"]);
  });
  it("treats anything but team as solo and ignores junk input", () => {
    expect(checkEarlyAccess(null).ok).toBe(false);
    const r = checkEarlyAccess({ name: "Bo", email: "bo@x.io", who: "everyone" });
    expect(r.ok && r.value.who).toBe("solo");
  });
  it("caps very long text", () => {
    const r = checkEarlyAccess({ name: "Bo", email: "bo@x.io", job: "x".repeat(5000) });
    expect(r.ok && r.value.job.length).toBe(2000);
  });
});

describe("earlyAccessEmail", () => {
  it("escapes HTML from the form", () => {
    const m = earlyAccessEmail({ name: "<b>Bo</b>", email: "bo@x.io", who: "solo", job: "" });
    expect(m.subject).toBe("Dashboard early access: <b>Bo</b>");
    expect(m.html).toContain("&lt;b&gt;Bo&lt;/b&gt;");
    expect(m.text).toContain("First job to automate: (not given)");
  });
});
