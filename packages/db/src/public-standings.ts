import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "./client";
import { match, team, tournamentGroup, tournamentGroupTeam } from "./schema";

export type PublicCategory = "senior" | "cadet";
export type PublicStage = "f1" | "f2";

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
  stage: PublicStage;
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

export function listPublicF1GroupStandings(): Promise<PublicGroupStanding[]> {
  return listPublicGroupStandings("f1");
}

export async function listPublicGroupStandings(
  stage: PublicStage,
): Promise<PublicGroupStanding[]> {
  const groups = await db
    .select({
      id: tournamentGroup.id,
      name: tournamentGroup.name,
      avatarLabel: tournamentGroup.avatarLabel,
      category: tournamentGroup.category,
      stage: tournamentGroup.stage,
    })
    .from(tournamentGroup)
    .where(eq(tournamentGroup.stage, stage))
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
        eq(tournamentGroupTeam.stage, stage),
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

/**
 * Team ids that advance to the next round, given every group of a single stage
 * (both categories). Mirrors the hardcoded bracket (see @mr/db/bracket):
 *
 * - F1 (both categories): the top 3 of each group reach F2.
 * - F2 senior: only the winner of each group reaches the knockout stage.
 * - F2 cadet: the three group winners plus the single best runner-up across
 *   the groups — a cross-group ranking, not a fixed position per group.
 *
 * Returned as a set so callers can highlight the qualifying rows regardless of
 * which group is on screen.
 */
export function qualifyingTeamIds(
  stageGroups: PublicGroupStanding[],
): Set<string> {
  const ids = new Set<string>();
  const byCategory = new Map<PublicCategory, PublicGroupStanding[]>();

  for (const group of stageGroups) {
    const list = byCategory.get(group.category) ?? [];
    list.push(group);
    byCategory.set(group.category, list);
  }

  for (const groups of byCategory.values()) {
    const stage = groups[0]?.stage;

    if (stage === "f1") {
      for (const group of groups) {
        for (const row of group.standings.slice(0, 3)) ids.add(row.teamId);
      }
      continue;
    }

    // F2: every group winner advances.
    const runnersUp: PublicStandingRow[] = [];
    for (const group of groups) {
      const [first, second] = group.standings;
      if (first) ids.add(first.teamId);
      if (second) runnersUp.push(second);
    }

    // Cadet F2 grants one extra spot to the best second-placed team across the
    // groups; senior F2 does not.
    if (groups[0]?.category === "cadet") {
      const bestRunnerUp = [...runnersUp].sort(compareStandingRows)[0];
      if (bestRunnerUp) ids.add(bestRunnerUp.teamId);
    }
  }

  return ids;
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
