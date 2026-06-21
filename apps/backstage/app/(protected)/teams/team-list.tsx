"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DashboardPage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mr/ui";
import { deleteTeam } from "./actions";
import { categoryLabel, initials, teamAvatarUrl } from "./avatar-utils";
import type { TeamSummary } from "./data";
import { TeamForm } from "./team-form";

type TeamsListProps = {
  teams: TeamSummary[];
  canWrite: boolean;
};

export function TeamsList({ teams, canWrite }: TeamsListProps) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return teams;

    return teams.filter((team) => {
      return (
        team.name.toLowerCase().includes(query) ||
        categoryLabel(team.category).toLowerCase().includes(query)
      );
    });
  }, [search, teams]);

  const isSearching = search.trim().length > 0;
  const isEmpty = teams.length === 0 || filteredTeams.length === 0;

  return (
    <DashboardPage
      searchPlaceholder="Buscar equipos..."
      onSearchChange={setSearch}
      actions={
        canWrite ? (
          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Registrar equipo
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Registrar equipo</SheetTitle>
                <SheetDescription>
                  Crea un equipo para gestionar su plantilla.
                </SheetDescription>
              </SheetHeader>
              <div className="px-4">
                <TeamForm
                  mode="create"
                  onSuccess={() => setCreateOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        ) : null
      }
      isEmpty={isEmpty}
      emptyState={
        isSearching ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="Sin resultados"
            description={`No se encontraron equipos para "${search}".`}
          />
        ) : (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title="Sin equipos registrados"
            description="Añade el primer equipo para comenzar."
            action={
              canWrite ? (
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Registrar equipo
                </Button>
              ) : undefined
            }
          />
        )
      }
    >
      <div className="flex flex-col gap-3 md:hidden">
        {filteredTeams.map((team) => (
          <TeamCard key={team.id} team={team} canWrite={canWrite} />
        ))}
      </div>
      <div className="hidden rounded-none border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Jugadores</TableHead>
              {canWrite ? (
                <TableHead className="w-12">
                  <span className="sr-only">Acciones</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>
                  <Link
                    href={`/teams/${team.id}`}
                    className="inline-flex max-w-full min-w-0 items-center gap-3 font-medium hover:underline"
                  >
                    <TeamAvatar team={team} />
                    <span className="truncate">{team.name}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {categoryLabel(team.category)}
                  </Badge>
                </TableCell>
                <TableCell>{team.playerCount}</TableCell>
                {canWrite ? (
                  <TableCell>
                    <TeamActions team={team} />
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardPage>
  );
}

function TeamCard({
  team,
  canWrite,
}: {
  team: TeamSummary;
  canWrite: boolean;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <Link
            href={`/teams/${team.id}`}
            className="flex min-w-0 items-center gap-3 hover:underline"
          >
            <TeamAvatar team={team} />
            <span className="truncate">{team.name}</span>
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="secondary">{categoryLabel(team.category)}</Badge>
          <span>{team.playerCount} jugadores</span>
        </CardDescription>
        {canWrite ? (
          <CardAction>
            <TeamActions team={team} />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/teams/${team.id}`}>Gestionar plantilla</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function TeamAvatar({ team }: { team: TeamSummary }) {
  return (
    <Avatar>
      <AvatarImage
        src={teamAvatarUrl(team.id)}
        alt={`Avatar de ${team.name}`}
      />
      <AvatarFallback>{initials(team.name)}</AvatarFallback>
    </Avatar>
  );
}

function TeamActions({ team }: { team: TeamSummary }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Sheet open={editOpen} onOpenChange={setEditOpen}>
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Acciones">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditOpen(true)}>
              <Pencil />
              Editar
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(event) => event.preventDefault()}
              >
                <Trash2 />
                Eliminar
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar equipo</SheetTitle>
            <SheetDescription>Actualiza los datos del equipo.</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <TeamForm
              mode="edit"
              team={team}
              onSuccess={() => setEditOpen(false)}
            />
          </div>
        </SheetContent>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar equipo</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará “{team.name}” y todos sus jugadores. Esta acción no
              se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <form action={deleteTeam}>
              <input type="hidden" name="id" value={team.id} />
              <AlertDialogAction type="submit" variant="destructive">
                Eliminar equipo
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
