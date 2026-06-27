"use client";

import Link from "next/link";
import { CalendarDays, ListOrdered } from "lucide-react";
import {
  CategoryBadge,
  EmptyState,
  GroupBadge,
  MatchSchedule,
  Standings,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TournamentCategory,
  type ScheduleDay,
  type StandingsRow,
} from "@mr/ui";

type TeamDetailSectionsProps = {
  matchDays: ScheduleDay[];
  standingsRows: StandingsRow[];
  teamId: string;
  teamName: string;
  group: {
    id: string;
    name: string;
    category: TournamentCategory;
    categoryLabel: string;
  };
};

export function TeamDetailSections({
  matchDays,
  standingsRows,
  teamId,
  teamName,
  group,
}: TeamDetailSectionsProps) {
  return (
    <Tabs defaultValue="matches" className="gap-4 pb-10">
      <header className="border bg-card px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="min-w-0 flex-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {teamName}
          </h1>
          <div className="flex flex-none flex-wrap items-center justify-end gap-2 pt-1">
            <GroupBadge seed={group.id} className="px-1.5 text-[10px]">
              {group.name}
            </GroupBadge>
            <CategoryBadge
              category={group.category}
              label={group.categoryLabel}
              className="h-5 px-1.5 text-[10px]"
            />
          </div>
        </div>
        <TabsList
          className="mt-2 h-10 w-full justify-start gap-5 overflow-x-auto p-0"
          variant="line"
        >
          <TabsTrigger value="matches" className="flex-none gap-2">
            <CalendarDays className="size-4" />
            Partidos
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex-none gap-2">
            <ListOrdered className="size-4" />
            Clasificación
          </TabsTrigger>
        </TabsList>
      </header>

      <TabsContent value="matches" className="flex flex-col gap-3">
        <MatchSchedule
          days={matchDays}
          showGroup
          linkComponent={Link}
          emptyState={
            <EmptyState
              icon={<CalendarDays className="h-10 w-10" />}
              title="Sin partidos"
              description="Aún no hay partidos programados para este equipo."
              className="border border-dashed bg-card px-4"
            />
          }
        />
      </TabsContent>

      <TabsContent value="standings" className="flex flex-col gap-3">
        <Standings
          rows={standingsRows}
          highlightedTeamId={teamId}
          linkComponent={Link}
          emptyState={
            <EmptyState
              icon={<ListOrdered className="h-10 w-10" />}
              title="Sin equipos"
              description="Aún no hay equipos en este grupo."
              className="border border-dashed bg-card px-4"
            />
          }
        />
      </TabsContent>
    </Tabs>
  );
}
