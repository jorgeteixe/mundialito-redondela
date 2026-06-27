import { Skeleton } from "@mr/ui";

export default function EliminatoriasLoading() {
  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </main>
  );
}
