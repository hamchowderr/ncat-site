import { ImageResponse } from "next/og";

export const alt = "Kontifi: Your content, social media ready.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, color: "#0b0b12", background: "#ffffff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#5b3df5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderLeft: "18px solid #ffffff", borderTop: "12px solid transparent", borderBottom: "12px solid transparent", marginLeft: 4 }} />
          </div>
          Kontifi
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#3d24c4", letterSpacing: 1 }}>SOCIAL MEDIA READY</div>
          <div style={{ fontSize: 80, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2.4, maxWidth: 1000 }}>Your content, social media ready.</div>
          <div style={{ fontSize: 30, color: "#5c5f6a" }}>Ready-made automations, no AI on every video. Pay once, own it.</div>
        </div>
      </div>
    ),
    size,
  );
}
