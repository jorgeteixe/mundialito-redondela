/**
 * Video design tokens, derived from the @mr/ui shadcn theme (packages/ui/src/styles.css)
 * so renders match the brand. Values are oklch strings — Chrome (the render runtime)
 * supports oklch in CSS, so they can be used directly in inline styles.
 *
 * Videos use a dark, branded canvas (deep-indigo primary) with white text, which reads
 * better full-bleed than the app's light surfaces.
 */
export const colors = {
  /** Brand primary (--color-primary in the UI theme). */
  primary: "oklch(0.25 0.109 264)",
  /** Darker primary for gradients (--color-primary-dark). */
  primaryDark: "oklch(0.16 0.08 264)",
  primaryForeground: "oklch(1 0 0)",

  /** Foreground + muted text on the dark canvas. */
  foreground: "oklch(1 0 0)",
  muted: "oklch(1 0 0 / 0.62)",

  /** Vivid blue accent for highlights/labels. */
  accent: "oklch(0.72 0.16 250)",
  /** Gold, reserved for celebratory emphasis (goals, winners). */
  highlight: "oklch(0.86 0.17 92)",
  /** Red (matches --destructive), e.g. live indicators. */
  destructive: "oklch(0.62 0.21 24)",

  /** Translucent card surface + border layered over the canvas. */
  surface: "oklch(1 0 0 / 0.08)",
  surfaceStrong: "oklch(1 0 0 / 0.12)",
  surfaceBorder: "oklch(1 0 0 / 0.16)",
} as const;

/** Corner radii in px (tracks the UI's rounded look at video scale). */
export const radius = {
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
  pill: 999,
} as const;

/** 8px spacing scale → px. */
export const space = (n: number): number => n * 8;

/** Background gradient used by every composition's <Frame>. */
export const brandGradient = `linear-gradient(160deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`;

/**
 * Deterministic accent hue from a team name (no Math.random — renders stay
 * reproducible). Used by <TeamCrest> when a team has no explicit color/logo yet.
 */
export function teamColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return `oklch(0.62 0.15 ${hash})`;
}
