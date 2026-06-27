import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "./client";
import { match, team, tournamentGroup, tournamentGroupTeam } from "./schema";

export type PublicCategory = "senior" | "cadet";

export type PublicStandingRow = {
  teamId: string;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type PublicGroupStanding = {
  id: string;
  name: string;
  avatarLabel: string;
  category: PublicCategory;
  standings: PublicStandingRow[];
};

type StandingTeam = {
  id: string;
  name: string;
};

type StandingMatch = {
  homeTeamId: string | null;
  awayTeamId: string | null;
  status: "scheduled" | "live" | "finished" | "postponed";
  homeScore: number | null;
  awayScore: number | null;
};

export async function listPublicF1GroupStandings(): Promise<
  PublicGroupStanding[]
> {
  const groups = await db
    .select({
      id: tournamentGroup.id,
      name: tournamentGroup.name,
      avatarLabel: tournamentGroup.avatarLabel,
      category: tournamentGroup.category,
    })
    .from(tournamentGroup)
    .where(eq(tournamentGroup.stage, "f1"))
    .orderBy(asc(tournamentGroup.category), asc(tournamentGroup.name));

  if (groups.length === 0) return [];

  const groupIds = groups.map((group) => group.id);

  const memberships = await db
    .select({
      groupId: tournamentGroupTeam.groupId,
      teamId: team.id,
      teamName: team.name,
    })
    .from(tournamentGroupTeam)
    .innerJoin(team, eq(team.id, tournamentGroupTeam.teamId))
    .where(
      and(
        eq(tournamentGroupTeam.stage, "f1"),
        inArray(tournamentGroupTeam.groupId, groupIds),
      ),
    )
    .orderBy(asc(team.name));

  const matches = await db
    .select({
      groupId: match.groupId,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    })
    .from(match)
    .where(inArray(match.groupId, groupIds));

  const teamsByGroup = new Map<string, StandingTeam[]>();
  for (const membership of memberships) {
    const teams = teamsByGroup.get(membership.groupId) ?? [];
    teams.push({ id: membership.teamId, name: membership.teamName });
    teamsByGroup.set(membership.groupId, teams);
  }

  const matchesByGroup = new Map<string, StandingMatch[]>();
  for (const match of matches) {
    if (!match.groupId) continue;

    const groupMatches = matchesByGroup.get(match.groupId) ?? [];
    groupMatches.push(match);
    matchesByGroup.set(match.groupId, groupMatches);
  }

  return groups.map((group) => ({
    ...group,
    standings: calculateStandings(
      teamsByGroup.get(group.id) ?? [],
      matchesByGroup.get(group.id) ?? [],
    ),
  }));
}

function calculateStandings(
  teams: StandingTeam[],
  matches: StandingMatch[],
): PublicStandingRow[] {
  const rows = new Map<string, PublicStandingRow>();

  for (const team of teams) {
    rows.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (
      match.status !== "finished" ||
      !match.homeTeamId ||
      !match.awayTeamId ||
      match.homeScore == null ||
      match.awayScore == null
    ) {
      continue;
    }

    const home = rows.get(match.homeTeamId);
    const away = rows.get(match.awayTeamId);
    if (!home || !away) continue;

    applyResult(home, match.homeScore, match.awayScore);
    applyResult(away, match.awayScore, match.homeScore);
  }

  return [...rows.values()].sort(compareStandingRows);
}

function compareStandingRows(
  a: PublicStandingRow,
  b: PublicStandingRow,
): number {
  return (
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.teamName.localeCompare(b.teamName, "es") ||
    a.teamId.localeCompare(b.teamId)
  );
}

function applyResult(
  row: PublicStandingRow,
  goalsFor: number,
  goalsAgainst: number,
) {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    row.wins += 1;
    row.points += 3;
  } else if (goalsFor === goalsAgainst) {
    row.draws += 1;
    row.points += 1;
  } else {
    row.losses += 1;
  }
}
