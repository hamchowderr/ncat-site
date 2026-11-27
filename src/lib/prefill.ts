/** Event the ask bars fire so the early-access form can pick up what the visitor typed. */
export const PREFILL_EVENT = "early-access:prefill";
/** Event the step previews fire so the form starts with that answer picked. */
export const PICK_EVENT = "early-access:pick";
/** An answer picked before the form opens: a ticked box for content, the one choice for source. */
export type Pick = { field: "content" | "source"; value: string };
/** Event that opens the early-access pop-up. */
export const OPEN_EVENT = "early-access:open";

export type SignedUp = { name: string; email: string };

export type OpenDetail = {
  /** What they tried in the demo, e.g. "a 35 s video, cut into 5 clips". Marks the sign-up to go first. */
  tried?: string;
  /** Called once the visitor has signed up, with who they are, e.g. to run their video. */
  onSent?: (who: SignedUp) => void;
};

/** Opens the early-access pop-up, with `text` written into "In your words" when given. */
export function openEarlyAccess(text?: string, detail: OpenDetail = {}) {
  const t = text?.trim();
  if (t) window.dispatchEvent(new CustomEvent<string>(PREFILL_EVENT, { detail: t }));
  window.dispatchEvent(new CustomEvent<OpenDetail>(OPEN_EVENT, { detail }));
}

/** Opens the early-access pop-up with one answer already picked. */
export function pickEarlyAccess(pick: Pick) {
  window.dispatchEvent(new CustomEvent<Pick>(PICK_EVENT, { detail: pick }));
  window.dispatchEvent(new CustomEvent<OpenDetail>(OPEN_EVENT, { detail: {} }));
}

/** Kept for the ask bars: hand typed text to the form and open it. */
export const prefillEarlyAccess = (text: string) => openEarlyAccess(text);

/** Whether a link is one of the site's "Get early access" links. */
export function isEarlyAccessLink(href: string | null): boolean {
  return !!href && /^\/?#early$/.test(href);
}
