import { describe, expect, it } from "vitest";
import { telegramToolDisplay } from "./agent";

describe("telegramToolDisplay", () => {
  it("renders approval buttons using Mastra action ids", () => {
    const result = telegramToolDisplay(
      {
        kind: "approval",
        toolCallId: "abc-123",
        toolName: "submitMatchResult",
        displayName: "submitMatchResult",
        argsSummary: "",
        args: {
          homeName: "El Barrio F.S",
          awayName: "Chata F.S",
          homeScore: 2,
          awayScore: 1,
          category: "Cadete",
          dateLabel: "lunes 29 de junio",
          time: "20:00",
        },
      },
      { mode: "static", platform: "telegram" },
    );

    expect(result?.kind).toBe("post");
    if (result?.kind !== "post" || typeof result.message === "string") {
      throw new Error("Expected a card approval message");
    }

    expect(result.message).toMatchObject({
      type: "card",
      children: [
        { type: "text", content: "📝 Confirmar resultado" },
        { type: "text", content: "El Barrio F.S 2-1 Chata F.S" },
        { type: "text", content: "Cadete · lunes 29 de junio · 20:00" },
        {
          type: "actions",
          children: [
            { type: "button", id: "tool_approve:abc-123", label: "Aprobar" },
            { type: "button", id: "tool_deny:abc-123", label: "Denegar" },
          ],
        },
      ],
    });
  });

  it("hides non-approval tool events", () => {
    const result = telegramToolDisplay(
      {
        kind: "running",
        toolCallId: "abc-123",
        toolName: "getSchedule",
        displayName: "getSchedule",
        argsSummary: "",
        args: {},
      },
      { mode: "static", platform: "telegram" },
    );

    expect(result).toBeUndefined();
  });
});
