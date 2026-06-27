"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { CategoryBadge, type TournamentCategory } from "./category-badge";

export interface MatchSide {
  id: string;
  name: string;
  /** Crest image URL; falls back to initials when absent. */
  crestUrl?: string;
  /** Goals scored. Absent until results exist — renders a placeholder. */
  score?: number;
}

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";

export interface ScheduleGroup {
  name: string;
  /** Short label rendered inside the group avatar (e.g. "A"). */
  avatarLabel?: string;
  /** Deterministic colors for the group avatar, computed by the caller. */
  avatarStyle?: React.CSSProperties;
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
  group?: ScheduleGroup;
  home: MatchSide;
  away: MatchSide;
}

export interface ScheduleDay {
  key: string;
  /** Preformatted day heading, e.g. "sábado, 27 jun". */
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
  /** Rendered when there are no matches. */
  emptyState?: React.ReactNode;
  className?: string;
}

const SCORE_PLACEHOLDER = "–";

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
  return side.score > other.score;
}

function TeamSide({
  team,
  align,
  emphasize,
}: {
  team: MatchSide;
  align: "home" | "away";
  emphasize: boolean;
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

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        align === "home"
          ? "flex-row justify-end"
          : "flex-row-reverse justify-end",
      )}
    >
      {name}
      {avatar}
    </div>
  );
}

function ScoreBox({ match }: { match: ScheduleMatch }) {
  const status = match.status ?? "scheduled";
  const showScore = hasResult(status);
  const homeScore =
    showScore && match.home.score != null
      ? match.home.score
      : SCORE_PLACEHOLDER;
  const awayScore =
    showScore && match.away.score != null
      ? match.away.score
      : SCORE_PLACEHOLDER;

  return (
    <div className="flex items-center gap-1.5 tabular-nums">
      <span
        className={cn(
          "min-w-5 text-center text-lg font-semibold sm:text-xl",
          isWinner(match.home, match.away, status) && "text-foreground",
          !showScore && "text-muted-foreground",
        )}
      >
        {homeScore}
      </span>
      <span className="text-muted-foreground">-</span>
      <span
        className={cn(
          "min-w-5 text-center text-lg font-semibold sm:text-xl",
          isWinner(match.away, match.home, status) && "text-foreground",
          !showScore && "text-muted-foreground",
        )}
      >
        {awayScore}
      </span>
    </div>
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

function GroupChip({ group }: { group: ScheduleGroup }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <Avatar size="sm" className="size-4 flex-none">
        <AvatarFallback
          className="border text-[9px] font-medium"
          style={group.avatarStyle}
        >
          {group.avatarLabel}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{group.name}</span>
    </span>
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
  className,
}: {
  match: ScheduleMatch;
  showCategory?: boolean;
  showGroup?: boolean;
  className?: string;
}) {
  const status = match.status ?? "scheduled";

  return (
    <div
      className={cn(
        "py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4",
        className,
      )}
    >
      {/* Meta — centered above the scoreboard on mobile, left column on desktop.
          Status moves to its own column on desktop, so it's only inline here on
          small screens. */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:justify-start sm:gap-x-3">
        <span className="font-medium tabular-nums text-foreground">
          {match.timeLabel}
        </span>
        {showCategory && match.category ? (
          <CategoryBadge
            category={match.category}
            label={match.categoryLabel}
            className="h-5 px-1.5 text-[10px]"
          />
        ) : null}
        {showGroup && match.group ? <GroupChip group={match.group} /> : null}
        <span className="sm:hidden">
          <StatusChip match={match} />
        </span>
      </div>

      {/* Scoreboard — full width on mobile, fixed and centered on desktop so the
          two side columns stay symmetric and the names get room to breathe. */}
      <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:mt-0 sm:w-[22rem] sm:gap-4 lg:w-[26rem]">
        <TeamSide
          team={match.home}
          align="home"
          emphasize={isWinner(match.home, match.away, status)}
        />
        <ScoreBox match={match} />
        <TeamSide
          team={match.away}
          align="away"
          emphasize={isWinner(match.away, match.home, status)}
        />
      </div>

      <div className="hidden sm:flex sm:justify-end">
        <StatusChip match={match} />
      </div>
    </div>
  );
}

function MatchList({
  matches,
  showCategory,
  showGroup,
}: {
  matches: ScheduleMatch[];
  showCategory: boolean;
  showGroup: boolean;
}) {
  return (
    <div className="divide-y divide-border border bg-card px-3 sm:px-4">
      {matches.map((match) => (
        <MatchRow
          key={match.id}
          match={match}
          showCategory={showCategory}
          showGroup={showGroup}
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
  emptyState,
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
              <div
                key={rowIndex}
                className="py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4"
              >
                <div className="flex justify-center sm:justify-start">
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="mt-1.5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:mt-0 sm:w-[22rem] sm:gap-4 lg:w-[26rem]">
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
