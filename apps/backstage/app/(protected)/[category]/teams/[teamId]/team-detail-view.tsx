"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
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
  CardDescription,
  CardHeader,
  CardTitle,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@mr/ui";
import { deletePlayer, deleteTeam } from "../actions";
import {
  categoryLabel,
  initials,
  playerAvatarUrl,
  teamAvatarUrl,
} from "../avatar-utils";
import { PlayerForm } from "../player-form";
import { TeamForm } from "../team-form";
import type { PlayerSummary, TeamDetail } from "../data";
import type { Category } from "@/lib/category";

type TeamDetailViewProps = {
  team: TeamDetail;
  category: Category;
  canWrite: boolean;
};

export function TeamDetailView({
  team,
  category,
  canWrite,
}: TeamDetailViewProps) {
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [createPlayerOpen, setCreatePlayerOpen] = useState(false);

  return (
    <Tabs defaultValue="players" className="gap-4">
      <header className="-mx-4 border-b border-border px-4 sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar size="lg" className="flex-none">
              <AvatarImage
                src={teamAvatarUrl(team.id)}
                alt={`Avatar de ${team.name}`}
              />
              <AvatarFallback>{initials(team.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate font-heading text-xl font-medium">
                {team.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="secondary">
                  {categoryLabel(team.category)}
                </Badge>
                <span className="leading-5">
                  {team.players.length} jugadores
                </span>
              </div>
            </div>
          </div>
          {canWrite ? (
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Sheet open={editTeamOpen} onOpenChange={setEditTeamOpen}>
                <SheetTriggerButton label="Editar" icon={<Pencil />} />
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Editar equipo</SheetTitle>
                    <SheetDescription>
                      Actualiza los datos del equipo.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-4">
                    <TeamForm
                      mode="edit"
                      team={team}
                      category={category}
                      onSuccess={() => setEditTeamOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <DeleteTeamButton team={team} category={category} />
            </div>
          ) : null}
        </div>
        <TabsList
          variant="line"
          className="h-12 w-full justify-start gap-5 p-0"
        >
          <TabsTrigger value="players" className="flex-none">
            Plantilla
          </TabsTrigger>
          <TabsTrigger value="empty" className="flex-none">
            Vacío
          </TabsTrigger>
        </TabsList>
      </header>

      <TabsContent value="players" className="flex flex-col gap-4 text-sm">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-medium">Plantilla</h2>
            <p className="text-xs text-muted-foreground">
              Jugadores registrados en este equipo.
            </p>
          </div>
          {canWrite ? (
            <Sheet open={createPlayerOpen} onOpenChange={setCreatePlayerOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="ml-auto">
                  <Plus />
                  Añadir jugador
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Añadir jugador</SheetTitle>
                  <SheetDescription>
                    Registra un jugador en {team.name}.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4">
                  <PlayerForm
                    mode="create"
                    teamId={team.id}
                    onSuccess={() => setCreatePlayerOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>

        {team.players.length === 0 ? (
          <EmptyState
            icon={<UserRoundPlus className="h-10 w-10" />}
            title="Sin jugadores registrados"
            description="Añade el primer jugador para completar la plantilla."
            action={
              canWrite ? (
                <Button size="sm" onClick={() => setCreatePlayerOpen(true)}>
                  <Plus />
                  Añadir jugador
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {team.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                teamId={team.id}
                canWrite={canWrite}
              />
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="empty" className="min-h-24" />
    </Tabs>
  );
}

function SheetTriggerButton({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <SheetTrigger asChild>
      <Button variant="outline" size="sm">
        {icon}
        {label}
      </Button>
    </SheetTrigger>
  );
}

function DeleteTeamButton({
  team,
  category,
}: {
  team: TeamDetail;
  category: Category;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar equipo</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará “{team.name}” y todos sus jugadores. Esta acción no se
            puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={deleteTeam}>
            <input type="hidden" name="id" value={team.id} />
            <input
              type="hidden"
              name="redirectTo"
              value={`/${category}/teams`}
            />
            <AlertDialogAction type="submit" variant="destructive">
              Eliminar equipo
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PlayerCard({
  player,
  teamId,
  canWrite,
}: {
  player: PlayerSummary;
  teamId: string;
  canWrite: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarImage
              src={playerAvatarUrl(player.id)}
              alt={`Avatar de ${player.name}`}
            />
            <AvatarFallback>{initials(player.name)}</AvatarFallback>
          </Avatar>
          <span className="truncate">{player.name}</span>
        </CardTitle>
        <CardDescription>Jugador</CardDescription>
        {canWrite ? (
          <CardAction>
            <Sheet open={editOpen} onOpenChange={setEditOpen}>
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Acciones"
                    >
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
                    <SheetTitle>Editar jugador</SheetTitle>
                    <SheetDescription>
                      Actualiza los datos del jugador.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-4">
                    <PlayerForm
                      mode="edit"
                      teamId={teamId}
                      player={player}
                      onSuccess={() => setEditOpen(false)}
                    />
                  </div>
                </SheetContent>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar jugador</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se eliminará “{player.name}” de la plantilla.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <form action={deletePlayer}>
                      <input type="hidden" name="id" value={player.id} />
                      <input type="hidden" name="teamId" value={teamId} />
                      <AlertDialogAction type="submit" variant="destructive">
                        Eliminar jugador
                      </AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Sheet>
          </CardAction>
        ) : null}
      </CardHeader>
    </Card>
  );
}
