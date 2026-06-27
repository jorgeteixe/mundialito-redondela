"use client";

import Link from "next/link";
import { CalendarDays, ListOrdered } from "lucide-react";
import {
  Badge,
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

type TeamGroup = {
  id: string;
  name: string;
  category: TournamentCategory;
  categoryLabel: string;
  stageLabel: string;
  standingsRows: StandingsRow[];
};

type TeamDetailSectionsProps = {
  matchDays: ScheduleDay[];
  teamId: string;
  teamName: string;
  groups: TeamGroup[];
};

export function TeamDetailSections({
  matchDays,
  teamId,
  teamName,
  groups,
}: TeamDetailSectionsProps) {
  // The team keeps the same category across phases, so the category badge is
  // shared; each group it belongs to gets its own group badge.
  const category = groups[0];

  return (
    <Tabs defaultValue="matches" className="gap-4 pb-10">
      <header className="border bg-card px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="min-w-0 flex-1 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {teamName}
          </h1>
          <div className="flex flex-none flex-col items-end gap-1.5 pt-1">
            {category ? (
              <CategoryBadge
                category={category.category}
                label={category.categoryLabel}
                className="h-5 px-1.5 text-[10px]"
              />
            ) : null}
            <div className="flex flex-wrap items-center justify-end gap-2">
              {groups.map((group) => (
                <GroupBadge
                  key={group.id}
                  seed={group.id}
                  className="px-1.5 text-[10px]"
                >
                  {group.name}
                </GroupBadge>
              ))}
            </div>
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

      <TabsContent value="standings" className="flex flex-col gap-6">
        {groups.map((group) => (
          <section key={group.id} className="flex flex-col gap-3">
            {groups.length > 1 ? (
              <div className="flex items-center gap-2">
                <GroupBadge seed={group.id} className="px-1.5 text-[10px]">
                  {group.name}
                </GroupBadge>
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {group.stageLabel}
                </Badge>
              </div>
            ) : null}
            <Standings
              rows={group.standingsRows}
              highlightedTeamId={teamId}
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
          </section>
        ))}
      </TabsContent>
    </Tabs>
  );
}
