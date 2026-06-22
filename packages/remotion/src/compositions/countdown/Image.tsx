import { CountdownHero } from "./content";
import type { CountdownProps } from "./schema";

/**
 * Square (1080×1080) still of the countdown for Instagram/Facebook posts.
 * Renders the shared <CountdownHero> fully composed (no animation) at a smaller
 * subtree scale to fit the square frame.
 */
export function CountdownImage({ daysLeft }: CountdownProps) {
  return <CountdownHero daysLeft={daysLeft} scale={2.4} />;
}
