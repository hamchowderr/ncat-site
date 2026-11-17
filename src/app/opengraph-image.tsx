import { ImageResponse } from "next/og";

export const alt = "NCA Dashboard: your content, organized and clipped automatically";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72,
          color: "#f5f4f1", background: "radial-gradient(ellipse at 50% 120%, rgba(255,110,50,.45), transparent 60%), #060709",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(100deg,#ff5b3a,#ff9a3c 45%,#ffd23f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderLeft: "18px solid #160a04", borderTop: "12px solid transparent", borderBottom: "12px solid transparent", marginLeft: 4 }} />
          </div>
          NCA <span style={{ color: "#80848e", fontWeight: 500, marginLeft: 10 }}>Dashboard</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2, maxWidth: 1000 }}>Your content, organized and clipped automatically</div>
          <div style={{ fontSize: 30, color: "#b3b6bd" }}>AI sets it up. Plain editing runs it. Pay once, own your version.</div>
        </div>
      </div>
    ),
    size,
  );
}
