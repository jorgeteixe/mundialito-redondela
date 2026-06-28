import { describe, expect, it } from "vitest";
import { createResultApprovalCard } from "./approval";

describe("createResultApprovalCard", () => {
  it("renders result details and stable action ids", () => {
    const card = createResultApprovalCard("abc123", {
      matchId: "m1",
      homeName: "El Barrio F.S",
      awayName: "Chata F.S",
      homeScore: 2,
      awayScore: 1,
      category: "Cadete",
      dateLabel: "lunes 29 de junio",
      time: "20:00",
    });

    expect(card).toMatchObject({
      type: "card",
      children: [
        { type: "text", content: "📝 Resultado detectado" },
        { type: "text", content: "El Barrio F.S 2-1 Chata F.S" },
        { type: "text", content: "🏆 Cadete" },
        { type: "text", content: "📅 lunes 29 de junio · 20:00" },
        { type: "text", content: "Pulsa Aprobar para guardar." },
        {
          type: "actions",
          children: [
            { type: "button", id: "mr_result_ok:abc123", label: "Aprobar" },
            { type: "button", id: "mr_result_no:abc123", label: "Denegar" },
          ],
        },
      ],
    });
  });
});
