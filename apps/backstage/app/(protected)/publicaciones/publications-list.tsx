"use client";

import {
  Clock,
  ExternalLink,
  Eye,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Badge,
  badgeVariants,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mr/ui";
import type { SocialPlatform, SocialPostTargetStatus } from "@mr/db";
import { PlatformIcon } from "@/app/components/social-icons";
import { retryPublicationTarget } from "./actions";
import type { PublicationSummary, PublicationTargetSummary } from "./data";

const postTypeLabels = {
  feed: "Feed",
  reel: "Reel",
  story: "Story",
} as const;

const statusLabels: Record<SocialPostTargetStatus, string> = {
  scheduled: "Programado",
  publishing: "Publicando",
  published: "Publicado",
  failed: "Error",
  cancelled: "Cancelado",
};

const platformNames: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Facebook permalinks can come back relative; make them absolute.
function externalHref(permalink: string | null) {
  if (!permalink) return null;
  if (permalink.startsWith("/")) return `https://www.facebook.com${permalink}`;
  return permalink;
}

function TargetBadge({
  target,
  mediaPending,
}: {
  target: PublicationTargetSummary;
  mediaPending: boolean;
}) {
  const showPending = mediaPending && target.status === "scheduled";
  const label = showPending ? "Esperando render" : statusLabels[target.status];
  const variant =
    target.status === "published"
      ? "default"
      : target.status === "failed" || target.status === "cancelled"
        ? "destructive"
        : "secondary";

  const href =
    target.status === "published" ? externalHref(target.permalink) : null;

  const content = (
    <>
      <PlatformIcon platform={target.platform} className="size-3.5" />
      {label}
      {href ? <ExternalLink className="size-3 opacity-80" /> : null}
    </>
  );

  // When published with a permalink, the whole badge is the link to the post.
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(
          badgeVariants({ variant }),
          "gap-1 transition-opacity hover:opacity-80",
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <Badge variant={variant} className="gap-1">
      {content}
    </Badge>
  );
}

function TargetBadges({ publication }: { publication: PublicationSummary }) {
  return (
    <div className="flex flex-wrap gap-2">
      {publication.targets.map((target) => (
        <TargetBadge
          key={target.id}
          target={target}
          mediaPending={publication.mediaPending}
        />
      ))}
    </div>
  );
}

function MediaPreviewDialog({
  publication,
}: {
  publication: PublicationSummary;
}) {
  if (!publication.mediaUrl) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
          Ver
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {postTypeLabels[publication.postType]}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {publication.caption || "Sin texto"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {publication.mediaKind === "video" ? (
          <video
            src={publication.mediaUrl}
            controls
            preload="metadata"
            className="aspect-[9/16] max-h-[70vh] w-full rounded-md bg-muted object-contain"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={publication.mediaUrl}
            alt={publication.caption || "Media"}
            className="max-h-[70vh] w-full rounded-md bg-muted object-contain"
          />
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cerrar</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ActionsMenu({ publication }: { publication: PublicationSummary }) {
  const failedTargets = publication.targets.filter(
    (target) => target.status === "failed",
  );

  if (failedTargets.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Acciones">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {failedTargets.map((target) => (
          <form key={target.id} action={retryPublicationTarget}>
            <input type="hidden" name="id" value={target.id} />
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full cursor-pointer">
                <RotateCcw />
                Reintentar {platformNames[target.platform]}
              </button>
            </DropdownMenuItem>
          </form>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RowActions({ publication }: { publication: PublicationSummary }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <MediaPreviewDialog publication={publication} />
      <ActionsMenu publication={publication} />
    </div>
  );
}

export function PublicationsList({
  publications,
}: {
  publications: PublicationSummary[];
}) {
  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {publications.map((publication) => (
          <Card key={publication.id} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-base">
                <span className="flex min-w-0 items-center gap-2">
                  <Badge variant="outline">
                    {postTypeLabels[publication.postType]}
                  </Badge>
                  <span className="truncate">
                    {publication.caption || "Sin texto"}
                  </span>
                </span>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(publication.scheduledAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <TargetBadges publication={publication} />
              <RowActions publication={publication} />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="hidden rounded-none border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Publicación</TableHead>
              <TableHead>Plataformas</TableHead>
              <TableHead>Programado</TableHead>
              <TableHead className="w-32">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publications.map((publication) => (
              <TableRow key={publication.id}>
                <TableCell>
                  <div className="flex max-w-sm items-center gap-2">
                    <Badge variant="outline">
                      {postTypeLabels[publication.postType]}
                    </Badge>
                    <span className="truncate">
                      {publication.caption || "Sin texto"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <TargetBadges publication={publication} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatDate(publication.scheduledAt)}
                </TableCell>
                <TableCell>
                  <RowActions publication={publication} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
