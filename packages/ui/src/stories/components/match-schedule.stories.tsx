import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  MatchSchedule,
  MatchScheduleSkeleton,
  type ScheduleDay,
  type ScheduleMatch,
} from "../../components/match-schedule";
import { Button } from "../../ui/button";

const groupAStyle = {
  backgroundColor: "hsl(210 78% 90%)",
  borderColor: "hsl(210 78% 78%)",
  color: "hsl(210 45% 28%)",
};
const groupBStyle = {
  backgroundColor: "hsl(120 78% 90%)",
  borderColor: "hsl(120 78% 78%)",
  color: "hsl(120 45% 28%)",
};

const groupA = { name: "Grupo A", avatarLabel: "A", avatarStyle: groupAStyle };
const groupB = { name: "Grupo B", avatarLabel: "B", avatarStyle: groupBStyle };

// Same generated-crest source as backstage (teamAvatarUrl) so the stories
// preview how real team avatars look.
const crestUrl = (id: string) =>
  `https://api.dicebear.com/10.x/shapes/svg?seed=${encodeURIComponent(id)}`;

const team = (id: string, name: string) => ({
  id,
  name,
  crestUrl: crestUrl(id),
});

const chapela = team("chapela", "Chapela FC");
const cesantes = team("cesantes", "Cesantes Atl.");
const reboreda = team("reboreda", "Reboreda");
const angorino = team("angorino", "Angoriño CF");

const scheduled: ScheduleMatch = {
  id: "scheduled",
  timeLabel: "10:00",
  status: "scheduled",
  category: "senior",
  categoryLabel: "Senior",
  group: groupA,
  home: chapela,
  away: cesantes,
};

const live: ScheduleMatch = {
  id: "live",
  timeLabel: "10:00",
  status: "live",
  minuteLabel: "42'",
  category: "senior",
  categoryLabel: "Senior",
  group: groupA,
  home: { ...chapela, score: 2 },
  away: { ...cesantes, score: 1 },
};

const finished: ScheduleMatch = {
  id: "finished",
  timeLabel: "11:30",
  status: "finished",
  category: "cadet",
  categoryLabel: "Cadete",
  group: groupB,
  home: { ...reboreda, score: 3 },
  away: { ...angorino, score: 1 },
};

// Knockout tie level after regular time, decided on penalties: the away side
// wins the shootout, so it stays solid while the home side dims.
const penaltyShootout: ScheduleMatch = {
  id: "penalties",
  timeLabel: "22:00",
  status: "finished",
  category: "senior",
  categoryLabel: "Senior",
  group: { name: "Semifinal", avatarLabel: "SF" },
  home: { ...chapela, score: 2, penaltyScore: 4 },
  away: { ...cesantes, score: 2, penaltyScore: 5 },
};

const days: ScheduleDay[] = [
  {
    key: "2026-06-27",
    label: "sábado, 27 jun",
    matches: [
      scheduled,
      { ...live, id: "d1-live" },
      { ...finished, id: "d1-finished" },
    ],
  },
  {
    key: "2026-06-28",
    label: "domingo, 28 jun",
    matches: [
      {
        id: "d2-1",
        timeLabel: "10:00",
        status: "scheduled",
        category: "senior",
        categoryLabel: "Senior",
        group: groupA,
        home: chapela,
        away: reboreda,
      },
    ],
  },
];

const dayNavigatorDays: ScheduleDay[] = [
  days[0]!,
  days[1]!,
  {
    key: "2026-06-29",
    label: "lunes, 29 jun",
    matches: [
      {
        id: "d3-1",
        timeLabel: "12:00",
        status: "scheduled",
        category: "cadet",
        categoryLabel: "Cadete",
        group: groupB,
        home: reboreda,
        away: chapela,
      },
      {
        id: "d3-2",
        timeLabel: "13:30",
        status: "scheduled",
        category: "senior",
        categoryLabel: "Senior",
        group: { name: "Final", avatarLabel: "F" },
        home: cesantes,
        away: angorino,
      },
    ],
  },
];

function MatchScheduleDayNavigator({
  days,
  showCategory = false,
}: {
  days: ScheduleDay[];
  showCategory?: boolean;
}) {
  const todayKey = "2026-06-27";
  const todayIndex = Math.max(
    0,
    days.findIndex((day) => day.key === todayKey),
  );
  const [selectedIndex, setSelectedIndex] = React.useState(todayIndex);
  const selectedDay = days[selectedIndex];

  if (!selectedDay) return null;

  const title = selectedDay.key === todayKey ? "Hoy" : selectedDay.label;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="size-11 sm:size-9"
          aria-label="Día anterior"
          disabled={selectedIndex === 0}
          onClick={() => setSelectedIndex((index) => Math.max(0, index - 1))}
        >
          <ChevronLeft />
        </Button>
        <div className="min-w-0 text-center">
          <h3 className="truncate text-base font-semibold capitalize text-foreground">
            {title}
          </h3>
          <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground">
            {selectedDay.label}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          className="size-11 sm:size-9"
          aria-label="Día siguiente"
          disabled={selectedIndex === days.length - 1}
          onClick={() =>
            setSelectedIndex((index) => Math.min(days.length - 1, index + 1))
          }
        >
          <ChevronRight />
        </Button>
      </div>
      <MatchSchedule
        matches={selectedDay.matches}
        showCategory={showCategory}
      />
    </div>
  );
}

const meta = {
  title: "Components/MatchSchedule",
  component: MatchSchedule,
  parameters: { layout: "padded" },
} satisfies Meta<typeof MatchSchedule>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scheduled: Story = {
  args: { matches: [scheduled], showCategory: true },
};

export const Live: Story = {
  args: { matches: [live], showCategory: true },
};

export const Finished: Story = {
  args: { matches: [finished], showCategory: true },
};

export const PenaltyShootout: Story = {
  args: { matches: [penaltyShootout], showCategory: true },
};

export const DayGrouped: Story = {
  args: { days, showCategory: true },
};

export const SpareGames: Story = {
  args: {
    matches: [scheduled, live, finished],
    showCategory: true,
  },
};

export const DayNavigator: Story = {
  args: { showCategory: true },
  render: (args) => (
    <MatchScheduleDayNavigator
      days={dayNavigatorDays}
      showCategory={args.showCategory}
    />
  ),
};

export const WithLinks: Story = {
  args: {
    showCategory: true,
    matches: [
      {
        ...scheduled,
        id: "linked",
        categoryHref: "#category",
        group: { ...groupA, href: "#group" },
        home: { ...chapela, href: "#home" },
        away: { ...cesantes, href: "#away" },
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    days: [],
    emptyState: (
      <div className="border border-dashed p-8 text-center text-sm text-muted-foreground">
        Sin partidos programados
      </div>
    ),
  },
};

export const Loading: Story = {
  args: { days: [] },
  render: () => <MatchScheduleSkeleton />,
};
