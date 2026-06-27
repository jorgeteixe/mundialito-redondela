"use client";

import {
  EmptyState,
  GroupBadge,
  Standings,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type StandingsRow,
} from "@mr/ui";
import { ListOrdered, Trophy } from "lucide-react";
import type { PublicCategory, PublicGroupStanding } from "@mr/db";

type GroupStandingsSectionProps = {
  groups: PublicGroupStanding[];
};

const CATEGORY_LABELS: Record<PublicCategory, string> = {
  senior: "Senior",
  cadet: "Cadete",
};

const CATEGORIES: PublicCategory[] = ["senior", "cadet"];

export function GroupStandingsSection({ groups }: GroupStandingsSectionProps) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-10 sm:px-6">
      <Tabs defaultValue="senior" className="gap-4">
        <header className="border bg-card px-4 pt-3">
          <h2 className="flex items-center justify-between gap-2 text-xl font-semibold tracking-tight text-foreground">
            Grupos
            <ListOrdered className="size-5 text-muted-foreground" />
          </h2>
          <TabsList
            className="mt-1 h-10 w-full justify-start gap-5 overflow-x-auto p-0"
            variant="line"
          >
            {CATEGORIES.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="flex-none"
              >
                {CATEGORY_LABELS[category]}
              </TabsTrigger>
            ))}
          </TabsList>
        </header>

        {CATEGORIES.map((category) => (
          <TabsContent
            key={category}
            value={category}
            className="flex flex-col gap-4"
          >
            {groups.filter((group) => group.category === category).length ===
            0 ? (
              <EmptyState
                icon={<Trophy className="h-10 w-10" />}
                title="Sin grupos"
                description="Aún no hay grupos en esta categoría."
                className="border border-dashed bg-card px-4"
              />
            ) : (
              groups
                .filter((group) => group.category === category)
                .map((group) => (
                  <section key={group.id} className="flex flex-col gap-3">
                    <header className="flex items-center gap-2">
                      <GroupBadge
                        seed={group.id}
                        className="px-1.5 text-[10px]"
                      >
                        {group.name}
                      </GroupBadge>
                    </header>
                    <Standings
                      rows={toStandingsRows(group)}
                      emptyState={
                        <EmptyState
                          icon={<Trophy className="h-10 w-10" />}
                          title="Sin equipos"
                          description="Aún no hay equipos en este grupo."
                          className="border border-dashed bg-card px-4"
                        />
                      }
                    />
                  </section>
                ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function toStandingsRows(group: PublicGroupStanding): StandingsRow[] {
  return group.standings.map((row) => ({
    team: {
      id: row.teamId,
      name: row.teamName,
      crestUrl: teamAvatarUrl(row.teamId),
    },
    played: row.played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    points: row.points,
  }));
}

function teamAvatarUrl(id: string) {
  return `https://api.dicebear.com/10.x/shapes/svg?seed=${encodeURIComponent(id)}`;
}
