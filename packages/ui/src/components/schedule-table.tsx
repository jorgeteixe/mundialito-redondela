"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import type { TournamentTeam } from "./tournament";

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
  /** Preformatted category label; only shown when `showCategory`. */
  categoryLabel?: string;
  group?: ScheduleGroup;
  home: TournamentTeam;
  away: TournamentTeam;
}

export interface ScheduleDay {
  key: string;
  /** Preformatted day heading, e.g. "sábado, 27 jun". */
  label: string;
  matches: ScheduleMatch[];
}

export interface ScheduleTableProps {
  days: ScheduleDay[];
  showCategory?: boolean;
  showGroup?: boolean;
  /** Rendered when `days` is empty. */
  emptyState?: React.ReactNode;
  className?: string;
}

// Keep columns aligned across every day's table, and wide enough that the
// shared overflow-x wrapper scrolls (instead of crushing cells) on mobile.
const TABLE_CLASS = "min-w-[34rem] table-fixed";

function ScheduleColgroup({
  showCategory,
  showGroup,
}: {
  showCategory: boolean;
  showGroup: boolean;
}) {
  return (
    <colgroup>
      <col className="w-[15%]" />
      {showCategory ? <col className="w-[15%]" /> : null}
      {showGroup ? <col className="w-[24%]" /> : null}
      <col />
      <col />
    </colgroup>
  );
}

function ScheduleHead({
  showCategory,
  showGroup,
}: {
  showCategory: boolean;
  showGroup: boolean;
}) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Hora</TableHead>
        {showCategory ? <TableHead>Categoría</TableHead> : null}
        {showGroup ? <TableHead>Grupo</TableHead> : null}
        <TableHead>Local</TableHead>
        <TableHead>Visitante</TableHead>
      </TableRow>
    </TableHeader>
  );
}

/**
 * Read-only, day-grouped match schedule rendered as aligned tables. The table
 * scrolls horizontally on small screens rather than collapsing into cards.
 * Presentational only — the caller precomputes all labels and avatar values.
 */
export function ScheduleTable({
  days,
  showCategory = false,
  showGroup = true,
  emptyState,
  className,
}: ScheduleTableProps) {
  if (days.length === 0) return <>{emptyState ?? null}</>;

  return (
    <div className={cn("flex flex-col gap-6 text-sm", className)}>
      {days.map((day) => (
        <section key={day.key} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium capitalize">{day.label}</h3>
          <div className="rounded-none border">
            <Table className={TABLE_CLASS}>
              <ScheduleColgroup
                showCategory={showCategory}
                showGroup={showGroup}
              />
              <ScheduleHead showCategory={showCategory} showGroup={showGroup} />
              <TableBody>
                {day.matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium tabular-nums">
                      {match.timeLabel}
                    </TableCell>
                    {showCategory ? (
                      <TableCell>
                        {match.categoryLabel ? (
                          <Badge variant="secondary">
                            {match.categoryLabel}
                          </Badge>
                        ) : null}
                      </TableCell>
                    ) : null}
                    {showGroup ? (
                      <TableCell>
                        {match.group ? <GroupCell group={match.group} /> : null}
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <TeamCell team={match.home} />
                    </TableCell>
                    <TableCell>
                      <TeamCell team={match.away} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ))}
    </div>
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

function TeamCell({ team }: { team: TournamentTeam }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="sm" className="flex-none">
        <AvatarImage src={team.crestUrl} alt={team.name} />
        <AvatarFallback>{teamInitials(team.name)}</AvatarFallback>
      </Avatar>
      <span className="truncate">{team.name}</span>
    </div>
  );
}

function GroupCell({ group }: { group: ScheduleGroup }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size="sm" className="flex-none">
        <AvatarFallback
          className="border text-xs font-medium"
          style={group.avatarStyle}
        >
          {group.avatarLabel}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{group.name}</span>
    </div>
  );
}

export interface ScheduleTableSkeletonProps {
  /** Number of placeholder day sections. */
  days?: number;
  /** Placeholder match rows per day. */
  rows?: number;
  showCategory?: boolean;
  showGroup?: boolean;
  className?: string;
}

/** Loading placeholder matching {@link ScheduleTable}'s layout. */
export function ScheduleTableSkeleton({
  days = 2,
  rows = 4,
  showCategory = false,
  showGroup = true,
  className,
}: ScheduleTableSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-6 text-sm", className)}>
      {Array.from({ length: days }).map((_, dayIndex) => (
        <section key={dayIndex} className="flex flex-col gap-3">
          <Skeleton className="h-4 w-32" />
          <div className="rounded-none border">
            <Table className={TABLE_CLASS}>
              <ScheduleColgroup
                showCategory={showCategory}
                showGroup={showGroup}
              />
              <ScheduleHead showCategory={showCategory} showGroup={showGroup} />
              <TableBody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell>
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                    {showCategory ? (
                      <TableCell>
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </TableCell>
                    ) : null}
                    {showGroup ? (
                      <TableCell>
                        <SkeletonAvatarRow nameWidth="w-20" />
                      </TableCell>
                    ) : null}
                    <TableCell>
                      <SkeletonAvatarRow nameWidth="w-24" />
                    </TableCell>
                    <TableCell>
                      <SkeletonAvatarRow nameWidth="w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ))}
    </div>
  );
}

function SkeletonAvatarRow({ nameWidth }: { nameWidth: string }) {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="size-6 flex-none rounded-full" />
      <Skeleton className={cn("h-4", nameWidth)} />
    </div>
  );
}
