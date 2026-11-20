import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const blob = vi.hoisted(() => ({ put: vi.fn(), head: vi.fn() }));
vi.mock("@vercel/blob", () => ({ put: blob.put, head: blob.head }));
const bot = vi.hoisted(() => ({ checkBotId: vi.fn(async () => ({ isBot: false })) }));
vi.mock("botid/server", () => bot);
import { forgetSignUps } from "@/lib/guard";
import { POST } from "./route";

const post = (body: unknown, from = "203.0.113.9") =>
  POST(new Request("http://localhost/api/early-access", { method: "POST", headers: { "Content-Type": "application/json", "x-real-ip": from }, body: typeof body === "string" ? body : JSON.stringify(body) }));
const valid = {
  name: "Ava",
  email: "ava@studio.co",
  role: "agency",
  teamSize: "6-20",
  content: ["podcasts"],
  volume: "5-20",
  hosting: "server",
  jobs: ["captions"],
  details: "Caption every upload",
};

describe("POST /api/early-access", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TOSEND_API_KEY", "test-key");
    vi.stubEnv("EARLY_ACCESS_FROM", "site@otakusolutions.io");
    vi.stubEnv("EARLY_ACCESS_TO", "owner@example.com");
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); fetchMock.mockReset(); blob.put.mockReset(); blob.head.mockReset(); bot.checkBotId.mockClear(); forgetSignUps(); });

  it("emails the sign-up through toSend with a reply-to", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ message_id: "m1" }), { status: 200 }));
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.tosend.com/v2/emails");
    expect(init.headers.Authorization).toBe("Bearer test-key");
    const sent = JSON.parse(init.body);
    expect(sent.to).toEqual([{ email: "owner@example.com" }]);
    expect(sent.reply_to).toEqual({ email: "ava@studio.co", name: "Ava" });
    expect(sent.text).toContain("Caption every upload");
    expect(sent.subject).toBe("[Editing agency · 6 to 20 · A rented server] Dashboard early access: Ava");
  });

  it("returns field errors without sending", async () => {
    const res = await post({ name: "", email: "x" });
    expect(res.status).toBe(422);
    expect((await res.json()).errors).toHaveProperty("email");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a body that is not JSON", async () => {
    expect((await post("nope")).status).toBe(400);
  });

  it("quietly drops bot submissions", async () => {
    const res = await post({ ...valid, website: "spam.example" });
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("says the list is not open when email is not set up", async () => {
    vi.stubEnv("TOSEND_API_KEY", "");
    const res = await post(valid);
    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports a failed send", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 500 }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await post(valid)).status).toBe(502);
    fetchMock.mockRejectedValue(new Error("offline"));
    expect((await post(valid)).status).toBe(502);
  });
  it("sends the visitor a note that it arrived, with replies going to Chowderr", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await post(valid);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const note = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(note.to).toEqual([{ email: "ava@studio.co", name: "Ava" }]);
    expect(note.reply_to).toEqual({ email: "owner@example.com", name: "Chowderr" });
    expect(note.subject).toBe("You’re on the list for the NCA Dashboard");
    expect(note.text).toContain("Hi Ava,");
    // No trial link until the trial has somewhere to start.
    expect(note.text).not.toContain("3 days");
  });

  it("offers the 3-day trial in the note once it has an address", async () => {
    vi.stubEnv("NEXT_PUBLIC_TRIAL_URL", "https://app.example/sign-up");
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await post(valid);
    const note = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(note.text).toContain("free for 3 days with no card: https://app.example/sign-up");
  });

  it("keeps a private copy of each sign-up, without the bot field", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "blob-token");
    blob.put.mockResolvedValue({ pathname: "x" });
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await post(valid);
    const [path, body, options] = blob.put.mock.calls[0];
    expect(path).toMatch(/^leads\/\d{4}-\d{2}-\d{2}\/early-access-[0-9a-f-]{36}\.json$/);
    expect(options).toMatchObject({ access: "private", contentType: "application/json" });
    const kept = JSON.parse(body);
    expect(kept).toMatchObject({ kind: "early-access", name: "Ava", email: "ava@studio.co", details: "Caption every upload" });
    expect(kept).not.toHaveProperty("website");
  });

  it("counts a kept sign-up as done while email is not set up yet", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "blob-token");
    vi.stubEnv("TOSEND_API_KEY", "");
    blob.put.mockResolvedValue({ pathname: "x" });
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("counts a kept sign-up as done when the email fails", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "blob-token");
    blob.put.mockResolvedValue({ pathname: "x" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue(new Response("{}", { status: 500 }));
    expect((await post(valid)).status).toBe(200);
  });

  it("still emails when the copy cannot be kept", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "blob-token");
    blob.put.mockRejectedValue(new Error("store gone"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    expect((await post(valid)).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it("puts people who tried the demo first: tagged in the subject and kept with the sign-up", async () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "blob-token");
    blob.put.mockResolvedValue({ pathname: "x" });
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await post({ ...valid, tried: "a 35 s video, cut into 5 clips" });
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.subject).toBe("[Tried the demo · Editing agency · 6 to 20 · A rented server] Dashboard early access: Ava");
    expect(sent.text).toContain("On: a 35 s video, cut into 5 clips");
    expect(JSON.parse(blob.put.mock.calls[0][1])).toMatchObject({ tried: "a 35 s video, cut into 5 clips" });
  });

  it("leaves the tag off for everyone else", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    await post(valid);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).subject).not.toContain("Tried the demo");
  });

  describe("kept for people", () => {
    it("turns away a request BotID says is a bot, on Vercel", async () => {
      vi.stubEnv("VERCEL", "1");
      bot.checkBotId.mockResolvedValueOnce({ isBot: true });
      const res = await post(valid);
      expect(res.status).toBe(403);
      expect(fetchMock).not.toHaveBeenCalled();
      expect(blob.put).not.toHaveBeenCalled();
    });

    it("skips BotID away from Vercel, and lets people through when it fails", async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ message_id: "m1" }), { status: 200 }));
      expect((await post(valid)).status).toBe(200);
      expect(bot.checkBotId).not.toHaveBeenCalled();
      vi.stubEnv("VERCEL", "1");
      bot.checkBotId.mockRejectedValueOnce(new Error("down"));
      expect((await post(valid, "198.51.100.7")).status).toBe(200);
    });

    it("allows five sign-ups in ten minutes from one address, then asks them to wait", async () => {
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ message_id: "m1" }), { status: 200 }));
      for (let i = 0; i < 5; i++) expect((await post(valid)).status).toBe(200);
      const res = await post(valid);
      expect(res.status).toBe(429);
      expect((await res.json()).error).toMatch(/Try again/);
      // Someone else is not held up.
      expect((await post(valid, "198.51.100.7")).status).toBe(200);
    });

    it("keeps a repeat sign-up but emails nobody twice in a day", async () => {
      vi.stubEnv("BLOB_READ_WRITE_TOKEN", "blob-token");
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ message_id: "m1" }), { status: 200 }));
      blob.head.mockResolvedValueOnce({ uploadedAt: new Date() });
      const res = await post(valid);
      expect(res.status).toBe(200);
      expect(fetchMock).not.toHaveBeenCalled();
      // The sign-up itself was kept.
      expect(blob.put.mock.calls.some(([path]) => String(path).startsWith("leads/"))).toBe(true);
    });

    it("emails a first sign-up, and notes it by a hash, never the address", async () => {
      vi.stubEnv("BLOB_READ_WRITE_TOKEN", "blob-token");
      fetchMock.mockResolvedValue(new Response(JSON.stringify({ message_id: "m1" }), { status: 200 }));
      blob.head.mockRejectedValueOnce(new Error("not found"));
      expect((await post(valid)).status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      const noted = blob.put.mock.calls.find(([path]) => String(path).startsWith("mailed/"));
      expect(noted?.[0]).toMatch(/^mailed\/[0-9a-f]{64}\.json$/);
      expect(String(noted?.[0])).not.toContain("ava");
    });
  });
});
