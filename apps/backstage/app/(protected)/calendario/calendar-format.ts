import type { TeamCategory } from "../[category]/teams/data";

const TIME_ZONE = "Europe/Madrid";

export type CalendarMatch = {
  id: string;
  scheduledAt: string;
  groupId: string | null;
  groupName: string | null;
  groupAvatarLabel: string | null;
  groupStage: "f1" | "f2" | null;
  kind: "group" | "semifinal" | "third_place" | "final";
  category: TeamCategory;
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

export type CalendarDay = {
  dateKey: string;
  label: string;
  matches: CalendarMatch[];
};

// Stable YYYY-MM-DD key in Madrid local time, so matches near midnight bucket
// into the correct local day regardless of the viewer's timezone.
const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dayLabelFormatter = new Intl.DateTimeFormat("es-ES", {
  timeZone: TIME_ZONE,
  weekday: "long",
});

const dayNumberFormatter = new Intl.DateTimeFormat("es-ES", {
  timeZone: TIME_ZONE,
  day: "numeric",
});

const monthLabelFormatter = new Intl.DateTimeFormat("es-ES", {
  timeZone: TIME_ZONE,
  month: "long",
});

const timeFormatter = new Intl.DateTimeFormat("es-ES", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

export function formatMatchTime(scheduledAt: string): string {
  return timeFormatter.format(new Date(scheduledAt));
}

/**
 * Buckets time-sorted matches into chronological day sections (Madrid local
 * day). Input must already be ordered by `scheduledAt` ascending; day order and
 * within-day order are preserved from that input.
 */
export function groupByDay(matches: CalendarMatch[]): CalendarDay[] {
  const days = new Map<string, CalendarDay>();

  for (const match of matches) {
    const date = new Date(match.scheduledAt);
    const dateKey = dayKeyFormatter.format(date);
    let day = days.get(dateKey);
    if (!day) {
      day = { dateKey, label: formatDayLabel(date), matches: [] };
      days.set(dateKey, day);
    }
    day.matches.push(match);
  }

  return [...days.values()];
}

function formatDayLabel(date: Date) {
  return `${dayLabelFormatter.format(date)}, ${dayNumberFormatter.format(date)} ${monthLabelFormatter.format(date)}`;
}
