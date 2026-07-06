import { Badge, cn } from "@mr/ui";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import type { AnnouncementProps } from "./schema";

/**
 * Generic announcement reel (story 9:16). Same visual language as the other
 * reels (schedule/countdown): light `bg-background` canvas, "XLVII" +
 * "Mundialito da Xunqueira" lockup pinned near the top, uppercase eyebrow, and
 * a big tracking-tight message centered in the remaining space, revealed word
 * by word. One free-text input drives the message.
 */
export function Announcement({ eyebrow = "Aviso", text }: AnnouncementProps) {
  const frame = useCurrentFrame();
  const enter = (delay: number) =>
    interpolate(frame, [delay, delay + 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

  const words = text.trim().split(/\s+/);
  const fontSize = messageFontSize(text.trim().length);

  return (
    <AbsoluteFill
      className="bg-background text-foreground"
      style={{ fontFamily }}
    >
      <div className="flex h-full flex-col items-center px-16 pb-28 pt-32 text-center">
        <header
          className="flex flex-col items-center"
          style={{
            opacity: enter(0),
            translate: `0 ${(1 - enter(0)) * 20}px`,
          }}
        >
          <Badge variant="secondary" className="h-9 px-4 text-[22px]">
            XLVII
          </Badge>
          <p className="mt-3 text-[46px] font-semibold tracking-tight text-foreground">
            Mundialito da Xunqueira
          </p>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center">
          <p
            className="mb-8 text-[32px] font-bold uppercase tracking-[0.24em] text-muted-foreground"
            style={{
              opacity: enter(8),
              translate: `0 ${(1 - enter(8)) * 16}px`,
            }}
          >
            {eyebrow}
          </p>

          <h1
            className={cn(
              "flex max-w-[940px] flex-wrap items-center justify-center",
              "font-bold leading-[1.05] tracking-tight text-foreground",
            )}
            style={{
              fontSize,
              columnGap: fontSize * 0.26,
              rowGap: fontSize * 0.08,
            }}
          >
            {words.map((word, index) => {
              const progress = enter(14 + index * 4);
              return (
                <span
                  key={`${word}-${index}`}
                  className="inline-block"
                  style={{
                    opacity: progress,
                    translate: `0 ${(1 - progress) * 40}px`,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </h1>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/**
 * Pick a headline size that keeps the message inside the frame as it gets
 * longer. Short avisos stay big and punchy; long ones step down gracefully.
 */
function messageFontSize(length: number): number {
  if (length <= 28) return 128;
  if (length <= 55) return 104;
  if (length <= 90) return 84;
  if (length <= 140) return 66;
  return 54;
}
