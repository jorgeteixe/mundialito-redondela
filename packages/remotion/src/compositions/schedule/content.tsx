import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  CategoryBadge,
  GroupBadge,
  cn,
} from "@mr/ui";
import { AbsoluteFill } from "remotion";
import { fontFamily } from "../../fonts";
import type { ScheduleProps } from "./schema";

type ScheduleContentProps = ScheduleProps & {
  variant: "story" | "square";
  enter?: (delay: number) => number;
};

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

function Team({
  name,
  align,
  compact,
}: {
  name: string;
  align: "home" | "away";
  compact: boolean;
}) {
  const avatar = (
    <Avatar className={cn("flex-none", compact ? "size-12" : "size-[72px]")}>
      <AvatarImage src={teamAvatarUrl(name)} alt={name} />
      <AvatarFallback
        className={cn("font-semibold", compact ? "text-sm" : "text-2xl")}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-4",
        align === "home" ? "justify-end" : "flex-row-reverse justify-end",
      )}
    >
      <div
        className={cn(
          "min-w-0 font-semibold leading-tight tracking-tight text-foreground",
          align === "home" ? "text-right" : "text-left",
          compact ? "text-[25px]" : "text-[38px]",
        )}
        style={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: compact ? 1 : 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {name}
      </div>
      {avatar}
    </div>
  );
}

function MatchRow({
  match,
  compact,
  progress,
}: {
  match: ScheduleProps["matches"][number];
  compact: boolean;
  progress: number;
}) {
  const category = match.category ?? "senior";
  const group = match.group ?? "Grupo A";

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] items-center border bg-card text-card-foreground shadow-sm",
        compact ? "gap-5 px-7 py-4" : "gap-7 px-8 py-6",
      )}
      style={{
        opacity: progress,
        translate: `0 ${(1 - progress) * 18}px`,
      }}
    >
      <Badge
        className={cn(
          "bg-primary font-bold leading-none tabular-nums text-primary-foreground",
          compact ? "h-7 px-3 text-[17px]" : "h-9 px-5 text-[24px]",
        )}
      >
        {match.time}
      </Badge>

      <div className="min-w-0">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
          <Team name={match.home} align="home" compact={compact} />
          <div
            className={cn(
              "font-semibold text-muted-foreground",
              compact ? "text-[18px]" : "text-[24px]",
            )}
          >
            -
          </div>
          <Team name={match.away} align="away" compact={compact} />
        </div>

        <div
          className={cn(
            "flex items-center justify-center gap-2",
            compact ? "mt-2" : "mt-3",
          )}
        >
          <CategoryBadge
            category={category}
            label={match.categoryLabel ?? CATEGORY_LABELS[category]}
            className={
              compact ? "h-6 px-2 text-[15px]" : "h-8 px-3 text-[20px]"
            }
          />
          <GroupBadge
            seed={group}
            className={
              compact ? "h-6 px-2 text-[15px]" : "h-8 px-3 text-[20px]"
            }
          >
            {group}
          </GroupBadge>
        </div>
      </div>
    </div>
  );
}

/**
 * Schedule layout for social media. It keeps the app's visual vocabulary
 * (light canvas, card border, avatars, category/group tags) but removes web
 * navigation chrome and sizes the content for video frames.
 */
export function ScheduleContent({
  eyebrow = "Partidos de hoy",
  date,
  venue = "Pista de A Xunqueira, Redondela",
  matches,
  variant,
  enter = () => 1,
}: ScheduleContentProps) {
  const compact = variant === "square";
  const visibleMatches = compact ? matches.slice(0, 5) : matches;
  const hiddenCount = matches.length - visibleMatches.length;

  return (
    <AbsoluteFill
      className="bg-background text-foreground"
      style={{ fontFamily }}
    >
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center",
          compact ? "gap-9 px-12 py-12" : "gap-14 px-16 py-28",
        )}
      >
        <header
          className="flex flex-col items-center text-center"
          style={{
            opacity: enter(0),
            translate: `0 ${(1 - enter(0)) * 20}px`,
          }}
        >
          <Badge
            variant="secondary"
            className={
              compact ? "h-5 px-2 text-[12px]" : "h-9 px-4 text-[22px]"
            }
          >
            XLVII
          </Badge>
          <p
            className={cn(
              "mt-3 font-semibold tracking-tight text-foreground",
              compact ? "text-[30px]" : "text-[46px]",
            )}
          >
            Mundialito da Xunqueira
          </p>
          <p
            className={cn(
              "mt-6 font-bold uppercase tracking-[0.24em] text-muted-foreground",
              compact ? "text-[22px]" : "text-[32px]",
            )}
          >
            {eyebrow}
          </p>
          <h1
            className={cn(
              "mt-3 max-w-[940px] font-bold leading-none tracking-tight text-foreground",
              compact ? "text-[70px]" : "text-[112px]",
            )}
          >
            {date}
          </h1>
        </header>

        <main
          className={cn(
            "flex w-full flex-col",
            compact ? "gap-2" : "gap-3",
            compact ? "max-w-[980px]" : "max-w-[920px]",
          )}
          style={{
            translate: `0 ${(1 - enter(8)) * 24}px`,
          }}
        >
          {visibleMatches.map((match, index) => (
            <MatchRow
              key={`${match.time}-${match.home}-${match.away}-${index}`}
              match={match}
              compact={compact}
              progress={enter(10 + index * 10)}
            />
          ))}
        </main>

        <footer
          className={cn(
            "flex w-full items-center justify-between gap-6 text-muted-foreground",
            compact ? "max-w-[980px] text-[20px]" : "max-w-[920px] text-[28px]",
          )}
          style={{ opacity: enter(18) }}
        >
          <span>{venue}</span>
          <span className="font-semibold text-foreground">
            {hiddenCount > 0
              ? `+${hiddenCount} ${hiddenCount === 1 ? "partido" : "partidos"}`
              : `${matches.length} ${matches.length === 1 ? "partido" : "partidos"}`}
          </span>
        </footer>
      </div>
    </AbsoluteFill>
  );
}
