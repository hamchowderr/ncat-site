/**
 * Where the demo cuts a video, and the FFmpeg request that makes each clip. Copied from the
 * dashboard's own Clips step (ncat-dash packages/automation-core/src/clips.ts) so the demo
 * does exactly what the product does: cut at pauses in speech, and make each clip vertical
 * with the whole picture fitted over a blurred copy. Keep the two in step.
 */

export interface Silence {
  start: number;
  end: number;
}

export interface ClipPlan {
  start: number;
  seconds: number;
}

const MIN_TAIL_SECONDS = 1;
const round = (value: number) => Math.round(value * 100) / 100;

/** The video's length in seconds from the toolkit's metadata result, or null. */
export function durationOf(result: unknown): number | null {
  const duration = Number((result as { duration?: unknown } | null)?.duration);
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

/** Width and height from the toolkit's metadata result, when it has them. */
export function sizeOf(result: unknown): { width: number; height: number } | null {
  const r = (result ?? {}) as { width?: unknown; height?: unknown };
  const width = Number(r.width), height = Number(r.height);
  return width > 0 && height > 0 ? { width, height } : null;
}

/** The pauses from the toolkit's silence result. Anything unreadable counts as none. */
export function parseSilences(result: unknown): Silence[] {
  if (!Array.isArray(result)) return [];
  return result
    .map((item) => ({ start: Number((item as { start?: unknown })?.start), end: Number((item as { end?: unknown })?.end) }))
    .filter(({ start, end }) => Number.isFinite(start) && Number.isFinite(end) && end > start)
    .sort((a, b) => a.start - b.start);
}

/**
 * Where to cut a video so every clip fits `maxSeconds`: the fewest clips that fit, of even
 * length, with each cut moved to the middle of the nearest pause in speech when one is in reach.
 */
export function planClips(duration: number, silences: Silence[], maxSeconds: number): ClipPlan[] {
  if (!(duration > 0) || !(maxSeconds > 0)) return [];
  const parts = Math.min(100, Math.ceil(duration / maxSeconds - 1e-9));
  const pauses = silences.map(({ start, end }) => (start + end) / 2);
  const cuts: number[] = [0];
  for (let left = parts; left > 1; left--) {
    const from = cuts[cuts.length - 1];
    const ideal = from + (duration - from) / left;
    const earliest = Math.max(from + MIN_TAIL_SECONDS, duration - (left - 1) * maxSeconds);
    const latest = Math.min(from + maxSeconds, duration - MIN_TAIL_SECONDS);
    const reachable = pauses.filter((at) => at >= earliest && at <= latest);
    const cut = reachable.length
      ? reachable.reduce((best, at) => (Math.abs(at - ideal) < Math.abs(best - ideal) ? at : best))
      : Math.min(Math.max(ideal, earliest), latest);
    cuts.push(cut);
  }
  cuts.push(duration);
  const plan: ClipPlan[] = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const seconds = Math.min(maxSeconds, Math.floor((cuts[i + 1] - cuts[i]) * 100) / 100);
    if (seconds > 0) plan.push({ start: round(cuts[i]), seconds });
  }
  return plan;
}

type Option = { option: string; argument?: string | number };
const opt = (option: string, argument?: string | number): Option => (argument === undefined ? { option } : { option, argument });

/** The request for the toolkit's /v1/ffmpeg/compose that makes one vertical 1080 × 1920 clip. */
export function verticalClipRequest(fileUrl: string, clip: ClipPlan): Record<string, unknown> {
  const width = 1080, height = 1920;
  const filter =
    "[0:v]split=2[bg][fg];" +
    // The blur is made on a quarter-size copy and scaled back up: it looks the same and
    // halves the encode time, which matters on a toolkit shared with other work.
    `[bg]scale=${width / 4}:${height / 4}:force_original_aspect_ratio=increase,crop=${width / 4}:${height / 4},boxblur=10:2,scale=${width}:${height}[blurred];` +
    `[fg]scale=${width}:${height}:force_original_aspect_ratio=decrease[sharp];` +
    "[blurred][sharp]overlay=(W-w)/2:(H-h)/2,setsar=1[v]";
  return {
    inputs: [{ file_url: fileUrl, options: [opt("-ss", clip.start), opt("-t", clip.seconds)] }],
    filters: [{ filter }],
    outputs: [
      {
        options: [
          opt("-map", "[v]"),
          opt("-map", "0:a?"),
          opt("-c:v", "libx264"),
          opt("-preset", "veryfast"),
          opt("-crf", 21),
          opt("-pix_fmt", "yuv420p"),
          opt("-c:a", "aac"),
          opt("-b:a", "160k"),
          opt("-movflags", "+faststart"),
          opt("-f", "mp4"),
        ],
      },
    ],
  };
}

/** The dashboard's built-in "Bold highlight" caption look. */
export const DEMO_CAPTION_LOOK = {
  style: "highlight",
  all_caps: true,
  bold: true,
  font_size: 90,
  max_words_per_line: 4,
  position: "bottom_center",
  line_color: "#FFFFFF",
  word_color: "#F2B33D",
  outline_color: "#000000",
  outline_width: 3,
} as const;

/** Every http(s) address inside a toolkit result, whatever its shape. */
export function collectUrls(value: unknown, found: string[] = [], depth = 0): string[] {
  if (depth > 6 || found.length >= 100) return found;
  if (typeof value === "string") {
    if (/^https?:\/\/\S+$/.test(value) && !found.includes(value)) found.push(value);
  } else if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, found, depth + 1);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectUrls(item, found, depth + 1);
  }
  return found;
}
