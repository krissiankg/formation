import { ImageResponse } from "next/og";

export const alt = "FORGEIA — Formation IA & SaaS";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0f1510 0%, #171d17 60%, #24141a 100%)",
          color: "#fbfaf4",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(121, 29, 62, 0.4) 0%, rgba(23, 29, 23, 0) 70%)",
          }}
        />

        {/* Header with Logo and Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "36px", fontWeight: 900, letterSpacing: "4px" }}>
              FORGE<span style={{ color: "#9e2a52" }}>IA</span>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 20px",
              borderRadius: "999px",
              background: "rgba(121, 29, 62, 0.25)",
              border: "1px solid rgba(158, 42, 82, 0.5)",
              color: "#faedf2",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "2px",
            }}
          >
            FORMATION PRÉSENTIELLE · 3 MOIS
          </div>
        </div>

        {/* Center Main Titles */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1
            style={{
              fontSize: "60px",
              fontWeight: 900,
              letterSpacing: "1px",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            CRÉEZ. <span style={{ color: "#9e2a52" }}>VENDEZ.</span>
            <br />
            DOMINEZ AVEC L&apos;IA.
          </h1>
          <p
            style={{
              fontSize: "22px",
              color: "#d7d2c5",
              margin: 0,
              maxWidth: "850px",
              lineHeight: 1.4,
            }}
          >
            Apprenez à concevoir des SaaS, applications et plateformes rentables avec l&apos;IA — et en vivre concrètement.
          </p>
        </div>

        {/* Footer info & tags */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            {["🚀 SaaS & Apps", "💳 Mobile Money", "🧠 Prompts & Code", "📲 WhatsApp"].map(
              (tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    fontSize: "13px",
                    color: "#faedf2",
                  }}
                >
                  {tag}
                </span>
              ),
            )}
          </div>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#fbfaf4" }}>
            forgeia.guelichweb.store
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
