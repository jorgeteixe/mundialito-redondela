import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  MatchSchedule,
  MatchScheduleSkeleton,
  type ScheduleDay,
  type ScheduleMatch,
} from "../../components/match-schedule";

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

export const DayGrouped: Story = {
  args: { days, showCategory: true },
};

export const SpareGames: Story = {
  args: {
    matches: [scheduled, live, finished],
    showCategory: true,
  },
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
