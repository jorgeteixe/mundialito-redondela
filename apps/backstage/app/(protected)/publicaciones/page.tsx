import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { listMediaOptions, listMediaTemplates, listPublications } from "./data";
import { PublicationQueueRefresh } from "./publication-queue-refresh";
import { PublicacionesList } from "./publicaciones-list";

export default async function PublicacionesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [publications, mediaOptions] = await Promise.all([
    listPublications(),
    listMediaOptions(),
  ]);
  const templates = listMediaTemplates();
  const hasActivePublications = publications.some(
    (publication) =>
      publication.mediaPending ||
      publication.targets.some(
        (target) =>
          target.status === "scheduled" || target.status === "publishing",
      ),
  );

  return (
    <>
      <PublicationQueueRefresh enabled={hasActivePublications} />
      <PublicacionesList
        publications={publications}
        mediaOptions={mediaOptions}
        templates={templates}
      />
    </>
  );
}
