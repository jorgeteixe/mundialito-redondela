import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listVideoJobs, listVideoTemplates } from "./data";
import { VideosList } from "./videos-list";
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
    <>
      <VideoQueueRefresh enabled={hasActiveJobs} />
      <VideosList templates={templates} jobs={jobs} />
    </>
  );
}
