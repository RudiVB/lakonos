import { ImageResponse } from "next/og";

// Renders a branded share image at build/edge time.
export const runtime = "edge";
export const alt = "Lakonos — Automate the work your people do by hand";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STATS: [string, string][] = [
  ["40,000", "Picks / day"],
  ["97%", "Pick accuracy"],
  ["40→24", "Staff, same output"],
  ["R8.5m", "Saved / year"],
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#06060c",
          color: "#f4f4f8",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* faint gradient bar at the very top */}
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 1200, height: 6, background: "linear-gradient(90deg,#818cf8,#c084fc,#22d3ee)" }} />

        {/* wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", width: 46, height: 46, borderRadius: 46, background: "linear-gradient(120deg,#818cf8,#c084fc,#22d3ee)" }} />
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>Lakonos</div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2, maxWidth: 920 }}>
            Automate the work your people do by hand.
          </div>
          <div style={{ display: "flex", fontSize: 27, color: "#a2a2b8", marginTop: 24, maxWidth: 840 }}>
            Custom business automation, built around how your operation already runs.
          </div>
        </div>

        {/* stats row */}
        <div style={{ display: "flex", gap: 46 }}>
          {STATS.map(([n, l]) => (
            <div key={l} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#c4b5fd" }}>{n}</div>
              <div style={{ display: "flex", fontSize: 20, color: "#8a8aa0", marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
