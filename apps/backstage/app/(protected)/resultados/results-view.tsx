"use client";

import { useState } from "react";
import { ClipboardList, Trophy } from "lucide-react";
import {
  Button,
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  CategoryBadge,
  EmptyState,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mr/ui";
import { ResultForm } from "./result-form";
import {
  formatMatchTime,
  type CalendarDay,
  type CalendarMatch,
} from "../calendario/calendar-format";

type ResultsViewProps = {
  days: CalendarDay[];
  canWrite: boolean;
};

export function ResultsView({ days, canWrite }: ResultsViewProps) {
  if (days.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-10 w-10" />}
        title="Sin partidos"
        description="Aún no hay partidos programados para registrar resultados."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {days.map((day) => (
        <section key={day.dateKey} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium capitalize">{day.label}</h2>

          <div className="flex flex-col gap-3 md:hidden">
            {day.matches.map((match) => (
              <MatchCard key={match.id} match={match} canWrite={canWrite} />
            ))}
          </div>

          <div className="hidden rounded-none border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Hora</TableHead>
                  <TableHead>Competición</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead className="text-center">Resultado</TableHead>
                  <TableHead>Visitante</TableHead>
                  {canWrite ? (
                    <TableHead className="w-28 text-right">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {day.matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="text-muted-foreground">
                      {formatMatchTime(match.scheduledAt)}
                    </TableCell>
                    <TableCell>
                      <CompetitionLabel match={match} />
                    </TableCell>
                    <TableCell>{match.homeTeamName}</TableCell>
                    <TableCell className="text-center font-medium">
                      {formatScore(match)}
                    </TableCell>
                    <TableCell>{match.awayTeamName}</TableCell>
                    {canWrite ? (
                      <TableCell className="text-right">
                        <ResultButton match={match} />
                      </TableCell>
                    ) : null}
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

function MatchCard({
  match,
  canWrite,
}: {
  match: CalendarMatch;
  canWrite: boolean;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {formatMatchTime(match.scheduledAt)}
          </span>
          <CompetitionLabel match={match} />
        </CardTitle>
        <CardDescription className="text-foreground">
          {match.homeTeamName} {formatScore(match)} {match.awayTeamName}
        </CardDescription>
        {canWrite ? (
          <CardAction>
            <ResultButton match={match} />
          </CardAction>
        ) : null}
      </CardHeader>
    </Card>
  );
}

function ResultButton({ match }: { match: CalendarMatch }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <ClipboardList />
        Resultado
      </Button>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Registrar resultado</SheetTitle>
          <SheetDescription>
            {match.homeTeamName} contra {match.awayTeamName}.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <ResultForm match={match} onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CompetitionLabel({ match }: { match: CalendarMatch }) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted-foreground">
      <CategoryBadge category={match.category} />
      <span className="inline-flex items-center gap-1">
        {match.kind === "group" ? (
          (match.groupName ?? "Grupo")
        ) : (
          <>
            <Trophy className="h-3 w-3" />
            {knockoutLabel(match.kind)}
          </>
        )}
      </span>
    </span>
  );
}

function knockoutLabel(kind: CalendarMatch["kind"]) {
  if (kind === "semifinal") return "Semifinal";
  if (kind === "third_place") return "3.º-4.º puesto";
  if (kind === "final") return "Final";
  return "Eliminatorias";
}

function formatScore(match: CalendarMatch) {
  if (match.homeScore == null || match.awayScore == null) {
    return "–";
  }
  const base = `${match.homeScore}-${match.awayScore}`;
  if (match.homePenalties != null && match.awayPenalties != null) {
    return `${base} (${match.homePenalties}-${match.awayPenalties})`;
  }
  return base;
}
