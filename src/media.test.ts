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

/** Every frame of a hero recording, 10 per second, small and grey. */
function frames(name: string) {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-i", `public/media/${name}.mp4`, "-vf", `fps=10,scale=${W}:${H}`, "-f", "rawvideo", "-pix_fmt", "gray", "-"], { maxBuffer: 1 << 28 });
  const out: Buffer[] = [];
  for (let i = 0; i + W * H <= raw.length; i += W * H) out.push(raw.subarray(i, i + W * H));
  return out;
}

describe.skipIf(!hasFfmpeg)("hero recordings", () => {
  for (const name of ["live-run", "review", "outputs", "agent-builds"]) {
    it(`${name} has no blank loading frames and no developer badge or error pop-up`, () => {
      frames(name).forEach((f, i) => {
        // the main area (right of the sidebar) always shows the app, never a blank loading page
        let ink = 0;
        let area = 0;
        for (let y = 0; y < H; y++) for (let x = 55; x < W; x++, area++) if (f[y * W + x] < 200) ink++;
        expect(ink / area, `${name} at ${i / 10}s looks blank`).toBeGreaterThan(0.004);
        // the corner where the framework's badge and error count sat is plain sidebar
        for (let y = 167; y < H; y++) for (let x = 0; x < 48; x++) expect(f[y * W + x], `${name} at ${i / 10}s has something in the corner`).toBeGreaterThan(235);
      });
    }, 60_000);
  }
});
