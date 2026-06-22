import { Easing, interpolate, useCurrentFrame } from "remotion";
import { CountdownHero } from "./content";
import type { CountdownProps } from "./schema";

/**
 * Daily countdown reel (story 9:16). Animated wrapper around the shared
 * <CountdownHero>: fade + overshoot pop on the number, staggered entrances on
 * the surrounding lines.
 */
export function Countdown({ daysLeft }: CountdownProps) {
  const frame = useCurrentFrame();

  // Hero pop: fade in + scale with a slight overshoot. Inline interpolate on the
  // individual `scale` property so the animation stays editable in Studio.
  const opacity = interpolate(frame, [4, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pop = interpolate(frame, [4, 18, 26], [0.6, 1.05, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const enter = (delay: number) =>
    interpolate(frame, [delay, delay + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

  return (
    <CountdownHero
      daysLeft={daysLeft}
      scale={3.1}
      opacity={opacity}
      pop={pop}
      enter={enter}
    />
  );
}
