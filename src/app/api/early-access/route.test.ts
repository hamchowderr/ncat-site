import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const post = (body: unknown) =>
  POST(new Request("http://localhost/api/early-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) }));
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
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); fetchMock.mockReset(); });

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
});
