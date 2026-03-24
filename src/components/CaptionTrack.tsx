import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface Word {
  word: string;
  startFrame: number;
  endFrame: number;
}

interface CaptionTrackProps {
  hookText: string;
  startFrame: number;
  durationFrames: number;
}

// Distribute words evenly across the duration
function buildWordTimings(text: string, startFrame: number, durationFrames: number): Word[] {
  const words = text.trim().split(/\s+/);
  const framesPerWord = durationFrames / words.length;
  return words.map((word, i) => ({
    word,
    startFrame: startFrame + Math.floor(i * framesPerWord),
    endFrame: startFrame + Math.floor((i + 1) * framesPerWord),
  }));
}

const WordChip: React.FC<{ word: string; active: boolean; upcoming: boolean }> = ({
  word,
  active,
  upcoming,
}) => {
  const scale = active ? 1.12 : 1;
  const color = active ? "#F5A623" : upcoming ? "#FAF3E0" : "rgba(250,243,224,0.45)";
  const weight = active ? 800 : upcoming ? 600 : 400;

  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: '"Montserrat", sans-serif',
        fontSize: 40,
        fontWeight: weight,
        color,
        transform: `scale(${scale})`,
        transition: "all 0.05s",
        marginRight: 10,
        textShadow: active
          ? "0 0 20px rgba(245,166,35,0.8), 0 2px 8px rgba(0,0,0,0.8)"
          : "0 2px 6px rgba(0,0,0,0.7)",
        letterSpacing: "-0.3px",
      }}
    >
      {word}
    </span>
  );
};

export const CaptionTrack: React.FC<CaptionTrackProps> = ({
  hookText,
  startFrame,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const words = buildWordTimings(hookText, startFrame, durationFrames);

  // Show captions only after startFrame
  if (frame < startFrame) return null;

  // Group into lines of ~5 words
  const lineSize = 5;
  const lines: Word[][] = [];
  for (let i = 0; i < words.length; i += lineSize) {
    lines.push(words.slice(i, i + lineSize));
  }

  // Find the current line (line containing active word)
  const activeIdx = words.findLastIndex((w) => frame >= w.startFrame) ?? 0;
  const currentLine = Math.floor(activeIdx / lineSize);

  const visibleLine = lines[currentLine] || [];

  const containerOpacity = interpolate(
    frame,
    [startFrame, startFrame + 6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: "22%",
        left: "4%",
        right: "4%",
        zIndex: 15,
        opacity: containerOpacity,
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          borderRadius: 14,
          padding: "14px 20px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 2,
        }}
      >
        {visibleLine.map((w, i) => {
          const globalIdx = currentLine * lineSize + i;
          const isActive = frame >= w.startFrame && frame < w.endFrame;
          const isUpcoming = frame < w.startFrame;
          return (
            <WordChip
              key={globalIdx}
              word={w.word}
              active={isActive}
              upcoming={isUpcoming}
            />
          );
        })}
      </div>
    </div>
  );
};
