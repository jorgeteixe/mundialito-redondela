import { CalendarDays } from "lucide-react";
import { EmptyState, ScheduleTable, type ScheduleDay } from "@mr/ui";
import { groupAvatarStyle } from "../[category]/groups/avatar-utils";
import { categoryLabel, teamAvatarUrl } from "../[category]/teams/avatar-utils";
import { formatMatchTime, type CalendarDay } from "./calendar-format";

type CalendarViewProps = {
  days: CalendarDay[];
  showCategory: boolean;
};

export function CalendarView({ days, showCategory }: CalendarViewProps) {
  const scheduleDays: ScheduleDay[] = days.map((day) => ({
    key: day.dateKey,
    label: day.label,
    matches: day.matches.map((match) => ({
      id: match.id,
      timeLabel: formatMatchTime(match.scheduledAt),
      categoryLabel: showCategory ? categoryLabel(match.category) : undefined,
      category: showCategory ? match.category : undefined,
      group: {
        name: match.groupName,
        avatarLabel: match.groupAvatarLabel,
        avatarStyle: groupAvatarStyle(match.groupId),
      },
      home: {
        id: match.homeTeamId,
        name: match.homeTeamName,
        crestUrl: teamAvatarUrl(match.homeTeamId),
      },
      away: {
        id: match.awayTeamId,
        name: match.awayTeamName,
        crestUrl: teamAvatarUrl(match.awayTeamId),
      },
    })),
  }));

  return (
    <ScheduleTable
      days={scheduleDays}
      showCategory={showCategory}
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
