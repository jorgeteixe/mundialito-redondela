import { colors, space } from "../theme";

/**
 * Eyebrow label + big title block, reused as the section header in the schedule
 * and result templates.
 */
export function Headline({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div style={{ marginBottom: space(5) }}>
      <div
        style={{
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: colors.highlight,
          marginBottom: space(1.5),
        }}
      >
        {eyebrow}
      </div>
      <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1 }}>
        {title}
      </div>
    </div>
  );
}
