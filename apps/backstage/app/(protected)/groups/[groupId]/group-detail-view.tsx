"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Plus, Trash2, UserRoundPlus } from "lucide-react";
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
import { AddTeamForm } from "../add-team-form";
import { deleteGroup, removeTeamFromGroup } from "../actions";
import { groupAvatarStyle } from "../avatar-utils";
import { GroupForm } from "../group-form";
import {
  categoryLabel,
  initials,
  teamAvatarUrl,
} from "../../teams/avatar-utils";
import type { GroupDetail, GroupTeamSummary } from "../data";

type GroupDetailViewProps = {
  group: GroupDetail;
  availableTeams: GroupTeamSummary[];
  canWrite: boolean;
};

export function GroupDetailView({
  group,
  availableTeams,
  canWrite,
}: GroupDetailViewProps) {
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [addTeamOpen, setAddTeamOpen] = useState(false);

  return (
    <Tabs defaultValue="teams" className="gap-4">
      <header className="-mx-4 border-b border-border px-4 sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <GroupAvatar group={group} />
            <div className="min-w-0">
              <h1 className="truncate font-heading text-xl font-medium">
                {group.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <Badge variant="secondary">
                  {categoryLabel(group.category)}
                </Badge>
                <span>{group.teams.length} equipos</span>
              </div>
            </div>
          </div>
          {canWrite ? (
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Sheet open={editGroupOpen} onOpenChange={setEditGroupOpen}>
                <SheetTriggerButton label="Editar" icon={<Pencil />} />
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Editar grupo</SheetTitle>
                    <SheetDescription>
                      Actualiza los datos del grupo.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="px-4">
                    <GroupForm
                      mode="edit"
                      group={group}
                      onSuccess={() => setEditGroupOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <DeleteGroupButton group={group} />
            </div>
          ) : null}
        </div>
        <TabsList
          variant="line"
          className="h-12 w-full justify-start gap-8 p-0"
        >
          <TabsTrigger value="teams" className="flex-none">
            Equipos
          </TabsTrigger>
          <TabsTrigger value="empty" className="flex-none">
            Vacío
          </TabsTrigger>
        </TabsList>
      </header>

      <TabsContent value="teams" className="flex flex-col gap-4 text-sm">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-medium">Equipos</h2>
            <p className="text-xs text-muted-foreground">
              Equipos registrados en este grupo.
            </p>
          </div>
          {canWrite ? (
            <Sheet open={addTeamOpen} onOpenChange={setAddTeamOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="ml-auto">
                  <Plus />
                  Añadir equipo
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Añadir equipo</SheetTitle>
                  <SheetDescription>
                    Selecciona un equipo sin grupo para {group.name}.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4">
                  <AddTeamForm
                    groupId={group.id}
                    groupCategory={group.category}
                    teams={availableTeams}
                    onSuccess={() => setAddTeamOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>

        {group.teams.length === 0 ? (
          <EmptyState
            icon={<UserRoundPlus className="h-10 w-10" />}
            title="Sin equipos registrados"
            description="Añade el primer equipo para completar el grupo."
            action={
              canWrite ? (
                <Button size="sm" onClick={() => setAddTeamOpen(true)}>
                  <Plus />
                  Añadir equipo
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.teams.map((team) => (
              <GroupTeamCard
                key={team.id}
                team={team}
                groupId={group.id}
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

function GroupAvatar({ group }: { group: GroupDetail }) {
  return (
    <Avatar size="lg" className="flex-none">
      <AvatarFallback
        className="border font-medium"
        style={groupAvatarStyle(group.id)}
      >
        {group.avatarLabel}
      </AvatarFallback>
    </Avatar>
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

function DeleteGroupButton({ group }: { group: GroupDetail }) {
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
          <AlertDialogTitle>Eliminar grupo</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará “{group.name}”. Sus equipos quedarán sin grupo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={deleteGroup}>
            <input type="hidden" name="id" value={group.id} />
            <input type="hidden" name="redirectTo" value="/groups" />
            <AlertDialogAction type="submit" variant="destructive">
              Eliminar grupo
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function GroupTeamCard({
  team,
  groupId,
  canWrite,
}: {
  team: GroupTeamSummary;
  groupId: string;
  canWrite: boolean;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarImage
              src={teamAvatarUrl(team.id)}
              alt={`Avatar de ${team.name}`}
            />
            <AvatarFallback>{initials(team.name)}</AvatarFallback>
          </Avatar>
          <Link href={`/teams/${team.id}`} className="truncate hover:underline">
            {team.name}
          </Link>
        </CardTitle>
        <CardDescription>
          <Badge variant="secondary">{categoryLabel(team.category)}</Badge>
        </CardDescription>
        {canWrite ? (
          <CardAction>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Quitar equipo"
                >
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Quitar equipo</AlertDialogTitle>
                  <AlertDialogDescription>
                    “{team.name}” quedará sin grupo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <form action={removeTeamFromGroup}>
                    <input type="hidden" name="groupId" value={groupId} />
                    <input type="hidden" name="teamId" value={team.id} />
                    <AlertDialogAction type="submit" variant="destructive">
                      Quitar equipo
                    </AlertDialogAction>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardAction>
        ) : null}
      </CardHeader>
    </Card>
  );
}
