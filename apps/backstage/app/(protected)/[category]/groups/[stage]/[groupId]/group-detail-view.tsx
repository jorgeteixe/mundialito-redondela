"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CalendarPlus,
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
  Button,
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  CategoryBadge,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mr/ui";
import { AddTeamForm } from "../../add-team-form";
import {
  deleteGroup,
  deleteGroupMatch,
  removeTeamFromGroup,
} from "../../actions";
import { groupAvatarStyle } from "../../avatar-utils";
import { GroupForm } from "../../group-form";
import { ScheduleMatchForm } from "../../schedule-match-form";
import { initials, teamAvatarUrl } from "../../../teams/avatar-utils";
import type {
  GroupDetail,
  GroupMatchSummary,
  GroupTeamSummary,
} from "../../data";
import type { Category } from "@/lib/category";
import { groupStageLabel } from "@/lib/group-stage";

type GroupDetailViewProps = {
  group: GroupDetail;
  category: Category;
  availableTeams: GroupTeamSummary[];
  canWrite: boolean;
};

export function GroupDetailView({
  group,
  category,
  availableTeams,
  canWrite,
}: GroupDetailViewProps) {
  const [editGroupOpen, setEditGroupOpen] = useState(false);
  const [addTeamOpen, setAddTeamOpen] = useState(false);
  const [scheduleMatchOpen, setScheduleMatchOpen] = useState(false);

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
                <CategoryBadge category={group.category} />
                <span>{group.teams.length} equipos</span>
                <span>{groupStageLabel(group.stage)}</span>
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
                      category={category}
                      stage={group.stage}
                      onSuccess={() => setEditGroupOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <DeleteGroupButton group={group} category={category} />
            </div>
          ) : null}
        </div>
        <TabsList
          variant="line"
          className="h-12 w-full justify-start gap-5 p-0"
        >
          <TabsTrigger value="teams" className="flex-none">
            Equipos
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex-none">
            Calendario
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex-none">
            Clasificación
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
                category={category}
                canWrite={canWrite}
              />
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="schedule" className="flex flex-col gap-4 text-sm">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-medium">Calendario</h2>
            <p className="text-xs text-muted-foreground">
              Partidos programados para este grupo.
            </p>
          </div>
          {canWrite ? (
            <Sheet open={scheduleMatchOpen} onOpenChange={setScheduleMatchOpen}>
              <SheetTrigger asChild>
                <Button size="sm" className="ml-auto">
                  <CalendarPlus />
                  Programar partido
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Programar partido</SheetTitle>
                  <SheetDescription>
                    Selecciona dos equipos de {group.name} y una fecha.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4">
                  <ScheduleMatchForm
                    groupId={group.id}
                    teams={group.teams}
                    onSuccess={() => setScheduleMatchOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>
        {group.matches.length === 0 ? (
          <EmptyState
            icon={<CalendarPlus className="h-10 w-10" />}
            title="Sin partidos programados"
            description="Programa el primer partido del grupo."
            action={
              canWrite ? (
                <Button size="sm" onClick={() => setScheduleMatchOpen(true)}>
                  <CalendarPlus />
                  Programar partido
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 md:hidden">
              {group.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  groupId={group.id}
                  match={match}
                  teams={group.teams}
                  canWrite={canWrite}
                />
              ))}
            </div>
            <div className="hidden rounded-none border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Visitante</TableHead>
                    {canWrite ? (
                      <TableHead className="w-12">
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.matches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>
                        {formatMatchDate(match.scheduledAt)}
                      </TableCell>
                      <TableCell>{match.homeTeamName}</TableCell>
                      <TableCell>{formatScore(match)}</TableCell>
                      <TableCell>{match.awayTeamName}</TableCell>
                      {canWrite ? (
                        <TableCell>
                          <MatchActions
                            groupId={group.id}
                            match={match}
                            teams={group.teams}
                          />
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </TabsContent>
      <TabsContent value="standings" className="flex flex-col gap-4 text-sm">
        <div>
          <h2 className="text-sm font-medium">Clasificación</h2>
          <p className="text-xs text-muted-foreground">
            Calculada con partidos finalizados de este grupo.
          </p>
        </div>
        {group.standings.length === 0 ? (
          <EmptyState
            icon={<UserRoundPlus className="h-10 w-10" />}
            title="Sin equipos"
            description="Añade equipos al grupo para ver la clasificación."
          />
        ) : (
          <div className="rounded-none border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipo</TableHead>
                  <TableHead className="text-right">PJ</TableHead>
                  <TableHead className="text-right">G</TableHead>
                  <TableHead className="text-right">E</TableHead>
                  <TableHead className="text-right">P</TableHead>
                  <TableHead className="text-right">GF</TableHead>
                  <TableHead className="text-right">GC</TableHead>
                  <TableHead className="text-right">DG</TableHead>
                  <TableHead className="text-right">Pts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.standings.map((row) => (
                  <TableRow key={row.teamId}>
                    <TableCell className="font-medium">
                      {row.teamName}
                    </TableCell>
                    <TableCell className="text-right">{row.played}</TableCell>
                    <TableCell className="text-right">{row.wins}</TableCell>
                    <TableCell className="text-right">{row.draws}</TableCell>
                    <TableCell className="text-right">{row.losses}</TableCell>
                    <TableCell className="text-right">{row.goalsFor}</TableCell>
                    <TableCell className="text-right">
                      {row.goalsAgainst}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.goalDifference}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {row.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function MatchCard({
  groupId,
  match,
  teams,
  canWrite,
}: {
  groupId: string;
  match: GroupMatchSummary;
  teams: GroupTeamSummary[];
  canWrite: boolean;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{formatMatchDate(match.scheduledAt)}</CardTitle>
        <CardDescription>
          {match.homeTeamName} contra {match.awayTeamName} ·{" "}
          {formatScore(match)}
        </CardDescription>
        {canWrite ? (
          <CardAction>
            <MatchActions groupId={groupId} match={match} teams={teams} />
          </CardAction>
        ) : null}
      </CardHeader>
    </Card>
  );
}

function MatchActions({
  groupId,
  match,
  teams,
}: {
  groupId: string;
  match: GroupMatchSummary;
  teams: GroupTeamSummary[];
}) {
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
            <SheetTitle>Editar partido</SheetTitle>
            <SheetDescription>
              Actualiza equipos y fecha del partido.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <ScheduleMatchForm
              mode="edit"
              groupId={groupId}
              teams={teams}
              match={match}
              onSuccess={() => setEditOpen(false)}
            />
          </div>
        </SheetContent>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar partido</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminará el partido entre “${match.homeTeamName}” y “${match.awayTeamName}”.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <form action={deleteGroupMatch}>
              <input type="hidden" name="id" value={match.id} />
              <input type="hidden" name="groupId" value={groupId} />
              <AlertDialogAction type="submit" variant="destructive">
                Eliminar partido
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}

function formatMatchDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(value));
}

function formatScore(match: GroupMatchSummary) {
  if (match.homeScore == null || match.awayScore == null) {
    return match.status === "postponed" ? "Aplazado" : "-";
  }
  return `${match.homeScore}-${match.awayScore}`;
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

function DeleteGroupButton({
  group,
  category,
}: {
  group: GroupDetail;
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
          <AlertDialogTitle>Eliminar grupo</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará “{group.name}”. Sus equipos quedarán sin grupo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <form action={deleteGroup}>
            <input type="hidden" name="id" value={group.id} />
            <input
              type="hidden"
              name="redirectTo"
              value={`/${category}/groups/${group.stage}`}
            />
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
  category,
  canWrite,
}: {
  team: GroupTeamSummary;
  groupId: string;
  category: Category;
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
          <Link
            href={`/${category}/teams/${team.id}`}
            className="truncate hover:underline"
          >
            {team.name}
          </Link>
        </CardTitle>
        <CardDescription>
          <CategoryBadge category={team.category} />
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
