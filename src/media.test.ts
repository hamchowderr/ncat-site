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

describe.skipIf(!hasFfmpeg)("hero recordings", () => {
  for (const name of ["live-run", "review", "outputs", "agent-builds"]) {
    it(`${name} has no blank loading frames, no developer badge and no misplaced frame`, () => {
      frames(name).forEach((f, i) => {
        const at = `${name} at ${i / 10}s`;
        // the main area (right of the sidebar) always shows the app, never a blank loading page
        expect(inkShare(f, 55), `${at} looks blank`).toBeGreaterThan(0.004);
        // the corner where the framework's dark badge sat holds only the light account avatar
        for (let y = 160; y < H; y++) for (let x = 0; x < 12; x++) expect(f[y * W + x], `${at} has something dark in the corner`).toBeGreaterThan(100);
        expect(cornerLight(f), `${at} is not filling the frame`).toBeGreaterThan(200);
      });
    }, 60_000);
  }
});

describe.skipIf(!hasFfmpeg)("feature recordings", () => {
  for (const name of ["templates", "runs", "review", "editors", "brand", "files", "alerts", "schedule"]) {
    it(`${name} never shows a blank page or a misplaced frame`, () => {
      const all = frames(`features/${name}`);
      expect(all.length).toBeGreaterThan(100);
      all.forEach((f, i) => {
        const at = `${name} at ${i / 10}s`;
        expect(inkShare(f, 0), `${at} looks blank`).toBeGreaterThan(0.004);
        expect(cornerLight(f), `${at} is not filling the frame`).toBeGreaterThan(200);
      });
    }, 60_000);
  }
});
