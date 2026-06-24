"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@mr/db";
import { requireAdminWrite } from "@/lib/authz";
import { isCategory } from "@/lib/category";

const { player, team } = schema;

// Dynamic-segment revalidation: refresh every category variant of these routes
// without needing to know which one the mutation came from.
const TEAMS_PATH = "/[category]/teams";
const TEAM_DETAIL_PATH = "/[category]/teams/[teamId]";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    name?: string;
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

export async function createTeam(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const nameResult = validateName(formData);
  const category = readString(formData, "category");

  if (nameResult.error || !isCategory(category)) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        name: nameResult.error,
      },
    };
  }

  await db.insert(team).values({
    name: nameResult.name,
    category,
  });

  revalidatePath(TEAMS_PATH, "page");
  return { status: "success", message: "Equipo registrado." };
}

export async function updateTeam(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const id = readString(formData, "id");
  const nameResult = validateName(formData);

  if (!id || nameResult.error) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        name: nameResult.error,
      },
    };
  }

  await db.update(team).set({ name: nameResult.name }).where(eq(team.id, id));

  revalidatePath(TEAMS_PATH, "page");
  revalidatePath(TEAM_DETAIL_PATH, "page");
  return { status: "success", message: "Equipo actualizado." };
}

export async function deleteTeam(formData: FormData) {
  await requireAdminWrite();

  const id = readString(formData, "id");
  const redirectTo = readString(formData, "redirectTo");

  if (!id) return;

  await db.delete(team).where(eq(team.id, id));

  revalidatePath(TEAMS_PATH, "page");
  if (redirectTo) redirect(redirectTo);
}

export async function createPlayer(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const teamId = readString(formData, "teamId");
  const nameResult = validateName(formData);

  if (!teamId || nameResult.error) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        teamId: teamId ? undefined : "Falta el equipo.",
        name: nameResult.error,
      },
    };
  }

  await db.insert(player).values({
    name: nameResult.name,
    teamId,
  });

  revalidatePath(TEAMS_PATH, "page");
  revalidatePath(TEAM_DETAIL_PATH, "page");
  return { status: "success", message: "Jugador añadido." };
}

export async function updatePlayer(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdminWrite();

  const id = readString(formData, "id");
  const teamId = readString(formData, "teamId");
  const nameResult = validateName(formData);

  if (!id || !teamId || nameResult.error) {
    return {
      status: "error",
      message: "Revisa los campos marcados.",
      fieldErrors: {
        teamId: teamId ? undefined : "Falta el equipo.",
        name: nameResult.error,
      },
    };
  }

  await db
    .update(player)
    .set({ name: nameResult.name })
    .where(eq(player.id, id));

  revalidatePath(TEAMS_PATH, "page");
  revalidatePath(TEAM_DETAIL_PATH, "page");
  return { status: "success", message: "Jugador actualizado." };
}

export async function deletePlayer(formData: FormData) {
  await requireAdminWrite();

  const id = readString(formData, "id");
  const teamId = readString(formData, "teamId");

  if (!id || !teamId) return;

  await db.delete(player).where(eq(player.id, id));

  revalidatePath(TEAMS_PATH, "page");
  revalidatePath(TEAM_DETAIL_PATH, "page");
}
