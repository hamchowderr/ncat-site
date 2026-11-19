import { NextResponse } from "next/server";
import { checkEarlyAccess, earlyAccessEmail } from "@/lib/early-access";
import { saveLead } from "@/lib/leads";
import { earlyAccessThanks, mailSetup, sendMail } from "@/lib/mail";
import { trialUrl } from "@/lib/trial";

/**
 * Receives the early-access form. Each sign-up is kept in the site's Blob store first
 * (see lib/leads.ts), then emailed to Chowderr through toSend, and the visitor gets a
 * short note saying it arrived. Kept or emailed is enough to count as signed up; only when
 * neither is set up does the form say the list is not open yet.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "That did not come through. Try again." }, { status: 400 });
  }
  const checked = checkEarlyAccess(body);
  if (!checked.ok) return NextResponse.json({ ok: false, errors: checked.errors }, { status: 422 });
  // Bots fill the hidden field; pretend it worked so they move on.
  if (checked.value.website) return NextResponse.json({ ok: true });
  const { website: _bot, ...answers } = checked.value; // eslint-disable-line @typescript-eslint/no-unused-vars

  const kept = await saveLead("early-access", answers);
  const setup = mailSetup();
  if (!setup) {
    if (kept) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, error: "The list is not open yet. Message Chowderr on any of the links below." }, { status: 503 });
  }
  const mail = earlyAccessEmail(checked.value);
  const sent = await sendMail(setup, {
    to: { email: setup.to },
    replyTo: { email: checked.value.email, name: checked.value.name },
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
  if (!sent && !kept) {
    return NextResponse.json({ ok: false, error: "That did not send. Try again, or message Chowderr on any of the links below." }, { status: 502 });
  }
  // The visitor's own copy. A failure here does not undo the sign-up.
  await sendMail(setup, {
    to: { email: checked.value.email, name: checked.value.name },
    replyTo: { email: setup.to, name: "Chowderr" },
    ...earlyAccessThanks(checked.value.name, trialUrl()),
  });
  return NextResponse.json({ ok: true });
}
