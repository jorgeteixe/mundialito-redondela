import { AbsoluteFill } from "remotion";
import { fontFamily } from "../../fonts";
import { social } from "../dummy/brand";
import {
  CalendarIcon,
  EditionBadge,
  ExternalLinkIcon,
  MetaItem,
  PinIcon,
} from "../dummy/parts";
import type { SocialProps } from "../dummy/schema";

/**
 * Open Graph share card (1200×630) — the link preview on Facebook/WhatsApp/etc.
 * A faithful, centred replica of the landing hero: black "XLVII" badge, the
 * huge tight near-black title, the muted location/date rows, and the navy CTA.
 */
export function OgShare({ variant = "light" }: SocialProps) {
  void variant;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: social.background,
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        padding: 72,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 36,
        }}
      >
        <EditionBadge fontSize={20} fontFamily={fontFamily}>
          XLVII
        </EditionBadge>

        <div
          style={{
            fontFamily,
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: -2.5,
            lineHeight: 1.02,
            color: social.ink,
            maxWidth: 680,
          }}
        >
          Mundialito da Xunqueira
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <MetaItem
            icon={<PinIcon size={22} />}
            fontSize={23}
            fontFamily={fontFamily}
          >
            Pista de A Xunqueira, Redondela
          </MetaItem>
          <MetaItem
            icon={<CalendarIcon size={22} />}
            fontSize={23}
            fontFamily={fontFamily}
          >
            29 jun – 24 jul 2026
          </MetaItem>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 4,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily,
              fontSize: 23,
              fontWeight: 600,
              color: social.onDark,
              backgroundColor: social.navy,
              padding: "13px 22px",
              borderRadius: 6,
            }}
          >
            Inscríbete
            <ExternalLinkIcon size={16} />
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily,
              fontSize: 23,
              fontWeight: 600,
              color: social.ink,
              border: `1px solid ${social.border}`,
              padding: "13px 22px",
              borderRadius: 6,
            }}
          >
            Más información
            <ExternalLinkIcon size={16} />
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
}
