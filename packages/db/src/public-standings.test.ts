import { expect, test } from "vitest";
import {
  qualifyingTeamIds,
  type PublicCategory,
  type PublicGroupStanding,
  type PublicStage,
  type PublicStandingRow,
} from "./public-standings";

let teamSeq = 0;

/** A standings row where only the fields used by ranking need to be realistic. */
function row(points: number): PublicStandingRow {
  teamSeq += 1;
  const id = `team-${teamSeq}`;
  return {
    teamId: id,
    teamName: id,
    played: 3,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: points,
    goalsAgainst: 0,
    goalDifference: points,
    points,
  };
}

/** Group whose standings are the given rows, already in finishing order. */
function group(
  name: string,
  category: PublicCategory,
  stage: PublicStage,
  standings: PublicStandingRow[],
): PublicGroupStanding {
  return { id: name, name, avatarLabel: name, category, stage, standings };
}

test("F1 qualifies the top 3 of every group", () => {
  const a = [row(9), row(6), row(3), row(0)];
  const b = [row(9), row(6), row(3), row(0)];
  const groups = [group("A", "senior", "f1", a), group("B", "senior", "f1", b)];

  const ids = qualifyingTeamIds(groups);

  expect(ids.has(a[3]!.teamId)).toBe(false);
  expect(ids.has(b[3]!.teamId)).toBe(false);
  expect([...a.slice(0, 3), ...b.slice(0, 3)].every((r) => ids.has(r.teamId)));
  expect(ids.size).toBe(6);
});

test("senior F2 qualifies only the winner of each group", () => {
  const a = [row(9), row(6), row(3)];
  const b = [row(9), row(6), row(3)];
  const groups = [group("A", "senior", "f2", a), group("B", "senior", "f2", b)];

  const ids = qualifyingTeamIds(groups);

  expect(ids.has(a[0]!.teamId)).toBe(true);
  expect(ids.has(b[0]!.teamId)).toBe(true);
  expect(ids.has(a[1]!.teamId)).toBe(false);
  expect(ids.size).toBe(2);
});

test("cadet F2 qualifies every winner plus the single best runner-up", () => {
  const a = [row(9), row(7)]; // runner-up: 7 pts (best)
  const b = [row(9), row(4)]; // runner-up: 4 pts
  const c = [row(9), row(5)]; // runner-up: 5 pts
  const groups = [
    group("A", "cadet", "f2", a),
    group("B", "cadet", "f2", b),
    group("C", "cadet", "f2", c),
  ];

  const ids = qualifyingTeamIds(groups);

  // All three winners advance.
  expect([a[0]!, b[0]!, c[0]!].every((r) => ids.has(r.teamId))).toBe(true);
  // Only group A's runner-up (most points) takes the extra spot.
  expect(ids.has(a[1]!.teamId)).toBe(true);
  expect(ids.has(b[1]!.teamId)).toBe(false);
  expect(ids.has(c[1]!.teamId)).toBe(false);
  expect(ids.size).toBe(4);
});

test("handles senior and cadet F2 groups together", () => {
  const seniorA = [row(9), row(6)];
  const cadetA = [row(9), row(7)];
  const cadetB = [row(9), row(4)];
  const groups = [
    group("SA", "senior", "f2", seniorA),
    group("CA", "cadet", "f2", cadetA),
    group("CB", "cadet", "f2", cadetB),
  ];

  const ids = qualifyingTeamIds(groups);

  // senior: winner only. cadet: both winners + best runner-up (cadetA's).
  expect(ids.has(seniorA[0]!.teamId)).toBe(true);
  expect(ids.has(seniorA[1]!.teamId)).toBe(false);
  expect(ids.has(cadetA[1]!.teamId)).toBe(true);
  expect(ids.has(cadetB[1]!.teamId)).toBe(false);
  expect(ids.size).toBe(4);
});
