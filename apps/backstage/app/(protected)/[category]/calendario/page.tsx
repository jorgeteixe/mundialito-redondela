import { requireSession } from "@/lib/authz";
import { parseCategoryParam } from "@/lib/category.server";
import { categoryLabel } from "../teams/avatar-utils";
import { CalendarView } from "../../calendario/calendar-view";
import { groupByDay } from "../../calendario/calendar-format";
import { listScheduledMatches } from "../../calendario/data";

export default async function CategoryCalendarPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  await requireSession();
  const category = parseCategoryParam((await params).category);
  const days = groupByDay(await listScheduledMatches(category));

  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="font-heading text-xl font-medium">
          Calendario · {categoryLabel(category)}
        </h1>
        <p className="text-xs text-muted-foreground">
          Partidos programados de la categoría {categoryLabel(category)}.
        </p>
      </div>
      <CalendarView days={days} showCategory={false} />
    </main>
  );
}
