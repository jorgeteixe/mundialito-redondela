import { describe, expect, it } from "vitest";
import {
  conflictWindow,
  matchesConflict,
  MATCH_DURATION_MS,
} from "./match-schedule";

const base = new Date("2026-06-27T18:30:00.000Z");
const minutes = (n: number) => new Date(base.getTime() + n * 60 * 1000);

describe("matchesConflict", () => {
  it("conflicts when two matches share the same kickoff", () => {
    expect(matchesConflict(base, minutes(0))).toBe(true);
  });

  it("conflicts when slots partially overlap (less than 30 min apart)", () => {
    expect(matchesConflict(base, minutes(15))).toBe(true);
    expect(matchesConflict(base, minutes(-15))).toBe(true);
  });

  it("does not conflict for back-to-back slots exactly 30 min apart", () => {
    expect(matchesConflict(base, minutes(30))).toBe(false);
    expect(matchesConflict(base, minutes(-30))).toBe(false);
  });

  it("does not conflict for slots further apart", () => {
    expect(matchesConflict(base, minutes(45))).toBe(false);
  });
});

describe("conflictWindow", () => {
  it("returns the open ±30 minute bounds around the kickoff", () => {
    const { start, end } = conflictWindow(base);
    expect(start.getTime()).toBe(base.getTime() - MATCH_DURATION_MS);
    expect(end.getTime()).toBe(base.getTime() + MATCH_DURATION_MS);
  });
});
