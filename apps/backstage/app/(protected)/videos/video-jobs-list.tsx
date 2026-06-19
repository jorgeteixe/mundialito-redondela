import Link from "next/link";
import { Download, Eye, RotateCcw, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
        <VideoPreviewDialog job={job} />
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

function JobResult({ job }: { job: VideoJobSummary }) {
  if (job.status === "succeeded") return <span>Listo para ver</span>;
  if (job.status === "queued") return <span>Pendiente de worker</span>;
  if (job.status === "running") return <span>Renderizando</span>;
  if (job.status === "cancelled") return <span>Cancelado</span>;

  return (
    <span className="line-clamp-2 text-destructive">
      {job.errorMessage ?? "No se pudo generar el vídeo."}
    </span>
  );
}

function VideoPreviewDialog({ job }: { job: VideoJobSummary }) {
  if (!job.outputPath) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
          Ver
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{job.templateTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            Vídeo generado el {formatDate(job.createdAt)}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <video
          src={job.outputPath}
          controls
          preload="metadata"
          className="aspect-[9/16] max-h-[70vh] w-full rounded-md bg-muted object-contain"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
          <Button asChild>
            <Link href={job.outputPath} download>
              <Download className="h-4 w-4" />
              Descargar
            </Link>
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function JobMeta({ job }: { job: VideoJobSummary }) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
      <span>{job.templateTitle}</span>
      <JobResult job={job} />
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
