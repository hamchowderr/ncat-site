/** Sending through toSend (tosend.com). One place for the request, so both routes send the same way. */
export type Mail = {
  to: { email: string; name?: string };
  replyTo?: { email: string; name?: string };
  subject: string;
  text: string;
  html: string;
};

export type MailSetup = { key: string; from: string; to: string };

/** TOSEND_API_KEY, EARLY_ACCESS_FROM and EARLY_ACCESS_TO, or null while any is missing. */
export function mailSetup(): MailSetup | null {
  const key = process.env.TOSEND_API_KEY, from = process.env.EARLY_ACCESS_FROM, to = process.env.EARLY_ACCESS_TO;
  return key && from && to ? { key, from, to } : null;
}

export async function sendMail(setup: MailSetup, mail: Mail): Promise<boolean> {
  const res = await fetch("https://api.tosend.com/v2/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${setup.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: { email: setup.from, name: "NCA Dashboard site" },
      to: [mail.to],
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
  }).catch(() => null);
  if (!res?.ok) console.error("mail: toSend send failed", res?.status);
  return !!res?.ok;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Plain paragraphs as text and as simple HTML. */
export function paragraphs(lines: string[]): { text: string; html: string } {
  return {
    text: lines.join("\n\n"),
    html: lines.map((l) => `<p style="margin:0 0 14px;line-height:1.5">${esc(l)}</p>`).join(""),
  };
}

/** The note the visitor gets after the early-access form: it arrived, and what happens next. */
export function earlyAccessThanks(name: string, trialUrl: string | null) {
  const first = name.split(" ")[0] || "there";
  return {
    subject: "You’re on the list for the NCA Dashboard",
    ...paragraphs([
      `Hi ${first},`,
      "Thanks for telling me what you make. Your answers came through, and I read every one of these myself and reply by email.",
      ...(trialUrl ? [`If you’d like to try it before then, the hosted dashboard is free for 3 days with no card: ${trialUrl}`] : []),
      "If you think of anything else, just reply to this email.",
      "Chowderr",
    ]),
  };
}
