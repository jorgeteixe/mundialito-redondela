import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ScheduleTable,
  ScheduleTableSkeleton,
  type ScheduleDay,
} from "../../components/schedule-table";

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

const days: ScheduleDay[] = [
  {
    key: "2026-06-27",
    label: "sábado, 27 jun",
    matches: [
      {
        id: "m1",
        timeLabel: "10:00",
        categoryLabel: "Senior",
        group: { name: "Grupo A", avatarLabel: "A", avatarStyle: groupAStyle },
        home: { id: "chapela", name: "Chapela FC" },
        away: { id: "cesantes", name: "Cesantes Atl." },
      },
      {
        id: "m2",
        timeLabel: "10:00",
        categoryLabel: "Cadete",
        group: { name: "Grupo B", avatarLabel: "B", avatarStyle: groupBStyle },
        home: { id: "reboreda", name: "Reboreda" },
        away: { id: "angorino", name: "Angoriño CF" },
      },
      {
        id: "m3",
        timeLabel: "11:30",
        categoryLabel: "Senior",
        group: { name: "Grupo A", avatarLabel: "A", avatarStyle: groupAStyle },
        home: { id: "cesantes", name: "Cesantes Atl." },
        away: { id: "chapela", name: "Chapela FC" },
      },
    ],
  },
  {
    key: "2026-06-28",
    label: "domingo, 28 jun",
    matches: [
      {
        id: "m4",
        timeLabel: "10:00",
        categoryLabel: "Senior",
        group: { name: "Grupo A", avatarLabel: "A", avatarStyle: groupAStyle },
        home: { id: "chapela", name: "Chapela FC" },
        away: { id: "reboreda", name: "Reboreda" },
      },
    ],
  },
];

const meta = {
  title: "Components/ScheduleTable",
  component: ScheduleTable,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ScheduleTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const General: Story = {
  args: { days, showCategory: true },
};

export const SingleCategory: Story = {
  args: { days, showCategory: false },
};

export const Empty: Story = {
  args: {
    days: [],
    emptyState: (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        Sin partidos programados
      </div>
    ),
  },
};

export const Loading: Story = {
  args: { days: [] },
  render: () => <ScheduleTableSkeleton showCategory />,
};
