import { ImageResponse } from "next/og";

// 180x180 is Apple's recommended apple-touch-icon size (iPhone Retina).
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e2694b",
        }}
      >
        <span style={{ fontSize: 112 }}>☕</span>
      </div>
    ),
    { ...size },
  );
}
