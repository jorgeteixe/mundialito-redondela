import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mr/ui";
import { auth } from "@/lib/auth";
import { listVideoJobs, listVideoTemplates } from "./data";
import { VideoJobForm } from "./video-job-form";
import { VideoJobsList } from "./video-jobs-list";
import { VideoQueueRefresh } from "./video-queue-refresh";

export default async function VideosPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [templates, jobs] = await Promise.all([
    listVideoTemplates(),
    listVideoJobs(),
  ]);
  const hasActiveJobs = jobs.some(
    (job) => job.status === "queued" || job.status === "running",
  );

  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <VideoQueueRefresh enabled={hasActiveJobs} />
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Vídeos</h1>
        <p className="text-sm text-muted-foreground">
          Genera piezas con Remotion desde la cola de producción.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo vídeo</CardTitle>
            <CardDescription>
              El worker procesará el trabajo en segundo plano.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoJobForm templates={templates} />
          </CardContent>
        </Card>
        <section className="flex min-w-0 flex-col gap-3">
          <div>
            <h2 className="text-lg font-semibold">Cola</h2>
            <p className="text-sm text-muted-foreground">
              Últimos trabajos solicitados.
            </p>
          </div>
          <VideoJobsList jobs={jobs} />
        </section>
      </div>
    </main>
  );
}
