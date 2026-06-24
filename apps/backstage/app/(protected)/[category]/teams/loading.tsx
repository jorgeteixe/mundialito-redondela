import {
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mr/ui";

export default function TeamsLoading() {
  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-full max-w-sm" />
        <Skeleton className="ml-auto h-7 w-32" />
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} size="sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="size-7" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden rounded-none border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipo</TableHead>
              <TableHead>Jugadores</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="inline-flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="size-7" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
