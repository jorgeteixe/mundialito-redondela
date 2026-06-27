import { asc, eq, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@mr/db";
import type { Category } from "@/lib/category";
import type { CalendarMatch } from "../../calendario/calendar-format";

const { match, player, team, tournamentGroup } = schema;

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

export async function listTeamMatches(
  teamId: string,
): Promise<CalendarMatch[]> {
  const homeTeam = alias(team, "home_team");
  const awayTeam = alias(team, "away_team");

  const rows = await db
    .select({
      id: match.id,
      scheduledAt: match.scheduledAt,
      groupId: match.groupId,
      groupName: tournamentGroup.name,
      groupAvatarLabel: tournamentGroup.avatarLabel,
      groupStage: tournamentGroup.stage,
      kind: match.kind,
      category: match.category,
      homeTeamId: match.homeTeamId,
      homeTeamName: homeTeam.name,
      homePlaceholder: match.homePlaceholder,
      awayTeamId: match.awayTeamId,
      awayTeamName: awayTeam.name,
      awayPlaceholder: match.awayPlaceholder,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      homePenalties: match.homePenalties,
      awayPenalties: match.awayPenalties,
    })
    .from(match)
    .leftJoin(tournamentGroup, eq(tournamentGroup.id, match.groupId))
    .leftJoin(homeTeam, eq(homeTeam.id, match.homeTeamId))
    .leftJoin(awayTeam, eq(awayTeam.id, match.awayTeamId))
    .where(or(eq(match.homeTeamId, teamId), eq(match.awayTeamId, teamId)))
    .orderBy(asc(match.scheduledAt));

  return rows.map((row) => ({
    id: row.id,
    scheduledAt: row.scheduledAt.toISOString(),
    groupId: row.groupId,
    groupName: row.groupName,
    groupAvatarLabel: row.groupAvatarLabel,
    groupStage: row.groupStage,
    kind: row.kind,
    category: row.category,
    homeTeamId: row.homeTeamId,
    homeTeamName: row.homeTeamName ?? row.homePlaceholder ?? "Pendiente",
    awayTeamId: row.awayTeamId,
    awayTeamName: row.awayTeamName ?? row.awayPlaceholder ?? "Pendiente",
    homeScore: row.homeScore,
    awayScore: row.awayScore,
    homePenalties: row.homePenalties,
    awayPenalties: row.awayPenalties,
  }));
}
