import { requireSession } from "@/lib/authz";
import { canWriteBackstage } from "@/lib/roles";
import { listVideoJobs, listVideoTemplates } from "./data";
import { VideosList } from "./videos-list";
import { VideoQueueRefresh } from "./video-queue-refresh";

export default async function VideosPage() {
  const session = await requireSession();

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
      <VideosList
        templates={templates}
        jobs={jobs}
        canWrite={canWriteBackstage(session.user.role)}
      />
    </>
  );
}
