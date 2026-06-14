import type { CSSProperties, ReactNode } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Spring entrance progress (0→1) that starts at `delay` frames. Frame-derived only,
 * so renders stay deterministic.
 */
export function useEntrance(delay = 0): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
    durationInFrames: 24,
  });
}

/**
 * Wraps children in a fade + rise entrance. Used by the animated (video) templates;
 * static (image) templates compose at frame 0 without it.
 */
export function AnimatedIn({
  children,
  delay = 0,
  distance = 60,
  style,
}: {
  children: ReactNode;
  delay?: number;
  distance?: number;
  style?: CSSProperties;
}) {
  const progress = useEntrance(delay);
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * distance}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
