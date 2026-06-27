import { DailyResultsContent } from "./content";
import type { DailyResultsProps } from "./schema";

/**
 * Square still of a day's results for Instagram/Facebook posts.
 */
export function DailyResultsImage(props: DailyResultsProps) {
  return <DailyResultsContent {...props} variant="square" />;
}
