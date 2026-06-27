"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { CategoryBadge, type TournamentCategory } from "./category-badge";
import { GroupBadge } from "./group-badge";

/**
 * Element used to render links. Defaults to a plain `<a>`; pass `next/link`
 * (or any component accepting `href`) to get client-side navigation.
 */
export type LinkComponent = React.ElementType;

export interface MatchSide {
  id: string;
  name: string;
  /** Crest image URL; falls back to initials when absent. */
  crestUrl?: string;
  /** Goals scored. Absent until results exist — renders a placeholder. */
  score?: number;
  /**
   * Penalty-shootout goals. Shown in parentheses next to the score and used to
   * decide the winner when regular time is level. Only rendered when both sides
   * have a value.
   */
  penaltyScore?: number;
  /** When set, the team (name + crest) links here. */
  href?: string;
}

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";

export interface ScheduleGroup {
  name: string;
  /** Short label rendered inside the group avatar (e.g. "A"). */
  avatarLabel?: string;
  /** Deterministic colors for the group avatar, computed by the caller. */
  avatarStyle?: React.CSSProperties;
  /** When set, the group chip links here. */
  href?: string;
}

export interface ScheduleMatch {
  id: string;
  /** Preformatted kickoff time, e.g. "10:00". */
  timeLabel: string;
  /** Defaults to "scheduled" when omitted. */
  status?: MatchStatus;
  /** Live clock label, e.g. "42'". Only shown while `status` is "live". */
  minuteLabel?: string;
  /** Category value, used to color the tag when `showCategory`. */
  category?: TournamentCategory;
  /** Preformatted category label; only shown when `showCategory`. */
  categoryLabel?: string;
  /** When set, the category chip links here. */
  categoryHref?: string;
  group?: ScheduleGroup;
  home: MatchSide;
  away: MatchSide;
}

export interface ScheduleDay {
  key: string;
  /** Preformatted day heading, e.g. "sábado, 27 junio". */
  label: string;
  matches: ScheduleMatch[];
}

export interface MatchScheduleProps {
  /** Day-grouped matches. Mutually exclusive with `matches`. */
  days?: ScheduleDay[];
  /** Flat list of standalone matches, rendered without day headings. */
  matches?: ScheduleMatch[];
  showCategory?: boolean;
  showGroup?: boolean;
  /** Used to render any links present on teams/category/group. */
  linkComponent?: LinkComponent;
  /** Rendered when there are no matches. */
  emptyState?: React.ReactNode;
  /**
   * Drops the list's own border and surface so it can sit flush inside a
   * surrounding card (rows still divide). Used by the calendar.
   */
  bare?: boolean;
  className?: string;
}

const SCORE_PLACEHOLDER = "–";

/** Wraps children in `as` (a link) when `href` is set; otherwise renders them as-is. */
function MaybeLink({
  href,
  as: Comp = "a",
  className,
  children,
}: {
  href?: string;
  as?: LinkComponent;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href) return <>{children}</>;
  return (
    <Comp href={href} className={className}>
      {children}
    </Comp>
  );
}

function teamInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function hasResult(status: MatchStatus) {
  return status === "live" || status === "finished";
}

function isWinner(side: MatchSide, other: MatchSide, status: MatchStatus) {
  if (status !== "finished") return false;
  if (side.score == null || other.score == null) return false;
  if (side.score !== other.score) return side.score > other.score;
  // Regular time level — fall back to the penalty shootout when present.
  if (
    side.penaltyScore != null &&
    other.penaltyScore != null &&
    side.penaltyScore !== other.penaltyScore
  ) {
    return side.penaltyScore > other.penaltyScore;
  }
  return false;
}

function TeamSide({
  team,
  align,
  emphasize,
  linkComponent,
}: {
  team: MatchSide;
  align: "home" | "away";
  emphasize: boolean;
  linkComponent?: LinkComponent;
}) {
  const avatar = (
    <Avatar size="sm" className="flex-none">
      <AvatarImage src={team.crestUrl} alt={team.name} />
      <AvatarFallback className="text-[10px] font-medium">
        {teamInitials(team.name)}
      </AvatarFallback>
    </Avatar>
  );
  const name = (
    <span
      className={cn(
        "min-w-0 truncate",
        align === "home" ? "text-right" : "text-left",
        emphasize && "font-semibold",
      )}
    >
      {team.name}
    </span>
  );

  const className = cn(
    "flex min-w-0 items-center gap-2.5",
    align === "home" ? "flex-row justify-end" : "flex-row-reverse justify-end",
  );

  if (team.href) {
    const Comp = linkComponent ?? "a";
    return (
      <Comp
        href={team.href}
        className={cn(className, "transition-colors hover:text-primary")}
      >
        {name}
        {avatar}
      </Comp>
    );
  }

  return (
    <div className={className}>
      {name}
      {avatar}
    </div>
  );
}

function ScoreBox({ match }: { match: ScheduleMatch }) {
  const status = match.status ?? "scheduled";

  // No result yet: a single, quiet placeholder reads far cleaner than two
  // dashes flanking a separator.
  if (
    !hasResult(status) ||
    match.home.score == null ||
    match.away.score == null
  ) {
    return (
      <span className="px-4 text-center text-base font-medium text-muted-foreground sm:px-6">
        {SCORE_PLACEHOLDER}
      </span>
    );
  }

  // Loser dims, winner (and draws) stay solid.
  const homeMuted = isWinner(match.away, match.home, status);
  const awayMuted = isWinner(match.home, match.away, status);

  // Penalties only make sense as a pair; show them when both are recorded.
  const showPenalties =
    match.home.penaltyScore != null && match.away.penaltyScore != null;

  return (
    <div className="flex items-center gap-2 px-2 text-lg font-semibold tabular-nums sm:px-3 sm:text-xl">
      <span
        className={cn(
          "min-w-5 text-center",
          homeMuted && "text-muted-foreground",
        )}
      >
        {match.home.score}
        {showPenalties ? (
          <PenaltyMark value={match.home.penaltyScore!} />
        ) : null}
      </span>
      <span className="text-muted-foreground">-</span>
      <span
        className={cn(
          "min-w-5 text-center",
          awayMuted && "text-muted-foreground",
        )}
      >
        {match.away.score}
        {showPenalties ? (
          <PenaltyMark value={match.away.penaltyScore!} />
        ) : null}
      </span>
    </div>
  );
}

/** Small parenthetical penalty count rendered next to a regular-time score. */
function PenaltyMark({ value }: { value: number }) {
  return (
    <span
      className="ml-0.5 align-top text-[0.6em] font-medium text-muted-foreground"
      title="Penaltis"
    >
      ({value})
    </span>
  );
}

function StatusChip({ match }: { match: ScheduleMatch }) {
  const status = match.status ?? "scheduled";

  if (status === "live") {
    return (
      <Badge className="h-5 gap-1 px-1.5 text-[10px] font-medium">
        <span
          className="size-1.5 rounded-full bg-primary-foreground"
          aria-hidden="true"
        />
        {match.minuteLabel ?? "En directo"}
      </Badge>
    );
  }
  if (status === "finished") {
    return (
      <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
        Final
      </Badge>
    );
  }
  if (status === "postponed") {
    return (
      <Badge
        variant="secondary"
        className="h-5 bg-destructive/10 px-1.5 text-[10px] font-medium text-destructive ring-1 ring-destructive/20"
      >
        Aplazado
      </Badge>
    );
  }
  return null;
}

function GroupChip({
  group,
  linkComponent,
}: {
  group: ScheduleGroup;
  linkComponent?: LinkComponent;
}) {
  return (
    <MaybeLink
      href={group.href}
      as={linkComponent}
      className="inline-flex max-w-full transition-opacity hover:opacity-80"
    >
      <GroupBadge style={group.avatarStyle} className="px-1.5 text-[10px]">
        {group.name}
      </GroupBadge>
    </MaybeLink>
  );
}

/**
 * A single match rendered as a centered scoreboard: home team meets the score
 * box in the middle, away team mirrors it. Presentational only — the caller
 * precomputes all labels, avatars and colors.
 */
export function MatchRow({
  match,
  showCategory = false,
  showGroup = true,
  linkComponent,
  className,
}: {
  match: ScheduleMatch;
  showCategory?: boolean;
  showGroup?: boolean;
  linkComponent?: LinkComponent;
  className?: string;
}) {
  const status = match.status ?? "scheduled";

  const category = showCategory ? match.category : undefined;
  const group = showGroup ? match.group : undefined;

  return (
    <div className={cn("py-3.5", className)}>
      {/* Header — time left, category + group centered, status right. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium tabular-nums text-foreground">
          {match.timeLabel}
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          {category ? (
            <MaybeLink
              href={match.categoryHref}
              as={linkComponent}
              className="inline-flex transition-opacity hover:opacity-80"
            >
              <CategoryBadge
                category={category}
                label={match.categoryLabel}
                className="h-5 px-1.5 text-[10px]"
              />
            </MaybeLink>
          ) : null}
          {group ? (
            <GroupChip group={group} linkComponent={linkComponent} />
          ) : null}
        </div>
        <div className="flex justify-end">
          <StatusChip match={match} />
        </div>
      </div>

      {/* Scoreboard — full width on mobile, fixed and centered on larger
          screens so the two teams meet symmetrically with room to breathe. */}
      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 sm:mx-auto sm:w-[26rem] lg:w-[30rem]">
        <TeamSide
          team={match.home}
          align="home"
          emphasize={isWinner(match.home, match.away, status)}
          linkComponent={linkComponent}
        />
        <ScoreBox match={match} />
        <TeamSide
          team={match.away}
          align="away"
          emphasize={isWinner(match.away, match.home, status)}
          linkComponent={linkComponent}
        />
      </div>
    </div>
  );
}

function MatchList({
  matches,
  showCategory,
  showGroup,
  linkComponent,
  bare,
}: {
  matches: ScheduleMatch[];
  showCategory: boolean;
  showGroup: boolean;
  linkComponent?: LinkComponent;
  bare?: boolean;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-border px-3 sm:px-4",
        !bare && "border bg-card",
      )}
    >
      {matches.map((match) => (
        <MatchRow
          key={match.id}
          match={match}
          showCategory={showCategory}
          showGroup={showGroup}
          linkComponent={linkComponent}
        />
      ))}
    </div>
  );
}

/**
 * Read-only match schedule. Pass `days` for a day-grouped calendar, or
 * `matches` for a flat list of standalone games. Mobile-first; presentational.
 */
export function MatchSchedule({
  days,
  matches,
  showCategory = false,
  showGroup = true,
  linkComponent,
  emptyState,
  bare,
  className,
}: MatchScheduleProps) {
  if (days && days.length > 0) {
    return (
      <div className={cn("flex flex-col gap-6 text-sm", className)}>
        {days.map((day) => (
          <section key={day.key} className="flex flex-col gap-3">
            <h3 className="text-sm font-medium capitalize">{day.label}</h3>
            <MatchList
              matches={day.matches}
              showCategory={showCategory}
              showGroup={showGroup}
              linkComponent={linkComponent}
              bare={bare}
            />
          </section>
        ))}
      </div>
    );
  }

  if (matches && matches.length > 0) {
    return (
      <div className={cn("text-sm", className)}>
        <MatchList
          matches={matches}
          showCategory={showCategory}
          showGroup={showGroup}
          linkComponent={linkComponent}
          bare={bare}
        />
      </div>
    );
  }

  return <>{emptyState ?? null}</>;
}

export interface MatchScheduleSkeletonProps {
  /** Number of placeholder day sections. */
  days?: number;
  /** Placeholder match rows per day. */
  rows?: number;
  showCategory?: boolean;
  showGroup?: boolean;
  className?: string;
}

/** Loading placeholder matching {@link MatchSchedule}'s layout. */
export function MatchScheduleSkeleton({
  days = 2,
  rows = 4,
  className,
}: MatchScheduleSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-6 text-sm", className)}>
      {Array.from({ length: days }).map((_, dayIndex) => (
        <section key={dayIndex} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-32" />
          <div className="divide-y divide-border border bg-card px-3 sm:px-4">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="py-3.5">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-5 w-24 justify-self-center rounded-full" />
                  <Skeleton className="h-5 w-12 justify-self-end rounded-full" />
                </div>
                <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 sm:mx-auto sm:w-[26rem] lg:w-[30rem]">
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="size-6 flex-none rounded-full" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                  <div className="flex flex-row-reverse items-center justify-end gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="size-6 flex-none rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
