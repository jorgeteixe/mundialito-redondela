"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq, ne, sql } from "drizzle-orm";
import { db, schema } from "@mr/db";
import { auth } from "@/lib/auth";
import { requireSuperAdmin } from "@/lib/authz";
import {
  backstageRoles,
  parseBackstageRole,
  type BackstageRole,
} from "@/lib/roles";

const { user } = schema;

export type UserFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    userId?: string;
  };
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function invalid(
  message: string,
  fieldErrors?: UserFormState["fieldErrors"],
): UserFormState {
  return { status: "error", message, fieldErrors };
}

function parseRoleInput(value: string): BackstageRole | null {
  return backstageRoles.includes(value as BackstageRole)
    ? (value as BackstageRole)
    : null;
}

async function countOtherSuperAdmins(userId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(user)
    .where(and(eq(user.role, "super-admin"), ne(user.id, userId)));

  return row?.count ?? 0;
}

async function isSuperAdminUser(userId: string) {
  const [row] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return parseBackstageRole(row?.role) === "super-admin";
}

export async function createBackstageUser(
  _state: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireSuperAdmin();

  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const role = parseRoleInput(readString(formData, "role"));

  if (!name || !email || !password || !role) {
    return invalid("Revisa los campos marcados.", {
      name: name ? undefined : "El nombre es obligatorio.",
      email: email ? undefined : "El correo es obligatorio.",
      password: password ? undefined : "La contraseña es obligatoria.",
      role: role ? undefined : "Selecciona un rol válido.",
    });
  }

  try {
    await auth.api.createUser({
      headers: await headers(),
      body: { name, email, password, role },
    });
  } catch (error) {
    return invalid(
      error instanceof Error ? error.message : "No se pudo crear el usuario.",
    );
  }

  revalidatePath("/users");
  return { status: "success", message: "Usuario creado." };
}

export async function updateBackstageUser(
  _state: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireSuperAdmin();

  const userId = readString(formData, "userId");
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const role = parseRoleInput(readString(formData, "role"));

  if (!userId || !name || !email || !role) {
    return invalid("Revisa los campos marcados.", {
      userId: userId ? undefined : "Falta el usuario.",
      name: name ? undefined : "El nombre es obligatorio.",
      email: email ? undefined : "El correo es obligatorio.",
      role: role ? undefined : "Selecciona un rol válido.",
    });
  }

  if (name.length > 120) {
    return invalid("Revisa los campos marcados.", {
      name: "El nombre debe tener 120 caracteres o menos.",
    });
  }

  if (role !== "super-admin" && (await isSuperAdminUser(userId))) {
    const otherSuperAdmins = await countOtherSuperAdmins(userId);
    if (otherSuperAdmins === 0) {
      return invalid("No puedes quitar el último super admin.");
    }
  }

  try {
    await auth.api.adminUpdateUser({
      headers: await headers(),
      body: {
        userId,
        data: {
          name,
          email,
          role,
        },
      },
    });
  } catch (error) {
    return invalid(
      error instanceof Error
        ? error.message
        : "No se pudo actualizar el usuario.",
    );
  }

  revalidatePath("/users");
  return { status: "success", message: "Usuario actualizado." };
}

export async function resetBackstageUserPassword(
  _state: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  await requireSuperAdmin();

  const userId = readString(formData, "userId");
  const password = readString(formData, "password");

  if (!userId || !password) {
    return invalid("Revisa los campos marcados.", {
      userId: userId ? undefined : "Falta el usuario.",
      password: password ? undefined : "La contraseña es obligatoria.",
    });
  }

  try {
    await auth.api.setUserPassword({
      headers: await headers(),
      body: { userId, newPassword: password },
    });
  } catch (error) {
    return invalid(
      error instanceof Error
        ? error.message
        : "No se pudo cambiar la contraseña.",
    );
  }

  revalidatePath("/users");
  return { status: "success", message: "Contraseña actualizada." };
}

export async function deleteBackstageUser(formData: FormData) {
  const session = await requireSuperAdmin();
  const userId = readString(formData, "userId");

  if (!userId || userId === session.user.id) return;

  if (await isSuperAdminUser(userId)) {
    const otherSuperAdmins = await countOtherSuperAdmins(userId);
    if (otherSuperAdmins === 0) return;
  }

  await auth.api.removeUser({
    headers: await headers(),
    body: { userId },
  });

  revalidatePath("/users");
}
