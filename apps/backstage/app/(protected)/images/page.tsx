import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listImageJobs, listImageTemplates } from "./data";
import { ImagesList } from "./images-list";
import { ImageQueueRefresh } from "./image-queue-refresh";

export default async function ImagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

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
      <ImagesList templates={templates} jobs={jobs} />
    </>
  );
}
