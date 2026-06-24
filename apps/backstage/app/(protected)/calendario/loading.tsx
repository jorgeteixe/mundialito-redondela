import { ScheduleTableSkeleton } from "@mr/ui";

export default function CalendarLoading() {
  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="font-heading text-xl font-medium">Calendario general</h1>
        <p className="text-xs text-muted-foreground">
          Todos los partidos programados, de todas las categorías.
        </p>
      </div>
      <ScheduleTableSkeleton showCategory />
    </main>
  );
}
