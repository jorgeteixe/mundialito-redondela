import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import {
  DayMatches,
  KnockoutBracket,
  MatchCard,
  MatchScore,
  StandingsTable,
  TeamBadge,
  type KnockoutRound,
  type StandingRow,
  type TournamentMatch,
  type TournamentTeam,
} from "./tournament";

const teams: TournamentTeam[] = [
  { id: "chapela", name: "Chapela FC", shortName: "CHA", group: "A" },
  { id: "cesantes", name: "Cesantes Atl.", shortName: "CES", group: "A" },
  { id: "reboreda", name: "Reboreda", shortName: "REB", group: "A" },
];

const liveMatch: TournamentMatch = {
  id: "m1",
  phase: "Grupo A",
  dateLabel: "Sábado 20",
  timeLabel: "10:00",
  venue: "Campo Municipal",
  status: "live",
  minute: "42'",
  home: { team: teams[0]!, score: 2 },
  away: { team: teams[1]!, score: 1 },
  highlight: "Chapela FC domina por bandas.",
};

afterEach(cleanup);

test("TeamBadge renders team name and group metadata", () => {
  render(<TeamBadge team={teams[0]!} />);

  expect(screen.getByText("Chapela FC")).toBeInTheDocument();
  expect(screen.getAllByText("Grupo A").length).toBeGreaterThan(0);
});

test("MatchCard renders live score, minute, venue, and highlight", () => {
  render(<MatchCard match={liveMatch} />);

  expect(screen.getAllByText("Grupo A").length).toBeGreaterThan(0);
  expect(screen.getByText("42'")).toBeInTheDocument();
  expect(screen.getByText("Campo Municipal")).toBeInTheDocument();
  expect(screen.getByText("Chapela FC domina por bandas.")).toBeInTheDocument();
  expect(screen.getByText("2")).toBeInTheDocument();
  expect(screen.getByText("1")).toBeInTheDocument();
});

test("MatchScore does not invent missing live scores", () => {
  render(
    <MatchScore
      match={{
        ...liveMatch,
        home: { team: teams[0]! },
        away: { team: teams[1]!, score: 1 },
      }}
    />,
  );

  expect(screen.getByText("–")).toBeInTheDocument();
  expect(screen.getByText("1")).toBeInTheDocument();
});

test("TeamBadge remains named when visual text is hidden", () => {
  render(<TeamBadge team={teams[0]!} showName={false} />);

  expect(screen.getByLabelText("Chapela FC")).toBeInTheDocument();
});

test("DayMatches renders empty state when no matches exist", () => {
  render(<DayMatches matches={[]} />);

  expect(screen.getByText("Partidos del día")).toBeInTheDocument();
  expect(screen.getByText("No hay partidos programados.")).toBeInTheDocument();
});

test("DayMatches can render a specific day label", () => {
  render(<DayMatches dateLabel="Domingo 21" matches={[liveMatch]} />);

  expect(screen.getByText("Partidos del día")).toBeInTheDocument();
  expect(
    screen.getByText("Domingo 21 · 1 partidos programados"),
  ).toBeInTheDocument();
});

test("StandingsTable highlights qualified teams", () => {
  const rows: StandingRow[] = [
    {
      team: teams[0]!,
      position: 1,
      played: 2,
      wins: 2,
      draws: 0,
      losses: 0,
      goalsFor: 5,
      goalsAgainst: 1,
      points: 6,
      qualified: true,
    },
    {
      team: teams[1]!,
      position: 2,
      played: 2,
      wins: 1,
      draws: 0,
      losses: 1,
      goalsFor: 3,
      goalsAgainst: 2,
      points: 3,
    },
  ];

  render(<StandingsTable group="A" rows={rows} />);

  expect(screen.getAllByText("Grupo A").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Clasificado").length).toBeGreaterThan(0);
  expect(screen.getAllByText("En juego").length).toBeGreaterThan(0);
});

test("KnockoutBracket renders rounds and pending final", () => {
  const rounds: KnockoutRound[] = [
    {
      id: "semi",
      title: "Semifinales",
      matches: [
        {
          id: "s1",
          label: "Semifinal 1",
          winnerId: "chapela",
          match: { ...liveMatch, status: "finished" },
        },
      ],
    },
    {
      id: "final",
      title: "Final",
      matches: [{ id: "f1", label: "Final" }],
    },
  ];

  render(<KnockoutBracket rounds={rounds} />);

  expect(screen.getByText("Semifinales")).toBeInTheDocument();
  expect(screen.getAllByText("Final").length).toBeGreaterThan(0);
  expect(screen.getByText("Pendiente de rival")).toBeInTheDocument();
});

test("KnockoutBracket renders empty state", () => {
  render(<KnockoutBracket rounds={[]} />);

  expect(
    screen.getByText("No hay eliminatorias configuradas."),
  ).toBeInTheDocument();
});
