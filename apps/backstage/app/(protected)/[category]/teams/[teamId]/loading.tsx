import { Card, CardHeader, Skeleton } from "@mr/ui";

export default function TeamDetailLoading() {
  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <Skeleton className="h-5 w-56 max-w-full" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-20" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="ml-auto h-7 w-32" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} size="sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="size-7" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </main>
  );
}
