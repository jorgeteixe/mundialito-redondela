"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyRound,
  Lock,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
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
  Badge,
  Button,
  DashboardPage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { backstageRoles, roleLabels, type BackstageRole } from "@/lib/roles";
import {
  createBackstageUser,
  deleteBackstageUser,
  resetBackstageUserPassword,
  updateBackstageUser,
  type UserFormState,
} from "./actions";
import type { BackstageUserSummary } from "./data";

const initialFormState: UserFormState = { status: "idle" };

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function useFormToast(state: UserFormState, onSuccess?: () => void) {
  const handledStateRef = useRef<UserFormState | null>(null);

  useEffect(() => {
    if (state.status === "idle") return;
    if (handledStateRef.current === state) return;
    handledStateRef.current = state;

    if (state.status === "success") {
      toast.success(state.message);
      onSuccess?.();
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [onSuccess, state]);
}

function RoleSelect({
  id,
  defaultValue,
}: {
  id: string;
  defaultValue: BackstageRole;
}) {
  return (
    <Select name="role" defaultValue={defaultValue} required>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder="Selecciona un rol" />
      </SelectTrigger>
      <SelectContent>
        {backstageRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {roleLabels[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CreateUserSheet() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createBackstageUser,
    initialFormState,
  );

  useFormToast(state, () => setOpen(false));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Crear usuario
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Crear usuario</SheetTitle>
          <SheetDescription>
            Crea una cuenta con contraseña directa.
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-user-name">Nombre</Label>
            <Input id="create-user-name" name="name" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-user-email">Correo electrónico</Label>
            <Input
              id="create-user-email"
              name="email"
              type="email"
              autoComplete="off"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-user-password">Contraseña</Label>
            <Input
              id="create-user-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="create-user-role">Rol</Label>
            <RoleSelect id="create-user-role" defaultValue="viewer" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Creando..." : "Crear usuario"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function EditUserForm({
  user,
  onSuccess,
}: {
  user: BackstageUserSummary;
  onSuccess: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    updateBackstageUser,
    initialFormState,
  );
  useFormToast(state, onSuccess);

  return (
    <form action={formAction} className="flex flex-col gap-4 px-4">
      <input type="hidden" name="userId" value={user.id} />
      <div className="flex flex-col gap-2">
        <Label htmlFor={`name-${user.id}`}>Nombre</Label>
        <Input
          id={`name-${user.id}`}
          name="name"
          defaultValue={user.name}
          autoComplete="off"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`email-${user.id}`}>Correo electrónico</Label>
        <Input
          id={`email-${user.id}`}
          name="email"
          type="email"
          defaultValue={user.email}
          autoComplete="off"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`role-${user.id}`}>Rol</Label>
        <RoleSelect id={`role-${user.id}`} defaultValue={user.role} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}

function PasswordForm({ user }: { user: BackstageUserSummary }) {
  const [state, formAction, pending] = useActionState(
    resetBackstageUserPassword,
    initialFormState,
  );
  useFormToast(state);

  return (
    <form action={formAction} className="flex flex-col gap-4 px-4">
      <input type="hidden" name="userId" value={user.id} />
      <div className="flex flex-col gap-2">
        <Label htmlFor={`password-${user.id}`}>Nueva contraseña</Label>
        <Input
          id={`password-${user.id}`}
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Cambiar contraseña"}
      </Button>
    </form>
  );
}

function UserActions({
  user,
  currentUserId,
}: {
  user: BackstageUserSummary;
  currentUserId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const isCurrentUser = user.id === currentUserId;

  return (
    <>
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Editar usuario</SheetTitle>
            <SheetDescription>{user.email}</SheetDescription>
          </SheetHeader>
          <EditUserForm user={user} onSuccess={() => setEditOpen(false)} />
        </SheetContent>
      </Sheet>
      <Sheet open={passwordOpen} onOpenChange={setPasswordOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Cambiar contraseña</SheetTitle>
            <SheetDescription>{user.email}</SheetDescription>
          </SheetHeader>
          <PasswordForm user={user} />
        </SheetContent>
      </Sheet>
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
            <DropdownMenuItem onSelect={() => setPasswordOpen(true)}>
              <KeyRound />
              Cambiar contraseña
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                disabled={isCurrentUser}
                variant="destructive"
                onSelect={(event) => event.preventDefault()}
              >
                {isCurrentUser ? <Lock /> : <Trash2 />}
                Eliminar
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará “{user.email}”. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <form action={deleteBackstageUser}>
              <input type="hidden" name="userId" value={user.id} />
              <AlertDialogAction type="submit" variant="destructive">
                Eliminar usuario
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function UsersList({
  users,
  currentUserId,
}: {
  users: BackstageUserSummary[];
  currentUserId: string;
}) {
  const [search, setSearch] = useState("");
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        roleLabels[user.role].toLowerCase().includes(query),
    );
  }, [search, users]);

  const isSearching = search.trim().length > 0;
  const isEmpty = users.length === 0 || filteredUsers.length === 0;

  return (
    <DashboardPage
      searchPlaceholder="Buscar usuarios..."
      onSearchChange={setSearch}
      actions={<CreateUserSheet />}
      isEmpty={isEmpty}
      emptyState={
        isSearching ? (
          <EmptyState
            icon={<UserCog className="h-10 w-10" />}
            title="Sin resultados"
            description={`No se encontraron usuarios para "${search}".`}
          />
        ) : (
          <EmptyState
            icon={<UserCog className="h-10 w-10" />}
            title="Sin usuarios"
            description="Crea el primer usuario del backstage."
            action={<CreateUserSheet />}
          />
        )
      }
    >
      <div className="rounded-none border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <span className="truncate font-medium">{user.name}</span>
                </TableCell>
                <TableCell>
                  <span className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{roleLabels[user.role]}</Badge>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <UserActions user={user} currentUserId={currentUserId} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardPage>
  );
}
