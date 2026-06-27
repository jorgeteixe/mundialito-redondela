import type { ScheduleMatch } from "@mr/ui";
import type { PublicCalendarMatch } from "@mr/db";

const TIME_ZONE = "Europe/Madrid";

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

export type PublicScheduleDay = {
  key: string;
  label: string;
  matches: ScheduleMatch[];
};

export function todayKey() {
  return dayKeyFormatter.format(new Date());
}

export function addDaysToKey(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  const next = new Date(Date.UTC(year!, month! - 1, day! + days, 12));

  return next.toISOString().slice(0, 10);
}

export function clampDayKey(key: string, minKey: string, maxKey: string) {
  if (key < minKey) return minKey;
  if (key > maxKey) return maxKey;

  return key;
}

export function labelForDayKey(key: string) {
  return formatDayLabel(dateFromDayKey(key));
}

export function buildScheduleDays(
  matches: PublicCalendarMatch[],
): PublicScheduleDay[] {
  const days = new Map<string, PublicScheduleDay>();

  for (const match of matches) {
    const date = new Date(match.scheduledAt);
    const key = dayKeyFormatter.format(date);
    let day = days.get(key);

    if (!day) {
      day = {
        key,
        label: formatDayLabel(date),
        matches: [],
      };
      days.set(key, day);
    }

    day.matches.push(toScheduleMatch(match));
  }

  return [...days.values()];
}

function dateFromDayKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);

  return new Date(Date.UTC(year!, month! - 1, day!, 12));
}

function formatDayLabel(date: Date) {
  return `${dayLabelFormatter.format(date)}, ${dayNumberFormatter.format(date)} ${monthLabelFormatter.format(date)}`;
}

function toScheduleMatch(match: PublicCalendarMatch): ScheduleMatch {
  return {
    id: match.id,
    timeLabel: timeFormatter.format(new Date(match.scheduledAt)),
    category: match.category,
    categoryLabel: categoryLabel(match.category),
    group:
      match.groupId && match.groupName && match.groupAvatarLabel
        ? {
            name: match.groupName,
            avatarLabel: match.groupAvatarLabel,
          }
        : {
            name: knockoutLabel(match.kind),
            avatarLabel: knockoutAvatar(match.kind),
          },
    status: match.status,
    home: {
      id: match.homeTeamId ?? `${match.id}-home`,
      name: match.homeTeamName,
      crestUrl: match.homeTeamId ? teamAvatarUrl(match.homeTeamId) : undefined,
      score: match.homeScore ?? undefined,
      penaltyScore: match.homePenalties ?? undefined,
    },
    away: {
      id: match.awayTeamId ?? `${match.id}-away`,
      name: match.awayTeamName,
      crestUrl: match.awayTeamId ? teamAvatarUrl(match.awayTeamId) : undefined,
      score: match.awayScore ?? undefined,
      penaltyScore: match.awayPenalties ?? undefined,
    },
  };
}

function categoryLabel(category: PublicCalendarMatch["category"]) {
  return category === "senior" ? "Senior" : "Cadete";
}

function teamAvatarUrl(id: string) {
  return `https://api.dicebear.com/10.x/shapes/svg?seed=${encodeURIComponent(id)}`;
}

function knockoutLabel(kind: PublicCalendarMatch["kind"]): string {
  if (kind === "semifinal") return "Semifinal";
  if (kind === "third_place") return "3.º-4.º puesto";
  if (kind === "final") return "Final";
  return "Eliminatorias";
}

function knockoutAvatar(kind: PublicCalendarMatch["kind"]): string {
  if (kind === "semifinal") return "SF";
  if (kind === "third_place") return "3.º";
  if (kind === "final") return "F";
  return "E";
}
