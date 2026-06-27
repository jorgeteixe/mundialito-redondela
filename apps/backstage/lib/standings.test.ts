import { describe, expect, it } from "vitest";
import { calculateStandings } from "./standings";

const teams = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Celta" },
];

describe("calculateStandings", () => {
  it("calculates points and goal totals from played matches only", () => {
    const rows = calculateStandings(teams, [
      {
        homeTeamId: "a",
        awayTeamId: "b",
        homeScore: 3,
        awayScore: 1,
      },
      {
        homeTeamId: "a",
        awayTeamId: "c",
        homeScore: null,
        awayScore: null,
      },
    ]);

    expect(rows[0]).toMatchObject({
      teamId: "a",
      played: 1,
      wins: 1,
      goalsFor: 3,
      goalsAgainst: 1,
      goalDifference: 2,
      points: 3,
    });
    expect(rows.find((row) => row.teamId === "c")).toMatchObject({
      played: 0,
      points: 0,
    });
  });

  it("sorts by points, goal difference, goals for, then name", () => {
    const rows = calculateStandings(teams, [
      {
        homeTeamId: "a",
        awayTeamId: "b",
        homeScore: 2,
        awayScore: 0,
      },
      {
        homeTeamId: "c",
        awayTeamId: "b",
        homeScore: 3,
        awayScore: 1,
      },
    ]);

    expect(rows.map((row) => row.teamId)).toEqual(["c", "a", "b"]);
  });
});
