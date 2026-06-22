import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  DayMatches,
  KnockoutBracket,
  MatchCard,
  Schedule,
  StandingsTable,
  TeamBadge,
  TeamCard,
  TeamList,
  type KnockoutRound,
  type StandingRow,
  type TournamentMatch,
  type TournamentTeam,
} from "../../components/tournament";

const teams: TournamentTeam[] = [
  {
    id: "chapela",
    name: "Chapela FC",
    shortName: "CHA",
    group: "A",
    seed: 1,
    record: "3-1-0",
  },
  {
    id: "cesantes",
    name: "Cesantes Atl.",
    shortName: "CES",
    group: "A",
    seed: 2,
    record: "2-1-1",
  },
  {
    id: "reboreda",
    name: "Reboreda",
    shortName: "REB",
    group: "A",
    seed: 3,
    record: "1-2-1",
  },
  {
    id: "cabeiro",
    name: "Cabeiro",
    shortName: "CAB",
    group: "A",
    seed: 4,
    record: "0-2-2",
  },
  {
    id: "vilar",
    name: "Vilar de Infesta",
    shortName: "VIL",
    group: "B",
    seed: 1,
  },
  {
    id: "quintela",
    name: "Quintela",
    shortName: "QUI",
    group: "B",
    seed: 2,
  },
  {
    id: "saxamonde",
    name: "Saxamonde",
    shortName: "SAX",
    group: "B",
    seed: 3,
  },
  {
    id: "trasmano",
    name: "Trasmañó",
    shortName: "TRA",
    group: "B",
    seed: 4,
  },
];

const matches: TournamentMatch[] = [
  {
    id: "m1",
    phase: "Grupo A",
    dateLabel: "Sábado 20",
    timeLabel: "10:00",
    venue: "Campo Municipal de Santa Mariña",
    status: "live",
    minute: "42'",
    home: { team: teams[0]!, score: 2 },
    away: { team: teams[1]!, score: 1 },
    highlight:
      "Chapela FC domina por bandas; Cesantes busca empate antes del descanso.",
  },
  {
    id: "m2",
    phase: "Grupo A",
    dateLabel: "Sábado 20",
    timeLabel: "11:15",
    venue: "Campo Municipal de Santa Mariña",
    status: "scheduled",
    home: { team: teams[2]! },
    away: { team: teams[3]! },
  },
  {
    id: "m3",
    phase: "Grupo B",
    dateLabel: "Sábado 20",
    timeLabel: "12:30",
    venue: "Campo Anexo",
    status: "finished",
    home: { team: teams[4]!, score: 1 },
    away: { team: teams[5]!, score: 1 },
    highlight: "Partido cerrado, reparto de puntos y grupo abierto.",
  },
  {
    id: "m4",
    phase: "Grupo B",
    dateLabel: "Domingo 21",
    timeLabel: "10:00",
    venue: "Campo Anexo",
    status: "scheduled",
    home: { team: teams[6]! },
    away: { team: teams[7]! },
  },
];

const standings: StandingRow[] = [
  {
    team: teams[0]!,
    position: 1,
    played: 4,
    wins: 3,
    draws: 1,
    losses: 0,
    goalsFor: 9,
    goalsAgainst: 3,
    points: 10,
    qualified: true,
  },
  {
    team: teams[1]!,
    position: 2,
    played: 4,
    wins: 2,
    draws: 1,
    losses: 1,
    goalsFor: 6,
    goalsAgainst: 4,
    points: 7,
    qualified: true,
  },
  {
    team: teams[2]!,
    position: 3,
    played: 4,
    wins: 1,
    draws: 2,
    losses: 1,
    goalsFor: 5,
    goalsAgainst: 5,
    points: 5,
  },
  {
    team: teams[3]!,
    position: 4,
    played: 4,
    wins: 0,
    draws: 0,
    losses: 4,
    goalsFor: 2,
    goalsAgainst: 10,
    points: 0,
  },
];

const bracket: KnockoutRound[] = [
  {
    id: "quarter",
    title: "Cuartos",
    matches: [
      {
        id: "q1",
        label: "Cuarto 1",
        winnerId: "chapela",
        match: {
          ...matches[0]!,
          status: "finished",
          home: { team: teams[0]!, score: 3 },
          away: { team: teams[7]!, score: 0 },
        },
      },
      {
        id: "q2",
        label: "Cuarto 2",
        winnerId: "cesantes",
        match: {
          ...matches[2]!,
          status: "finished",
          home: { team: teams[1]!, score: 2 },
          away: { team: teams[6]!, score: 1 },
        },
      },
    ],
  },
  {
    id: "semi",
    title: "Semifinales",
    matches: [
      {
        id: "s1",
        label: "Semifinal 1",
        match: {
          id: "s1-match",
          phase: "Semifinal",
          status: "scheduled",
          home: { team: teams[0]! },
          away: { team: teams[1]! },
        },
      },
    ],
  },
  {
    id: "final",
    title: "Final",
    matches: [{ id: "f1", label: "Final" }],
  },
];

function StoryFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[560px] bg-background p-4 text-foreground sm:p-8">
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </div>
  );
}

const meta = {
  component: MatchCard,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    match: matches[0],
  },
} satisfies Meta<typeof MatchCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MatchCardLive: Story = {
  render: (args) => (
    <StoryFrame>
      <div className="max-w-xl">
        <MatchCard {...args} />
      </div>
    </StoryFrame>
  ),
};

export const DayMatchesBoard: Story = {
  render: () => (
    <StoryFrame>
      <DayMatches dateLabel="Sábado 20 junio" matches={matches.slice(0, 3)} />
    </StoryFrame>
  ),
};

export const WeekSchedule: Story = {
  render: () => (
    <StoryFrame>
      <Schedule
        days={[
          {
            date: "20 junio 2026",
            label: "Sábado",
            matches: matches.slice(0, 3),
          },
          {
            date: "21 junio 2026",
            label: "Domingo",
            matches: matches.slice(3),
          },
        ]}
      />
    </StoryFrame>
  ),
};

export const GroupStandings: Story = {
  render: () => (
    <StoryFrame>
      <StandingsTable group="A" rows={standings} />
    </StoryFrame>
  ),
};

export const TeamsOverview: Story = {
  render: () => (
    <StoryFrame>
      <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
        <TeamCard team={teams[0]!} statLabel="Puntos" statValue={10} />
        <TeamList teams={teams.slice(0, 6)} />
      </div>
    </StoryFrame>
  ),
};

export const TeamBadgeCompact: Story = {
  render: () => (
    <StoryFrame>
      <div className="flex flex-wrap gap-3">
        {teams.map((team) => (
          <TeamBadge key={team.id} team={team} />
        ))}
      </div>
    </StoryFrame>
  ),
};

export const KnockoutPath: Story = {
  render: () => (
    <StoryFrame>
      <KnockoutBracket rounds={bracket} />
    </StoryFrame>
  ),
};
