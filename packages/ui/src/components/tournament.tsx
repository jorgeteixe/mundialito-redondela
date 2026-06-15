"use client";

import * as React from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Goal,
  MapPin,
  Medal,
  Shield,
  Trophy,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface TournamentTeam {
  id: string;
  name: string;
  shortName?: string;
  crestUrl?: string;
  group?: string;
  seed?: number;
  colorClassName?: string;
  record?: string;
}

export interface MatchTeam {
  team: TournamentTeam;
  score?: number;
  penalties?: number;
}

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";

export interface TournamentMatch {
  id: string;
  home: MatchTeam;
  away: MatchTeam;
  status: MatchStatus;
  phase?: string;
  group?: string;
  dateLabel?: string;
  timeLabel?: string;
  venue?: string;
  minute?: string;
  highlight?: string;
}

export interface StandingRow {
  team: TournamentTeam;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  position: number;
  qualified?: boolean;
  trend?: "up" | "down" | "same";
}

export interface KnockoutNode {
  id: string;
  label: string;
  match?: TournamentMatch;
  winnerId?: string;
  nextMatchId?: string;
}

export interface KnockoutRound {
  id: string;
  title: string;
  matches: KnockoutNode[];
}

function getTeamInitials(team: TournamentTeam) {
  if (team.shortName && team.shortName.length <= 3) {
    return team.shortName.toUpperCase();
  }

  const source = team.shortName ?? team.name;
  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getStatusLabel(status: MatchStatus) {
  switch (status) {
    case "live":
      return "En directo";
    case "finished":
      return "Finalizado";
    case "postponed":
      return "Aplazado";
    default:
      return "Programado";
  }
}

function isWinner(side: MatchTeam, other: MatchTeam, status?: MatchStatus) {
  if (status !== "finished") return false;
  if (side.penalties != null && other.penalties != null) {
    return side.penalties > other.penalties;
  }
  if (side.score == null || other.score == null) return false;
  return side.score > other.score;
}

export function TeamBadge({
  team,
  size = "md",
  showName = true,
  className,
}: {
  team: TournamentTeam;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}) {
  const avatarSize =
    size === "lg" ? "size-12" : size === "sm" ? "size-7" : "size-9";
  const fallbackTextSize =
    size === "lg" ? "text-sm" : size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div
      className={cn("flex min-w-0 items-center gap-2", className)}
      aria-label={showName ? undefined : team.name}
    >
      <Avatar className={cn("rounded-none ring-1 ring-border", avatarSize)}>
        <AvatarImage src={team.crestUrl} alt={team.name} />
        <AvatarFallback
          className={cn(
            "rounded-none bg-primary font-semibold text-primary-foreground",
            fallbackTextSize,
            team.colorClassName,
          )}
        >
          {getTeamInitials(team)}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">
            {team.name}
          </div>
          {(team.group || team.record) && (
            <div className="truncate text-xs text-muted-foreground">
              {[team.group && `Grupo ${team.group}`, team.record]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QualifiedBadge({
  label = "Clasificado",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-6 gap-1.5 bg-primary/10 px-2 text-primary ring-1 ring-primary/20 dark:bg-primary/20",
        className,
      )}
    >
      <Check className="size-3" aria-hidden="true" />
      {label}
    </Badge>
  );
}

export function TeamCard({
  team,
  statLabel,
  statValue,
  className,
}: {
  team: TournamentTeam;
  statLabel?: string;
  statValue?: string | number;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0", className)} size="sm">
      <CardContent className="flex items-center gap-3">
        <TeamBadge team={team} size="lg" />
        {statLabel && (
          <div className="ml-auto shrink-0 text-right">
            <div className="text-base font-semibold">{statValue}</div>
            <div className="text-xs text-muted-foreground">{statLabel}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TeamList({
  teams,
  className,
}: {
  teams: TournamentTeam[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          statLabel="Bombo"
          statValue={team.seed ?? "-"}
        />
      ))}
    </div>
  );
}

export function MatchStatusBadge({
  status,
  minute,
}: {
  status: MatchStatus;
  minute?: string;
}) {
  const statusClassName = {
    live: "bg-primary text-primary-foreground",
    scheduled: "bg-muted text-muted-foreground ring-1 ring-border",
    finished: "bg-muted text-foreground ring-1 ring-border",
    postponed:
      "bg-destructive/10 text-destructive ring-1 ring-destructive/20 dark:bg-destructive/20",
  } satisfies Record<MatchStatus, string>;

  return (
    <Badge
      variant="secondary"
      className={cn("h-6 shrink-0 gap-1.5 px-2", statusClassName[status])}
    >
      {status === "live" && (
        <span
          className="size-1.5 rounded-full bg-primary-foreground"
          aria-hidden="true"
        />
      )}
      {minute ?? getStatusLabel(status)}
    </Badge>
  );
}

export function MatchScore({
  match,
  compact = false,
  className,
}: {
  match: TournamentMatch;
  compact?: boolean;
  className?: string;
}) {
  const showScore = match.status === "live" || match.status === "finished";
  const homeScore =
    showScore && match.home.score != null ? match.home.score : "–";
  const awayScore =
    showScore && match.away.score != null ? match.away.score : "–";

  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]",
        className,
      )}
    >
      <TeamBadge
        team={match.home.team}
        showName={!compact}
        className={cn(
          "min-h-10 justify-self-start",
          isWinner(match.home, match.away, match.status) && "font-semibold",
        )}
      />
      <div className="row-span-2 flex min-w-20 items-center justify-center gap-1 self-center px-2 tabular-nums sm:row-span-1">
        <span className="min-w-6 text-center text-lg font-semibold sm:min-w-7 sm:text-xl">
          {homeScore}
        </span>
        <span className="text-muted-foreground">-</span>
        <span className="min-w-6 text-center text-lg font-semibold sm:min-w-7 sm:text-xl">
          {awayScore}
        </span>
      </div>
      <TeamBadge
        team={match.away.team}
        showName={!compact}
        className={cn(
          "min-h-10 justify-self-start sm:justify-self-end sm:flex-row-reverse sm:text-right",
          isWinner(match.away, match.home, match.status) && "font-semibold",
        )}
      />
      {(match.home.penalties != null || match.away.penalties != null) && (
        <div className="col-span-2 text-center text-xs text-muted-foreground sm:col-span-3">
          Penaltis {match.home.penalties ?? 0}-{match.away.penalties ?? 0}
        </div>
      )}
    </div>
  );
}

export function MatchRow({
  match,
  className,
}: {
  match: TournamentMatch;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 border-b border-border py-3 last:border-b-0 sm:grid-cols-[minmax(7rem,10rem)_1fr_auto] sm:items-center",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground sm:block">
        <div className="font-medium text-foreground">
          {match.timeLabel ?? match.dateLabel}
        </div>
        {match.venue && <div className="truncate">{match.venue}</div>}
      </div>
      <MatchScore match={match} />
      <MatchStatusBadge status={match.status} minute={match.minute} />
    </div>
  );
}

export function MatchCard({
  match,
  className,
}: {
  match: TournamentMatch;
  className?: string;
}) {
  return (
    <Card
      className={cn(match.status === "live" && "ring-primary/35", className)}
    >
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-2">
          <span className="truncate">
            {match.phase ?? match.group ?? "Partido"}
          </span>
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
          {match.dateLabel && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3" aria-hidden="true" />{" "}
              {match.dateLabel}
            </span>
          )}
          {match.timeLabel && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" aria-hidden="true" /> {match.timeLabel}
            </span>
          )}
          {match.venue && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3 shrink-0" aria-hidden="true" />{" "}
              <span className="truncate">{match.venue}</span>
            </span>
          )}
        </CardDescription>
        <CardAction>
          <MatchStatusBadge status={match.status} minute={match.minute} />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3">
        <MatchScore match={match} />
        {match.highlight && (
          <>
            <Separator />
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Goal
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{match.highlight}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function TodayMatches({
  title = "Partidos de hoy",
  matches,
  className,
}: {
  title?: string;
  matches: TournamentMatch[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{matches.length} partidos programados</CardDescription>
      </CardHeader>
      <CardContent>
        {matches.length > 0 ? (
          <div>
            {matches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No hay partidos programados.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function Schedule({
  days,
  className,
}: {
  days: Array<{ date: string; label: string; matches: TournamentMatch[] }>;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {days.map((day) => (
        <Card key={day.date}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays
                className="size-4 text-primary"
                aria-hidden="true"
              />{" "}
              {day.label}
            </CardTitle>
            <CardDescription>{day.date}</CardDescription>
          </CardHeader>
          <CardContent>
            {day.matches.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StandingsMobileRow({ row }: { row: StandingRow }) {
  return (
    <div
      className={cn(
        "grid gap-3 border-b border-border py-3 last:border-b-0",
        row.qualified && "bg-primary/5 px-2",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center bg-muted text-xs font-medium">
            {row.position}
          </span>
          <TeamBadge team={row.team} />
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xl font-semibold tabular-nums">{row.points}</div>
          <div className="text-xs text-muted-foreground">Pts</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-muted/60 p-2">
          <div className="font-semibold tabular-nums">{row.played}</div>
          <div className="text-muted-foreground">PJ</div>
        </div>
        <div className="bg-muted/60 p-2">
          <div className="font-semibold tabular-nums">{row.wins}</div>
          <div className="text-muted-foreground">G</div>
        </div>
        <div className="bg-muted/60 p-2">
          <div className="font-semibold tabular-nums">{row.draws}</div>
          <div className="text-muted-foreground">E</div>
        </div>
        <div className="bg-muted/60 p-2">
          <div className="font-semibold tabular-nums">{row.losses}</div>
          <div className="text-muted-foreground">P</div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          Goles {row.goalsFor}-{row.goalsAgainst}
        </div>
        {row.qualified ? (
          <QualifiedBadge />
        ) : (
          <Badge variant="ghost">En juego</Badge>
        )}
      </div>
    </div>
  );
}

export function StandingsTable({
  group,
  rows,
  className,
}: {
  group: string;
  rows: StandingRow[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Grupo {group}</CardTitle>
        <CardDescription>Clasificación actual</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="sm:hidden">
          {rows.map((row) => (
            <StandingsMobileRow key={row.team.id} row={row} />
          ))}
        </div>
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead className="text-right">
                  <abbr title="Partidos jugados">PJ</abbr>
                </TableHead>
                <TableHead className="text-right">
                  <abbr title="Ganados">G</abbr>
                </TableHead>
                <TableHead className="text-right">
                  <abbr title="Empatados">E</abbr>
                </TableHead>
                <TableHead className="text-right">
                  <abbr title="Perdidos">P</abbr>
                </TableHead>
                <TableHead className="text-right">
                  <abbr title="Goles a favor">GF</abbr>
                </TableHead>
                <TableHead className="text-right">
                  <abbr title="Goles en contra">GC</abbr>
                </TableHead>
                <TableHead className="text-right">
                  <abbr title="Puntos">Pts</abbr>
                </TableHead>
                <TableHead className="text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.team.id}
                  className={row.qualified ? "bg-primary/5" : undefined}
                >
                  <TableCell className="font-medium">{row.position}</TableCell>
                  <TableCell>
                    <TeamBadge team={row.team} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.played}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.wins}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.draws}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.losses}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.goalsFor}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {row.goalsAgainst}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {row.points}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.qualified ? (
                      <QualifiedBadge />
                    ) : (
                      <Badge variant="ghost">En juego</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function BracketTeamLine({
  side,
  winner,
}: {
  side: MatchTeam;
  winner: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-11 items-center justify-between gap-2 border-b border-border px-3 last:border-b-0",
        winner && "bg-primary/10",
      )}
    >
      <TeamBadge team={side.team} size="sm" />
      <div className="flex items-center gap-1 font-semibold tabular-nums">
        <span>{side.score ?? "-"}</span>
        {side.penalties != null && (
          <span className="text-xs text-muted-foreground">
            ({side.penalties})
          </span>
        )}
      </div>
    </div>
  );
}

export function KnockoutBracket({
  rounds,
  className,
}: {
  rounds: KnockoutRound[];
  className?: string;
}) {
  if (rounds.length === 0) {
    return (
      <div
        className={cn(
          "py-6 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        No hay eliminatorias configuradas.
      </div>
    );
  }

  return (
    <div className={cn("pb-2 md:overflow-x-auto", className)}>
      <div
        className="grid gap-4 md:min-w-[760px] md:gap-3 md:[grid-template-columns:repeat(var(--round-count),minmax(13rem,1fr))]"
        style={{ "--round-count": rounds.length } as React.CSSProperties}
      >
        {rounds.map((round, roundIndex) => (
          <div key={round.id} className="grid gap-4 md:content-center">
            <div className="flex items-center gap-2 text-sm font-medium">
              {roundIndex === rounds.length - 1 ? (
                <Trophy className="size-4 text-primary" aria-hidden="true" />
              ) : (
                <Shield className="size-4 text-primary" aria-hidden="true" />
              )}
              {round.title}
            </div>
            <div className="grid gap-4">
              {round.matches.map((node) => (
                <Card
                  key={node.id}
                  size="sm"
                  className="relative overflow-visible"
                >
                  {roundIndex < rounds.length - 1 && (
                    <ChevronRight
                      className="absolute top-1/2 -right-3 hidden size-5 -translate-y-1/2 text-muted-foreground md:block"
                      aria-hidden="true"
                    />
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between gap-2 text-xs">
                      <span className="truncate">{node.label}</span>
                      {node.match?.status === "finished" && node.winnerId && (
                        <Medal
                          className="size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0">
                    {node.match ? (
                      <div className="border-y border-border">
                        <BracketTeamLine
                          side={node.match.home}
                          winner={node.winnerId === node.match.home.team.id}
                        />
                        <BracketTeamLine
                          side={node.match.away}
                          winner={node.winnerId === node.match.away.team.id}
                        />
                      </div>
                    ) : (
                      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                        Pendiente de rival
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
