"use client";

import * as React from "react";
import { Button, EmptyState, MatchSchedule, type ScheduleDay } from "@mr/ui";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { addDaysToKey, clampDayKey, labelForDayKey } from "../calendar-format";

const TOURNAMENT_START_KEY = "2026-06-29";
const TOURNAMENT_END_KEY = "2026-07-24";

type DayCalendarProps = {
  days: ScheduleDay[];
  todayKey: string;
};

export function DayCalendar({ days, todayKey }: DayCalendarProps) {
  const initialKey = clampDayKey(
    todayKey,
    TOURNAMENT_START_KEY,
    TOURNAMENT_END_KEY,
  );
  const [selectedKey, setSelectedKey] = React.useState(initialKey);
  const daysByKey = React.useMemo(
    () => new Map(days.map((day) => [day.key, day])),
    [days],
  );
  const selectedDay = daysByKey.get(selectedKey);
  const selectedLabel = selectedDay?.label ?? labelForDayKey(selectedKey);
  const isToday = selectedKey === todayKey;
  const title = isToday ? "Hoy" : selectedLabel;
  const matchCount = selectedDay?.matches.length ?? 0;
  const matchCountLabel =
    matchCount === 0
      ? "Sin partidos"
      : matchCount === 1
        ? "1 partido"
        : `${matchCount} partidos`;

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="size-11 sm:size-9"
          aria-label="Día anterior"
          disabled={selectedKey === TOURNAMENT_START_KEY}
          onClick={() =>
            setSelectedKey((key) =>
              clampDayKey(
                addDaysToKey(key, -1),
                TOURNAMENT_START_KEY,
                TOURNAMENT_END_KEY,
              ),
            )
          }
        >
          <ChevronLeft />
        </Button>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-base font-semibold capitalize text-foreground">
            {title}
          </h1>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {matchCountLabel}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="size-11 sm:size-9"
          aria-label="Día siguiente"
          disabled={selectedKey === TOURNAMENT_END_KEY}
          onClick={() =>
            setSelectedKey((key) =>
              clampDayKey(
                addDaysToKey(key, 1),
                TOURNAMENT_START_KEY,
                TOURNAMENT_END_KEY,
              ),
            )
          }
        >
          <ChevronRight />
        </Button>
      </div>

      <MatchSchedule
        matches={selectedDay?.matches ?? []}
        showCategory
        emptyState={
          <EmptyState
            icon={<CalendarDays className="h-10 w-10" />}
            title="Sin partidos"
            description="No hay partidos programados para este día."
            className="border border-dashed bg-card px-4"
          />
        }
      />
    </section>
  );
}
