import { NextResponse } from "next/server";
import { demoDeps } from "@/lib/demo/deps";
import { demoStatus } from "@/lib/demo/service";

export const dynamic = "force-dynamic";

/** Where a run is. Asking also moves it on, so the page asking every few seconds drives it. */
export async function GET(request: Request) {
  const deps = demoDeps(request);
  if (!deps) return NextResponse.json({ ok: false, error: "Real runs aren’t switched on yet." }, { status: 503 });
  const url = new URL(request.url);
  const found = await demoStatus(url.searchParams.get("id") ?? "", url.searchParams.get("k"), deps);
  return found.ok ? NextResponse.json(found, { headers: { "cache-control": "no-store" } }) : NextResponse.json({ ok: false, error: found.error }, { status: found.status });
}
