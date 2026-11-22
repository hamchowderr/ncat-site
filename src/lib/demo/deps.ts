import { mailSetup, paragraphs, sendMail } from "@/lib/mail";
import type { Demo } from "./run";
import type { DemoDeps } from "./service";
import { blobStore, demoSecret } from "./store";
import { httpToolkit, toolkitSetup } from "./toolkit";

/** The site's own address: NEXT_PUBLIC_SITE_URL, else the deployment's, else the request's. */
export function siteUrl(request: Request): string {
  const set = process.env.NEXT_PUBLIC_SITE_URL;
  if (set && !/example\.com/.test(set)) return set.replace(/\/+$/, "");
  return new URL(request.url).origin;
}

/** The email with the link to their clips. */
export function clipsReadyEmail(demo: Demo, link: string) {
  const first = demo.name.split(" ")[0] || "there";
  const n = demo.clips.length;
  return {
    subject: "Your clips are ready",
    ...paragraphs([
      `Hi ${first},`,
      `The toolkit cut ${demo.fileName} into ${n} vertical ${n === 1 ? "clip" : "clips"}${demo.clips.every((c) => c.captioned) ? " with captions" : ""}. Watch and download them here: ${link}`,
      "The link works for 7 days. In Takewon this runs by itself every time a new video comes in.",
      "If you have questions, just reply to this email.",
      "Chowderr",
    ]),
  };
}

/** Null while Blob storage is not connected. */
export function demoDeps(request: Request): DemoDeps | null {
  const secret = demoSecret();
  if (!secret || !process.env.BLOB_READ_WRITE_TOKEN) return null;
  const setup = toolkitSetup();
  return {
    store: blobStore,
    toolkit: setup ? httpToolkit(setup) : null,
    secret,
    siteUrl: siteUrl(request),
    now: () => Date.now(),
    dailyLimit: Number(process.env.DEMO_DAILY_LIMIT) > 0 ? Number(process.env.DEMO_DAILY_LIMIT) : 40,
    async sendReady(demo, link) {
      const mail = mailSetup();
      if (!mail) return false;
      return sendMail(mail, { to: { email: demo.email, name: demo.name }, replyTo: { email: mail.to, name: "Chowderr" }, ...clipsReadyEmail(demo, link) });
    },
  };
}

/** Whether the demo can run real jobs: storage and a toolkit are both set up. */
export const demoEnabled = () => !!(process.env.BLOB_READ_WRITE_TOKEN && toolkitSetup());
