import React from "react";
import { Composition } from "remotion";
import { HoneycraftAd, PLATFORM_DIMENSIONS, HoneycraftAdProps } from "./compositions/HoneycraftAd";

const DEFAULT_PROPS: HoneycraftAdProps = {
  videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  audioUrl: "",
  hookText: "This honey hasn't been touched since the hive",
  platform: "TikTok",
  hookType: "curiosity",
  ctaText: "Shop Now — HoneyCraft.co.uk",
  showCaptions: true,
  showCta: true,
};

export const Root: React.FC = () => {
  // Register a composition per platform
  const platforms = Object.entries(PLATFORM_DIMENSIONS) as [
    HoneycraftAdProps["platform"],
    { width: number; height: number }
  ][];

  return (
    <>
      {platforms.map(([platform, dims]) => (
        <Composition
          key={platform}
          id={`HoneycraftAd_${platform.replace(/[\s/]/g, "_")}`}
          component={HoneycraftAd}
          durationInFrames={300} // 10s at 30fps — overridden per render
          fps={30}
          width={dims.width}
          height={dims.height}
          defaultProps={{ ...DEFAULT_PROPS, platform }}
          calculateMetadata={async ({ props }) => {
            const plat = props.platform || "TikTok";
            const dim = PLATFORM_DIMENSIONS[plat] || PLATFORM_DIMENSIONS.TikTok;
            return {
              width: dim.width,
              height: dim.height,
              durationInFrames: props.durationInFrames ?? 300,
            };
          }}
        />
      ))}
    </>
  );
};
