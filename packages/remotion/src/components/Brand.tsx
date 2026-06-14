import { colors, radius, space } from "../theme";
import { TOURNAMENT } from "../tournament";

/**
 * Tournament wordmark + edition pill. Reused as the header in <Frame>.
 */
export function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: space(2.5) }}>
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: colors.foreground,
        }}
      >
        {TOURNAMENT.name}
      </div>
      <span
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: colors.primary,
          backgroundColor: colors.highlight,
          padding: `${space(0.75)}px ${space(1.75)}px`,
          borderRadius: radius.pill,
          letterSpacing: 1,
        }}
      >
        {TOURNAMENT.edition} · {TOURNAMENT.year}
      </span>
    </div>
  );
}
