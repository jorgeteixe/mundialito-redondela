import { describe, expect, it } from "vitest";

import {
  findScheduleConflicts,
  isDateOnly,
  parseArgs,
} from "./reschedule-matches";

describe("parseArgs", () => {
  it("defaults to preview mode and the tournament timezone", () => {
    expect(parseArgs(["--from", "2026-07-14", "--to", "2026-07-17"])).toEqual({
      from: "2026-07-14",
      to: "2026-07-17",
      apply: false,
      timeZone: "Europe/Madrid",
    });
  });

  it("accepts apply mode", () => {
    expect(
      parseArgs(["--from", "2026-07-14", "--to", "2026-07-17", "--apply"])
        .apply,
    ).toBe(true);
  });

  it("rejects missing and invalid dates", () => {
    expect(() => parseArgs(["--from", "2026-07-14"])).toThrow();
    expect(() =>
      parseArgs(["--from", "2026-02-30", "--to", "2026-07-17"]),
    ).toThrow();
  });
});

describe("isDateOnly", () => {
  it("validates calendar dates", () => {
    expect(isDateOnly("2028-02-29")).toBe(true);
    expect(isDateOnly("2026-02-29")).toBe(false);
    expect(isDateOnly("14-07-2026")).toBe(false);
  });
});

describe("findScheduleConflicts", () => {
  const moved = {
    id: "moved",
    code: "S-FINAL",
    category: "senior",
    scheduledAt: new Date("2026-07-14T18:00:00.000Z"),
    rescheduledAt: new Date("2026-07-17T18:00:00.000Z"),
  };

  it("finds overlapping destination slots", () => {
    expect(
      findScheduleConflicts(
        [moved],
        [
          {
            id: "existing",
            scheduledAt: new Date("2026-07-17T18:15:00.000Z"),
          },
        ],
      ),
    ).toHaveLength(1);
  });

  it("allows back-to-back slots", () => {
    expect(
      findScheduleConflicts(
        [moved],
        [
          {
            id: "existing",
            scheduledAt: new Date("2026-07-17T18:30:00.000Z"),
          },
        ],
      ),
    ).toHaveLength(0);
  });
});
