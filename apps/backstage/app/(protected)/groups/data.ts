import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "@mr/db";
import type { TeamCategory } from "../teams/data";

const { team, tournamentGroup } = schema;

export type GroupSummary = {
  id: string;
  name: string;
  avatarLabel: string;
  category: TeamCategory;
  teamCount: number;
};

export type GroupTeamSummary = {
  id: string;
  name: string;
  category: TeamCategory;
  groupId: string | null;
};

export type GroupDetail = {
  id: string;
  name: string;
  avatarLabel: string;
  category: TeamCategory;
  teams: GroupTeamSummary[];
};

export async function listGroups(): Promise<GroupSummary[]> {
  return db
    .select({
      id: tournamentGroup.id,
      name: tournamentGroup.name,
      avatarLabel: tournamentGroup.avatarLabel,
      category: tournamentGroup.category,
      teamCount: sql<number>`count(${team.id})::int`,
    })
    .from(tournamentGroup)
    .leftJoin(team, eq(team.groupId, tournamentGroup.id))
    .groupBy(tournamentGroup.id)
    .orderBy(asc(tournamentGroup.name));
}

export async function getGroupDetail(id: string): Promise<GroupDetail | null> {
  const result = await db.query.tournamentGroup.findFirst({
    where: eq(tournamentGroup.id, id),
    columns: {
      id: true,
      name: true,
      avatarLabel: true,
      category: true,
    },
    with: {
      teams: {
        columns: {
          id: true,
          name: true,
          category: true,
          groupId: true,
        },
        orderBy: [asc(team.name)],
      },
    },
  });

  return result ?? null;
}

export async function listUngroupedTeams(
  category: TeamCategory,
): Promise<GroupTeamSummary[]> {
  return db
    .select({
      id: team.id,
      name: team.name,
      category: team.category,
      groupId: team.groupId,
    })
    .from(team)
    .where(and(eq(team.category, category), isNull(team.groupId)))
    .orderBy(asc(team.name));
}
