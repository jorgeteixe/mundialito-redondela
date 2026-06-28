import { describe, expect, it } from "vitest";
import { validateResultInput } from "./apply-result";

const base = {
  homeScore: 2 as number | null,
  awayScore: 1 as number | null,
  homePenalties: null as number | null,
  awayPenalties: null as number | null,
};

describe("validateResultInput — scores", () => {
  it("accepts a plain group result", () => {
    expect(validateResultInput({ kind: "group", ...base }).ok).toBe(true);
  });

  it("accepts clearing a result (both scores empty)", () => {
    expect(
      validateResultInput({
        kind: "group",
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
      }).ok,
    ).toBe(true);
  });

  it("rejects a half-filled score", () => {
    const result = validateResultInput({
      kind: "group",
      ...base,
      awayScore: null,
    });
    expect(result).toMatchObject({ ok: false, code: "incomplete-score" });
  });

  it("rejects out-of-range or non-integer scores", () => {
    expect(
      validateResultInput({ kind: "group", ...base, homeScore: 100 }),
    ).toMatchObject({ ok: false, code: "invalid-score" });
    expect(
      validateResultInput({ kind: "group", ...base, homeScore: 1.5 }),
    ).toMatchObject({ ok: false, code: "invalid-score" });
    expect(
      validateResultInput({ kind: "group", ...base, awayScore: -1 }),
    ).toMatchObject({ ok: false, code: "invalid-score" });
  });
});

describe("validateResultInput — penalties", () => {
  it("forbids penalties on group matches", () => {
    const result = validateResultInput({
      kind: "group",
      homeScore: 1,
      awayScore: 1,
      homePenalties: 4,
      awayPenalties: 3,
    });
    expect(result).toMatchObject({
      ok: false,
      code: "penalties-not-allowed-group",
    });
  });

  it("allows penalties on a level knockout", () => {
    expect(
      validateResultInput({
        kind: "final",
        homeScore: 2,
        awayScore: 2,
        homePenalties: 4,
        awayPenalties: 3,
      }).ok,
    ).toBe(true);
  });

  it("rejects penalties on a decided knockout", () => {
    const result = validateResultInput({
      kind: "semifinal",
      homeScore: 3,
      awayScore: 1,
      homePenalties: 4,
      awayPenalties: 3,
    });
    expect(result).toMatchObject({ ok: false, code: "penalties-not-level" });
  });

  it("rejects half-filled penalties", () => {
    const result = validateResultInput({
      kind: "third_place",
      homeScore: 1,
      awayScore: 1,
      homePenalties: 4,
      awayPenalties: null,
    });
    expect(result).toMatchObject({ ok: false, code: "penalties-incomplete" });
  });

  it("allows a level knockout with no penalties yet (pending)", () => {
    expect(
      validateResultInput({
        kind: "final",
        homeScore: 1,
        awayScore: 1,
        homePenalties: null,
        awayPenalties: null,
      }).ok,
    ).toBe(true);
  });
});
