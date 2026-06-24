import { requireSession } from "@/lib/authz";
import { CalendarView } from "./calendar-view";
import { groupByDay } from "./calendar-format";
import { listScheduledMatches } from "./data";

export default async function CalendarPage() {
  await requireSession();
  const days = groupByDay(await listScheduledMatches());

  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="font-heading text-xl font-medium">Calendario general</h1>
        <p className="text-xs text-muted-foreground">
          Todos los partidos programados, de todas las categorías.
        </p>
      </div>
      <CalendarView days={days} showCategory />
    </main>
  );
}
