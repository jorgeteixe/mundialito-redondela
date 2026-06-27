import * as React from "react";
import { cn } from "../lib/utils";
import { Badge } from "../ui/badge";

const SATURATION = 78;
const BACKGROUND_LIGHTNESS = 90;
const BORDER_LIGHTNESS = 78;
const TEXT_LIGHTNESS = 28;

function hash(value: string) {
  let result = 0;

  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) >>> 0;
  }

  return result;
}

/**
 * Deterministic tint (background / border / text) for a group, derived from a
 * stable seed — typically the group id — so the same group always reads the
 * same color across the app.
 */
export function groupTint(seed: string): React.CSSProperties {
  const hue = hash(seed) % 360;

  return {
    backgroundColor: `hsl(${hue} ${SATURATION}% ${BACKGROUND_LIGHTNESS}%)`,
    borderColor: `hsl(${hue} ${SATURATION}% ${BORDER_LIGHTNESS}%)`,
    color: `hsl(${hue} 45% ${TEXT_LIGHTNESS}%)`,
  };
}

export interface GroupBadgeProps extends React.ComponentProps<typeof Badge> {
  /**
   * Stable seed (typically the group id) used to derive the tint. Ignored when
   * an explicit `style` is supplied.
   */
  seed?: string;
}

/**
 * Colored tag for a tournament group, the group-side counterpart to
 * {@link CategoryBadge}. Pass `seed` to color it deterministically, or `style`
 * to supply a precomputed tint. The group name goes in `children`.
 */
export function GroupBadge({
  seed,
  style,
  className,
  ...props
}: GroupBadgeProps) {
  const tint = style ?? (seed ? groupTint(seed) : undefined);

  return (
    <Badge
      variant="outline"
      className={cn("max-w-full truncate", className)}
      style={tint}
      {...props}
    />
  );
}
