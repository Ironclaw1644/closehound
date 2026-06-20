import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT_MONO, FONT_SANS } from "./theme";

export const Background: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {/* hairline grid */}
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${C.hair}55 1px, transparent 1px), linear-gradient(90deg, ${C.hair}55 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        opacity: 0.5,
      }}
    />
    {/* top chartreuse glow */}
    <AbsoluteFill
      style={{
        background: `radial-gradient(700px 360px at 50% -6%, ${C.chart}33, transparent 64%)`,
      }}
    />
    {/* frame */}
    <AbsoluteFill style={{ border: `2px solid ${C.hair}`, pointerEvents: "none" }} />
  </AbsoluteFill>
);

export const Reticle: React.FC<{ size: number }> = ({ size }) => {
  const s = size;
  const stroke = Math.max(3, s / 12);
  return (
    <svg width={s} height={s} viewBox="0 0 32 32">
      <rect x="0" y="0" width="32" height="32" rx="8" fill={C.chart} />
      <g fill="none" stroke={C.bg} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 7 H7 V9" />
        <path d="M23 7 H25 V9" />
        <path d="M9 25 H7 V23" />
        <path d="M23 25 H25 V23" />
        <circle cx="16" cy="16" r="3.4" fill={C.bg} stroke="none" />
      </g>
    </svg>
  );
};

/** Refined uppercase eyebrow (gold, no slash) — matches the site's editorial style. */
export const MonoLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = C.gold,
}) => (
  <div
    style={{
      fontFamily: FONT_SANS,
      textTransform: "uppercase",
      letterSpacing: "0.18em",
      fontSize: 21,
      fontWeight: 600,
      color,
    }}
  >
    {children}
  </div>
);

/** Fade + rise wrapper driven by the local frame. */
export const Reveal: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [delay, delay + 12], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ opacity: o, transform: `translateY(${y}px)`, ...style }}>{children}</div>;
};

export const DealCard: React.FC = () => {
  const f = useCurrentFrame();
  const score = Math.round(interpolate(f, [10, 40], [0, 86], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const rows: [string, string, number, boolean][] = [
    ["Purchase price", "$92,000", 14, false],
    ["HUD voucher rent", "$1,485 / mo", 22, false],
    ["Monthly cash flow", "+$612", 30, true],
    ["Cash-on-cash", "11.8%", 38, true],
  ];
  return (
    <div
      style={{
        width: 620,
        borderRadius: 20,
        background: C.card,
        border: `2px solid ${C.hair}`,
        padding: 32,
        fontFamily: FONT_SANS,
        color: C.white,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 18, color: C.muted, letterSpacing: "0.06em" }}>
            Cleveland, OH · 44105
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>3-bed · 1,180 sqft</div>
        </div>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            background: C.chart,
            color: C.bg,
            fontSize: 44,
            fontWeight: 800,
            display: "grid",
            placeItems: "center",
          }}
        >
          {score}
        </div>
      </div>
      <div style={{ marginTop: 22 }}>
        {rows.map(([k, v, delay, good]) => {
          const o = interpolate(f, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={k}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 0",
                borderBottom: `1px solid ${C.hair}`,
                opacity: o,
              }}
            >
              <span style={{ color: C.muted, fontSize: 23 }}>{k}</span>
              <span style={{ color: good ? C.green : C.white, fontWeight: 700, fontSize: 25 }}>{v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
