import { Skeleton } from "@mr/ui";

export default function ResultadosLoading() {
  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    </main>
  );
}
