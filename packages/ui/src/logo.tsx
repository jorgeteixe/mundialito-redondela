"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";

type LogoVariant = "edition" | "event";

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: LogoVariant;
}

interface LogoLineProps {
  children: string;
  color?: string;
  maxSize: number;
  minSize: number;
  targetRatio?: number;
}

export function Logo({ variant = "edition", style, ...props }: LogoProps) {
  const label =
    variant === "edition"
      ? "XLVII Mundialito da Xunqueira"
      : "Mundialito da Xunqueira";

  return (
    <div
      {...props}
      aria-label={label}
      role="img"
      style={{ ...styles.logo, ...style }}
    >
      {variant === "edition" ? (
        <LogoLine color="#062f63" maxSize={248} minSize={96}>
          XLVII
        </LogoLine>
      ) : null}
      <LogoLine maxSize={118} minSize={44}>
        Mundialito
      </LogoLine>
      <span style={styles.separatorRow} aria-hidden="true">
        <span style={styles.rule} />
        <span style={styles.da}>Da</span>
        <span style={styles.rule} />
      </span>
      <LogoLine maxSize={128} minSize={54}>
        Xunqueira
      </LogoLine>
    </div>
  );
}

function LogoLine({
  children,
  color = "#050505",
  maxSize,
  minSize,
  targetRatio = 0.92,
}: LogoLineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState(maxSize);

  useLayoutEffect(() => {
    const fit = () => {
      const container = containerRef.current;
      const text = textRef.current;

      if (!container || !text) {
        return;
      }

      const targetWidth = container.clientWidth * targetRatio;
      const currentWidth = text.scrollWidth;

      if (targetWidth <= 0 || currentWidth <= 0) {
        return;
      }

      setFontSize((currentSize) => {
        const nextSize = Math.min(
          maxSize,
          Math.max(minSize, currentSize * (targetWidth / currentWidth)),
        );

        return Math.abs(nextSize - currentSize) < 0.5 ? currentSize : nextSize;
      });
    };

    fit();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(fit);
    const container = containerRef.current;

    if (container) {
      observer.observe(container);
    }

    return () => observer.disconnect();
  }, [maxSize, minSize, targetRatio]);

  return (
    <div ref={containerRef} style={styles.line}>
      <span
        ref={textRef}
        style={{
          ...styles.lineText,
          color,
          fontSize,
        }}
      >
        {children}
      </span>
    </div>
  );
}

const styles = {
  logo: {
    width: "min(100%, 640px)",
    display: "grid",
    gap: "clamp(6px, 1vw, 10px)",
    color: "#050505",
    fontFamily:
      "Impact, Haettenschweiler, 'Arial Narrow Bold', 'Arial Black', sans-serif",
    fontSynthesis: "none",
    fontWeight: 900,
    lineHeight: 0.9,
    textAlign: "center",
    textTransform: "uppercase",
  },
  line: {
    display: "grid",
    justifyItems: "center",
    width: "100%",
  },
  lineText: {
    display: "block",
    lineHeight: 0.9,
    whiteSpace: "nowrap",
  },
  separatorRow: {
    width: "92%",
    justifySelf: "center",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "clamp(18px, 5vw, 40px)",
  },
  rule: {
    height: "3px",
    background: "#062f63",
  },
  da: {
    color: "#062f63",
    fontSize: "clamp(38px, 8vw, 58px)",
    lineHeight: 0.9,
  },
} satisfies Record<string, CSSProperties>;
