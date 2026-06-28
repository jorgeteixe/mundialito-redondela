import { describe, expect, it } from "vitest";
import { getMadridDateContext } from "./tools";

describe("getMadridDateContext", () => {
  it("returns today and tomorrow in Europe/Madrid", () => {
    const context = getMadridDateContext(new Date("2026-06-28T10:42:00.000Z"));

    expect(context).toEqual({
      timezone: "Europe/Madrid",
      today: "2026-06-28",
      todayLabel: "domingo 28 de junio",
      tomorrow: "2026-06-29",
      tomorrowLabel: "lunes 29 de junio",
      upcomingDays: expect.arrayContaining([
        { day: "2026-06-28", label: "domingo 28 de junio" },
        { day: "2026-06-29", label: "lunes 29 de junio" },
        { day: "2026-06-30", label: "martes 30 de junio" },
      ]),
    });
    expect(context.upcomingDays).toHaveLength(14);
  });

  it("uses Madrid date at the UTC day boundary", () => {
    const context = getMadridDateContext(new Date("2026-06-28T22:30:00.000Z"));

    expect(context.today).toBe("2026-06-29");
    expect(context.todayLabel).toBe("lunes 29 de junio");
  });
});
