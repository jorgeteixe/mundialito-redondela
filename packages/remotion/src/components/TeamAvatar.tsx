import { cn } from "@mr/ui";
import { useCallback, useState } from "react";
import { Img } from "remotion";

// Combining diacritical marks (U+0300–U+036F), stripped after NFD normalization.
const DIACRITICS = /[̀-ͯ]/g;

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Dicebear "shapes" avatar derived deterministically from the team name. */
function teamAvatarUrl(name: string) {
  return `https://api.dicebear.com/10.x/shapes/svg?seed=${encodeURIComponent(slug(name))}`;
}

/**
 * Team avatar for social renders. Uses Remotion's <Img>, which calls delayRender()
 * until the remote image loads, so still captures (renderStill) wait for the dicebear
 * SVG instead of snapshotting the initials fallback. Radix's <AvatarImage> swaps in via
 * a post-mount onLoad state that doesn't integrate with delayRender — that race is why
 * the schedule post showed initials while the multi-frame video eventually showed the
 * image. On load error we fall back to the initials and let the render continue.
 */
export function TeamAvatar({
  name,
  className,
  fallbackClassName,
}: {
  name: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const handleError = useCallback(() => setFailed(true), []);

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full after:absolute after:inset-0 after:rounded-full after:border after:border-border",
        className,
      )}
    >
      {failed ? (
        <span
          className={cn(
            "flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground",
            fallbackClassName,
          )}
        >
          {initials(name)}
        </span>
      ) : (
        <Img
          src={teamAvatarUrl(name)}
          alt={name}
          onError={handleError}
          className="size-full rounded-full object-cover"
        />
      )}
    </div>
  );
}
