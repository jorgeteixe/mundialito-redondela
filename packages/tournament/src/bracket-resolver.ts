import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "@mr/db";
import {
  bracketForCategory,
  type BracketSlot,
  type BracketCategory,
} from "@mr/db/bracket";
import {
  calculateStandings,
  rankAcrossGroups,
  type StandingRow,
} from "./standings";

const { match, team, tournamentGroup, tournamentGroupTeam } = schema;

type Stage = "f1" | "f2";

type MatchRow = {
  id: string;
  code: string | null;
  groupId: string | null;
  kind: "group" | "semifinal" | "third_place" | "final";
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
};

type GroupState = { standings: StandingRow[]; complete: boolean };

export type ResolveContext = {
  /** Standings keyed by `${stage}:${groupLabel}`. */
  groups: Map<string, GroupState>;
  /** True when every group of that stage is finished. */
  stageComplete: Record<Stage, boolean>;
  /** Ranked same-position finishers keyed by `${stage}:${position}`. */
  rankTables: Map<string, StandingRow[]>;
  /** Knockout/group matches keyed by their bracket code. */
  matchByCode: Map<string, MatchRow>;
};

/**
 * Resolve a single slot to a team id, or null if not yet determined. A slot
 * only resolves once everything it depends on is final: the source group
 * complete, every group of a stage complete (for cross-group ranks), or the
 * referenced match played with a decisive score.
 */
export function resolveSlot(
  slot: BracketSlot,
  ctx: ResolveContext,
): string | null {
  if (slot.from === "group") {
    const entry = ctx.groups.get(`${slot.stage}:${slot.group}`);
    if (!entry || !entry.complete) return null;
    return entry.standings[slot.pos - 1]?.teamId ?? null;
  }

  if (slot.from === "rank") {
    if (!ctx.stageComplete[slot.stage]) return null;
    const table = ctx.rankTables.get(`${slot.stage}:${slot.pos}`);
    return table?.[slot.rank - 1]?.teamId ?? null;
  }

  // match outcome
  const ref = ctx.matchByCode.get(slot.code);
  if (
    !ref ||
    ref.homeScore == null ||
    ref.awayScore == null ||
    !ref.homeTeamId ||
    !ref.awayTeamId
  ) {
    return null;
  }
  let homeWon: boolean;
  if (ref.homeScore !== ref.awayScore) {
    homeWon = ref.homeScore > ref.awayScore;
  } else if (
    // Regular time level → break the tie on penalties, when recorded.
    ref.homePenalties != null &&
    ref.awayPenalties != null &&
    ref.homePenalties !== ref.awayPenalties
  ) {
    homeWon = ref.homePenalties > ref.awayPenalties;
  } else {
    return null; // still level → pending
  }
  const winner = homeWon ? ref.homeTeamId : ref.awayTeamId;
  const loser = homeWon ? ref.awayTeamId : ref.homeTeamId;
  return slot.outcome === "winner" ? winner : loser;
}

function isGroupComplete(matches: MatchRow[]): boolean {
  return (
    matches.length > 0 &&
    matches.every((m) => m.homeScore != null && m.awayScore != null)
  );
}

function buildRankTables(
  states: Map<string, GroupState>,
  stage: Stage,
): Map<string, StandingRow[]> {
  const tables = new Map<string, StandingRow[]>();
  const stageStandings = [...states.entries()]
    .filter(([key]) => key.startsWith(`${stage}:`))
    .map(([, state]) => state.standings);
  const maxPos = Math.max(0, ...stageStandings.map((s) => s.length));
  for (let pos = 1; pos <= maxPos; pos += 1) {
    tables.set(`${stage}:${pos}`, rankAcrossGroups(stageStandings, pos));
  }
  return tables;
}

/**
 * Fill in real teams for every F2 group + knockout match of a category, based
 * on the current group results and the hardcoded bracket. Also rebuilds the F2
 * group memberships (so F2 standings work) once the group stage is complete.
 * Idempotent; returns how many slots were newly assigned.
 */
export async function resolveBracket(
  category: BracketCategory,
): Promise<number> {
  const bracket = bracketForCategory(category);

  const groupRows = await db
    .select({
      id: tournamentGroup.id,
      avatarLabel: tournamentGroup.avatarLabel,
      stage: tournamentGroup.stage,
    })
    .from(tournamentGroup)
    .where(eq(tournamentGroup.category, category));

  const f2GroupByLabel = new Map(
    groupRows.filter((g) => g.stage === "f2").map((g) => [g.avatarLabel, g]),
  );

  const matchRows: MatchRow[] = await db
    .select({
      id: match.id,
      code: match.code,
      groupId: match.groupId,
      kind: match.kind,
      homeTeamId: match.homeTeamId,
      awayTeamId: match.awayTeamId,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      homePenalties: match.homePenalties,
      awayPenalties: match.awayPenalties,
    })
    .from(match)
    .where(eq(match.category, category));

  const matchByCode = new Map(
    matchRows.filter((m) => m.code != null).map((m) => [m.code as string, m]),
  );
  const matchesByGroup = new Map<string, MatchRow[]>();
  for (const m of matchRows) {
    if (!m.groupId) continue;
    const list = matchesByGroup.get(m.groupId) ?? [];
    list.push(m);
    matchesByGroup.set(m.groupId, list);
  }

  // --- F1 memberships → F1 standings ---
  const memberships = await db
    .select({
      groupId: tournamentGroupTeam.groupId,
      stage: tournamentGroupTeam.stage,
      teamId: team.id,
      teamName: team.name,
    })
    .from(tournamentGroupTeam)
    .innerJoin(team, eq(team.id, tournamentGroupTeam.teamId))
    .where(
      inArray(
        tournamentGroupTeam.groupId,
        groupRows.map((g) => g.id),
      ),
    );

  const teamsByGroup = new Map<string, { id: string; name: string }[]>();
  for (const row of memberships) {
    if (row.stage !== "f1") continue; // F2 memberships are rebuilt below
    const list = teamsByGroup.get(row.groupId) ?? [];
    list.push({ id: row.teamId, name: row.teamName });
    teamsByGroup.set(row.groupId, list);
  }

  const groups = new Map<string, GroupState>();
  for (const g of groupRows.filter((g) => g.stage === "f1")) {
    const groupMatches = matchesByGroup.get(g.id) ?? [];
    groups.set(`f1:${g.avatarLabel}`, {
      standings: calculateStandings(teamsByGroup.get(g.id) ?? [], groupMatches),
      complete: isGroupComplete(groupMatches),
    });
  }

  const f1Complete = groupRows
    .filter((g) => g.stage === "f1")
    .every((g) => groups.get(`f1:${g.avatarLabel}`)?.complete);

  const updates: { id: string; homeTeamId?: string; awayTeamId?: string }[] =
    [];
  const setSlot = (
    m: MatchRow,
    side: "home" | "away",
    teamId: string | null,
  ) => {
    if (!teamId) return;
    const current = side === "home" ? m.homeTeamId : m.awayTeamId;
    if (current === teamId) return;
    let entry = updates.find((u) => u.id === m.id);
    if (!entry) {
      entry = { id: m.id };
      updates.push(entry);
    }
    if (side === "home") entry.homeTeamId = teamId;
    else entry.awayTeamId = teamId;
  };

  // Context with F1 only so far (knockout F2 ranks come after rebuild).
  const ctxF1: ResolveContext = {
    groups,
    stageComplete: { f1: f1Complete, f2: false },
    rankTables: buildRankTables(groups, "f1"),
    matchByCode,
  };

  // --- Resolve F2 group matches + rebuild F2 memberships ---
  const f2TeamsByGroupId = new Map<string, Set<string>>();
  for (const def of bracket) {
    if (def.kind !== "group" || !def.groupLabel) continue;
    const m = matchByCode.get(def.code);
    if (!m) continue;
    const homeTeamId = resolveSlot(def.home, ctxF1);
    const awayTeamId = resolveSlot(def.away, ctxF1);
    setSlot(m, "home", homeTeamId);
    setSlot(m, "away", awayTeamId);

    const f2Group = f2GroupByLabel.get(def.groupLabel);
    if (f2Group) {
      const set = f2TeamsByGroupId.get(f2Group.id) ?? new Set<string>();
      if (homeTeamId) set.add(homeTeamId);
      if (awayTeamId) set.add(awayTeamId);
      f2TeamsByGroupId.set(f2Group.id, set);
    }
  }

  // Rebuild F2 memberships only once the group stage is fully decided, so we
  // never thrash partial assignments. A clean delete+insert keeps it correct
  // even if earlier results were edited.
  if (f1Complete) {
    const f2GroupIds = groupRows
      .filter((g) => g.stage === "f2")
      .map((g) => g.id);
    if (f2GroupIds.length > 0) {
      await db
        .delete(tournamentGroupTeam)
        .where(
          and(
            inArray(tournamentGroupTeam.groupId, f2GroupIds),
            eq(tournamentGroupTeam.stage, "f2"),
          ),
        );
      const rows = [...f2TeamsByGroupId.entries()].flatMap(([groupId, teams]) =>
        [...teams].map((teamId) => ({ groupId, teamId, stage: "f2" as const })),
      );
      if (rows.length > 0) {
        await db.insert(tournamentGroupTeam).values(rows);
      }
    }
  }

  // --- F2 standings (from the rebuilt memberships) ---
  const teamNameById = new Map(
    memberships.map((r) => [r.teamId, r.teamName] as const),
  );
  for (const g of groupRows.filter((g) => g.stage === "f2")) {
    const set = f2TeamsByGroupId.get(g.id) ?? new Set<string>();
    const groupMatches = matchesByGroup.get(g.id) ?? [];
    const teams = [...set].map((id) => ({
      id,
      name: teamNameById.get(id) ?? "",
    }));
    groups.set(`f2:${g.avatarLabel}`, {
      standings: calculateStandings(teams, groupMatches),
      complete: f1Complete && isGroupComplete(groupMatches),
    });
  }

  const f2Complete =
    f1Complete &&
    groupRows
      .filter((g) => g.stage === "f2")
      .every((g) => groups.get(`f2:${g.avatarLabel}`)?.complete);

  const ctx: ResolveContext = {
    groups,
    stageComplete: { f1: f1Complete, f2: f2Complete },
    rankTables: new Map([
      ...buildRankTables(groups, "f1"),
      ...buildRankTables(groups, "f2"),
    ]),
    matchByCode,
  };

  // --- Resolve knockout matches ---
  for (const def of bracket) {
    if (def.kind === "group") continue;
    const m = matchByCode.get(def.code);
    if (!m) continue;
    setSlot(m, "home", resolveSlot(def.home, ctx));
    setSlot(m, "away", resolveSlot(def.away, ctx));
  }

  let assigned = 0;
  for (const update of updates) {
    const { id, ...values } = update;
    assigned += Object.keys(values).length;
    await db.update(match).set(values).where(eq(match.id, id));
  }

  return assigned;
}
