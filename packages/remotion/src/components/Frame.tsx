import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill } from "remotion";
import { fontFamily } from "../fonts";
import { brandGradient, colors, space } from "../theme";
import { Brand } from "./Brand";

/**
 * Shared chrome for every composition: branded gradient canvas, safe padding,
 * the tournament lockup at the top and the venue strip at the bottom. Templates
 * render their content into the flexible middle region.
 */
export function Frame({
  children,
  contentStyle,
}: {
  children: ReactNode;
  contentStyle?: CSSProperties;
}) {
  return (
    <AbsoluteFill
      style={{
        backgroundImage: brandGradient,
        color: colors.foreground,
        fontFamily,
        padding: space(9),
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Brand />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          ...contentStyle,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
}
