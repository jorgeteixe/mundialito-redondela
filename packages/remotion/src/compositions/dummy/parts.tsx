import type { CSSProperties, ReactNode } from "react";
import { social } from "./brand";

/**
 * Shared brand parts that mirror the landing page hero so every social asset
 * reads as the same site: the black "XLVII" badge, the tight near-black
 * wordmark, and the muted meta rows with lucide-style line icons.
 */

/** Black rounded badge — the landing's signature edition device. */
export function EditionBadge({
  children,
  fontSize = 18,
  fontFamily,
}: {
  children: ReactNode;
  fontSize?: number;
  fontFamily?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: social.black,
        color: social.onDark,
        fontFamily,
        fontSize,
        fontWeight: 700,
        letterSpacing: 0.5,
        lineHeight: 1,
        // Compact, near-rectangular label like the landing badge.
        padding: `${fontSize * 0.32}px ${fontSize * 0.58}px`,
        borderRadius: Math.max(3, fontSize * 0.18),
      }}
    >
      {children}
    </span>
  );
}

/** The "Mundialito da Xunqueira" wordmark — tight, heavy, near-black. */
export function Wordmark({
  fontSize,
  fontFamily,
  align = "center",
  color = social.ink,
}: {
  fontSize: number;
  fontFamily?: string;
  align?: "center" | "left";
  color?: string;
}) {
  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight: 800,
        letterSpacing: -fontSize * 0.025,
        lineHeight: 0.98,
        color,
        textAlign: align,
      }}
    >
      Mundialito da Xunqueira
    </div>
  );
}

/** Muted meta row: a line icon + label, like the landing's location/date. */
export function MetaItem({
  icon,
  children,
  fontSize = 22,
  fontFamily,
}: {
  icon: ReactNode;
  children: ReactNode;
  fontSize?: number;
  fontFamily?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: fontSize * 0.5,
        color: social.muted,
        fontFamily,
        fontSize,
        fontWeight: 500,
      }}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}

const iconBase = (size: number): CSSProperties => ({
  width: size,
  height: size,
  flex: "none",
});

/** lucide MapPin. */
export function PinIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconBase(size)}
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/** lucide ExternalLink — the icon the landing buttons carry. */
export function ExternalLinkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconBase(size)}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

/** lucide CalendarDays (simplified). */
export function CalendarIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconBase(size)}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
