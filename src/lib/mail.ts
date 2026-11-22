/** Sending through toSend (tosend.com) with its official SDK (npm "tosend"). One place for the request, so both routes send the same way. */
import { ToSend, ToSendError } from "tosend";

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
  try {
    await new ToSend({ apiKey: setup.key, timeout: 15_000 }).send({
      from: { email: setup.from, name: "Takewon site" },
      to: [mail.to],
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    return true;
  } catch (error) {
    console.error("mail: toSend send failed", error instanceof ToSendError ? error.code : error);
    return false;
  }
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
    subject: "You’re on the list for Takewon",
    ...paragraphs([
      `Hi ${first},`,
      "Thanks for telling me what you make. Your answers came through, and I read every one of these myself and reply by email.",
      ...(trialUrl ? [`If you’d like to try it before then, the hosted version of Takewon is free for 3 days with no card: ${trialUrl}`] : []),
      "If you think of anything else, just reply to this email.",
      "Chowderr",
    ]),
  };
}
