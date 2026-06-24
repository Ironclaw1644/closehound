import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FONT_MONO, FONT_SANS } from "./theme";
import { Background, Reticle } from "./components";

// Paid social ad — 9:16, ~37s, timed to public/ad-vo-v2.mp3.
// Hook (Veo) → Agitation (Veo) → Proof (real app frames) → Value/CTA endcard.
// Every number on screen is a real app output (Cleveland 44110, 2264 Hibiscus St).

const VO = "ad-vo-v2.mp3";

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, transparent 26%, transparent 52%, rgba(0,0,0,0.78) 100%)",
    }}
  />
);

/** Subtle Ken Burns zoom on a still frame. */
const Ken: React.FC<{ src: string; to?: number; dur: number; origin?: string }> = ({
  src,
  to = 1.08,
  dur,
  origin = "center top",
}) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [0, dur], [1.0, to], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#ffffff" }}>
      <Img
        src={staticFile(src)}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transform: `scale(${s})`, transformOrigin: origin }}
      />
    </AbsoluteFill>
  );
};

/** Bottom caption bar — readable over both video and light app screenshots. */
const Caption: React.FC<{ children: React.ReactNode; delay?: number; sub?: React.ReactNode }> = ({
  children,
  delay = 5,
  sub,
}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [delay, delay + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(f, [delay, delay + 10], [26, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", padding: "0 56px 150px" }}>
      <div style={{ opacity: o, transform: `translateY(${y}px)`, textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(14,14,14,0.93)",
            border: `1px solid ${C.hair}`,
            borderRadius: 24,
            padding: "26px 38px",
          }}
        >
          <div style={{ fontFamily: FONT_SANS, fontSize: 54, fontWeight: 800, lineHeight: 1.14, color: C.white }}>
            {children}
          </div>
          {sub && (
            <div style={{ fontFamily: FONT_SANS, fontSize: 32, fontWeight: 600, color: C.muted, marginTop: 10 }}>{sub}</div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Hl: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.chart }) => (
  <span style={{ color }}>{children}</span>
);

const CTAScene: React.FC = () => {
  const f = useCurrentFrame();
  const rise = (delay: number) => ({
    opacity: interpolate(f, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    transform: `translateY(${interpolate(f, [delay, delay + 12], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
  });
  const pulse = 1 + 0.02 * Math.sin(f / 9);
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: 70, fontFamily: FONT_SANS, color: C.white }}>
        <div style={{ ...rise(0), display: "flex", alignItems: "center", gap: 20 }}>
          <Reticle size={84} />
          <div style={{ fontSize: 64, fontWeight: 800 }}>
            Close<span style={{ color: C.muted }}>Hound</span>
          </div>
        </div>
        <div style={{ ...rise(12), marginTop: 54, fontSize: 76, fontWeight: 800, lineHeight: 1.08 }}>
          One deal pays<br />for <Hl>years</Hl>.
        </div>
        <div style={{ ...rise(24), marginTop: 34, fontSize: 40, fontWeight: 700 }}>
          <Hl color={C.green}>$5,760/yr</Hl> from one house
          <div style={{ fontSize: 30, color: C.muted, fontWeight: 600, marginTop: 8 }}>vs. CloseHound at $39/mo</div>
        </div>
        <div style={{ ...rise(40), marginTop: 56, transform: `${rise(40).transform} scale(${pulse})` }}>
          <div style={{ fontSize: 70, fontWeight: 800, color: C.chart, letterSpacing: "-0.01em" }}>closehound.com</div>
        </div>
        <div
          style={{
            ...rise(50),
            marginTop: 30,
            fontFamily: FONT_SANS,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            fontSize: 24,
            fontWeight: 600,
            color: C.muted,
          }}
        >
          100 free credits · ~10 markets · no card
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const PaidAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <Audio src={staticFile(VO)} />

    {/* HOOK — 0:00–0:04 */}
    <Sequence durationInFrames={120}>
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <OffthreadVideo src={staticFile("ad/hook.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <Vignette />
        <Caption delay={8} sub={<><Hl>$133,000</Hl> house · rent guaranteed by the government</>}>
          The government pays <Hl>$1,925/mo</Hl><br />to rent this house.
        </Caption>
      </AbsoluteFill>
    </Sequence>

    {/* AGITATION — 0:04–0:12 */}
    <Sequence from={120} durationInFrames={240}>
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <OffthreadVideo src={staticFile("ad/agitation.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <Vignette />
        <Sequence durationInFrames={120}>
          <Caption delay={6}>In the right markets the voucher<br /><Hl>beats the mortgage</Hl>.</Caption>
        </Sequence>
        <Sequence from={120} durationInFrames={120}>
          <Caption delay={4}>Most investors never check —<br />so they <Hl>overpay</Hl>.</Caption>
        </Sequence>
      </AbsoluteFill>
    </Sequence>

    {/* PROOF: screener — 0:12–0:15 */}
    <Sequence from={360} durationInFrames={90}>
      <Ken src="ad/f-screener.png" dur={90} />
      <Caption delay={6}>Pick a market. <Hl>Run it.</Hl></Caption>
    </Sequence>

    {/* PROOF: ranked deals — 0:15–0:18 */}
    <Sequence from={450} durationInFrames={90}>
      <Ken src="ad/f-deals.png" dur={90} />
      <Caption delay={6}>Real <Hl>HUD voucher rents</Hl> —<br />every listing, ranked.</Caption>
    </Sequence>

    {/* PROOF: the deal (drawer) — 0:18–0:25 */}
    <Sequence from={540} durationInFrames={210}>
      <Ken src="ad/f-drawer.png" to={1.06} dur={210} />
      <Sequence durationInFrames={72}>
        <Caption delay={4}><Hl>$1,925/mo</Hl> voucher rent</Caption>
      </Sequence>
      <Sequence from={72} durationInFrames={72}>
        <Caption delay={4}><Hl color={C.green}>+$480/mo</Hl> net cash flow</Caption>
      </Sequence>
      <Sequence from={144} durationInFrames={66}>
        <Caption delay={4}>Deal Score <Hl>100</Hl> — it cash-flows.</Caption>
      </Sequence>
    </Sequence>

    {/* VALUE + CTA — 0:25–0:37 */}
    <Sequence from={750} durationInFrames={360}>
      <CTAScene />
    </Sequence>
  </AbsoluteFill>
);
