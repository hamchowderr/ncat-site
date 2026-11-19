import { NextResponse } from "next/server";
import { blobStore } from "@/lib/demo/store";

/** Daily (vercel.json): deletes visitors' uploaded videos after 7 days. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ ok: true, removed: 0 });
  const removed = await blobStore.removeUploadsBefore(Date.now() - 7 * 24 * 60 * 60_000);
  return NextResponse.json({ ok: true, removed });
}
