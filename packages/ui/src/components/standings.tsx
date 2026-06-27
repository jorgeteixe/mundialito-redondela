"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import type { LinkComponent } from "./match-schedule";

export interface StandingsTeam {
  id: string;
  name: string;
  /** Crest image URL; falls back to initials when absent. */
  crestUrl?: string;
  /** When set, the team (name + crest) links here. */
  href?: string;
}

export interface StandingsRow {
  team: StandingsTeam;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface StandingsProps {
  /** Rows in final order — the caller sorts them. */
  rows: StandingsRow[];
  /**
   * Highlight the top N positions as advancing to the next stage. Off when
   * omitted; also renders a short legend under the table.
   */
  qualifyCount?: number;
  /** Used to render team links. Defaults to a plain `<a>`. */
  linkComponent?: LinkComponent;
  /** Rendered when there are no rows. */
  emptyState?: React.ReactNode;
  className?: string;
}

type StatColumn = {
  key: keyof Omit<StandingsRow, "team">;
  abbr: string;
  label: string;
  /** Hidden below `sm` to keep the mobile table compact. */
  secondary?: boolean;
  emphasize?: boolean;
};

// Order matches a typical football table; secondary stats collapse on mobile.
const STAT_COLUMNS: StatColumn[] = [
  { key: "played", abbr: "PJ", label: "Partidos jugados" },
  { key: "wins", abbr: "G", label: "Ganados", secondary: true },
  { key: "draws", abbr: "E", label: "Empatados", secondary: true },
  { key: "losses", abbr: "P", label: "Perdidos", secondary: true },
  { key: "goalsFor", abbr: "GF", label: "Goles a favor", secondary: true },
  {
    key: "goalsAgainst",
    abbr: "GC",
    label: "Goles en contra",
    secondary: true,
  },
  { key: "goalDifference", abbr: "DG", label: "Diferencia de goles" },
  { key: "points", abbr: "Pts", label: "Puntos", emphasize: true },
];

function teamInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function TeamCell({
  team,
  linkComponent,
}: {
  team: StandingsTeam;
  linkComponent?: LinkComponent;
}) {
  const content = (
    <>
      <Avatar size="sm" className="flex-none">
        <AvatarImage src={team.crestUrl} alt={team.name} />
        <AvatarFallback className="text-[10px] font-medium">
          {teamInitials(team.name)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 truncate">{team.name}</span>
    </>
  );

  const className = "flex min-w-0 items-center gap-2.5";

  if (team.href) {
    const Comp = linkComponent ?? "a";
    return (
      <Comp
        href={team.href}
        className={cn(className, "transition-colors hover:text-primary")}
      >
        {content}
      </Comp>
    );
  }

  return <div className={className}>{content}</div>;
}

/**
 * Read-only league table. Presentational — the caller pre-sorts `rows` and
 * supplies precomputed crests and links. Mobile-first: position, team, played,
 * goal difference and points stay visible on phones; the rest reveal at `sm:`.
 */
export function Standings({
  rows,
  qualifyCount,
  linkComponent,
  emptyState,
  className,
}: StandingsProps) {
  if (rows.length === 0) return <>{emptyState ?? null}</>;

  return (
    <div className={cn("text-sm", className)}>
      <div className="overflow-hidden border bg-card">
        <table className="w-full tabular-nums">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="w-9 py-2.5 pl-3 text-left font-medium sm:pl-4">
                <span className="sr-only">Posición</span>#
              </th>
              <th className="py-2.5 pr-3 text-left font-medium">Equipo</th>
              {STAT_COLUMNS.map((col) => (
                <th
                  key={col.key}
                  title={col.label}
                  aria-label={col.label}
                  className={cn(
                    "w-9 py-2.5 text-center font-medium",
                    col.secondary && "hidden sm:table-cell",
                    col.emphasize && "pr-3 text-foreground sm:pr-4",
                  )}
                >
                  {col.abbr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const qualifies = qualifyCount != null && index < qualifyCount;

              return (
                <tr
                  key={row.team.id}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    qualifies && "bg-muted/40",
                  )}
                >
                  <td
                    className={cn(
                      "py-2.5 pl-3 text-left font-medium text-muted-foreground sm:pl-4",
                      qualifies &&
                        "border-l-2 border-primary pl-[10px] text-foreground sm:pl-[14px]",
                    )}
                  >
                    {index + 1}
                  </td>
                  <td className="py-2.5 pr-3 font-medium">
                    <TeamCell team={row.team} linkComponent={linkComponent} />
                  </td>
                  {STAT_COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "py-2.5 text-center text-muted-foreground",
                        col.secondary && "hidden sm:table-cell",
                        col.emphasize &&
                          "pr-3 font-semibold text-foreground sm:pr-4",
                      )}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {qualifyCount != null ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-3 w-0.5 flex-none bg-primary" aria-hidden="true" />
          Clasifican a la siguiente fase
        </p>
      ) : null}
    </div>
  );
}

export interface StandingsSkeletonProps {
  /** Placeholder team rows. */
  rows?: number;
  className?: string;
}

/** Loading placeholder matching {@link Standings}'s layout. */
export function StandingsSkeleton({
  rows = 4,
  className,
}: StandingsSkeletonProps) {
  return (
    <div className={cn("text-sm", className)}>
      <div className="overflow-hidden border bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5 sm:px-4">
          <Skeleton className="h-4 w-4 flex-none" />
          <Skeleton className="h-4 w-24" />
          <div className="ml-auto flex gap-4">
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-4 w-6" />
          </div>
        </div>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-2.5 border-b border-border px-3 py-2.5 last:border-b-0 sm:px-4"
          >
            <Skeleton className="h-4 w-4 flex-none" />
            <Skeleton className="size-6 flex-none rounded-full" />
            <Skeleton className="h-4 w-28" />
            <div className="ml-auto flex gap-4">
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
