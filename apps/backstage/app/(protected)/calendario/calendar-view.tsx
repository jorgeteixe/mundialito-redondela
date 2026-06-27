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
        ? {
            name: match.groupName,
            avatarLabel: match.groupAvatarLabel,
            avatarStyle: groupAvatarStyle(match.groupId),
            href: `/${match.category}/groups/${match.groupId}`,
          }
        : undefined,
      home: {
        id: match.homeTeamId,
        name: match.homeTeamName,
        crestUrl: teamAvatarUrl(match.homeTeamId),
        href: `/${match.category}/teams/${match.homeTeamId}`,
      },
      away: {
        id: match.awayTeamId,
        name: match.awayTeamName,
        crestUrl: teamAvatarUrl(match.awayTeamId),
        href: `/${match.category}/teams/${match.awayTeamId}`,
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
