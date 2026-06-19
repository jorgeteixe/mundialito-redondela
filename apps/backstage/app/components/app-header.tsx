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

const segmentLabels: Record<string, string> = {
  teams: "Equipos",
  videos: "Vídeos",
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
  const [teamLabels, setTeamLabels] = useState<Record<string, string>>({});

  useEffect(() => {
    const teamId = segments.find(isUuid);
    if (!teamId || teamLabels[teamId]) return;

    let cancelled = false;

    fetch(`/api/teams/${teamId}`)
      .then((response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ name: string }>;
      })
      .then((data) => {
        if (!cancelled && data?.name) {
          setTeamLabels((current) => ({ ...current, [teamId]: data.name }));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [segments, teamLabels]);

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
            return (
              <Fragment key={`${segment}-${index}`}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>
                      {isUuid(segment) && !teamLabels[segment] ? (
                        <Skeleton
                          className="h-4 w-28"
                          aria-label="Cargando equipo"
                        />
                      ) : isUuid(segment) ? (
                        teamLabels[segment]
                      ) : (
                        label(segment)
                      )}
                    </BreadcrumbPage>
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
