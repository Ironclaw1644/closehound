import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT_SANS } from "./theme";
import { Background, MonoLabel, Reveal, DealCard } from "./components";

/** Short silent hero loop — the deal card filling + score counting. */
export const Loop: React.FC = () => {
  const f = useCurrentFrame();
  const tagline = interpolate(f, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT_SANS, color: C.white }}
      >
        <Reveal><MonoLabel>DEAL SCORE</MonoLabel></Reveal>
        <div style={{ marginTop: 24 }}>
          <DealCard />
        </div>
        <div style={{ marginTop: 24, fontSize: 28, fontWeight: 800, color: C.chart, opacity: tagline }}>
          Find where the voucher beats the mortgage.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
