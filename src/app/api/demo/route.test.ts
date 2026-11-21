import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const bot = vi.hoisted(() => ({ checkBotId: vi.fn(async () => ({ isBot: false })) }));
vi.mock("botid/server", () => bot);
const demo = vi.hoisted(() => ({ createDemo: vi.fn(async () => ({ ok: true, id: "d1" })), deps: vi.fn(() => ({}) as unknown) }));
vi.mock("@/lib/demo/service", () => ({ createDemo: demo.createDemo }));
vi.mock("@/lib/demo/deps", () => ({ demoDeps: demo.deps }));
import { forgetSignUps } from "@/lib/guard";
import { POST } from "./route";

const book = (from = "203.0.113.9") =>
  POST(new Request("http://localhost/api/demo", { method: "POST", headers: { "Content-Type": "application/json", "x-real-ip": from }, body: JSON.stringify({ email: "ava@studio.co" }) }));

describe("POST /api/demo, kept for people", () => {
  beforeEach(() => demo.deps.mockReturnValue({}));
  afterEach(() => { vi.unstubAllEnvs(); forgetSignUps(); demo.createDemo.mockClear(); bot.checkBotId.mockClear(); });

  it("books three runs from one address in ten minutes, then asks them to wait", async () => {
    for (let i = 0; i < 3; i++) expect((await book()).status).toBe(200);
    const res = await book();
    expect(res.status).toBe(429);
    expect((await res.json()).error).toMatch(/Try again/);
    expect(demo.createDemo).toHaveBeenCalledTimes(3);
    // Someone else is not held up.
    expect((await book("198.51.100.7")).status).toBe(200);
  });

  it("turns away a request BotID says is a bot, on Vercel, before booking anything", async () => {
    vi.stubEnv("VERCEL", "1");
    bot.checkBotId.mockResolvedValueOnce({ isBot: true });
    expect((await book()).status).toBe(403);
    expect(demo.createDemo).not.toHaveBeenCalled();
  });

  it("still says real runs are off before counting anything", async () => {
    demo.deps.mockReturnValue(null);
    expect((await book()).status).toBe(503);
    demo.deps.mockReturnValue({});
    for (let i = 0; i < 3; i++) expect((await book()).status).toBe(200);
  });
});
