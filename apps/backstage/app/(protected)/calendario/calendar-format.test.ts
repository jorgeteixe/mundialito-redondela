import { describe, expect, it } from "vitest";
import { groupByDay, type CalendarMatch } from "./calendar-format";

function makeMatch(
  id: string,
  scheduledAt: string,
  overrides: Partial<CalendarMatch> = {},
): CalendarMatch {
  return {
    id,
    scheduledAt,
    groupId: "g1",
    groupName: "Grupo A",
    groupAvatarLabel: "A",
    groupStage: "f1",
    kind: "group",
    category: "senior",
    homeTeamId: "home-1",
    homeTeamName: "Local",
    awayTeamId: "away-1",
    awayTeamName: "Visitante",
    status: "scheduled",
    homeScore: null,
    awayScore: null,
    homePenalties: null,
    awayPenalties: null,
    ...overrides,
  };
}

describe("groupByDay", () => {
  it("buckets matches into Madrid-local days in chronological order", () => {
    // Madrid is UTC+2 in June (CEST).
    const days = groupByDay([
      makeMatch("a", "2026-06-27T08:00:00.000Z"), // 10:00 Madrid, 27th
      makeMatch("b", "2026-06-27T09:30:00.000Z"), // 11:30 Madrid, 27th
      makeMatch("c", "2026-06-28T08:00:00.000Z"), // 10:00 Madrid, 28th
    ]);

    expect(days.map((d) => d.dateKey)).toEqual(["2026-06-27", "2026-06-28"]);
    expect(days[0]!.matches.map((m) => m.id)).toEqual(["a", "b"]);
    expect(days[1]!.matches.map((m) => m.id)).toEqual(["c"]);
  });

  it("places a near-midnight UTC match on the correct Madrid local day", () => {
    // 22:30Z on the 27th is 00:30 Madrid on the 28th (UTC+2).
    const days = groupByDay([makeMatch("late", "2026-06-27T22:30:00.000Z")]);

    expect(days).toHaveLength(1);
    expect(days[0]!.dateKey).toBe("2026-06-28");
  });

  it("keeps matches time-sorted within a day across groups", () => {
    const days = groupByDay([
      makeMatch("early", "2026-06-27T08:00:00.000Z", { groupName: "Grupo B" }),
      makeMatch("mid", "2026-06-27T08:00:00.000Z", { groupName: "Grupo A" }),
      makeMatch("late", "2026-06-27T09:30:00.000Z", { groupName: "Grupo A" }),
    ]);

    expect(days).toHaveLength(1);
    expect(days[0]!.matches.map((m) => m.id)).toEqual(["early", "mid", "late"]);
  });

  it("returns an empty array when there are no matches", () => {
    expect(groupByDay([])).toEqual([]);
  });
});
