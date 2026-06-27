import { describe, expect, it } from "vitest";
import { parseScore, resolveScorePair } from "./result-score";

describe("parseScore", () => {
  it("treats empty input as no score", () => {
    expect(parseScore("")).toEqual({ value: null });
    expect(parseScore("   ")).toEqual({ value: null });
  });

  it("parses a valid non-negative integer", () => {
    expect(parseScore("0")).toEqual({ value: 0 });
    expect(parseScore(" 3 ")).toEqual({ value: 3 });
    expect(parseScore("99")).toEqual({ value: 99 });
  });

  it("rejects non-integers and negatives", () => {
    expect(parseScore("-1").error).toBeDefined();
    expect(parseScore("1.5").error).toBeDefined();
    expect(parseScore("a").error).toBeDefined();
  });

  it("caps at 99", () => {
    expect(parseScore("100").error).toBeDefined();
  });
});

describe("resolveScorePair", () => {
  const both = "Rellena ambos.";

  it("accepts both empty", () => {
    const result = resolveScorePair("", "", both);
    expect(result.hasError).toBe(false);
    expect(result.homeValue).toBeNull();
    expect(result.awayValue).toBeNull();
  });

  it("accepts both filled", () => {
    const result = resolveScorePair("2", "1", both);
    expect(result.hasError).toBe(false);
    expect(result.homeValue).toBe(2);
    expect(result.awayValue).toBe(1);
  });

  it("rejects only one side filled with the both-required message", () => {
    const result = resolveScorePair("2", "", both);
    expect(result.hasError).toBe(true);
    expect(result.fieldErrors.home).toBe(both);
    expect(result.fieldErrors.away).toBe(both);
  });

  it("surfaces per-field parse errors", () => {
    const result = resolveScorePair("x", "1", both);
    expect(result.hasError).toBe(true);
    expect(result.fieldErrors.home).toBeDefined();
    expect(result.fieldErrors.away).toBeUndefined();
  });
});
