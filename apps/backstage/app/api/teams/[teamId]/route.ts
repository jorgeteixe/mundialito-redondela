import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db, schema } from "@mr/db";
import { auth } from "@/lib/auth";

type TeamRouteProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export async function GET(_request: Request, { params }: TeamRouteProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { teamId } = await params;
  const [team] = await db
    .select({ name: schema.team.name })
    .from(schema.team)
    .where(eq(schema.team.id, teamId))
    .limit(1);

  if (!team) {
    return NextResponse.json(
      { message: "Equipo no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ name: team.name });
}
