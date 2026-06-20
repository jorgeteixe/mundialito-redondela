import { AbsoluteFill } from "remotion";
import { fontFamily } from "../../fonts";
import { social } from "./brand";
import { EditionBadge } from "./parts";

/**
 * Square profile picture (320×320) shared by Instagram and Facebook. Mirrors the
 * landing hero — black "XLVII" badge + tight near-black wordmark on white —
 * composed inside the centre safe-zone for the platforms' circular crop.
 */
export function SocialProfile({
  variant = "light",
}: {
  variant?: "light" | "filled";
}) {
  const dark = variant === "filled";
  const bg = dark ? social.black : social.background;
  const word = dark ? social.onDark : social.ink;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          textAlign: "center",
        }}
      >
        <EditionBadge fontSize={19} fontFamily={fontFamily}>
          XLVII
        </EditionBadge>
        <div
          style={{
            fontFamily,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: -1,
            lineHeight: 1.0,
            color: word,
          }}
        >
          Mundialito da
          <br />
          Xunqueira
        </div>
        <div
          style={{
            fontFamily,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 0.8,
            color: dark ? "rgba(255,255,255,0.65)" : social.muted,
          }}
        >
          Redondela · 2026
        </div>
      </div>
    </AbsoluteFill>
  );
}
