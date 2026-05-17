import { ImageResponse } from "next/og";
import { loadPreviewBySlug } from "@/lib/preview/load";
import { getPaletteForModel } from "@/lib/preview/palettes";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "WalkPerro preview";

export default async function PreviewOgImage({
  params,
}: {
  params: { slug: string };
}) {
  let model;
  try {
    model = await loadPreviewBySlug(params.slug);
  } catch {
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

  const palette = getPaletteForModel(model);
  const heroUrl = model.assets.heroUrl;
  const cityLabel = model.business.city ?? "Local service";
  const ratingLabel =
    typeof model.business.rating === "number"
      ? `★ ${model.business.rating.toFixed(1)}${
          model.business.reviewCount ? ` · ${model.business.reviewCount} reviews` : ""
        }`
      : null;

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
        {/* Background hero image — photo bleed left half */}
        {heroUrl ? (
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              left: 0,
              width: 600,
              height: 630,
              backgroundImage: `url(${heroUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ) : null}
        {/* Gradient veil over the photo so text is readable on right */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            background: `linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.55) 30%, ${palette.inkBg} 56%, ${palette.inkBg} 100%)`,
          }}
        />
        {/* Right column: copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: 0,
            left: 580,
            width: 540,
            height: 630,
            padding: "60px 40px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: palette.accent,
              }}
            />
            <span
              style={{
                fontSize: 18,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: palette.inkText,
                opacity: 0.8,
              }}
            >
              {cityLabel}
            </span>
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
                fontSize: 64,
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {model.business.name}
            </div>
            <div
              style={{
                fontSize: 30,
                lineHeight: 1.2,
                opacity: 0.85,
              }}
            >
              {model.hero.headline}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {ratingLabel ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 20,
                  color: palette.accent,
                  fontWeight: 600,
                }}
              >
                {ratingLabel}
              </div>
            ) : (
              <div />
            )}
            <div
              style={{
                display: "flex",
                fontSize: 14,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: palette.inkText,
                opacity: 0.6,
              }}
            >
              walkperro.com
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
