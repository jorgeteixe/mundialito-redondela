import { describe, expect, it } from "vitest";
import { bracketForCategory } from "./bracket";

describe("cadet knockout bracket", () => {
  it("pairs the top seed with the lowest seed and the middle seeds together", () => {
    const matches = bracketForCategory("cadet");
    const semifinal1 = matches.find((match) => match.code === "cadet-sf-1");
    const semifinal2 = matches.find((match) => match.code === "cadet-sf-2");

    expect(semifinal1).toMatchObject({
      home: { from: "rank", stage: "f2", pos: 1, rank: 1 },
      away: { from: "rank", stage: "f2", pos: 2, rank: 1 },
    });
    expect(semifinal2).toMatchObject({
      home: { from: "rank", stage: "f2", pos: 1, rank: 2 },
      away: { from: "rank", stage: "f2", pos: 1, rank: 3 },
    });
  });
});
