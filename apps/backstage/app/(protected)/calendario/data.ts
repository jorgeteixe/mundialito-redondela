import { asc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, schema } from "@mr/db";
import type { Category } from "@/lib/category";
import type { CalendarMatch } from "./calendar-format";

const { match, team, tournamentGroup } = schema;

export async function listScheduledMatches(
  category?: Category,
): Promise<CalendarMatch[]> {
  const homeTeam = alias(team, "home_team");
  const awayTeam = alias(team, "away_team");

  const rows = await db
    .select({
      id: match.id,
      scheduledAt: match.scheduledAt,
      groupId: match.groupId,
      groupName: tournamentGroup.name,
      groupAvatarLabel: tournamentGroup.avatarLabel,
      groupStage: tournamentGroup.stage,
      kind: match.kind,
      category: match.category,
      homeTeamId: match.homeTeamId,
      homeTeamName: homeTeam.name,
      homePlaceholder: match.homePlaceholder,
      awayTeamId: match.awayTeamId,
      awayTeamName: awayTeam.name,
      awayPlaceholder: match.awayPlaceholder,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      homePenalties: match.homePenalties,
      awayPenalties: match.awayPenalties,
    })
    .from(match)
    .leftJoin(tournamentGroup, eq(tournamentGroup.id, match.groupId))
    .leftJoin(homeTeam, eq(homeTeam.id, match.homeTeamId))
    .leftJoin(awayTeam, eq(awayTeam.id, match.awayTeamId))
    .where(category ? eq(match.category, category) : undefined)
    .orderBy(asc(match.scheduledAt));

  return rows.map((row) => ({
    id: row.id,
    scheduledAt: row.scheduledAt.toISOString(),
    groupId: row.groupId,
    groupName: row.groupName,
    groupAvatarLabel: row.groupAvatarLabel,
    groupStage: row.groupStage,
    kind: row.kind,
    category: row.category,
    homeTeamId: row.homeTeamId,
    homeTeamName: row.homeTeamName ?? row.homePlaceholder ?? "Pendiente",
    awayTeamId: row.awayTeamId,
    awayTeamName: row.awayTeamName ?? row.awayPlaceholder ?? "Pendiente",
    homeScore: row.homeScore,
    awayScore: row.awayScore,
    homePenalties: row.homePenalties,
    awayPenalties: row.awayPenalties,
  }));
}
