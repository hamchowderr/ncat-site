import { NextResponse } from "next/server";
import { demoDeps } from "@/lib/demo/deps";
import { demoHook } from "@/lib/demo/service";

/** The toolkit posts each finished job here. The address carries the run's key. */
export async function POST(request: Request) {
  const deps = demoDeps(request);
  if (!deps) return NextResponse.json({ ok: false }, { status: 503 });
  const url = new URL(request.url);
  const envelope = await request.json().catch(() => null);
  const ok = await demoHook(url.searchParams.get("id") ?? "", url.searchParams.get("k"), url.searchParams.get("job") ?? "", envelope, deps);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
