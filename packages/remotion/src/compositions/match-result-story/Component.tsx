import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  CategoryBadge,
  GroupBadge,
  cn,
} from "@mr/ui";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { fontFamily } from "../../fonts";
import type { MatchResultStoryProps } from "./schema";

const CATEGORY_LABELS = {
  senior: "Senior",
  cadet: "Cadete",
} as const;

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function teamAvatarUrl(name: string) {
  return `https://api.dicebear.com/10.x/shapes/svg?seed=${encodeURIComponent(slug(name))}`;
}

function won(
  sideScore: number,
  otherScore: number,
  sidePenaltyScore?: number,
  otherPenaltyScore?: number,
) {
  if (sideScore !== otherScore) return sideScore > otherScore;
  if (
    sidePenaltyScore != null &&
    otherPenaltyScore != null &&
    sidePenaltyScore !== otherPenaltyScore
  ) {
    return sidePenaltyScore > otherPenaltyScore;
  }
  return true;
}

function PenaltyMark({ value }: { value: number }) {
  return (
    <span className="ml-2 align-top text-[0.26em] font-semibold text-muted-foreground">
      ({value})
    </span>
  );
}

function TeamPanel({
  name,
  side,
  winner,
  progress,
}: {
  name: string;
  side: "home" | "away";
  winner: boolean;
  progress: number;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center border bg-card px-8 py-12 text-center text-card-foreground shadow-sm",
        winner && "bg-muted/40",
      )}
      style={{
        opacity: progress,
        translate: `${(side === "home" ? -1 : 1) * (1 - progress) * 70}px 0`,
        scale: String(interpolate(progress, [0, 1], [0.96, 1])),
      }}
    >
      <Avatar className="size-[190px]">
        <AvatarImage src={teamAvatarUrl(name)} alt={name} />
        <AvatarFallback className="text-[60px] font-bold">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <p
        className={cn(
          "mt-9 max-w-[360px] truncate text-[52px] font-bold leading-tight tracking-tight",
          !winner && "text-muted-foreground",
        )}
      >
        {name}
      </p>
    </div>
  );
}

export function MatchResultStory({
  eyebrow = "Resultado final",
  home,
  away,
  category = "senior",
  categoryLabel,
  phase = "Fase 1",
  group,
  note,
  venue = "Pista de A Xunqueira, Redondela",
}: MatchResultStoryProps) {
  const frame = useCurrentFrame();
  const enter = (delay: number, duration = 16) =>
    interpolate(frame, [delay, delay + duration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
  const header = enter(0);
  const panels = enter(16, 20);
  const score = enter(38, 18);
  const details = enter(58);
  const homeWon = won(
    home.score,
    away.score,
    home.penaltyScore,
    away.penaltyScore,
  );
  const awayWon = won(
    away.score,
    home.score,
    away.penaltyScore,
    home.penaltyScore,
  );
  const displayHomeScore = Math.round(
    interpolate(score, [0, 1], [0, home.score]),
  );
  const displayAwayScore = Math.round(
    interpolate(score, [0, 1], [0, away.score]),
  );

  return (
    <AbsoluteFill
      className="bg-background text-foreground"
      style={{ fontFamily }}
    >
      <div className="flex h-full flex-col items-center justify-center gap-16 px-16 py-24">
        <header
          className="flex flex-col items-center text-center"
          style={{
            opacity: header,
            translate: `0 ${(1 - header) * 22}px`,
          }}
        >
          <Badge variant="secondary" className="h-9 px-4 text-[22px]">
            XLVII
          </Badge>
          <p className="mt-3 text-[46px] font-semibold tracking-tight text-foreground">
            Mundialito da Xunqueira
          </p>
          <p className="mt-6 text-[34px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </p>
        </header>

        <main className="flex w-full max-w-[980px] flex-col items-center">
          <div className="flex w-full gap-5">
            <TeamPanel
              name={home.name}
              side="home"
              winner={homeWon}
              progress={panels}
            />
            <TeamPanel
              name={away.name}
              side="away"
              winner={awayWon}
              progress={panels}
            />
          </div>

          <div
            className="mt-8 flex justify-center"
            style={{
              opacity: score,
              scale: String(
                interpolate(score, [0, 0.68, 1], [0.55, 1.1, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
              ),
            }}
          >
            <div className="flex min-w-[560px] items-center justify-center gap-10 border bg-background px-14 py-6 shadow-sm">
              <span
                className={cn(
                  "min-w-[155px] text-right text-[168px] font-bold leading-none tabular-nums",
                  !homeWon && "text-muted-foreground",
                )}
              >
                {displayHomeScore}
                {home.penaltyScore != null ? (
                  <PenaltyMark value={home.penaltyScore} />
                ) : null}
              </span>
              <span className="text-[84px] font-semibold leading-none text-muted-foreground">
                -
              </span>
              <span
                className={cn(
                  "min-w-[155px] text-left text-[168px] font-bold leading-none tabular-nums",
                  !awayWon && "text-muted-foreground",
                )}
              >
                {displayAwayScore}
                {away.penaltyScore != null ? (
                  <PenaltyMark value={away.penaltyScore} />
                ) : null}
              </span>
            </div>
          </div>
        </main>

        <section
          className="flex flex-col items-center gap-5 text-center"
          style={{
            opacity: details,
            translate: `0 ${(1 - details) * 18}px`,
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            <CategoryBadge
              category={category}
              label={categoryLabel ?? CATEGORY_LABELS[category]}
              className="h-9 px-4 text-[22px]"
            />
            {group ? (
              <GroupBadge seed={group} className="h-9 px-4 text-[22px]">
                {group}
              </GroupBadge>
            ) : null}
            <Badge variant="outline" className="h-9 px-4 text-[22px]">
              {phase}
            </Badge>
          </div>
          {note ? (
            <p className="max-w-[760px] text-[34px] font-semibold tracking-tight text-foreground">
              {note}
            </p>
          ) : null}
          <p className="text-[26px] text-muted-foreground">{venue}</p>
        </section>
      </div>
    </AbsoluteFill>
  );
}
