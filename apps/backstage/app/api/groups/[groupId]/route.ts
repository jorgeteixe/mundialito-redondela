import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@mr/db";
import { auth } from "@/lib/auth";

type GroupRouteProps = {
  params: Promise<{
    groupId: string;
  }>;
};

export async function GET(_request: Request, { params }: GroupRouteProps) {
  const session = await auth.api.getSession({
    headers: _request.headers,
  });

  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { groupId } = await params;
  const [group] = await db
    .select({ name: schema.tournamentGroup.name })
    .from(schema.tournamentGroup)
    .where(eq(schema.tournamentGroup.id, groupId))
    .limit(1);

  if (!group) {
    return NextResponse.json(
      { message: "Grupo no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ name: group.name });
}
