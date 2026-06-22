import { Badge } from "@mr/ui";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import type { CountdownProps } from "./schema";

/** Spanish copy for the three states: kickoff day, tomorrow, and N days out. */
function copy(daysLeft: number): {
  eyebrow: string;
  hero: string;
  label?: string;
} {
  if (daysLeft <= 0) {
    return { eyebrow: "El gran día", hero: "¡Hoy\nempieza!" };
  }
  if (daysLeft === 1) {
    return { eyebrow: "Falta", hero: "1", label: "día" };
  }
  return { eyebrow: "Faltan", hero: String(daysLeft), label: "días" };
}

/**
 * Daily countdown reel (story 9:16). Mirrors the web hero (apps/web Hero +
 * Countdown): light `bg-background` canvas, @mr/ui Badge/Button, bold
 * tracking-tight headline. Built at the web's natural scale and scaled up to
 * fill the 1080-wide canvas so badge/button proportions stay on-brand.
 */
export function Countdown({ daysLeft }: CountdownProps) {
  const frame = useCurrentFrame();
  const { eyebrow, hero, label } = copy(daysLeft);
  const isNumber = label !== undefined;

  // Hero pop: fade in + scale with a slight overshoot. Inline interpolate on the
  // individual `scale` property so the animation stays editable in Studio.
  const opacity = interpolate(frame, [4, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pop = interpolate(frame, [4, 18, 26], [0.6, 1.05, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const enter = (delay: number) =>
    interpolate(frame, [delay, delay + 12], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

  return (
    <AbsoluteFill
      className="bg-background items-center justify-center"
      style={{ fontFamily }}
    >
      {/* Build the hero at web scale, then scale the whole subtree so @mr/ui
          radii/typography/padding stay proportional (same trick as HelloWorld). */}
      <div
        className="flex w-[340px] flex-col items-center gap-4 text-center"
        style={{ scale: "3.1" }}
      >
        <div
          className="flex flex-col items-center gap-2"
          style={{
            opacity: enter(0),
            translate: `0 ${(1 - enter(0)) * 12}px`,
          }}
        >
          <Badge variant="secondary">XLVII</Badge>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            Mundialito da Xunqueira
          </p>
        </div>

        <p className="text-base font-medium uppercase tracking-[0.35em] text-muted-foreground">
          {eyebrow}
        </p>

        <div
          className="font-bold tracking-tight text-foreground"
          style={{
            opacity,
            scale: String(pop),
            fontSize: isNumber ? 200 : 76,
            lineHeight: 0.88,
            whiteSpace: "pre-line",
          }}
        >
          {hero}
        </div>

        {label ? (
          <p
            className="text-5xl font-bold uppercase tracking-tight text-foreground"
            style={{ opacity: enter(14) }}
          >
            {label}
          </p>
        ) : null}

        <div
          className="flex flex-col gap-1 text-base text-muted-foreground"
          style={{ opacity: enter(20) }}
        >
          <span>Pista de A Xunqueira, Redondela</span>
          <span>29 jun – 24 jul 2026</span>
        </div>
      </div>
    </AbsoluteFill>
  );
}
