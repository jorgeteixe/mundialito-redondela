import { ScheduleContent } from "./content";
import type { ScheduleProps } from "./schema";

/**
 * Square still of a day's schedule for Instagram/Facebook posts.
 */
export function ScheduleImage(props: ScheduleProps) {
  return <ScheduleContent {...props} variant="square" />;
}
