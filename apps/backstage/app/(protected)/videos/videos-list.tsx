"use client";

import { useMemo, useState } from "react";
import { Clapperboard } from "lucide-react";
import { DashboardPage, EmptyState } from "@mr/ui";
import type { VideoJobSummary, VideoTemplateSummary } from "./data";
import { CreateVideoSheet } from "./create-video-sheet";
import { VideoJobsList } from "./video-jobs-list";

type VideosListProps = {
  jobs: VideoJobSummary[];
  templates: VideoTemplateSummary[];
};

const statusLabels = {
  queued: "En cola",
  running: "Generando",
  succeeded: "Completado",
  failed: "Error",
  cancelled: "Cancelado",
} as const;

export function VideosList({ jobs, templates }: VideosListProps) {
  const [search, setSearch] = useState("");

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return jobs;

    return jobs.filter((job) => {
      return (
        job.templateTitle.toLowerCase().includes(query) ||
        statusLabels[job.status].toLowerCase().includes(query) ||
        job.id.toLowerCase().includes(query)
      );
    });
  }, [jobs, search]);

  const isSearching = search.trim().length > 0;
  const isEmpty = jobs.length === 0 || filteredJobs.length === 0;

  return (
    <DashboardPage
      searchPlaceholder="Buscar vídeos..."
      onSearchChange={setSearch}
      actions={<CreateVideoSheet templates={templates} />}
      isEmpty={isEmpty}
      emptyState={
        isSearching ? (
          <EmptyState
            icon={<Clapperboard className="h-10 w-10" />}
            title="Sin resultados"
            description={`No se encontraron vídeos para "${search}".`}
          />
        ) : (
          <EmptyState
            icon={<Clapperboard className="h-10 w-10" />}
            title="Sin vídeos en la cola"
            description="Añade el primer vídeo para comenzar."
            action={<CreateVideoSheet templates={templates} />}
          />
        )
      }
    >
      <VideoJobsList jobs={filteredJobs} />
    </DashboardPage>
  );
}
