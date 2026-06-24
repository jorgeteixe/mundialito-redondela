import { asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@mr/db";
import type { Category } from "@/lib/category";

const { player, team } = schema;

export type TeamCategory = Category;

export type TeamSummary = {
  id: string;
  name: string;
  category: TeamCategory;
  playerCount: number;
};

export type TeamDetail = {
  id: string;
  name: string;
  category: TeamCategory;
  players: PlayerSummary[];
};

export type PlayerSummary = {
  id: string;
  name: string;
  teamId: string;
};

export async function listTeams(category: Category): Promise<TeamSummary[]> {
  return db
    .select({
      id: team.id,
      name: team.name,
      category: team.category,
      playerCount: sql<number>`count(${player.id})::int`,
    })
    .from(team)
    .leftJoin(player, eq(player.teamId, team.id))
    .where(eq(team.category, category))
    .groupBy(team.id)
    .orderBy(asc(team.name));
}

export async function getTeamDetail(id: string): Promise<TeamDetail | null> {
  const result = await db.query.team.findFirst({
    where: eq(team.id, id),
    columns: {
      id: true,
      name: true,
      category: true,
    },
    with: {
      players: {
        columns: {
          id: true,
          name: true,
          teamId: true,
        },
        orderBy: [asc(player.name)],
      },
    },
  });

  return result ?? null;
}
