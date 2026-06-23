import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FONT_MONO, FONT_SANS } from "./theme";
import { Background, Reticle, MonoLabel, Reveal, DealCard } from "./components";

const center: React.CSSProperties = {
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  fontFamily: FONT_SANS,
  color: C.white,
};

const TitleScene: React.FC = () => (
  <AbsoluteFill style={center}>
    <Reveal>
      <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
        <Reticle size={104} />
        <div style={{ fontSize: 72, fontWeight: 800 }}>
          Close<span style={{ color: C.muted }}>Hound</span>
        </div>
      </div>
    </Reveal>
    <Reveal delay={10} style={{ marginTop: 26 }}>
      <div style={{ fontSize: 60, fontWeight: 800, color: C.chart }}>Sniff out the deal.</div>
    </Reveal>
    <Reveal delay={20} style={{ marginTop: 18 }}>
      <MonoLabel>SECTION 8 DEAL SCREENER</MonoLabel>
    </Reveal>
  </AbsoluteFill>
);

const InsightScene: React.FC = () => {
  const lines = [
    <>In the right markets, the government</>,
    <>will pay <span style={{ color: C.chart }}>more than the open market</span></>,
    <>for the exact same house.</>,
  ];
  return (
    <AbsoluteFill style={center}>
      <div style={{ maxWidth: 1000 }}>
        {lines.map((l, i) => (
          <Reveal key={i} delay={i * 12} style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.35 }}>
            {l}
          </Reveal>
        ))}
        <Reveal delay={48} style={{ marginTop: 24, fontSize: 26, color: C.muted }}>
          Most investors never check. CloseHound checks every listing.
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};

const Step: React.FC<{ n: string; t: string; s: string; delay: number }> = ({ n, t, s, delay }) => (
  <Reveal delay={delay} style={{ display: "flex", gap: 22, alignItems: "center", marginBottom: 26 }}>
    <span style={{ fontFamily: FONT_MONO, fontSize: 38, fontWeight: 800, color: C.chart }}>{n}</span>
    <div style={{ textAlign: "left" }}>
      <div style={{ fontSize: 30, fontWeight: 800 }}>{t}</div>
      <div style={{ fontSize: 21, color: C.muted, marginTop: 4 }}>{s}</div>
    </div>
  </Reveal>
);

const HowScene: React.FC = () => (
  <AbsoluteFill style={{ ...center, justifyContent: "flex-start", paddingTop: 90 }}>
    <Reveal><MonoLabel>HOW IT WORKS</MonoLabel></Reveal>
    <div style={{ marginTop: 40, width: 760 }}>
      <Step n="01" t="Pick a market — or any ZIP" s="Cleveland, OH · graded A for cash flow" delay={6} />
      <Step n="02" t="Pull the HUD voucher rent" s="The official SAFMR ceiling for that ZIP" delay={16} />
      <Step n="03" t="Match live for-sale listings" s="Every property, underwritten instantly" delay={26} />
    </div>
  </AbsoluteFill>
);

const DealScene: React.FC = () => {
  const f = useCurrentFrame();
  const tagline = interpolate(f, [150, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ ...center }}>
      <Reveal><MonoLabel>DEAL SCORE</MonoLabel></Reveal>
      <div style={{ marginTop: 26 }}>
        <DealCard />
      </div>
      <div style={{ marginTop: 26, fontSize: 28, fontWeight: 800, color: C.chart, opacity: tagline }}>
        Here, the voucher beats the mortgage.
      </div>
    </AbsoluteFill>
  );
};

const ZonesScene: React.FC = () => {
  const zones = [
    "Cleveland, OH", "Memphis, TN", "Detroit, MI", "Birmingham, AL",
    "Indianapolis, IN", "Milwaukee, WI", "St. Louis, MO", "Augusta, GA",
  ];
  return (
    <AbsoluteFill style={{ ...center, justifyContent: "flex-start", paddingTop: 80 }}>
      <Reveal><MonoLabel color={C.gold}>OPPORTUNITY ZONES</MonoLabel></Reveal>
      <Reveal delay={6} style={{ fontSize: 46, fontWeight: 800, marginTop: 14 }}>
        Where to start your hunt.
      </Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 30, width: 820 }}>
        {zones.map((z, i) => (
          <Reveal
            key={z}
            delay={12 + i * 4}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              background: C.card, border: `1px solid ${C.hair}`, borderRadius: 10, padding: "12px 16px",
            }}
          >
            <span style={{ width: 24, height: 24, borderRadius: 5, background: C.green, color: C.bg, fontWeight: 800, display: "grid", placeItems: "center", fontSize: 15 }}>A</span>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{z}</span>
          </Reveal>
        ))}
      </div>
      <Reveal delay={56} style={{ marginTop: 34, fontSize: 38, fontWeight: 800, color: C.chart }}>
        Start free at closehound.com
      </Reveal>
      <Reveal delay={62} style={{ marginTop: 10 }}>
        <MonoLabel color={C.muted}>100 SCREENS · NO CARD · ALL 50 STATES</MonoLabel>
      </Reveal>
    </AbsoluteFill>
  );
};

export const Demo: React.FC = () => (
  <AbsoluteFill>
    <Background />
    <Audio src={staticFile("voiceover.mp3")} />
    <Sequence durationInFrames={150}><TitleScene /></Sequence>
    <Sequence from={150} durationInFrames={150}><InsightScene /></Sequence>
    <Sequence from={300} durationInFrames={210}><HowScene /></Sequence>
    <Sequence from={510} durationInFrames={240}><DealScene /></Sequence>
    <Sequence from={750} durationInFrames={180}><ZonesScene /></Sequence>
  </AbsoluteFill>
);
