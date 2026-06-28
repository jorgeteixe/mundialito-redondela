import { describe, expect, it } from "vitest";
import { resolveSlot, type ResolveContext } from "./bracket-resolver";
import { rankAcrossGroups, type StandingRow } from "./standings";

function row(
  teamId: string,
  points: number,
  goalDifference = 0,
  goalsFor = 0,
): StandingRow {
  return {
    teamId,
    teamName: teamId.toUpperCase(),
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor,
    goalsAgainst: 0,
    goalDifference,
    points,
  };
}

function makeContext(overrides: Partial<ResolveContext> = {}): ResolveContext {
  return {
    groups: new Map(),
    stageComplete: { f1: false, f2: false },
    rankTables: new Map(),
    matchByCode: new Map(),
    ...overrides,
  };
}

describe("resolveSlot — group", () => {
  const groups = new Map([
    [
      "f1:A",
      { standings: [row("t1", 9), row("t2", 6), row("t3", 3)], complete: true },
    ],
    ["f1:B", { standings: [row("u1", 9), row("u2", 6)], complete: false }],
  ]);

  it("resolves the Nth place of a complete group", () => {
    const ctx = makeContext({ groups });
    expect(
      resolveSlot({ from: "group", stage: "f1", group: "A", pos: 1 }, ctx),
    ).toBe("t1");
    expect(
      resolveSlot({ from: "group", stage: "f1", group: "A", pos: 3 }, ctx),
    ).toBe("t3");
  });

  it("returns null while the group is incomplete", () => {
    const ctx = makeContext({ groups });
    expect(
      resolveSlot({ from: "group", stage: "f1", group: "B", pos: 1 }, ctx),
    ).toBeNull();
  });

  it("returns null for an out-of-range position", () => {
    const ctx = makeContext({ groups });
    expect(
      resolveSlot({ from: "group", stage: "f1", group: "A", pos: 4 }, ctx),
    ).toBeNull();
  });
});

describe("resolveSlot — rank", () => {
  const rankTables = new Map([
    ["f2:1", [row("best", 9), row("mid", 7), row("worst", 4)]],
  ]);

  it("resolves a cross-group rank only when the stage is complete", () => {
    const incomplete = makeContext({
      rankTables,
      stageComplete: { f1: true, f2: false },
    });
    expect(
      resolveSlot({ from: "rank", stage: "f2", pos: 1, rank: 1 }, incomplete),
    ).toBeNull();

    const complete = makeContext({
      rankTables,
      stageComplete: { f1: true, f2: true },
    });
    expect(
      resolveSlot({ from: "rank", stage: "f2", pos: 1, rank: 1 }, complete),
    ).toBe("best");
    expect(
      resolveSlot({ from: "rank", stage: "f2", pos: 1, rank: 3 }, complete),
    ).toBe("worst");
  });
});

describe("resolveSlot — match outcome", () => {
  const finished = {
    id: "m",
    code: "sf-1",
    groupId: null,
    kind: "semifinal" as const,
    homeTeamId: "home",
    awayTeamId: "away",
    homeScore: 2,
    awayScore: 1,
    homePenalties: null,
    awayPenalties: null,
  };

  it("returns winner and loser for a decisive finished match", () => {
    const ctx = makeContext({ matchByCode: new Map([["sf-1", finished]]) });
    expect(
      resolveSlot({ from: "match", code: "sf-1", outcome: "winner" }, ctx),
    ).toBe("home");
    expect(
      resolveSlot({ from: "match", code: "sf-1", outcome: "loser" }, ctx),
    ).toBe("away");
  });

  it("returns null on a draw with no penalties recorded", () => {
    const ctx = makeContext({
      matchByCode: new Map([
        ["sf-1", { ...finished, homeScore: 1, awayScore: 1 }],
      ]),
    });
    expect(
      resolveSlot({ from: "match", code: "sf-1", outcome: "winner" }, ctx),
    ).toBeNull();
  });

  it("breaks a draw on penalties when recorded", () => {
    const ctx = makeContext({
      matchByCode: new Map([
        [
          "sf-1",
          {
            ...finished,
            homeScore: 1,
            awayScore: 1,
            homePenalties: 4,
            awayPenalties: 5,
          },
        ],
      ]),
    });
    expect(
      resolveSlot({ from: "match", code: "sf-1", outcome: "winner" }, ctx),
    ).toBe("away");
    expect(
      resolveSlot({ from: "match", code: "sf-1", outcome: "loser" }, ctx),
    ).toBe("home");
  });

  it("returns null on a draw with level penalties", () => {
    const ctx = makeContext({
      matchByCode: new Map([
        [
          "sf-1",
          {
            ...finished,
            homeScore: 1,
            awayScore: 1,
            homePenalties: 3,
            awayPenalties: 3,
          },
        ],
      ]),
    });
    expect(
      resolveSlot({ from: "match", code: "sf-1", outcome: "winner" }, ctx),
    ).toBeNull();
  });

  it("returns null when the referenced match has no score yet", () => {
    const ctx = makeContext({
      matchByCode: new Map([
        ["sf-1", { ...finished, homeScore: null, awayScore: null }],
      ]),
    });
    expect(
      resolveSlot({ from: "match", code: "sf-1", outcome: "winner" }, ctx),
    ).toBeNull();
  });

  it("returns null when the referenced match is missing", () => {
    const ctx = makeContext();
    expect(
      resolveSlot({ from: "match", code: "sf-1", outcome: "winner" }, ctx),
    ).toBeNull();
  });
});

describe("rankAcrossGroups", () => {
  it("orders same-position finishers across groups deterministically", () => {
    const groupA = [row("a1", 9, 5), row("a2", 4, 1)];
    const groupB = [row("b1", 9, 8), row("b2", 6, 2)];
    const groupC = [row("c1", 7, 3), row("c2", 6, 4)];

    // Best 1st places by points then GD: b1 (9,8) > a1 (9,5) > c1 (7).
    const firsts = rankAcrossGroups([groupA, groupB, groupC], 1);
    expect(firsts.map((r) => r.teamId)).toEqual(["b1", "a1", "c1"]);

    // 2nd places: b2 (6,2) and c2 (6,4) tie on points, GD breaks it; a2 last.
    const seconds = rankAcrossGroups([groupA, groupB, groupC], 2);
    expect(seconds.map((r) => r.teamId)).toEqual(["c2", "b2", "a2"]);
  });
});
