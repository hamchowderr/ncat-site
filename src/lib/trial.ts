/**
 * Where the 3-day free trial starts: the hosted dashboard's sign-up page, from
 * NEXT_PUBLIC_TRIAL_URL. Null until it is set, and then the buttons lead to early access
 * instead. Read at build time, so a change needs a new deployment.
 */
export function trialUrl(value = process.env.NEXT_PUBLIC_TRIAL_URL): string | null {
  const url = value?.trim();
  return url && /^https:\/\//.test(url) ? url : null;
}

export const TRIAL_LABEL = "Start your 3-day free trial";
export const TRIAL_NOTE = "No card needed.";
