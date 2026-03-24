import React from "react";
import {
  AbsoluteFill,
  Audio,
  Video,
  useVideoConfig,
  useCurrentFrame,
  interpolate,
  staticFile,
  OffthreadVideo,
} from "remotion";
import { AnimatedHook } from "../components/AnimatedHook";
import { CaptionTrack } from "../components/CaptionTrack";
import { BrandOverlay } from "../components/BrandOverlay";

export interface HoneycraftAdProps {
  videoUrl: string;
  audioUrl: string;
  hookText: string;
  platform: "TikTok" | "Instagram" | "Instagram Reels" | "Facebook" | "Pinterest" | "YouTube" | "Twitter/X";
  hookType?: string;
  ctaText?: string;
  showCaptions?: boolean;
  showCta?: boolean;
  campaignName?: string;
}

// Platform → dimensions
export const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number }> = {
  TikTok:             { width: 1080, height: 1920 },
  Instagram:          { width: 1080, height: 1350 },
  "Instagram Reels":  { width: 1080, height: 1920 },
  "Instagram Stories":{ width: 1080, height: 1920 },
  Facebook:           { width: 1280, height: 720 },
  Pinterest:          { width: 1000, height: 1500 },
  YouTube:            { width: 1280, height: 720 },
  "Twitter/X":        { width: 1280, height: 720 },
};

export const HoneycraftAd: React.FC<HoneycraftAdProps> = ({
  videoUrl,
  audioUrl,
  hookText,
  platform,
  hookType = "curiosity",
  ctaText = "Shop Now — HoneyCraft.co.uk",
  showCaptions = true,
  showCta = true,
}) => {
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  // Hook shows at frame 0, captions start at frame 20 (after hook settles)
  const hookEndFrame = 25;
  const captionStartFrame = 20;
  const captionDuration = durationInFrames - captionStartFrame - fps; // leave 1s at end for CTA

  // Video fade-in
  const videoOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle Ken Burns zoom on video (very slow, feels cinematic)
  const zoomScale = interpolate(frame, [0, durationInFrames], [1, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "#3D2B1F",
        overflow: "hidden",
      }}
    >
      {/* Background video with Ken Burns */}
      <AbsoluteFill
        style={{
          opacity: videoOpacity,
          transform: `scale(${zoomScale})`,
          transformOrigin: "center center",
        }}
      >
        <OffthreadVideo
          src={videoUrl}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          muted
        />
      </AbsoluteFill>

      {/* Voiceover audio */}
      {audioUrl && (
        <Audio src={audioUrl} startFrom={0} />
      )}

      {/* Brand overlays (vignettes, badge, CTA) */}
      <BrandOverlay
        platform={platform}
        showCta={showCta}
        ctaText={ctaText}
      />

      {/* Hook text — prominent at top */}
      <AnimatedHook text={hookText} startFrame={0} />

      {/* TikTok-style word-by-word captions */}
      {showCaptions && captionDuration > 0 && (
        <CaptionTrack
          hookText={hookText}
          startFrame={captionStartFrame}
          durationFrames={captionDuration}
        />
      )}
    </AbsoluteFill>
  );
};
