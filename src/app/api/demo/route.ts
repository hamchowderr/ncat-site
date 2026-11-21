import { NextResponse } from "next/server";
import { demoDeps } from "@/lib/demo/deps";
import { createDemo } from "@/lib/demo/service";
import { addressOf, looksLikeBot, takeDemoRun } from "@/lib/guard";

/** After sign-up: books one real run for the visitor's video, before it is uploaded. */
export async function POST(request: Request) {
  const deps = demoDeps(request);
  if (!deps) return NextResponse.json({ ok: false, error: "Real runs aren’t switched on yet. You’re still on the list." }, { status: 503 });
  if (await looksLikeBot()) return NextResponse.json({ ok: false, error: "That did not come through. Try again." }, { status: 403 });
  if (!takeDemoRun(addressOf(request))) return NextResponse.json({ ok: false, error: "That’s a few runs in a short time. Try again in ten minutes." }, { status: 429 });
  const body = await request.json().catch(() => null);
  const made = await createDemo(body, deps);
  return made.ok ? NextResponse.json(made) : NextResponse.json({ ok: false, error: made.error }, { status: made.status });
}
