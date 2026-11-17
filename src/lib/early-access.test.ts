import { describe, expect, it } from "vitest";
import { checkEarlyAccess, earlyAccessEmail, STEPS } from "./early-access";

const full = {
  name: "  Ava Reyes ", email: "ava@studio.co", link: "https://youtube.com/@ava", role: "agency", teamSize: "6-20",
  content: ["podcasts", "client-work"], platforms: ["youtube", "tiktok"], volume: "5-20", hosting: "machine", toolkit: "new",
  editors: ["premiere"], jobs: ["captions", "vertical"], details: "Clips for 12 clients a week", source: "kinn",
};

describe("checkEarlyAccess", () => {
  it("accepts a full intake and trims text", () => {
    const r = checkEarlyAccess(full);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toMatchObject({ name: "Ava Reyes", role: "agency", content: ["podcasts", "client-work"] });
  });

  it("names every missing required answer", () => {
    const r = checkEarlyAccess({});
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["content", "email", "hosting", "jobs", "name", "role", "teamSize", "volume"]);
  });

  it("checks one step at a time when asked", () => {
    const r = checkEarlyAccess({ name: "Bo", email: "bo@x.io", role: "creator", teamSize: "solo" }, STEPS[0].fields);
    expect(r.ok).toBe(true);
    const r2 = checkEarlyAccess({ name: "Bo", email: "nope" }, STEPS[0].fields);
    expect(!r2.ok && r2.errors.email).toBe("That email address doesn’t look right.");
  });

  it("drops answers that are not on the list and repeats", () => {
    const r = checkEarlyAccess({ ...full, role: "hacker", platforms: ["youtube", "youtube", "myspace"], jobs: "captions" });
    expect(!r.ok && r.errors.role).toBeTruthy();
    const r2 = checkEarlyAccess({ ...full, platforms: ["youtube", "youtube", "myspace"], jobs: "captions" });
    expect(r2.ok && r2.value.platforms).toEqual(["youtube"]);
    expect(r2.ok && r2.value.jobs).toEqual(["captions"]);
  });

  it("lets the person describe the job instead of ticking one", () => {
    const r = checkEarlyAccess({ ...full, jobs: [], details: "Something custom" });
    expect(r.ok).toBe(true);
  });

  it("caps long text", () => {
    const r = checkEarlyAccess({ ...full, details: "x".repeat(5000) });
    expect(r.ok && r.value.details.length).toBe(2000);
  });
});

describe("earlyAccessEmail", () => {
  it("tags the subject for sorting and groups answers by step", () => {
    const r = checkEarlyAccess(full);
    if (!r.ok) throw new Error("expected valid");
    const m = earlyAccessEmail(r.value);
    expect(m.subject).toBe("[Editing agency · 6 to 20 · My own always-on machine, like a Mac Mini] Dashboard early access: Ava Reyes");
    expect(m.text).toContain("THEIR CONTENT\nMakes: Podcasts, Client edits\nPosts to: YouTube, TikTok");
    expect(m.text).toContain("Heard about it from: The KINN");
    expect(m.text).not.toContain("undefined");
  });

  it("escapes HTML from the form", () => {
    const r = checkEarlyAccess({ ...full, name: "<b>Bo</b>" });
    if (!r.ok) throw new Error("expected valid");
    expect(earlyAccessEmail(r.value).html).toContain("&lt;b&gt;Bo&lt;/b&gt;");
  });
});
