import { desc } from "drizzle-orm";
import { db, schema } from "@mr/db";
import { parseBackstageRole, type BackstageRole } from "@/lib/roles";

const { user } = schema;

export type BackstageUserSummary = {
  id: string;
  name: string;
  email: string;
  role: BackstageRole;
  createdAt: string;
};

export async function listBackstageUsers(): Promise<BackstageUserSummary[]> {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  return rows.map((row) => ({
    ...row,
    role: parseBackstageRole(row.role),
    createdAt: row.createdAt.toISOString(),
  }));
}
