"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { DashboardPage, EmptyState } from "@mr/ui";
import { CreatePublicationSheet } from "./create-publication-sheet";
import type {
  MediaOption,
  MediaTemplateSummary,
  PublicationSummary,
} from "./data";
import { PublicationsList } from "./publications-list";

type PublicacionesListProps = {
  publications: PublicationSummary[];
  mediaOptions: MediaOption[];
  templates: MediaTemplateSummary[];
  canWrite: boolean;
};

export function PublicacionesList({
  publications,
  mediaOptions,
  templates,
  canWrite,
}: PublicacionesListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return publications;
    return publications.filter(
      (publication) =>
        publication.caption.toLowerCase().includes(query) ||
        publication.postType.toLowerCase().includes(query) ||
        publication.targets.some((target) =>
          target.platform.toLowerCase().includes(query),
        ),
    );
  }, [publications, search]);

  const isSearching = search.trim().length > 0;
  const isEmpty = publications.length === 0 || filtered.length === 0;

  const createSheet = canWrite ? (
    <CreatePublicationSheet mediaOptions={mediaOptions} templates={templates} />
  ) : null;

  return (
    <DashboardPage
      searchPlaceholder="Buscar publicaciones..."
      onSearchChange={setSearch}
      actions={createSheet}
      isEmpty={isEmpty}
      emptyState={
        isSearching ? (
          <EmptyState
            icon={<Send className="h-10 w-10" />}
            title="Sin resultados"
            description={`No se encontraron publicaciones para "${search}".`}
          />
        ) : (
          <EmptyState
            icon={<Send className="h-10 w-10" />}
            title="Sin publicaciones"
            description="Programa la primera publicación para Instagram o Facebook."
            action={createSheet ?? undefined}
          />
        )
      }
    >
      <PublicationsList publications={filtered} canWrite={canWrite} />
    </DashboardPage>
  );
}
