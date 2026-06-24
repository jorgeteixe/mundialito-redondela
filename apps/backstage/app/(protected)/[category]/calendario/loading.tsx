import { ScheduleTableSkeleton, Skeleton } from "@mr/ui";

export default function CategoryCalendarLoading() {
  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <ScheduleTableSkeleton showCategory={false} />
    </main>
  );
}
