import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@mr/db";
import { requireAdminWrite } from "@/lib/authz";

const { team, tournamentGroup, tournamentGroupTeam } = schema;

export async function POST(request: Request) {
  await requireAdminWrite();

  const body = (await request.json()) as {
    groupId?: unknown;
    teamId?: unknown;
  };
  const groupId = typeof body.groupId === "string" ? body.groupId : "";
  const teamId = typeof body.teamId === "string" ? body.teamId : "";

  if (!groupId || !teamId) {
    return NextResponse.json(
      { message: "Revisa los campos marcados." },
      { status: 400 },
    );
  }

  const [group] = await db
    .select({
      category: tournamentGroup.category,
      stage: tournamentGroup.stage,
    })
    .from(tournamentGroup)
    .where(eq(tournamentGroup.id, groupId))
    .limit(1);

  if (!group) {
    return NextResponse.json(
      { message: "Selecciona un grupo válido." },
      { status: 404 },
    );
  }

  const [selectedTeam] = await db
    .select({ id: team.id })
    .from(team)
    .where(and(eq(team.id, teamId), eq(team.category, group.category)))
    .limit(1);

  if (!selectedTeam) {
    return NextResponse.json(
      { message: "Selecciona un equipo disponible." },
      { status: 400 },
    );
  }

  const [membership] = await db
    .insert(tournamentGroupTeam)
    .values({ groupId, teamId, stage: group.stage })
    .onConflictDoNothing()
    .returning({ teamId: tournamentGroupTeam.teamId });

  if (!membership) {
    return NextResponse.json(
      { message: "El equipo ya está asignado en esta fase." },
      { status: 409 },
    );
  }

  return NextResponse.json({ message: "Equipo añadido." });
}
