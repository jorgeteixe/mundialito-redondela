import { Badge } from "@mr/ui";
import { AbsoluteFill } from "remotion";
import { fontFamily } from "../../fonts";

/** Spanish copy for the three states: kickoff day, tomorrow, and N days out. */
export function copy(daysLeft: number): {
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

type CountdownHeroProps = {
  daysLeft: number;
  /** Subtree scale — larger for the 9:16 reel, smaller for the square post. */
  scale: number;
  /** Hero fade (1 when static). */
  opacity?: number;
  /** Hero overshoot pop (1 when static). */
  pop?: number;
  /** Per-element entrance progress by frame delay (→ 1 when static). */
  enter?: (delay: number) => number;
};

/**
 * Presentational countdown hero shared by the video reel and the still post.
 * Mirrors the web hero (apps/web Hero + Countdown): light `bg-background`
 * canvas, @mr/ui Badge, Inter, bold tracking-tight headline. Built at web scale
 * and scaled up so badge/typography proportions stay on-brand.
 */
export function CountdownHero({
  daysLeft,
  scale,
  opacity = 1,
  pop = 1,
  enter = () => 1,
}: CountdownHeroProps) {
  const { eyebrow, hero, label } = copy(daysLeft);
  const isNumber = label !== undefined;

  return (
    <AbsoluteFill
      className="bg-background items-center justify-center"
      style={{ fontFamily }}
    >
      <div
        className="flex w-[340px] flex-col items-center gap-4 text-center"
        style={{ scale: String(scale) }}
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
