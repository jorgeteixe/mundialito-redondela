"use client";

import { useState } from "react";
import {
  CalendarPlus,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCcw,
  Trash2,
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
  Button,
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
import type { Category } from "@/lib/category";
import { EliminatoriaForm } from "./eliminatoria-form";
import { deleteEliminatoriaMatch, recalcBracket } from "./actions";
import type { EliminatoriaMatch, EliminatoriaTeam } from "./data";

type Props = {
  category: Category;
  matches: EliminatoriaMatch[];
  teams: EliminatoriaTeam[];
  canWrite: boolean;
};

export function EliminatoriasList({
  category,
  matches,
  teams,
  canWrite,
}: Props) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <DashboardPage
      actions={
        canWrite ? (
          <div className="flex items-center gap-2">
            <form action={recalcBracket}>
              <input type="hidden" name="category" value={category} />
              <Button type="submit" size="sm" variant="outline">
                <RefreshCcw />
                Recalcular cruces
              </Button>
            </form>
            <Sheet open={createOpen} onOpenChange={setCreateOpen}>
              <SheetTrigger asChild>
                <Button size="sm">
                  <Plus />
                  Programar partido
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Programar eliminatoria</SheetTitle>
                  <SheetDescription>
                    Añade semifinal, tercer puesto o final.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-4">
                  <EliminatoriaForm
                    category={category}
                    teams={teams}
                    onSuccess={() => setCreateOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : null
      }
      isEmpty={matches.length === 0}
      emptyState={
        <EmptyState
          icon={<CalendarPlus className="h-10 w-10" />}
          title="Sin eliminatorias"
          description="Programa semifinales y finales cuando toque."
          action={
            canWrite ? (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <CalendarPlus />
                Programar partido
              </Button>
            ) : undefined
          }
        />
      }
    >
      <div className="rounded-none border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Ronda</TableHead>
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
            {matches.map((match) => (
              <TableRow key={match.id}>
                <TableCell>{formatDate(match.scheduledAt)}</TableCell>
                <TableCell>{kindLabel(match.kind)}</TableCell>
                <TableCell>{match.homeTeamName}</TableCell>
                <TableCell>{formatScore(match)}</TableCell>
                <TableCell>{match.awayTeamName}</TableCell>
                {canWrite ? (
                  <TableCell>
                    <MatchActions
                      category={category}
                      match={match}
                      teams={teams}
                    />
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

function MatchActions({
  category,
  match,
  teams,
}: {
  category: Category;
  match: EliminatoriaMatch;
  teams: EliminatoriaTeam[];
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
            <SheetTitle>Editar eliminatoria</SheetTitle>
            <SheetDescription>
              Actualiza equipos, fecha y resultado.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <EliminatoriaForm
              mode="edit"
              category={category}
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
              Se eliminará este partido de eliminatorias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <form action={deleteEliminatoriaMatch}>
              <input type="hidden" name="id" value={match.id} />
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  }).format(new Date(value));
}

function kindLabel(kind: EliminatoriaMatch["kind"]) {
  if (kind === "third_place") return "3.º-4.º puesto";
  return kind === "semifinal" ? "Semifinal" : "Final";
}

function formatScore(match: EliminatoriaMatch) {
  if (match.homeScore == null || match.awayScore == null) {
    return "-";
  }
  const base = `${match.homeScore}-${match.awayScore}`;
  if (match.homePenalties != null && match.awayPenalties != null) {
    return `${base} (${match.homePenalties}-${match.awayPenalties})`;
  }
  return base;
}
