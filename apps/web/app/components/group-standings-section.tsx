"use client";

import Link from "next/link";
import {
  Badge,
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
  /**
   * Team ids that advance from this stage. Computed by the caller (see
   * `qualifyingTeamIds` in @mr/db) because the rule differs per stage and, for
   * cadet F2, depends on a cross-group ranking.
   */
  qualifyingTeamIds?: readonly string[];
  highlightedTeamId?: string;
};

const CATEGORY_LABELS: Record<PublicCategory, string> = {
  senior: "Senior",
  cadet: "Cadete",
};

const STAGE_LABELS = {
  f1: "Fase 1",
  f2: "Fase 2",
} as const;

const CATEGORIES: PublicCategory[] = ["senior", "cadet"];

export function GroupStandingsSection({
  groups,
  qualifyingTeamIds,
  highlightedTeamId,
}: GroupStandingsSectionProps) {
  // This overview only renders one stage at a time; label it from the groups.
  const stageLabel = STAGE_LABELS[groups[0]?.stage ?? "f1"];

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-10 sm:px-6">
      <Tabs
        defaultValue="senior"
        className="gap-0 overflow-hidden border bg-card"
      >
        <header className="border-b px-4 pt-3">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
            Grupos
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {stageLabel}
            </Badge>
            <ListOrdered className="ml-auto size-5 text-muted-foreground" />
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
            className="flex flex-col divide-y"
          >
            {groups.filter((group) => group.category === category).length ===
            0 ? (
              <EmptyState
                icon={<Trophy className="h-10 w-10" />}
                title="Sin grupos"
                description="Aún no hay grupos en esta categoría."
                className="px-4 py-12"
              />
            ) : (
              groups
                .filter((group) => group.category === category)
                .map((group) => (
                  <section key={group.id} className="flex flex-col gap-3 py-4">
                    <header className="flex items-center gap-2 px-3 sm:px-4">
                      <Link
                        href={`/grupos/${group.id}`}
                        className="inline-flex max-w-full transition-opacity hover:opacity-80"
                      >
                        <GroupBadge
                          seed={group.id}
                          className="px-1.5 text-[10px]"
                        >
                          {group.name}
                        </GroupBadge>
                      </Link>
                    </header>
                    <Standings
                      bare
                      rows={toStandingsRows(group)}
                      highlightedTeamId={highlightedTeamId}
                      qualifyingTeamIds={qualifyingTeamIds}
                      linkComponent={Link}
                      emptyState={
                        <EmptyState
                          icon={<Trophy className="h-10 w-10" />}
                          title="Sin equipos"
                          description="Aún no hay equipos en este grupo."
                          className="py-8"
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
      href: `/equipos/${row.teamId}`,
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
