import { afterEach, describe, expect, it, vi } from "vitest";
import { sendMail } from "./mail";

const setup = { key: "tsend_key", from: "site@takewon.com", to: "owner@example.com" };
const mail = { to: { email: "ava@studio.co" }, subject: "Hi", text: "Hello", html: "<p>Hello</p>" };

describe("sendMail", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends through toSend's API with the key and the site as sender", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ message_id: "m1" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendMail(setup, mail)).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.tosend.com/v2/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tsend_key");
    expect(JSON.parse(String(init.body))).toMatchObject({
      from: { email: "site@takewon.com", name: "Takewon site" },
      to: [{ email: "ava@studio.co" }],
      subject: "Hi",
    });
  });

  it("says no, without throwing, when toSend refuses or sends back a gateway page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ message: "Invalid API key" }), { status: 401 })));
    expect(await sendMail(setup, mail)).toBe(false);
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>Bad gateway</html>", { status: 502 })));
    expect(await sendMail(setup, mail)).toBe(false);
  });

  it("says no when toSend cannot be reached", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    expect(await sendMail(setup, mail)).toBe(false);
  });
});
