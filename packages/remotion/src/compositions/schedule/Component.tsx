import { Easing, interpolate, useCurrentFrame } from "remotion";
import { ScheduleContent } from "./content";
import type { ScheduleProps } from "./schema";

/**
 * Daily schedule reel (story 9:16). Match rows reveal as one grouped schedule,
 * keeping the frame readable instead of animating each small item separately.
 */
export function Schedule(props: ScheduleProps) {
  const frame = useCurrentFrame();
  const enter = (delay: number) =>
    interpolate(frame, [delay, delay + 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

  return <ScheduleContent {...props} variant="story" enter={enter} />;
}
