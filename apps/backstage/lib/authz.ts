import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageUsers, canWriteBackstage } from "@/lib/roles";

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session;
}

export async function requireAdminWrite() {
  const session = await requireSession();
  if (!canWriteBackstage(session.user.role)) {
    throw new Error("No tienes permiso para realizar esta acción.");
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await requireSession();
  if (!canManageUsers(session.user.role)) notFound();
  return session;
}
