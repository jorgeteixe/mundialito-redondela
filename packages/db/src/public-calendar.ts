import { asc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "./client";
import { match, team, tournamentGroup } from "./schema";

export type PublicCalendarMatch = {
  id: string;
  scheduledAt: string;
  groupId: string | null;
  groupName: string | null;
  groupAvatarLabel: string | null;
  kind: "group" | "semifinal" | "third_place" | "final";
  category: "senior" | "cadet";
  homeTeamId: string | null;
  homeTeamName: string;
  awayTeamId: string | null;
  awayTeamName: string;
  status: "scheduled" | "live" | "finished" | "postponed";
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
};

export async function listPublicMatches(): Promise<PublicCalendarMatch[]> {
  const homeTeam = alias(team, "home_team");
  const awayTeam = alias(team, "away_team");

  const rows = await db
    .select({
      id: match.id,
      scheduledAt: match.scheduledAt,
      groupId: match.groupId,
      groupName: tournamentGroup.name,
      groupAvatarLabel: tournamentGroup.avatarLabel,
      kind: match.kind,
      category: match.category,
      homeTeamId: match.homeTeamId,
      homeTeamName: homeTeam.name,
      homePlaceholder: match.homePlaceholder,
      awayTeamId: match.awayTeamId,
      awayTeamName: awayTeam.name,
      awayPlaceholder: match.awayPlaceholder,
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      homePenalties: match.homePenalties,
      awayPenalties: match.awayPenalties,
    })
    .from(match)
    .leftJoin(tournamentGroup, eq(tournamentGroup.id, match.groupId))
    .leftJoin(homeTeam, eq(homeTeam.id, match.homeTeamId))
    .leftJoin(awayTeam, eq(awayTeam.id, match.awayTeamId))
    .orderBy(asc(match.scheduledAt));

  return rows.map((row) => ({
    id: row.id,
    scheduledAt: row.scheduledAt.toISOString(),
    groupId: row.groupId,
    groupName: row.groupName,
    groupAvatarLabel: row.groupAvatarLabel,
    kind: row.kind,
    category: row.category,
    homeTeamId: row.homeTeamId,
    homeTeamName: row.homeTeamName ?? row.homePlaceholder ?? "Pendiente",
    awayTeamId: row.awayTeamId,
    awayTeamName: row.awayTeamName ?? row.awayPlaceholder ?? "Pendiente",
    status: row.status,
    homeScore: row.homeScore,
    awayScore: row.awayScore,
    homePenalties: row.homePenalties,
    awayPenalties: row.awayPenalties,
  }));
}
