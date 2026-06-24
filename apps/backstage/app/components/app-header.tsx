"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  SidebarTrigger,
  Skeleton,
} from "@mr/ui";
import { isCategory } from "@/lib/category";

const segmentLabels: Record<string, string> = {
  senior: "Senior",
  cadet: "Cadete",
  teams: "Equipos",
  groups: "Grupos",
  calendario: "Calendario",
  videos: "Vídeos",
  images: "Imágenes",
  publicaciones: "Publicaciones",
  users: "Usuarios",
};

const entityEndpoints: Record<
  string,
  { apiPath: string; loadingLabel: string }
> = {
  teams: { apiPath: "teams", loadingLabel: "Cargando equipo" },
  groups: { apiPath: "groups", loadingLabel: "Cargando grupo" },
};

function label(segment: string) {
  return segmentLabels[segment] ?? segment;
}

function isUuid(segment: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    segment,
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [entityLabels, setEntityLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    const entityIndex = segments.findIndex(isUuid);
    const entityId = segments[entityIndex];
    const entitySegment = segments[entityIndex - 1];
    const endpoint = entitySegment ? entityEndpoints[entitySegment] : undefined;
    const labelKey =
      entityId && entitySegment ? `${entitySegment}:${entityId}` : "";
    if (!entityId || !endpoint || entityLabels[labelKey]) return;

    let cancelled = false;

    fetch(`/api/${endpoint.apiPath}/${entityId}`)
      .then((response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ name: string }>;
      })
      .then((data) => {
        if (!cancelled && data?.name) {
          setEntityLabels((current) => ({ ...current, [labelKey]: data.name }));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [entityLabels, segments]);

  return (
    <header className="flex h-14 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="h-6 data-[orientation=vertical]:self-center"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {segments.map((segment, index) => {
            const isLast = index === segments.length - 1;
            const entitySegment = segments[index - 1];
            const labelKey = `${entitySegment}:${segment}`;
            const endpoint = entitySegment
              ? entityEndpoints[entitySegment]
              : undefined;
            return (
              <Fragment key={`${segment}-${index}`}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>
                      {isUuid(segment) && !entityLabels[labelKey] ? (
                        <Skeleton
                          className="h-4 w-28"
                          aria-label={endpoint?.loadingLabel ?? "Cargando"}
                        />
                      ) : isUuid(segment) ? (
                        entityLabels[labelKey]
                      ) : (
                        label(segment)
                      )}
                    </BreadcrumbPage>
                  ) : index === 0 && isCategory(segment) ? (
                    // The category segment has no landing page of its own, so
                    // it's shown as plain (non-clickable) context.
                    <span className="text-muted-foreground">
                      {label(segment)}
                    </span>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={`/${segments.slice(0, index + 1).join("/")}`}>
                        {label(segment)}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
