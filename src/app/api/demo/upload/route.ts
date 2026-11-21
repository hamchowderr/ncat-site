import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { demoDeps } from "@/lib/demo/deps";
import { MAX_BYTES } from "@/lib/demo/run";
import { mayUpload } from "@/lib/demo/service";

/**
 * Lets the browser upload the visitor's video straight to the site's private Blob store,
 * only to the place booked for their run, only a video, and only up to 1 GB.
 */
export async function POST(request: Request) {
  const deps = demoDeps(request);
  if (!deps) return NextResponse.json({ error: "Uploads aren’t switched on yet." }, { status: 503 });
  try {
    const body = (await request.json()) as HandleUploadBody;
    const answer = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload: unknown = null;
        try {
          payload = clientPayload ? JSON.parse(clientPayload) : null;
        } catch {
          payload = null;
        }
        if (!(await mayUpload(pathname, payload, deps))) throw new Error("This upload is not booked.");
        return {
          allowedContentTypes: ["video/*", "application/octet-stream"],
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: false,
          allowOverwrite: true,
          validUntil: Date.now() + 60 * 60_000,
        };
      },
    });
    return NextResponse.json(answer);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload refused." }, { status: 400 });
  }
}
