"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, UsersRound } from "lucide-react";
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
import { deleteGroup } from "./actions";
import { groupAvatarStyle } from "./avatar-utils";
import { GroupForm } from "./group-form";
import type { GroupSummary } from "./data";
import { categoryLabel } from "../teams/avatar-utils";

type GroupsListProps = {
  groups: GroupSummary[];
};

export function GroupsList({ groups }: GroupsListProps) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return groups;

    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.avatarLabel.toLowerCase().includes(query) ||
        categoryLabel(group.category).toLowerCase().includes(query),
    );
  }, [groups, search]);

  const isSearching = search.trim().length > 0;
  const isEmpty = groups.length === 0 || filteredGroups.length === 0;

  return (
    <DashboardPage
      searchPlaceholder="Buscar grupos..."
      onSearchChange={setSearch}
      actions={
        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Registrar grupo
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Registrar grupo</SheetTitle>
              <SheetDescription>
                Crea un grupo para organizar equipos.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4">
              <GroupForm mode="create" onSuccess={() => setCreateOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      }
      isEmpty={isEmpty}
      emptyState={
        isSearching ? (
          <EmptyState
            icon={<UsersRound className="h-10 w-10" />}
            title="Sin resultados"
            description={`No se encontraron grupos para "${search}".`}
          />
        ) : (
          <EmptyState
            icon={<UsersRound className="h-10 w-10" />}
            title="Sin grupos registrados"
            description="Añade el primer grupo para comenzar."
            action={
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Registrar grupo
              </Button>
            }
          />
        )
      }
    >
      <div className="flex flex-col gap-3 md:hidden">
        {filteredGroups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
      <div className="hidden rounded-none border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grupo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Equipos</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>
                  <Link
                    href={`/groups/${group.id}`}
                    className="inline-flex max-w-full min-w-0 items-center gap-3 font-medium hover:underline"
                  >
                    <GroupAvatar group={group} />
                    <span className="truncate">{group.name}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {categoryLabel(group.category)}
                  </Badge>
                </TableCell>
                <TableCell>{group.teamCount}</TableCell>
                <TableCell>
                  <GroupActions group={group} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardPage>
  );
}

function GroupCard({ group }: { group: GroupSummary }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>
          <Link
            href={`/groups/${group.id}`}
            className="flex min-w-0 items-center gap-3 hover:underline"
          >
            <GroupAvatar group={group} />
            <span className="truncate">{group.name}</span>
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="secondary">{categoryLabel(group.category)}</Badge>
          <span>{group.teamCount} equipos</span>
        </CardDescription>
        <CardAction>
          <GroupActions group={group} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={`/groups/${group.id}`}>Gestionar equipos</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function GroupAvatar({ group }: { group: GroupSummary }) {
  return (
    <Avatar>
      <AvatarFallback
        className="border font-medium"
        style={groupAvatarStyle(group.id)}
      >
        {group.avatarLabel}
      </AvatarFallback>
    </Avatar>
  );
}

function GroupActions({ group }: { group: GroupSummary }) {
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
            <SheetTitle>Editar grupo</SheetTitle>
            <SheetDescription>Actualiza los datos del grupo.</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <GroupForm
              mode="edit"
              group={group}
              onSuccess={() => setEditOpen(false)}
            />
          </div>
        </SheetContent>
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
              <AlertDialogAction type="submit" variant="destructive">
                Eliminar grupo
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
