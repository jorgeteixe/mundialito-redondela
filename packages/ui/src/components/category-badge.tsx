import * as React from "react";
import { cn } from "../lib/utils";
import { Badge } from "../ui/badge";

export type TournamentCategory = "senior" | "cadet";

const CATEGORY_LABELS: Record<TournamentCategory, string> = {
  senior: "Senior",
  cadet: "Cadete",
};

// Distinct but subdued tints per category — soft fills, not saturated chips — so
// the two are tellable apart at a glance without shouting in mixed lists.
const CATEGORY_CLASSES: Record<TournamentCategory, string> = {
  senior:
    "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-300",
  cadet:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
};

export interface CategoryBadgeProps extends React.ComponentProps<typeof Badge> {
  category: TournamentCategory;
  /** Overrides the default Spanish label ("Senior" / "Cadete"). */
  label?: string;
}

/** Colored tag for a tournament category, consistent across web and backstage. */
export function CategoryBadge({
  category,
  label,
  className,
  ...props
}: CategoryBadgeProps) {
  return (
    <Badge className={cn(CATEGORY_CLASSES[category], className)} {...props}>
      {label ?? CATEGORY_LABELS[category]}
    </Badge>
  );
}
