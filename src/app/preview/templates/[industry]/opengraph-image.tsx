import { ImageResponse } from "next/og";
import type { LeadIndustry } from "@/lib/industries";
import { buildSamplePreviewModel } from "@/lib/preview/sample-data";
import { getPaletteForIndustry } from "@/lib/preview/palettes";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "WalkPerro preview";

const VALID_SLUGS: Record<string, LeadIndustry> = {
  handyman: "handyman",
  "pressure-washing": "pressure washing",
  roofing: "roofing",
  hvac: "HVAC",
  plumbing: "plumbing",
  dental: "dental",
  "med-spa": "med spa",
  "junk-removal": "junk removal",
  "mobile-detailing": "mobile detailing",
  landscaping: "landscaping",
  painting: "painting",
  electrical: "electrical",
  "auto-repair": "auto repair",
  "pest-control": "pest control",
};

const INDUSTRY_DISPLAY: Record<LeadIndustry, string> = {
  handyman: "Handyman",
  "pressure washing": "Pressure Washing",
  roofing: "Roofing",
  HVAC: "HVAC",
  plumbing: "Plumbing",
  dental: "Dentistry",
  "med spa": "Med Spa",
  "junk removal": "Junk Removal",
  "mobile detailing": "Mobile Detailing",
  landscaping: "Landscaping",
  painting: "Painting",
  electrical: "Electrical",
  "auto repair": "Auto Repair",
  "pest control": "Pest Control",
};

export default function TemplateOgImage({
  params,
}: {
  params: { industry: string };
}) {
  const industry = VALID_SLUGS[params.industry];
  if (!industry) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "#0E0E0E",
            color: "#F5F1E8",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            fontSize: 56,
          }}
        >
          WalkPerro
        </div>
      ),
      size
    );
  }

  const model = buildSamplePreviewModel(industry);
  const palette = getPaletteForIndustry(industry);
  const display = INDUSTRY_DISPLAY[industry];
  const heroUrl = model.assets.heroUrl;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: palette.inkBg,
          color: palette.inkText,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {heroUrl ? (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              right: 0,
              width: 720,
              height: 630,
              backgroundImage: `url(${heroUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ) : null}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            background: `linear-gradient(90deg, ${palette.inkBg} 0%, ${palette.inkBg} 38%, rgba(0,0,0,0.0) 70%, rgba(0,0,0,0.0) 100%)`,
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: 0,
            left: 0,
            width: 720,
            height: 630,
            padding: "70px 60px",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: palette.accent,
              }}
            />
            WalkPerro · Template
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 92,
                fontWeight: 700,
                lineHeight: 0.96,
                letterSpacing: "-0.02em",
                color: palette.accent,
              }}
            >
              {display}
            </div>
            <div
              style={{
                fontSize: 32,
                lineHeight: 1.2,
                color: palette.inkText,
                opacity: 0.92,
              }}
            >
              Conversion-grade $497 launch site, live in 7 days.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 14,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.6,
            }}
          >
            walkperro.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
