import { colors, radius, teamColor } from "../theme";

/** First letter of the first and last words, e.g. "Real Xunqueira" → "RX". */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

/**
 * Placeholder team crest until real logos exist: a rounded square with the team's
 * initials over a colour derived deterministically from its name (see teamColor).
 * Swappable for an <Img> logo later without touching the templates.
 */
export function TeamCrest({
  name,
  size = 140,
}: {
  name: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius.lg,
        backgroundColor: teamColor(name),
        border: `${Math.round(size * 0.03)}px solid ${colors.surfaceBorder}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
        fontWeight: 800,
        color: colors.foreground,
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );
}
