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
      category: tournamentGroup.category,
      homeTeamId: match.homeTeamId,
      homeTeamName: homeTeam.name,
      awayTeamId: match.awayTeamId,
      awayTeamName: awayTeam.name,
    })
    .from(match)
    .innerJoin(tournamentGroup, eq(tournamentGroup.id, match.groupId))
    .innerJoin(homeTeam, eq(homeTeam.id, match.homeTeamId))
    .innerJoin(awayTeam, eq(awayTeam.id, match.awayTeamId))
    .where(category ? eq(tournamentGroup.category, category) : undefined)
    .orderBy(asc(match.scheduledAt));

  return rows.map((row) => ({
    ...row,
    scheduledAt: row.scheduledAt.toISOString(),
  }));
}
