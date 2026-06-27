import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@mr/db";
import type { GroupStage } from "@/lib/group-stage";
import { calculateStandings, type StandingRow } from "@/lib/standings";
import type { TeamCategory } from "../teams/data";

const { match, team, tournamentGroup, tournamentGroupTeam } = schema;

export type GroupSummary = {
  id: string;
  name: string;
  avatarLabel: string;
  category: TeamCategory;
  stage: GroupStage;
  teamCount: number;
};

export type GroupTeamSummary = {
  id: string;
  name: string;
  category: TeamCategory;
  groupId: string | null;
};

export type GroupMatchSummary = {
  id: string;
  homeTeamId: string;
  homeTeamName: string;
  homePlaceholder: string | null;
  awayTeamId: string;
  awayTeamName: string;
  awayPlaceholder: string | null;
  scheduledAt: string;
  status: "scheduled" | "live" | "finished" | "postponed";
  homeScore: number | null;
  awayScore: number | null;
};

export type GroupStanding = StandingRow;

export type GroupDetail = {
  id: string;
  name: string;
  avatarLabel: string;
  category: TeamCategory;
  stage: GroupStage;
  teams: GroupTeamSummary[];
  matches: GroupMatchSummary[];
  standings: GroupStanding[];
};

export async function listGroups(
  category: TeamCategory,
  stage: GroupStage,
): Promise<GroupSummary[]> {
  return db
    .select({
      id: tournamentGroup.id,
      name: tournamentGroup.name,
      avatarLabel: tournamentGroup.avatarLabel,
      category: tournamentGroup.category,
      stage: tournamentGroup.stage,
      teamCount: sql<number>`count(${tournamentGroupTeam.teamId})::int`,
    })
    .from(tournamentGroup)
    .leftJoin(
      tournamentGroupTeam,
      eq(tournamentGroupTeam.groupId, tournamentGroup.id),
    )
    .where(
      and(
        eq(tournamentGroup.category, category),
        eq(tournamentGroup.stage, stage),
      ),
    )
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
      stage: true,
    },
  });

  if (!result) return null;

  const teams = await db
    .select({
      id: team.id,
      name: team.name,
      category: team.category,
      groupId: tournamentGroupTeam.groupId,
    })
    .from(tournamentGroupTeam)
    .innerJoin(team, eq(team.id, tournamentGroupTeam.teamId))
    .where(eq(tournamentGroupTeam.groupId, id))
    .orderBy(asc(team.name));

  const homeTeam = alias(team, "home_team");
  const awayTeam = alias(team, "away_team");
  const matches = await db
    .select({
      id: match.id,
      homeTeamId: match.homeTeamId,
      homeTeamName: homeTeam.name,
      homePlaceholder: match.homePlaceholder,
      awayTeamId: match.awayTeamId,
      awayTeamName: awayTeam.name,
      awayPlaceholder: match.awayPlaceholder,
      scheduledAt: match.scheduledAt,
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    })
    .from(match)
    .leftJoin(homeTeam, eq(homeTeam.id, match.homeTeamId))
    .leftJoin(awayTeam, eq(awayTeam.id, match.awayTeamId))
    .where(eq(match.groupId, id))
    .orderBy(asc(match.scheduledAt));

  const standings = calculateStandings(
    teams.map((team) => ({ id: team.id, name: team.name })),
    matches,
  );

  return {
    ...result,
    teams,
    matches: matches.map((match) => ({
      ...match,
      homeTeamId: match.homeTeamId ?? "",
      homeTeamName: match.homeTeamName ?? match.homePlaceholder ?? "Pendiente",
      awayTeamId: match.awayTeamId ?? "",
      awayTeamName: match.awayTeamName ?? match.awayPlaceholder ?? "Pendiente",
      scheduledAt: match.scheduledAt.toISOString(),
    })),
    standings,
  };
}

export async function listUngroupedTeams(
  category: TeamCategory,
  stage: GroupStage,
): Promise<GroupTeamSummary[]> {
  return db
    .select({
      id: team.id,
      name: team.name,
      category: team.category,
      groupId: tournamentGroupTeam.groupId,
    })
    .from(team)
    .leftJoin(
      tournamentGroupTeam,
      and(
        eq(tournamentGroupTeam.teamId, team.id),
        eq(tournamentGroupTeam.stage, stage),
      ),
    )
    .where(
      and(eq(team.category, category), isNull(tournamentGroupTeam.groupId)),
    )
    .orderBy(asc(team.name));
}
