import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// No rounding/border here on purpose — iOS/Android both apply their own
// mask shape to home-screen icons, so a pre-rounded square just doubles
// up (or fights) whatever corner treatment the OS adds.
export default function Icon() {
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
        <span style={{ fontSize: 320 }}>☕</span>
      </div>
    ),
    { ...size },
  );
}
