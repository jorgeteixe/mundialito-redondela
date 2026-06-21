import { requireSession } from "@/lib/authz";
import { canWriteBackstage } from "@/lib/roles";
import { listImageJobs, listImageTemplates } from "./data";
import { ImagesList } from "./images-list";
import { ImageQueueRefresh } from "./image-queue-refresh";

export default async function ImagesPage() {
  const session = await requireSession();

  const [templates, jobs] = await Promise.all([
    listImageTemplates(),
    listImageJobs(),
  ]);
  const hasActiveJobs = jobs.some(
    (job) => job.status === "queued" || job.status === "running",
  );

  return (
    <>
      <ImageQueueRefresh enabled={hasActiveJobs} />
      <ImagesList
        templates={templates}
        jobs={jobs}
        canWrite={canWriteBackstage(session.user.role)}
      />
    </>
  );
}
