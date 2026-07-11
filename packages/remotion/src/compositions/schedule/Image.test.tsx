import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ScheduleImage } from "./Image";

vi.mock("../../components/TeamAvatar", () => ({
  TeamAvatar: ({ name }: { name: string }) => <span>{name}</span>,
}));

describe("ScheduleImage", () => {
  it("renders all 6 matches in the square post variant", () => {
    const html = renderToStaticMarkup(
      <ScheduleImage
        date="Lunes 29 de junio"
        matches={[
          {
            time: "10:00",
            home: "Equipo 1",
            away: "Rival 1",
            category: "senior",
            categoryLabel: "Senior",
            group: "Grupo A",
          },
          {
            time: "11:00",
            home: "Equipo 2",
            away: "Rival 2",
            category: "cadet",
            categoryLabel: "Cadete",
            group: "Grupo B",
          },
          {
            time: "12:00",
            home: "Equipo 3",
            away: "Rival 3",
            category: "senior",
            categoryLabel: "Senior",
            group: "Grupo C",
          },
          {
            time: "13:00",
            home: "Equipo 4",
            away: "Rival 4",
            category: "cadet",
            categoryLabel: "Cadete",
            group: "Grupo D",
          },
          {
            time: "14:00",
            home: "Equipo 5",
            away: "Rival 5",
            category: "senior",
            categoryLabel: "Senior",
            group: "Grupo E",
          },
          {
            time: "15:00",
            home: "Equipo 6",
            away: "Rival 6",
            category: "cadet",
            categoryLabel: "Cadete",
            group: "Grupo F",
          },
        ]}
      />,
    );

    expect(html).toContain("Equipo 6");
    expect(html).toContain("Rival 6");
    expect(html).toContain("15:00");
    expect(html).toContain("6 partidos");
    expect(html).not.toContain("+1 partido");
  });
});
