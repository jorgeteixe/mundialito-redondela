/**
 * Brand palette for the social image templates, mirrored from the REAL utility
 * tokens the app renders with — the `@theme inline` block in packages/ui/src/styles.css
 * (not the unused `:root --primary`). The landing page is modern-minimalist:
 * near-black title + black "XLVII" badge + navy primary, all on white.
 */
export const social = {
  /** Page background — white, like the landing light theme. */
  background: "#ffffff",
  /** Title / foreground (--foreground). Effectively near-black. */
  ink: "#090b0c",
  /** Primary brand navy (--color-primary) — buttons, accents. */
  navy: "#051a55",
  /** Darker navy (--color-primary-dark). */
  navyDark: "#01072f",
  /** Badge fill (--color-secondary) — the black "XLVII" pill. */
  black: "#010101",
  /** Muted grey for meta text (--muted-foreground). */
  muted: "#67787c",
  /** Hairline border (--border). */
  border: "#e3e7e8",
  /** Text on a dark/navy/black surface. */
  onDark: "#ffffff",
} as const;
