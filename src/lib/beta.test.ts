import { describe, expect, it, vi } from "vitest";
import { betaAnswers, betaSetup, sendToApp } from "./beta";
import { checkEarlyAccess } from "./early-access";

const answers = checkEarlyAccess({
  name: "Ava",
  email: "ava@studio.co",
  role: "creator",
  teamSize: "solo",
  content: ["podcasts", "streams"],
  volume: "1-5",
  hosting: "unsure",
  jobs: ["captions"],
  source: "tech-week",
});
if (!answers.ok) throw new Error("fixture");

describe("beta sign-ups sent to the app", () => {
  it("are off until both the address and the secret are set, https only", () => {
    expect(betaSetup({} as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(betaSetup({ TAKEWON_BETA_URL: "http://x/beta/apply", BETA_SIGNUP_SECRET: "s" } as unknown as NodeJS.ProcessEnv)).toBeNull();
    expect(betaSetup({ TAKEWON_BETA_URL: "https://x/beta/apply", BETA_SIGNUP_SECRET: "s" } as unknown as NodeJS.ProcessEnv)).toEqual({ url: "https://x/beta/apply", secret: "s" });
  });

  it("carry each answer in the form's own words, leaving blanks out", () => {
    const list = betaAnswers(answers.value);
    expect(list).toContainEqual({ question: "Makes", answer: "Podcasts, Livestreams" });
    expect(list).toContainEqual({ question: "Would run it on", answer: "Not sure yet" });
    expect(list.find((a) => a.question === "Posts to")).toBeUndefined();
  });

  it("say false, and log, when the app can't be reached", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const post = vi.fn().mockRejectedValue(new Error("down"));
    expect(await sendToApp(answers.value, null, { url: "https://x/beta/apply", secret: "s" }, post)).toBe(false);
    expect(error).toHaveBeenCalled();
    const refused = vi.fn().mockResolvedValue(new Response("{}", { status: 401 }));
    expect(await sendToApp(answers.value, null, { url: "https://x/beta/apply", secret: "s" }, refused)).toBe(false);
    const body = JSON.parse(refused.mock.calls[0][1].body);
    expect(body.source).toBe("a16z Tech Week Los Angeles");
    error.mockRestore();
  });
});
