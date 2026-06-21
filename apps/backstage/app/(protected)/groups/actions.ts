"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "@mr/db";
import { requireAdminWrite } from "@/lib/authz";
import type { TeamCategory } from "../teams/data";

const { team, tournamentGroup } = schema;

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    name?: string;
    avatarLabel?: string;
    category?: string;
    groupId?: string;
    teamId?: string;
  };
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function validateName(formData: FormData) {
  const name = readString(formData, "name");

  if (!name) {
    return {
      name,
      error: "El nombre es obligatorio.",
    };
  }

  if (name.length > 120) {
    return {
      name,
      error: "El nombre debe tener 120 caracteres o menos.",
    };
  }

  return { name };
}

function parseCategory(value: string): TeamCategory | null {
  if (value === "senior" || value === "cadet") return value;
  return null;
}

function validateAvatarLabel(formData: FormData) {
  const avatarLabel = readString(formData, "avatarLabel").toUpperCase();

  if (!avatarLabel) {
    return {
      avatarLabel,
      error: "La letra o número es obligatorio.",
    };
  }

  if (!/^[A-Z0-9]$/.test(avatarLabel)) {
    return {
      avatarLabel,
      error: "Usa una sola letra o número.",
    };
  }

  return { avatarLabel };
}

export async function createGroup(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const nameResult = validateName(formData);
  const avatarResult = validateAvatarLabel(formData);
  const category = parseCategory(readString(formData, "category"));

  if (nameResult.error || avatarResult.error || !category) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        name: nameResult.error,
        avatarLabel: avatarResult.error,
        category: category ? undefined : "Selecciona una categoría.",
      },
    };
  }

  await db.insert(tournamentGroup).values({
    name: nameResult.name,
    avatarLabel: avatarResult.avatarLabel,
    category,
  });

  revalidatePath("/groups");
  return { status: "success", message: "Grupo registrado." };
}

export async function updateGroup(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const id = readString(formData, "id");
  const nameResult = validateName(formData);
  const avatarResult = validateAvatarLabel(formData);
  const category = parseCategory(readString(formData, "category"));

  if (!id || nameResult.error || avatarResult.error || !category) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        name: nameResult.error,
        avatarLabel: avatarResult.error,
        category: category ? undefined : "Selecciona una categoría.",
      },
    };
  }

  const [currentGroup] = await db
    .select({ category: tournamentGroup.category })
    .from(tournamentGroup)
    .where(eq(tournamentGroup.id, id))
    .limit(1);

  if (currentGroup?.category && currentGroup.category !== category) {
    const [assignedTeam] = await db
      .select({ id: team.id })
      .from(team)
      .where(eq(team.groupId, id))
      .limit(1);

    if (assignedTeam) {
      return {
        status: "error",
        message: "Quita los equipos antes de cambiar la categoría.",
        fieldErrors: {
          category: "El grupo debe estar vacío para cambiar la categoría.",
        },
      };
    }
  }

  await db
    .update(tournamentGroup)
    .set({
      name: nameResult.name,
      avatarLabel: avatarResult.avatarLabel,
      category,
    })
    .where(eq(tournamentGroup.id, id));

  revalidatePath("/groups");
  revalidatePath(`/groups/${id}`);
  return { status: "success", message: "Grupo actualizado." };
}

export async function deleteGroup(formData: FormData) {
  await requireAdminWrite();

  const id = readString(formData, "id");
  const redirectTo = readString(formData, "redirectTo");

  if (!id) return;

  await db.delete(tournamentGroup).where(eq(tournamentGroup.id, id));

  revalidatePath("/groups");
  revalidatePath("/teams");
  if (redirectTo) redirect(redirectTo);
}

export async function addTeamToGroup(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const groupId = readString(formData, "groupId");
  const teamId = readString(formData, "teamId");

  if (!groupId || !teamId) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        groupId: groupId ? undefined : "Falta el grupo.",
        teamId: teamId ? undefined : "Selecciona un equipo.",
      },
    };
  }

  const [group] = await db
    .select({ category: tournamentGroup.category })
    .from(tournamentGroup)
    .where(eq(tournamentGroup.id, groupId))
    .limit(1);

  if (!group) {
    return {
      status: "error",
      message: "Selecciona un grupo válido.",
      fieldErrors: {
        groupId: "El grupo no existe.",
      },
    };
  }

  const [updatedTeam] = await db
    .update(team)
    .set({ groupId })
    .where(
      and(
        eq(team.id, teamId),
        eq(team.category, group.category),
        isNull(team.groupId),
      ),
    )
    .returning({ id: team.id });

  if (!updatedTeam) {
    return {
      status: "error",
      message: "Selecciona un equipo disponible.",
      fieldErrors: {
        teamId: "El equipo no está disponible para esta categoría.",
      },
    };
  }

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/teams");
  return { status: "success", message: "Equipo añadido." };
}

export async function removeTeamFromGroup(formData: FormData) {
  await requireAdminWrite();

  const groupId = readString(formData, "groupId");
  const teamId = readString(formData, "teamId");

  if (!groupId || !teamId) return;

  await db
    .update(team)
    .set({ groupId: null })
    .where(and(eq(team.id, teamId), eq(team.groupId, groupId)));

  revalidatePath("/groups");
  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/teams");
}
