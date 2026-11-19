/** "a 14 min video, cut into 14 clips" */
export function describeTry(seconds: number, clips: number): string {
  const m = Math.round(seconds / 60);
  const length = seconds < 60 ? `${seconds} s` : m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`;
  return `a ${length} video, cut into ${clips} ${clips === 1 ? "clip" : "clips"}`;
}
