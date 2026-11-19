import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const blob = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock("@vercel/blob", () => ({ put: blob.put }));
import { POST } from "./route";

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) }));
const valid = { email: "ava@studio.co", seconds: 840, clips: 14 };

describe("POST /api/preview", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TOSEND_API_KEY", "test-key");
    vi.stubEnv("EARLY_ACCESS_FROM", "site@otakusolutions.io");
    vi.stubEnv("EARLY_ACCESS_TO", "owner@example.com");
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); fetchMock.mockReset(); blob.put.mockReset(); });

  it("tells Chowderr who saved previews and what they tried, and sends them a note", async () => {
    const res = await post(valid);
    expect(res.status).toBe(200);
    const [toOwner, toVisitor] = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
    expect(toOwner.to).toEqual([{ email: "owner@example.com" }]);
    expect(toOwner.reply_to).toEqual({ email: "ava@studio.co" });
    expect(toOwner.text).toContain("a 14 min video, cut into 14 clips");
    expect(toVisitor.to).toEqual([{ email: "ava@studio.co" }]);
    expect(toVisitor.reply_to).toEqual({ email: "owner@example.com", name: "Chowderr" });
    expect(toVisitor.subject).toBe("Your clip previews");
  });

  it("points the note at the trial once it has an address", async () => {
    vi.stubEnv("NEXT_PUBLIC_TRIAL_URL", "https://app.example/sign-up");
    await post(valid);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).text).toContain("free for 3 days with no card: https://app.example/sign-up");
  });

  it("keeps the email and what was tried, and never any video", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "blob-token");
    blob.put.mockResolvedValue({ pathname: "x" });
    await post({ ...valid, file: "data:video/mp4;base64,AAAA" });
    const [path, body] = blob.put.mock.calls[0];
    expect(path).toMatch(/^leads\/\d{4}-\d{2}-\d{2}\/preview-/);
    expect(Object.keys(JSON.parse(body)).sort()).toEqual(["at", "clips", "email", "kind", "name", "seconds"]);
  });

  it("refuses an address that is not one", async () => {
    const res = await post({ ...valid, email: "nope" });
    expect(res.status).toBe(422);
    expect((await res.json()).error).toBe("That email address doesn’t look right.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lets the previews save even with nothing set up", async () => {
    vi.stubEnv("TOSEND_API_KEY", "");
    expect((await post(valid)).status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("quietly drops bots and bodies that are not JSON", async () => {
    expect((await post({ ...valid, website: "spam" })).status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect((await post("nope")).status).toBe(400);
  });
});
