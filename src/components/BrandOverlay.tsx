import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface BrandOverlayProps {
  platform: string;
  showCta?: boolean;
  ctaText?: string;
}

export const BrandOverlay: React.FC<BrandOverlayProps> = ({
  platform,
  showCta = true,
  ctaText = "Shop Now — HoneyCraft.co.uk",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Logo badge fades in at frame 8
  const logoOpacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // CTA slides up in final 2 seconds
  const ctaStart = durationInFrames - fps * 2;
  const ctaProgress = spring({
    frame: frame - ctaStart,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.9 },
    durationInFrames: 18,
  });
  const ctaY = interpolate(ctaProgress, [0, 1], [60, 0]);
  const ctaOpacity = interpolate(frame, [ctaStart, ctaStart + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle vignette on edges
  const isTikTok = platform === "TikTok" || platform === "Instagram Reels";

  return (
    <>
      {/* Top vignette */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "25%",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Bottom vignette */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "35%",
          background: "linear-gradient(to top, rgba(61,43,31,0.8) 0%, transparent 100%)",
          zIndex: 5,
          pointerEvents: "none",
        }}
      />

      {/* Brand badge — top right */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "5%",
          zIndex: 20,
          opacity: logoOpacity,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(245,166,35,0.15)",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(245,166,35,0.4)",
          borderRadius: 40,
          padding: "8px 16px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #F5A623, #D4780A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
          }}
        >
          🍯
        </div>
        <span
          style={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 700,
            fontSize: 22,
            color: "#FAF3E0",
            letterSpacing: "0.5px",
          }}
        >
          HoneyCraft
        </span>
      </div>

      {/* Platform tag */}
      {isTikTok && (
        <div
          style={{
            position: "absolute",
            top: "5%",
            left: "5%",
            zIndex: 20,
            opacity: logoOpacity,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "6px 14px",
          }}
        >
          <span
            style={{
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 600,
              fontSize: 18,
              color: "rgba(250,243,224,0.7)",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            #RawHoney
          </span>
        </div>
      )}

      {/* CTA bar — bottom */}
      {showCta && (
        <div
          style={{
            position: "absolute",
            bottom: "6%",
            left: "5%",
            right: "5%",
            zIndex: 20,
            opacity: ctaOpacity,
            transform: `translateY(${ctaY}px)`,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #F5A623, #D4780A)",
              borderRadius: 50,
              padding: "16px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              boxShadow: "0 4px 24px rgba(245,166,35,0.5)",
            }}
          >
            <span
              style={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 800,
                fontSize: 32,
                color: "#3D2B1F",
                letterSpacing: "0.5px",
              }}
            >
              {ctaText}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
