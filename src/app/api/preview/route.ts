import { NextResponse } from "next/server";
import { saveLead } from "@/lib/leads";
import { mailSetup, paragraphs, sendMail } from "@/lib/mail";
import { checkPreviewLead, describeTry } from "@/lib/preview";
import { trialUrl } from "@/lib/trial";

/**
 * Someone who tried the demo asks to save their clip previews. Their email and what they
 * tried (length and clip count, never the video) are kept and emailed to Chowderr, they
 * get a short note, and the browser then saves the previews it drew itself.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "That did not come through. Try again." }, { status: 400 });
  }
  const checked = checkPreviewLead(body);
  if (!checked.ok) return NextResponse.json({ ok: false, error: checked.error }, { status: 422 });
  const v = checked.value;
  if (v.website) return NextResponse.json({ ok: true });
  const tried = describeTry(v.seconds, v.clips);

  const kept = await saveLead("preview", { email: v.email, name: v.name, seconds: v.seconds, clips: v.clips });
  const setup = mailSetup();
  const sent = setup
    ? await sendMail(setup, {
        to: { email: setup.to },
        replyTo: { email: v.email, ...(v.name ? { name: v.name } : {}) },
        subject: `[Try it] Saved their previews: ${v.name || v.email}`,
        ...paragraphs([`${v.name || "Someone"} (${v.email}) tried the demo on ${tried} and saved the previews.`]),
      })
    : false;
  if (setup && (sent || kept)) {
    const trial = trialUrl();
    await sendMail(setup, {
      to: { email: v.email, ...(v.name ? { name: v.name } : {}) },
      replyTo: { email: setup.to, name: "Chowderr" },
      subject: "Your clip previews",
      ...paragraphs([
        `Hi${v.name ? ` ${v.name.split(" ")[0]}` : ""},`,
        `Your previews from ${tried} are saved on your computer. The preview splits the video evenly; the real automation cuts at the pauses in speech, makes every clip vertical, captions it and waits for your team to approve.`,
        trial
          ? `To run it on your own videos, the hosted dashboard is free for 3 days with no card: ${trial}`
          : "I’m opening the dashboard to a few teams at a time. Reply to this email and tell me what you make, and I’ll get back to you myself.",
        "Chowderr",
      ]),
    });
  }
  // The previews are the visitor's either way: nothing here keeps them from saving.
  return NextResponse.json({ ok: true });
}
