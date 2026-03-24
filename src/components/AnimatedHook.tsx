import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

interface AnimatedHookProps {
  text: string;
  startFrame?: number;
}

export const AnimatedHook: React.FC<AnimatedHookProps> = ({
  text,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - startFrame;

  // Slide up + fade in over 18 frames
  const slideProgress = spring({
    frame: f,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
    durationInFrames: 18,
  });

  const opacity = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(slideProgress, [0, 1], [40, 0]);

  // Subtle scale pulse after entry
  const pulse = interpolate(f, [18, 24, 30], [1, 1.03, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.ease),
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "12%",
        left: "5%",
        right: "5%",
        zIndex: 10,
        opacity,
        transform: `translateY(${translateY}px) scale(${pulse})`,
      }}
    >
      {/* Subtle background blur pill */}
      <div
        style={{
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px)",
          borderRadius: 16,
          padding: "18px 24px",
          borderLeft: "4px solid #F5A623",
        }}
      >
        <span
          style={{
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 800,
            fontSize: 52,
            color: "#FAF3E0",
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
            textShadow: "0 2px 12px rgba(0,0,0,0.6)",
            display: "block",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};
