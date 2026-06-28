import { describe, expect, it } from "vitest";
import type { PublicCalendarMatch } from "@mr/db";
import { isAllowedChannel, resolveMatch } from "./match-resolver";

function match(over: Partial<PublicCalendarMatch>): PublicCalendarMatch {
  return {
    id: "m1",
    scheduledAt: "2026-07-10T19:30:00.000Z",
    groupId: null,
    groupName: null,
    groupAvatarLabel: null,
    kind: "group",
    category: "senior",
    homeTeamId: "h",
    homeTeamName: "Real Madrid",
    awayTeamId: "a",
    awayTeamName: "Barcelona",
    homeScore: null,
    awayScore: null,
    homePenalties: null,
    awayPenalties: null,
    ...over,
  };
}

describe("resolveMatch — orientation", () => {
  it("orients scores to the fixture home/away regardless of input order", () => {
    const matches = [match({})]; // home=Real Madrid, away=Barcelona
    // User says "Barcelona 1 Real Madrid 3" → Barcelona is away with 1.
    const result = resolveMatch(matches, {
      teamA: "Barcelona",
      scoreA: 1,
      teamB: "Real Madrid",
      scoreB: 3,
    });
    expect(result).toMatchObject({
      ok: true,
      homeName: "Real Madrid",
      awayName: "Barcelona",
      homeScore: 3,
      awayScore: 1,
    });
  });

  it("matches on partial names", () => {
    const result = resolveMatch([match({})], {
      teamA: "madrid",
      scoreA: 2,
      teamB: "barca",
      scoreB: 0,
    });
    expect(result.ok).toBe(true);
  });
});

describe("resolveMatch — disambiguation", () => {
  it("returns not-found when no fixture matches", () => {
    const result = resolveMatch([match({})], {
      teamA: "Sevilla",
      scoreA: 1,
      teamB: "Valencia",
      scoreB: 1,
    });
    expect(result).toMatchObject({ ok: false, warning: "not-found" });
  });

  it("flags ambiguity between two equally-matching unplayed fixtures", () => {
    const matches = [
      match({ id: "m1", scheduledAt: "2026-07-10T19:30:00.000Z" }),
      match({ id: "m2", scheduledAt: "2026-07-11T19:30:00.000Z" }),
    ];
    const result = resolveMatch(matches, {
      teamA: "Real Madrid",
      scoreA: 2,
      teamB: "Barcelona",
      scoreB: 1,
    });
    expect(result).toMatchObject({ ok: false, warning: "ambiguous" });
  });

  it("uses dayHint to disambiguate", () => {
    const matches = [
      match({ id: "m1", scheduledAt: "2026-07-10T19:30:00.000Z" }),
      match({ id: "m2", scheduledAt: "2026-07-11T19:30:00.000Z" }),
    ];
    const result = resolveMatch(matches, {
      teamA: "Real Madrid",
      scoreA: 2,
      teamB: "Barcelona",
      scoreB: 1,
      dayHint: "2026-07-11",
    });
    expect(result).toMatchObject({ ok: true, matchId: "m2" });
  });

  it("prefers the unplayed fixture over a played one", () => {
    const matches = [
      match({ id: "played", homeScore: 1, awayScore: 0 }),
      match({ id: "pending", scheduledAt: "2026-07-12T19:30:00.000Z" }),
    ];
    const result = resolveMatch(matches, {
      teamA: "Real Madrid",
      scoreA: 2,
      teamB: "Barcelona",
      scoreB: 1,
    });
    expect(result).toMatchObject({ ok: true, matchId: "pending" });
  });
});

describe("resolveMatch — penalty rules", () => {
  it("rejects penalties on a group match", () => {
    const result = resolveMatch([match({ kind: "group" })], {
      teamA: "Real Madrid",
      scoreA: 1,
      teamB: "Barcelona",
      scoreB: 1,
      penaltiesA: 4,
      penaltiesB: 3,
    });
    expect(result).toMatchObject({
      ok: false,
      warning: "penalties-not-allowed",
    });
  });

  it("asks for penalties on a level knockout", () => {
    const result = resolveMatch([match({ kind: "final" })], {
      teamA: "Real Madrid",
      scoreA: 2,
      teamB: "Barcelona",
      scoreB: 2,
    });
    expect(result).toMatchObject({ ok: false, warning: "needs-penalties" });
  });

  it("accepts a level knockout with penalties, oriented correctly", () => {
    const result = resolveMatch([match({ kind: "final" })], {
      teamA: "Barcelona",
      scoreA: 2,
      teamB: "Real Madrid",
      scoreB: 2,
      penaltiesA: 5,
      penaltiesB: 4,
    });
    expect(result).toMatchObject({
      ok: true,
      kind: "final",
      homeName: "Real Madrid",
      awayName: "Barcelona",
      homeScore: 2,
      awayScore: 2,
      homePenalties: 4,
      awayPenalties: 5,
    });
  });

  it("rejects penalties on a decided knockout", () => {
    const result = resolveMatch([match({ kind: "semifinal" })], {
      teamA: "Real Madrid",
      scoreA: 3,
      teamB: "Barcelona",
      scoreB: 1,
      penaltiesA: 5,
      penaltiesB: 4,
    });
    expect(result).toMatchObject({ ok: false, warning: "penalties-not-level" });
  });
});

describe("isAllowedChannel", () => {
  it("accepts the configured group via prefixed channel id", () => {
    expect(isAllowedChannel("telegram:-1001234567890", "-1001234567890")).toBe(
      true,
    );
  });

  it("accepts an exact id match", () => {
    expect(isAllowedChannel("-1001234567890", "-1001234567890")).toBe(true);
  });

  it("rejects any other chat", () => {
    expect(isAllowedChannel("telegram:-999", "-1001234567890")).toBe(false);
  });
});
