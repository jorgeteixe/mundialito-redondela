import { asc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "./client";
import { match, team, tournamentGroup } from "./schema";

export type ResultPublishingMatch = {
  id: string;
  scheduledAt: Date;
  groupId: string | null;
  groupName: string | null;
  groupStage: "f1" | "f2" | null;
  kind: "group" | "semifinal" | "third_place" | "final";
  category: "senior" | "cadet";
  homeTeamName: string | null;
  homePlaceholder: string | null;
  awayTeamName: string | null;
  awayPlaceholder: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
};

export async function listResultPublishingMatches(): Promise<
  ResultPublishingMatch[]
> {
  const homeTeam = alias(team, "home_team");
  const awayTeam = alias(team, "away_team");

  return db
    .select({
      id: match.id,
      scheduledAt: match.scheduledAt,
      groupId: match.groupId,
      groupName: tournamentGroup.name,
      groupStage: tournamentGroup.stage,
      kind: match.kind,
      category: match.category,
      homeTeamName: homeTeam.name,
      homePlaceholder: match.homePlaceholder,
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
    .orderBy(asc(match.scheduledAt));
}
