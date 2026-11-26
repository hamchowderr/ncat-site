import { CONTACT_EMAIL } from "@/lib/contact";
import { NextResponse } from "next/server";
import { checkEarlyAccess, earlyAccessEmail } from "@/lib/early-access";
import { sendToApp } from "@/lib/beta";
import { addressOf, looksLikeBot, mayEmail, takeSignUp } from "@/lib/guard";
import { saveLead } from "@/lib/leads";
import { earlyAccessThanks, mailSetup, sendMail } from "@/lib/mail";
import { trialUrl } from "@/lib/trial";

/**
 * Receives the "Join the beta" form. Each sign-up goes to the Takewon app's Beta Testers
 * page (lib/beta.ts) and is kept in the site's Blob store as a backup (lib/leads.ts), then
 * emailed to Chowderr through toSend, and the visitor gets a short note saying it arrived.
 * Any one of those is enough to count as signed up; only when none is set up does the form
 * say the list is not open yet.
 *
 * Kept for people (lib/guard.ts): Vercel BotID turns bots away, one address gets a few
 * sign-ups in ten minutes, and nobody is emailed twice in a day however often their
 * address is typed in.
 */
export async function POST(request: Request) {
  if (await looksLikeBot()) {
    return NextResponse.json({ ok: false, error: "That did not come through. Try again." }, { status: 403 });
  }
  if (!takeSignUp(addressOf(request))) {
    return NextResponse.json(
      { ok: false, error: "That's a lot of sign-ups from here in a few minutes. Try again in a little while." },
      { status: 429 },
    );
  }
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

  const [inApp, inBlob] = await Promise.all([
    sendToApp(checked.value, request.headers.get("user-agent")),
    saveLead("early-access", answers),
  ]);
  const kept = inApp || inBlob;
  console.log("beta sign-up", { inApp, inBlob, newsletter: checked.value.newsletter === true });
  const setup = mailSetup();
  // The same address again within a day: kept above, but nobody is emailed again.
  if (setup && kept && !(await mayEmail(checked.value.email))) return NextResponse.json({ ok: true });
  if (!setup) {
    if (kept) return NextResponse.json({ ok: true });
    return NextResponse.json({ ok: false, error: `The list is not open yet. Email ${CONTACT_EMAIL} and you’ll hear back.` }, { status: 503 });
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
    return NextResponse.json({ ok: false, error: `That did not send. Try again, or email ${CONTACT_EMAIL}.` }, { status: 502 });
  }
  // The visitor's own copy. A failure here does not undo the sign-up.
  await sendMail(setup, {
    to: { email: checked.value.email, name: checked.value.name },
    replyTo: { email: setup.to, name: "Chowderr" },
    ...earlyAccessThanks(checked.value.name, trialUrl()),
  });
  return NextResponse.json({ ok: true });
}
