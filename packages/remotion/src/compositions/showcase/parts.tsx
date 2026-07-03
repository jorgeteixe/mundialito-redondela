import type { ReactNode } from "react";
import { useCurrentFrame } from "remotion";
import { space, teamColor } from "../../theme";
import { social } from "../dummy/brand";

/** Mono stack, mirrors --font-mono in the UI theme. */
export const fontMono =
  'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace';

/** White card with the app's hairline border, like the landing's list cards. */
export function Card({
  children,
  width = 620,
  style,
}: {
  children: ReactNode;
  width?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width,
        backgroundColor: social.background,
        border: `2px solid ${social.border}`,
        borderRadius: 20,
        boxShadow: "0 24px 60px rgba(9, 11, 12, 0.08)",
        padding: space(5),
        display: "flex",
        flexDirection: "column",
        gap: space(3),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 26,
        fontWeight: 700,
        letterSpacing: 4,
        textTransform: "uppercase",
        color: social.muted,
      }}
    >
      {children}
    </div>
  );
}

export function TeamDot({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        backgroundColor: teamColor(name),
        flexShrink: 0,
      }}
    />
  );
}

export function Pill({
  children,
  filled = false,
  fontSize = 32,
}: {
  children: ReactNode;
  filled?: boolean;
  fontSize?: number;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: fontSize * 0.3,
        fontSize,
        fontWeight: 600,
        color: filled ? social.onDark : social.ink,
        backgroundColor: filled ? social.navy : social.background,
        border: filled ? "none" : `2px solid ${social.border}`,
        padding: `${fontSize * 0.28}px ${fontSize * 0.72}px`,
        borderRadius: 999,
      }}
    >
      {children}
    </span>
  );
}

/** Three bouncing dots, frame-derived so renders stay deterministic. */
export function TypingDots({ color = social.muted }: { color?: string }) {
  const frame = useCurrentFrame();
  return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            backgroundColor: color,
            transform: `translateY(${Math.sin((frame - i * 3) / 2.5) * 4}px)`,
          }}
        />
      ))}
    </span>
  );
}
