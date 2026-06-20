import { AbsoluteFill } from "remotion";
import { fontFamily } from "../../fonts";
import { social } from "./brand";
import {
  CalendarIcon,
  EditionBadge,
  MetaItem,
  PinIcon,
  Wordmark,
} from "./parts";
import type { SocialProps } from "./schema";

/**
 * Facebook cover (851×315). Centred landing-hero lockup — black "XLVII" badge,
 * tight wordmark, muted meta row — kept inside Facebook's ~640px mobile
 * centre-crop and lifted above the bottom-left profile-photo overlap.
 */
export function FacebookCover({ variant = "light" }: SocialProps) {
  void variant;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: social.background,
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 48,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <EditionBadge fontSize={16} fontFamily={fontFamily}>
          XLVII · 2026
        </EditionBadge>
        <Wordmark fontSize={52} fontFamily={fontFamily} />
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <MetaItem
            icon={<PinIcon size={18} />}
            fontSize={18}
            fontFamily={fontFamily}
          >
            Pista de A Xunqueira, Redondela
          </MetaItem>
          <MetaItem
            icon={<CalendarIcon size={18} />}
            fontSize={18}
            fontFamily={fontFamily}
          >
            29 jun – 24 jul 2026
          </MetaItem>
        </div>
      </div>
    </AbsoluteFill>
  );
}
