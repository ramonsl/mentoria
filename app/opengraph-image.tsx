import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Mentoria de carreira em tecnologia | Ramon Lummertz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [mentorPhoto] = await Promise.all([
    readFile(join(process.cwd(), "public/mentor.jpg")),
  ]);

  const photoBase64 = `data:image/jpeg;base64,${mentorPhoto.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#071b2e",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* glow decorativo */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.18)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(103,232,249,0.08)",
            filter: "blur(60px)",
            display: "flex",
          }}
        />

        {/* coluna esquerda */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 56px",
            gap: 24,
          }}
        >
          {/* eyebrow */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 3,
                background: "#ffca62",
                borderRadius: 2,
                display: "flex",
              }}
            />
            <span
              style={{
                color: "#93c5fd",
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Mentoria de carreira em tecnologia
            </span>
          </div>

          {/* headline */}
          <div
            style={{
              color: "#ffffff",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Vamos construir o próximo passo da sua carreira em tech.
          </div>

          {/* bullets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {[
              "Currículo que passa pela triagem",
              "LinkedIn com posicionamento claro",
              "Preparação para entrevistas",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#ffca62",
                    flexShrink: 0,
                    display: "flex",
                  }}
                />
                <span style={{ color: "#cbd5e1", fontSize: 24 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* domínio */}
          <div style={{ marginTop: 16, color: "#ffca62", fontSize: 22, fontWeight: 600 }}>
            ramonlummertz.com.br
          </div>
        </div>

        {/* coluna direita — foto */}
        <div
          style={{
            width: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingBottom: 0,
            paddingRight: 0,
            position: "relative",
          }}
        >
          {/* moldura circular */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 300,
              height: 380,
              borderRadius: "150px 150px 0 0",
              background: "rgba(255,202,98,0.08)",
              border: "1px solid rgba(255,202,98,0.2)",
              display: "flex",
              overflow: "hidden",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <img
              src={photoBase64}
              width={280}
              height={280}
              style={{
                objectFit: "cover",
                objectPosition: "center top",
                borderRadius: "50%",
                marginBottom: 20,
              }}
            />
          </div>
          {/* nome sobre a foto */}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              right: 0,
              width: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#ffffff", fontSize: 20, fontWeight: 700 }}>
              Ramon Lummertz
            </span>
            <span style={{ color: "#94a3b8", fontSize: 16, marginTop: 2 }}>
              Gerente de TI · Professor PUCRS
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
