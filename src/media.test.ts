// @vitest-environment node
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const W = 288;
const H = 180;
const hasFfmpeg = (() => {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

/** Every frame of a recording, 10 per second, small and grey. */
function frames(file: string) {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", `public/media/${file}.mp4`, "-vf", `fps=10,scale=${W}:${H}`, "-f", "rawvideo", "-pix_fmt", "gray", "-"], {
    maxBuffer: 1 << 28,
  });
  const out: Buffer[] = [];
  for (let i = 0; i + W * H <= raw.length; i += W * H) out.push(raw.subarray(i, i + W * H));
  return out;
}

function inkShare(f: Buffer, x0: number) {
  let ink = 0;
  let area = 0;
  for (let y = 0; y < H; y++) for (let x = x0; x < W; x++, area++) if (f[y * W + x] < 200) ink++;
  return ink / area;
}

/** Mean brightness of the bottom-right corner, which is always plain page in the dashboard. */
function cornerLight(f: Buffer) {
  let sum = 0;
  let n = 0;
  for (let y = H - 8; y < H; y++) for (let x = W - 8; x < W; x++, n++) sum += f[y * W + x];
  return sum / n;
}

const HERO = ["live-run", "review", "outputs", "agent-builds"];
const FEATURES = ["templates", "runs", "review", "editors", "brand", "files", "alerts", "schedule", "zoom", "library", "calendar", "moments", "follow", "steps", "mcp"];

// The recordings move a camera in to each action, so most frames are close-ups. Every clip
// opens on the whole app window, recorded from a production build: that first frame shows
// the light page in both bottom corners, with no framework badge. The badge is near-black;
// the grey ring of the signed-in avatar at the foot of a long menu may reach the corner.
describe.skipIf(!hasFfmpeg)("recordings", () => {
  for (const name of [...HERO, ...FEATURES.map((n) => `features/${n}`)]) {
    it(`${name} never shows a blank page and opens on the whole window`, () => {
      const all = frames(name);
      expect(all.length).toBeGreaterThan(100);
      all.forEach((f, i) => expect(inkShare(f, 0), `${name} at ${i / 10}s looks blank`).toBeGreaterThan(0.002));
      const first = all[0];
      expect(cornerLight(first), `${name} does not open on the whole window`).toBeGreaterThan(200);
      for (let y = 160; y < H; y++) for (let x = 0; x < 12; x++) expect(first[y * W + x], `${name} has something dark in the corner`).toBeGreaterThan(60);
    }, 60_000);
  }
});

describe.skipIf(!hasFfmpeg)("recording sizes", () => {
  const size = (file: string) =>
    execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", `public/media/${file}.mp4`])
      .toString()
      .trim();
  it("is 16:10 at 1600x1000 in every recording", () => {
    for (const name of FEATURES) expect(size(`features/${name}`), name).toBe("1600,1000");
    for (const name of HERO) expect(size(name), name).toBe("1600,1000");
  });
});

// The demo team's own logo (Northlight Media's coral and orange circles) sits in the team
// switcher at the top left, so no clip shows the plain stand-in mark. Brand opens before the
// logo is uploaded, and the calendar opens with the menu folded, so those two are left out.
describe.skipIf(!hasFfmpeg)("team logo in the recordings", () => {
  const coralIn = (file: string) => {
    const w = 128;
    const h = 100;
    const raw = execFileSync("ffmpeg", ["-v", "error", "-i", `public/media/${file}.mp4`, "-frames:v", "1", "-vf", `crop=${w}:${h}:0:0`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]);
    let n = 0;
    for (let i = 0; i + 2 < raw.length; i += 3) if (raw[i] > 220 && raw[i + 1] > 70 && raw[i + 1] < 130 && raw[i + 2] > 80 && raw[i + 2] < 140) n++;
    return n;
  };
  for (const name of [...HERO, ...FEATURES.filter((n) => n !== "brand" && n !== "calendar").map((n) => `features/${n}`)]) {
    it(`${name} opens with Northlight Media's logo, not the plain mark`, () => {
      expect(coralIn(name)).toBeGreaterThan(200);
    });
  }
});

/** Share of strongly coral/orange pixels (the team logo) in one corner box of a clip's frame at 1 s. */
function coralShare(file: string, side: "left" | "right") {
  const w = 120;
  const raw = execFileSync("ffmpeg", ["-v", "error", "-ss", "1", "-i", `public/media/${file}.mp4`, "-frames:v", "1", "-vf", `scale=${w}:-2`, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]);
  const h = raw.length / 3 / w;
  const box = Math.round(w * 0.3);
  let hit = 0;
  for (let y = 0; y < Math.min(box, h); y++)
    for (let i = 0; i < box; i++) {
      const x = side === "left" ? i : w - 1 - i;
      const p = (y * w + x) * 3;
      if (raw[p] > 200 && raw[p + 1] < 160 && raw[p + 2] < 140) hit++;
    }
  return hit / (box * box);
}

describe.skipIf(!hasFfmpeg)("feed clips", () => {
  for (const name of ["linkedin", "tiktok", "instagram", "youtube", "facebook"]) {
    it(`${name} carries the team logo top left, not top right`, () => {
      expect(coralShare(`split/${name}`, "left")).toBeGreaterThan(0.02);
      expect(coralShare(`split/${name}`, "right")).toBeLessThan(0.005);
    });
  }
});
