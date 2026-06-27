import { and, asc, eq, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@mr/db";
import type { Category } from "@/lib/category";

const { match, team } = schema;

export type KnockoutKind = "semifinal" | "third_place" | "final";
export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";

export type EliminatoriaMatch = {
  id: string;
  category: Category;
  kind: KnockoutKind;
  scheduledAt: string;
  homeTeamId: string;
  homeTeamName: string;
  homePlaceholder: string | null;
  awayTeamId: string;
  awayTeamName: string;
  awayPlaceholder: string | null;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
};

export type EliminatoriaTeam = {
  id: string;
  name: string;
  category: Category;
};

export async function listEliminatoriaMatches(
  category: Category,
): Promise<EliminatoriaMatch[]> {
  const homeTeam = alias(team, "home_team");
  const awayTeam = alias(team, "away_team");

  const rows = await db
    .select({
      id: match.id,
      category: match.category,
      kind: match.kind,
      scheduledAt: match.scheduledAt,
      homeTeamId: match.homeTeamId,
      homeTeamName: homeTeam.name,
      homePlaceholder: match.homePlaceholder,
      awayTeamId: match.awayTeamId,
      awayTeamName: awayTeam.name,
      awayPlaceholder: match.awayPlaceholder,
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    })
    .from(match)
    .leftJoin(homeTeam, eq(homeTeam.id, match.homeTeamId))
    .leftJoin(awayTeam, eq(awayTeam.id, match.awayTeamId))
    .where(and(eq(match.category, category), ne(match.kind, "group")))
    .orderBy(asc(match.scheduledAt));

  return rows.map((row) => ({
    ...row,
    kind: row.kind as KnockoutKind,
    homeTeamId: row.homeTeamId ?? "",
    homeTeamName: row.homeTeamName ?? row.homePlaceholder ?? "Pendiente",
    awayTeamId: row.awayTeamId ?? "",
    awayTeamName: row.awayTeamName ?? row.awayPlaceholder ?? "Pendiente",
    scheduledAt: row.scheduledAt.toISOString(),
  }));
}

export async function listEliminatoriaTeams(
  category: Category,
): Promise<EliminatoriaTeam[]> {
  return db
    .select({ id: team.id, name: team.name, category: team.category })
    .from(team)
    .where(eq(team.category, category))
    .orderBy(asc(team.name));
}
