/**
 * The clip shapes and longest lengths the dashboard's Clips step makes for each social platform.
 * Copied from the dashboard's own table (ncat-dash packages/automation-core/src/clips.ts, PLATFORMS),
 * so the site never promises a shape the product does not make. Keep the two in step.
 */
export type Frame = "9:16" | "4:5" | "1:1" | "16:9" | "original";

export type Place = { place: string; frame: Frame; maxSeconds: number };

export const CLIP_SHAPES: Record<"TikTok" | "YouTube" | "X" | "Instagram" | "LinkedIn" | "Facebook", Place[]> = {
  TikTok: [{ place: "TikTok", frame: "9:16", maxSeconds: 180 }],
  YouTube: [
    { place: "Shorts", frame: "9:16", maxSeconds: 180 },
    { place: "YouTube", frame: "16:9", maxSeconds: 900 },
  ],
  X: [{ place: "X", frame: "original", maxSeconds: 140 }],
  Instagram: [
    { place: "Reels", frame: "9:16", maxSeconds: 180 },
    { place: "Feed", frame: "4:5", maxSeconds: 180 },
    { place: "Stories", frame: "9:16", maxSeconds: 60 },
  ],
  LinkedIn: [{ place: "LinkedIn", frame: "original", maxSeconds: 900 }],
  Facebook: [
    { place: "Reels", frame: "9:16", maxSeconds: 90 },
    { place: "Feed", frame: "4:5", maxSeconds: 180 },
    { place: "Stories", frame: "9:16", maxSeconds: 60 },
  ],
};

export type SocialPlatform = keyof typeof CLIP_SHAPES;

/** "Vertical 9:16", "Portrait 4:5", "Square 1:1", "Wide 16:9", "Its own shape" (the dashboard's own words). */
export function frameName(frame: Frame): string {
  switch (frame) {
    case "9:16":
      return "Vertical 9:16";
    case "4:5":
      return "Portrait 4:5";
    case "1:1":
      return "Square 1:1";
    case "16:9":
      return "Wide 16:9";
    default:
      return "Its own shape";
  }
}

/** Width over height. "Its own shape" is drawn as the usual wide recording. */
export function frameRatio(frame: Frame): number {
  switch (frame) {
    case "9:16":
      return 9 / 16;
    case "4:5":
      return 4 / 5;
    case "1:1":
      return 1;
    default:
      return 16 / 9;
  }
}

/** "60 s", "3 min", "2 min 20 s" (the dashboard's own format). */
export function formatLimit(seconds: number): string {
  if (seconds < 120) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
}

/** The biggest box of the given shape that fits inside width x height. */
export function fitFrame(frame: Frame, width: number, height: number) {
  const r = frameRatio(frame);
  return width / height > r ? { width: height * r, height } : { width, height: width / r };
}
