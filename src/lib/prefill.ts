/** Event the ask bars fire so the early-access form can pick up what the visitor typed. */
export const PREFILL_EVENT = "early-access:prefill";

/** Hand typed text to the early-access form and scroll to it. */
export function prefillEarlyAccess(text: string) {
  const t = text.trim();
  if (t) window.dispatchEvent(new CustomEvent<string>(PREFILL_EVENT, { detail: t }));
  const target = document.getElementById("early");
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", "#early");
}
