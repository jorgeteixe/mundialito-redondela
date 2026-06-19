import Link from "next/link";
import { RotateCcw, X } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mr/ui";
import {
  cancelVideoGenerationJob,
  retryFailedVideoGenerationJob,
} from "./actions";
import type { VideoJobSummary } from "./data";

const statusLabels = {
  queued: "En cola",
  running: "Generando",
  succeeded: "Completado",
  failed: "Error",
  cancelled: "Cancelado",
} as const;

function formatDate(date: string | null) {
  if (!date) return "Pendiente";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function JobStatusBadge({ status }: { status: VideoJobSummary["status"] }) {
  if (status === "succeeded") {
    return <Badge>Completado</Badge>;
  }

  if (status === "failed" || status === "cancelled") {
    return <Badge variant="destructive">{statusLabels[status]}</Badge>;
  }

  return <Badge variant="secondary">{statusLabels[status]}</Badge>;
}

function JobActions({ job }: { job: VideoJobSummary }) {
  return (
    <div className="flex justify-end gap-2">
      {job.status === "succeeded" && job.outputPath ? (
        <Button asChild variant="outline" size="sm">
          <Link href={job.outputPath}>Descargar</Link>
        </Button>
      ) : null}
      {job.status === "failed" ? (
        <form action={retryFailedVideoGenerationJob}>
          <input type="hidden" name="id" value={job.id} />
          <Button variant="outline" size="icon-sm" aria-label="Reintentar">
            <RotateCcw />
          </Button>
        </form>
      ) : null}
      {job.status === "queued" ? (
        <form action={cancelVideoGenerationJob}>
          <input type="hidden" name="id" value={job.id} />
          <Button variant="outline" size="icon-sm" aria-label="Cancelar">
            <X />
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function JobMeta({ job }: { job: VideoJobSummary }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
      <span>{job.templateTitle}</span>
      <span>
        Intento {job.attempts}/{job.maxAttempts}
      </span>
      <span>{formatDate(job.createdAt)}</span>
    </div>
  );
}

export function VideoJobsList({ jobs }: { jobs: VideoJobSummary[] }) {
  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {jobs.map((job) => (
          <Card key={job.id} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-base">
                <span className="truncate">{job.templateTitle}</span>
                <JobStatusBadge status={job.status} />
              </CardTitle>
              <CardDescription>
                <JobMeta job={job} />
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {job.errorMessage ? (
                <p className="text-sm text-destructive">{job.errorMessage}</p>
              ) : null}
              <JobActions job={job} />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="hidden rounded-none border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vídeo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Intentos</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="w-32">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="flex max-w-sm flex-col gap-1">
                    <span className="font-medium">{job.templateTitle}</span>
                    {job.errorMessage ? (
                      <span className="line-clamp-2 text-xs text-destructive">
                        {job.errorMessage}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <JobStatusBadge status={job.status} />
                </TableCell>
                <TableCell>
                  {job.attempts}/{job.maxAttempts}
                </TableCell>
                <TableCell>{formatDate(job.createdAt)}</TableCell>
                <TableCell>
                  <JobActions job={job} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
