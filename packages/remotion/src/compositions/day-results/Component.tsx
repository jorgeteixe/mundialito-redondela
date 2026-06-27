import { Easing, interpolate, useCurrentFrame } from "remotion";
import { DailyResultsContent } from "./content";
import type { DailyResultsProps } from "./schema";

/**
 * Daily results reel (story 9:16). Results reveal row by row after the title.
 */
export function DailyResults(props: DailyResultsProps) {
  const frame = useCurrentFrame();
  const enter = (delay: number) =>
    interpolate(frame, [delay, delay + 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

  return <DailyResultsContent {...props} variant="story" enter={enter} />;
}
