"use client";

import * as React from "react";
import Link from "next/link";
import {
  Button,
  EmptyState,
  MatchSchedule,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type ScheduleDay,
} from "@mr/ui";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDaysToKey,
  clampDayKey,
  labelForDayKey,
  todayKey as clientTodayKey,
} from "../calendar-format";

const TOURNAMENT_START_KEY = "2026-06-29";
const TOURNAMENT_END_KEY = "2026-07-24";

type DayCalendarProps = {
  days: ScheduleDay[];
  todayKey: string;
};

type CalendarCategory = "all" | "senior" | "cadet";

const CATEGORY_LABELS: Record<CalendarCategory, string> = {
  all: "Todos",
  senior: "Senior",
  cadet: "Cadete",
};

const CATEGORIES: CalendarCategory[] = ["all", "senior", "cadet"];

export function DayCalendar({ days, todayKey }: DayCalendarProps) {
  const initialKey = clampDayKey(
    todayKey,
    TOURNAMENT_START_KEY,
    TOURNAMENT_END_KEY,
  );
  const [selectedKey, setSelectedKey] = React.useState(initialKey);
  const [today, setToday] = React.useState(todayKey);

  // `todayKey` is computed on the server. A cached or bfcache-restored document
  // can be stale relative to the visitor's real "today", which would park the
  // calendar on the wrong day. Re-sync from the client clock once on mount —
  // this runs after hydration, so it can never cause a mismatch — and only move
  // the selection if the user hasn't navigated away from the server default.
  React.useEffect(() => {
    const clientToday = clientTodayKey();
    if (clientToday === todayKey) return;
    setToday(clientToday);
    setSelectedKey((current) =>
      current === initialKey
        ? clampDayKey(clientToday, TOURNAMENT_START_KEY, TOURNAMENT_END_KEY)
        : current,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const daysByKey = React.useMemo(
    () => new Map(days.map((day) => [day.key, day])),
    [days],
  );
  const [selectedCategory, setSelectedCategory] =
    React.useState<CalendarCategory>("all");
  const selectedDay = daysByKey.get(selectedKey);
  const selectedMatches = filterMatches(
    selectedDay?.matches ?? [],
    selectedCategory,
  );
  const selectedLabel = selectedDay?.label ?? labelForDayKey(selectedKey);
  const isToday = selectedKey === today;
  const title = isToday ? "Hoy" : selectedLabel;
  const matchCount = selectedMatches.length;
  const matchCountLabel =
    matchCount === 0
      ? "Sin partidos"
      : matchCount === 1
        ? "1 partido"
        : `${matchCount} partidos`;

  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
      <Tabs
        value={selectedCategory}
        onValueChange={(value) =>
          setSelectedCategory(value as CalendarCategory)
        }
        className="gap-0 overflow-hidden border bg-card"
      >
        <header className="border-b px-4 pt-3">
          <h1 className="flex items-center justify-between gap-2 text-xl font-semibold tracking-tight text-foreground">
            Calendario
            <CalendarDays className="size-5 text-muted-foreground" />
          </h1>
          <TabsList
            className="mt-1 h-10 w-full justify-start gap-5 overflow-x-auto p-0"
            variant="line"
          >
            {CATEGORIES.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="flex-none"
              >
                {CATEGORY_LABELS[category]}
              </TabsTrigger>
            ))}
          </TabsList>
        </header>

        {CATEGORIES.map((category) => (
          <TabsContent
            key={category}
            value={category}
            className="flex flex-col"
          >
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4">
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="size-11 sm:size-10"
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
                <h2 className="truncate text-base font-semibold capitalize text-foreground">
                  {title}
                </h2>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {matchCountLabel}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="size-11 sm:size-10"
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
              bare
              matches={selectedMatches}
              showCategory={selectedCategory === "all"}
              linkComponent={Link}
              emptyState={
                <EmptyState
                  icon={<CalendarDays className="h-10 w-10" />}
                  title="Sin partidos"
                  description="No hay partidos programados para este día."
                  className="px-4 py-12"
                />
              }
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}

function filterMatches(
  matches: ScheduleDay["matches"],
  category: CalendarCategory,
) {
  if (category === "all") return matches;

  return matches.filter((match) => match.category === category);
}
