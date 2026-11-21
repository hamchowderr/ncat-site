import { NextResponse } from "next/server";
import { demoDeps } from "@/lib/demo/deps";
import { startDemo } from "@/lib/demo/service";

/** The upload is in: hands the video to the toolkit. */
export async function POST(request: Request) {
  const deps = demoDeps(request);
  if (!deps) return NextResponse.json({ ok: false, error: "Real runs aren’t switched on yet." }, { status: 503 });
  const body = ((await request.json().catch(() => null)) ?? {}) as { id?: unknown; key?: unknown };
  const started = await startDemo(String(body.id ?? ""), body.key, deps);
  return started.ok ? NextResponse.json(started) : NextResponse.json({ ok: false, error: started.error }, { status: started.status });
}
