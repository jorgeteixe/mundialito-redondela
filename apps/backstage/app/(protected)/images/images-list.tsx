"use client";

import { useMemo, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { DashboardPage, EmptyState } from "@mr/ui";
import type { ImageJobSummary, ImageTemplateSummary } from "./data";
import { CreateImageSheet } from "./create-image-sheet";
import { ImageJobsList } from "./image-jobs-list";

type ImagesListProps = {
  jobs: ImageJobSummary[];
  templates: ImageTemplateSummary[];
  canWrite: boolean;
};

const statusLabels = {
  queued: "En cola",
  running: "Generando",
  succeeded: "Completado",
  failed: "Error",
  cancelled: "Cancelado",
} as const;

export function ImagesList({ jobs, templates, canWrite }: ImagesListProps) {
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
      searchPlaceholder="Buscar imágenes..."
      onSearchChange={setSearch}
      actions={canWrite ? <CreateImageSheet templates={templates} /> : null}
      isEmpty={isEmpty}
      emptyState={
        isSearching ? (
          <EmptyState
            icon={<ImageIcon className="h-10 w-10" />}
            title="Sin resultados"
            description={`No se encontraron imágenes para "${search}".`}
          />
        ) : (
          <EmptyState
            icon={<ImageIcon className="h-10 w-10" />}
            title="Sin imágenes en la cola"
            description="Añade la primera imagen para comenzar."
            action={
              canWrite ? <CreateImageSheet templates={templates} /> : undefined
            }
          />
        )
      }
    >
      <ImageJobsList jobs={filteredJobs} canWrite={canWrite} />
    </DashboardPage>
  );
}
