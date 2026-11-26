import {
  CONTENT,
  EDITORS,
  HOSTING,
  JOBS,
  NEWSLETTER_WORDING,
  PLATFORMS,
  ROLES,
  SOURCES,
  TEAM_SIZES,
  TOOLKIT,
  VOLUMES,
  type EarlyAccessInput,
} from "@/lib/early-access";

/**
 * Sends a beta sign-up to the Takewon app, server to server, where it shows on the Admin
 * page Beta Testers and the operator invites it (the app's convex/beta.ts). Needs
 * TAKEWON_BETA_URL (the app's `<Convex HTTP address>/beta/apply`) and BETA_SIGNUP_SECRET,
 * the same secret set on the app. Without them, this answers false and the sign-up is
 * only kept in Blob and emailed.
 */
type Option = { readonly value: string; readonly label: string };
const label = (o: readonly Option[], v: string) => o.find((x) => x.value === v)?.label ?? "";
const labels = (o: readonly Option[], vs: string[]) => vs.map((v) => label(o, v)).filter(Boolean).join(", ");

/** The answers as the app keeps them: each question in the form's words, then the answer. */
export function betaAnswers(v: EarlyAccessInput): { question: string; answer: string }[] {
  return (
    [
      ["What describes them", label(ROLES, v.role)],
      ["People who'd use it", label(TEAM_SIZES, v.teamSize)],
      ["Makes", labels(CONTENT, v.content)],
      ["Posts to", labels(PLATFORMS, v.platforms)],
      ["Records each week", label(VOLUMES, v.volume)],
      ["Would run it on", label(HOSTING, v.hosting)],
      ["NCA Toolkit", label(TOOLKIT, v.toolkit)],
      ["Finishes videos in", labels(EDITORS, v.editors)],
      ["Jobs to run by themselves", labels(JOBS, v.jobs)],
      ["First automation, in their words", v.details],
      ["Tried the demo first", v.tried ?? ""],
    ] as [string, string][]
  )
    .filter(([, answer]) => answer)
    .map(([question, answer]) => ({ question, answer }));
}

export function betaSetup(env: NodeJS.ProcessEnv = process.env) {
  const url = env.TAKEWON_BETA_URL?.trim();
  const secret = env.BETA_SIGNUP_SECRET?.trim();
  if (!url || !secret || !url.startsWith("https://")) return null;
  return { url, secret };
}

export async function sendToApp(
  v: EarlyAccessInput,
  userAgent: string | null,
  setup = betaSetup(),
  post: typeof fetch = fetch,
): Promise<boolean> {
  if (!setup) return false;
  const source = label(SOURCES, v.source);
  try {
    const res = await post(setup.url, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${setup.secret}` },
      body: JSON.stringify({
        email: v.email,
        name: v.name,
        answers: betaAnswers(v),
        ...(v.link ? { link: v.link } : {}),
        ...(source ? { source } : {}),
        ...(v.newsletter ? { newsletter: true, newsletterWording: NEWSLETTER_WORDING } : {}),
        ...(userAgent ? { userAgent: userAgent.slice(0, 300) } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("beta: the app refused the sign-up", res.status);
    return res.ok;
  } catch (error) {
    console.error("beta: could not reach the app", error instanceof Error ? error.message : error);
    return false;
  }
}
