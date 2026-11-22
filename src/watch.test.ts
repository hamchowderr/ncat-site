// @vitest-environment node
import { openSync, readdirSync, readSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The explainer videos the dashboard's "Watch how" button plays from takewon.com/watch.
// The names must match the list in the dashboard (ncat-dash src/lib/watch-how.ts).
const VIDEOS = [
  "01-getting-set-up",
  "02-start-from-a-template",
  "03-build-your-own-automation",
  "04-other-ways-to-start",
  "05-how-steps-connect-themselves",
  "06-test-a-step",
  "07-set-your-brand-once",
  "08-drafts-publishing-and-undo",
  "09-logic-steps",
  "10-your-team",
  "11-approvals",
  "12-when-something-fails",
  "13-a-backup-plan-when-a-step-fails",
  "14-your-files",
  "15-open-in-your-editor",
  "16-share-an-automation",
  "17-the-agent",
  "18-the-review-room",
  "19-your-library",
  "20-your-calendar",
  "21-clients-and-projects",
  "22-chains",
  "23-b-roll-and-motion",
  "24-your-inbox",
  "25-home",
  "26-jobs",
  "27-meeting-imports",
  "28-chat-alerts",
];

const DIR = "public/watch";

/** The top-level boxes of an MP4, in order, up to the first media data. */
function boxes(file: string) {
  const fd = openSync(`${DIR}/${file}`, "r");
  const size = statSync(`${DIR}/${file}`).size;
  const head = Buffer.alloc(8);
  const out: string[] = [];
  let at = 0;
  while (at + 8 <= size) {
    readSync(fd, head, 0, 8, at);
    let length = head.readUInt32BE(0);
    const type = head.toString("latin1", 4, 8);
    out.push(type);
    if (type === "mdat") break;
    if (length === 1) {
      const big = Buffer.alloc(8);
      readSync(fd, big, 0, 8, at + 8);
      length = Number(big.readBigUInt64BE(0));
    }
    if (length < 8) break;
    at += length;
  }
  return out;
}

describe("the Watch how videos", () => {
  it("are all there, and nothing else is", () => {
    expect(readdirSync(DIR).sort()).toEqual(
      VIDEOS.map((name) => `${name}.mp4`),
    );
  });

  it("start playing before they finish downloading", () => {
    for (const name of VIDEOS) {
      const order = boxes(`${name}.mp4`);
      expect(order.indexOf("moov"), name).toBeGreaterThan(-1);
      expect(order.indexOf("moov"), name).toBeLessThan(order.indexOf("mdat"));
    }
  });
});
