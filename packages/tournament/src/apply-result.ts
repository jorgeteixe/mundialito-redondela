import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@mr/db";
import type { BracketCategory } from "@mr/db/bracket";
import { resolveBracket } from "./bracket-resolver";
import { triggerResultsPublishAfterSave } from "./trigger";

const { match, team } = schema;

export type MatchKind = "group" | "semifinal" | "third_place" | "final";

export type ApplyMatchResultInput = {
  matchId: string;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties?: number | null;
  awayPenalties?: number | null;
};

export type ApplyMatchResultErrorCode =
  | "match-not-found"
  | "invalid-score"
  | "incomplete-score"
  | "penalties-not-allowed-group"
  | "penalties-incomplete"
  | "penalties-not-level";

export type ApplyMatchResultOutcome =
  | {
      ok: true;
      category: BracketCategory;
      kind: MatchKind;
      homeName: string;
      awayName: string;
      homeScore: number | null;
      awayScore: number | null;
      homePenalties: number | null;
      awayPenalties: number | null;
    }
  | { ok: false; code: ApplyMatchResultErrorCode; message: string };

function isValidScore(value: number | null): boolean {
  return (
    value === null || (Number.isInteger(value) && value >= 0 && value <= 99)
  );
}

export type ValidateResultInput = {
  kind: MatchKind;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
};

export type ValidateResultOutcome =
  | { ok: true }
  | { ok: false; code: ApplyMatchResultErrorCode; message: string };

/**
 * Pure validation of a match-result entry. The single source of truth for the
 * penalty invariants: group matches never carry penalties, and on knockouts
 * penalties only apply once regular time ends level. Kept DB-free so it can be
 * unit-tested in isolation.
 */
export function validateResultInput(
  input: ValidateResultInput,
): ValidateResultOutcome {
  if (
    !isValidScore(input.homeScore) ||
    !isValidScore(input.awayScore) ||
    !isValidScore(input.homePenalties) ||
    !isValidScore(input.awayPenalties)
  ) {
    return {
      ok: false,
      code: "invalid-score",
      message: "Los resultados deben ser números enteros entre 0 y 99.",
    };
  }

  // Scores are entered as a pair: both present (a played match) or both empty
  // (clearing the result).
  if ((input.homeScore === null) !== (input.awayScore === null)) {
    return {
      ok: false,
      code: "incomplete-score",
      message: "Rellena ambos resultados.",
    };
  }

  const isKnockout = input.kind !== "group";
  const hasPenalties =
    input.homePenalties !== null || input.awayPenalties !== null;

  if (hasPenalties && !isKnockout) {
    return {
      ok: false,
      code: "penalties-not-allowed-group",
      message: "Los partidos de grupo no tienen penaltis.",
    };
  }

  if (
    hasPenalties &&
    (input.homePenalties === null || input.awayPenalties === null)
  ) {
    return {
      ok: false,
      code: "penalties-incomplete",
      message: "Rellena ambos penaltis.",
    };
  }

  // Penalties only make sense once regular time ends level.
  if (
    hasPenalties &&
    input.homeScore !== null &&
    input.homeScore !== input.awayScore
  ) {
    return {
      ok: false,
      code: "penalties-not-level",
      message:
        "Los penaltis solo se registran cuando el partido acaba en empate.",
    };
  }

  return { ok: true };
}

/**
 * Persist a match result and run every downstream side effect the backstage
 * form runs: re-resolve the bracket/standings for the category and fire the
 * Trigger.dev publishing pipeline. Single source of truth for the penalty
 * invariants — penalties never apply to group matches, and on knockouts they
 * only make sense once regular time ends level. Returns the canonical team
 * names so callers can confirm what was saved.
 */
export async function applyMatchResult(
  input: ApplyMatchResultInput,
): Promise<ApplyMatchResultOutcome> {
  const homePenalties = input.homePenalties ?? null;
  const awayPenalties = input.awayPenalties ?? null;

  const homeTeam = alias(team, "home_team");
  const awayTeam = alias(team, "away_team");

  const [row] = await db
    .select({
      category: match.category,
      kind: match.kind,
      homePlaceholder: match.homePlaceholder,
      awayPlaceholder: match.awayPlaceholder,
      homeName: homeTeam.name,
      awayName: awayTeam.name,
    })
    .from(match)
    .leftJoin(homeTeam, eq(homeTeam.id, match.homeTeamId))
    .leftJoin(awayTeam, eq(awayTeam.id, match.awayTeamId))
    .where(eq(match.id, input.matchId))
    .limit(1);

  if (!row) {
    return {
      ok: false,
      code: "match-not-found",
      message: "El partido no existe.",
    };
  }

  const validation = validateResultInput({
    kind: row.kind,
    homeScore: input.homeScore,
    awayScore: input.awayScore,
    homePenalties,
    awayPenalties,
  });
  if (!validation.ok) {
    return validation;
  }

  await db
    .update(match)
    .set({
      homeScore: input.homeScore,
      awayScore: input.awayScore,
      homePenalties,
      awayPenalties,
    })
    .where(eq(match.id, input.matchId));

  // A saved result can change standings and knockout faces, so re-resolve.
  await resolveBracket(row.category);

  try {
    await triggerResultsPublishAfterSave({ matchId: input.matchId });
  } catch (error) {
    console.error("Failed to trigger result publication workflow", error);
  }

  return {
    ok: true,
    category: row.category,
    kind: row.kind,
    homeName: row.homeName ?? row.homePlaceholder ?? "Local",
    awayName: row.awayName ?? row.awayPlaceholder ?? "Visitante",
    homeScore: input.homeScore,
    awayScore: input.awayScore,
    homePenalties,
    awayPenalties,
  };
}
