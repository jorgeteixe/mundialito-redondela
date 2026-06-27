export type StandingTeam = {
  id: string;
  name: string;
};

export type StandingMatch = {
  homeTeamId: string | null;
  awayTeamId: string | null;
  status: "scheduled" | "live" | "finished" | "postponed";
  homeScore: number | null;
  awayScore: number | null;
};

export type StandingRow = {
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

export function calculateStandings(
  teams: StandingTeam[],
  matches: StandingMatch[],
): StandingRow[] {
  const rows = new Map<string, StandingRow>();

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

/**
 * Deterministic ordering for standing rows: points, then goal difference, then
 * goals for, then name, then id. Used both within a group and — since there is
 * no cross-group head-to-head — to rank same-position finishers across groups.
 */
export function compareStandingRows(a: StandingRow, b: StandingRow): number {
  return (
    b.points - a.points ||
    b.goalDifference - a.goalDifference ||
    b.goalsFor - a.goalsFor ||
    a.teamName.localeCompare(b.teamName, "es") ||
    a.teamId.localeCompare(b.teamId)
  );
}

/**
 * Rank the teams that finished in a given position across several groups.
 * `groupStandings` is one already-sorted standings array per group. Returns the
 * `position`-th finisher of each group ordered best-first (index 0 = rank 1).
 */
export function rankAcrossGroups(
  groupStandings: StandingRow[][],
  position: number,
): StandingRow[] {
  const finishers = groupStandings
    .map((standings) => standings[position - 1])
    .filter((row): row is StandingRow => row != null);
  return [...finishers].sort(compareStandingRows);
}

function applyResult(row: StandingRow, goalsFor: number, goalsAgainst: number) {
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
