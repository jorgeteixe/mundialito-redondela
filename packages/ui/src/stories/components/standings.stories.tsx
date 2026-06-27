import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Standings,
  StandingsSkeleton,
  type StandingsRow,
} from "../../components/standings";

// Same generated-crest source as backstage (teamAvatarUrl) so the stories
// preview how real team avatars look.
const crestUrl = (id: string) =>
  `https://api.dicebear.com/10.x/shapes/svg?seed=${encodeURIComponent(id)}`;

const row = (
  id: string,
  name: string,
  stats: Omit<StandingsRow, "team">,
): StandingsRow => ({
  team: { id, name, crestUrl: crestUrl(id), href: `#${id}` },
  ...stats,
});

// A finished four-team group, already sorted by the caller.
const rows: StandingsRow[] = [
  row("chapela", "Chapela FC", {
    played: 3,
    wins: 3,
    draws: 0,
    losses: 0,
    goalsFor: 8,
    goalsAgainst: 2,
    goalDifference: 6,
    points: 9,
  }),
  row("cesantes", "Cesantes Atlético", {
    played: 3,
    wins: 1,
    draws: 1,
    losses: 1,
    goalsFor: 5,
    goalsAgainst: 4,
    goalDifference: 1,
    points: 4,
  }),
  row("reboreda", "Reboreda", {
    played: 3,
    wins: 1,
    draws: 1,
    losses: 1,
    goalsFor: 3,
    goalsAgainst: 4,
    goalDifference: -1,
    points: 4,
  }),
  row("angorino", "Angoriño CF", {
    played: 3,
    wins: 0,
    draws: 0,
    losses: 3,
    goalsFor: 1,
    goalsAgainst: 7,
    goalDifference: -6,
    points: 0,
  }),
];

const meta = {
  title: "Components/Standings",
  component: Standings,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Standings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { rows },
};

export const WithQualifyZone: Story = {
  args: { rows, qualifyCount: 2 },
};

export const QualifyingTeams: Story = {
  args: { rows, qualifyingTeamIds: ["chapela", "reboreda"] },
};

export const FullColumns: Story = {
  args: { rows, fullColumns: true, qualifyCount: 2 },
};

export const Empty: Story = {
  args: {
    rows: [],
    emptyState: (
      <div className="border border-dashed p-8 text-center text-sm text-muted-foreground">
        Sin equipos
      </div>
    ),
  },
};

export const Loading: Story = {
  args: { rows: [] },
  render: () => <StandingsSkeleton />,
};
