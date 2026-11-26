/**
 * The footer's product news box posts to the app's double opt-in endpoint, from
 * NEXT_PUBLIC_NEWS_SIGNUP_URL (for example https://<app backend site URL>/email/news/subscribe).
 * Null until it is set, and then the box is left off the page. Read at build time.
 */
export function newsSignupUrl(value = process.env.NEXT_PUBLIC_NEWS_SIGNUP_URL): string | null {
  const url = value?.trim();
  return url && /^https?:\/\//.test(url) ? url : null;
}

/**
 * The words next to the box. The app records the same sentence as what the person agreed
 * to (WEBSITE_WORDING in the app), so change both together.
 */
export const NEWS_WORDING = "Get Takewon product news by email. We'll ask you to confirm first, and you can stop any time.";

export type NewsOutcome = "ok" | "invalid" | "busy" | "failed";

/** Sends one address. Never throws: a network failure or an odd answer is "failed". */
export async function subscribe(url: string, email: string, website = ""): Promise<NewsOutcome> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, website }),
    });
    const body = (await res.json().catch(() => null)) as { outcome?: string } | null;
    const outcome = body?.outcome;
    return outcome === "ok" || outcome === "invalid" || outcome === "busy" ? outcome : "failed";
  } catch {
    return "failed";
  }
}
