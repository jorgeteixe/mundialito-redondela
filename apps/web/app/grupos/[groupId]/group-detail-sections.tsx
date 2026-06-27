"use client";

import Link from "next/link";
import { CalendarDays, ListOrdered } from "lucide-react";
import {
  Badge,
  CategoryBadge,
  EmptyState,
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

type GroupDetailSectionsProps = {
  matchDays: ScheduleDay[];
  standingsRows: StandingsRow[];
  group: {
    id: string;
    name: string;
    category: TournamentCategory;
    categoryLabel: string;
    stageLabel: string;
    qualifyingTeamIds: string[];
  };
};

export function GroupDetailSections({
  matchDays,
  standingsRows,
  group,
}: GroupDetailSectionsProps) {
  return (
    <Tabs defaultValue="standings" className="gap-4 pb-10">
      <header className="border bg-card px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="min-w-0 flex-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {group.name}
          </h1>
          <div className="flex flex-none flex-wrap items-center justify-end gap-2 pt-1">
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {group.stageLabel}
            </Badge>
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
          <TabsTrigger value="standings" className="flex-none gap-2">
            <ListOrdered className="size-4" />
            Clasificación
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex-none gap-2">
            <CalendarDays className="size-4" />
            Partidos
          </TabsTrigger>
        </TabsList>
      </header>

      <TabsContent value="standings" className="flex flex-col gap-3">
        <Standings
          rows={standingsRows}
          qualifyingTeamIds={group.qualifyingTeamIds}
          fullColumns
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

      <TabsContent value="matches" className="flex flex-col gap-3">
        <MatchSchedule
          days={matchDays}
          showGroup={false}
          linkComponent={Link}
          emptyState={
            <EmptyState
              icon={<CalendarDays className="h-10 w-10" />}
              title="Sin partidos"
              description="Aún no hay partidos programados para este grupo."
              className="border border-dashed bg-card px-4"
            />
          }
        />
      </TabsContent>
    </Tabs>
  );
}
