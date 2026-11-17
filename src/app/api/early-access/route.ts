import { NextResponse } from "next/server";
import { checkEarlyAccess, earlyAccessEmail } from "@/lib/early-access";

/**
 * Receives the early-access form and emails it to Chowderr through toSend.
 * Needs TOSEND_API_KEY, EARLY_ACCESS_FROM (an address on a verified toSend domain)
 * and EARLY_ACCESS_TO. Without them the form says sign-ups are not open yet.
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

  const key = process.env.TOSEND_API_KEY, from = process.env.EARLY_ACCESS_FROM, to = process.env.EARLY_ACCESS_TO;
  if (!key || !from || !to) {
    return NextResponse.json({ ok: false, error: "The list is not open yet. Message Chowderr on any of the links below." }, { status: 503 });
  }
  const mail = earlyAccessEmail(checked.value);
  const res = await fetch("https://api.tosend.com/v2/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: { email: from, name: "NCA Dashboard site" },
      to: [{ email: to }],
      reply_to: { email: checked.value.email, name: checked.value.name },
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    }),
  }).catch(() => null);
  if (!res?.ok) {
    console.error("early-access: toSend send failed", res?.status);
    return NextResponse.json({ ok: false, error: "That did not send. Try again, or message Chowderr on any of the links below." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
