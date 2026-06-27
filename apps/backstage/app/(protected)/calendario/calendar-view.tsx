"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { EmptyState, MatchSchedule, type ScheduleDay } from "@mr/ui";
import { groupAvatarStyle } from "../[category]/groups/avatar-utils";
import { categoryLabel, teamAvatarUrl } from "../[category]/teams/avatar-utils";
import { formatMatchTime, type CalendarDay } from "./calendar-format";

type CalendarViewProps = {
  days: CalendarDay[];
  showCategory: boolean;
  showGroup?: boolean;
};

export function CalendarView({
  days,
  showCategory,
  showGroup = true,
}: CalendarViewProps) {
  const scheduleDays: ScheduleDay[] = days.map((day) => ({
    key: day.dateKey,
    label: day.label,
    matches: day.matches.map((match) => ({
      id: match.id,
      timeLabel: formatMatchTime(match.scheduledAt),
      categoryLabel: showCategory ? categoryLabel(match.category) : undefined,
      category: showCategory ? match.category : undefined,
      group: showGroup
        ? match.groupId && match.groupName && match.groupAvatarLabel
          ? {
              name: match.groupName,
              avatarLabel: match.groupAvatarLabel,
              avatarStyle: groupAvatarStyle(match.groupId),
              href: `/${match.category}/groups/${match.groupStage}/${match.groupId}`,
            }
          : {
              name: "Eliminatorias",
              avatarLabel: "E",
            }
        : undefined,
      status: match.status,
      home: {
        id: match.homeTeamId ?? `${match.id}-home`,
        name: match.homeTeamName,
        crestUrl: match.homeTeamId
          ? teamAvatarUrl(match.homeTeamId)
          : undefined,
        href: match.homeTeamId
          ? `/${match.category}/teams/${match.homeTeamId}`
          : undefined,
        score: match.homeScore ?? undefined,
      },
      away: {
        id: match.awayTeamId ?? `${match.id}-away`,
        name: match.awayTeamName,
        crestUrl: match.awayTeamId
          ? teamAvatarUrl(match.awayTeamId)
          : undefined,
        href: match.awayTeamId
          ? `/${match.category}/teams/${match.awayTeamId}`
          : undefined,
        score: match.awayScore ?? undefined,
      },
    })),
  }));

  return (
    <MatchSchedule
      days={scheduleDays}
      showCategory={showCategory}
      showGroup={showGroup}
      linkComponent={Link}
      emptyState={
        <EmptyState
          icon={<CalendarDays className="h-10 w-10" />}
          title="Sin partidos programados"
          description="Aún no hay partidos en el calendario."
        />
      }
    />
  );
}
