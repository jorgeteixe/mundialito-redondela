import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { Standings, type StandingsRow } from "./standings";

const stats = {
  played: 3,
  wins: 2,
  draws: 1,
  losses: 0,
  goalsFor: 6,
  goalsAgainst: 2,
  goalDifference: 4,
  points: 7,
};

const rows: StandingsRow[] = [
  { team: { id: "chapela", name: "Chapela FC" }, ...stats },
  {
    team: { id: "cesantes", name: "Cesantes Atl." },
    ...stats,
    wins: 1,
    draws: 0,
    losses: 2,
    points: 3,
  },
];

afterEach(cleanup);

test("renders each team with its points", () => {
  render(<Standings rows={rows} />);

  expect(screen.getByText("Chapela FC")).toBeInTheDocument();
  expect(screen.getByText("Cesantes Atl.")).toBeInTheDocument();
  expect(screen.getByText("7")).toBeInTheDocument();
});

test("numbers the positions in row order", () => {
  render(<Standings rows={rows} />);

  const bodyRows = screen.getAllByRole("row").slice(1); // drop header
  // Position lives in each row's first cell.
  expect(bodyRows[0]!.querySelector("td")).toHaveTextContent("1");
  expect(bodyRows[1]!.querySelector("td")).toHaveTextContent("2");
});

test("marks the top N rows as qualifying", () => {
  render(<Standings rows={rows} qualifyCount={1} />);

  expect(
    screen.getByText("Clasifican a la siguiente fase"),
  ).toBeInTheDocument();

  const bodyRows = screen.getAllByRole("row").slice(1);
  expect(bodyRows[0]).toHaveClass("bg-muted/40");
  expect(bodyRows[1]).not.toHaveClass("bg-muted/40");
});

test("highlights the requested team row", () => {
  render(<Standings rows={rows} highlightedTeamId="cesantes" />);

  const bodyRows = screen.getAllByRole("row").slice(1);
  expect(bodyRows[0]).not.toHaveClass("bg-primary/10");
  expect(bodyRows[1]).toHaveClass("bg-primary/10");
  expect(bodyRows[1]).toHaveAttribute("aria-current", "true");
});

test("renders the empty state when there are no rows", () => {
  render(<Standings rows={[]} emptyState={<p>Sin equipos</p>} />);

  expect(screen.getByText("Sin equipos")).toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

test("links the team when a href is provided", () => {
  render(
    <Standings
      rows={[
        {
          team: { id: "chapela", name: "Chapela FC", href: "/teams/chapela" },
          ...stats,
        },
      ]}
    />,
  );

  const link = screen.getByRole("link", { name: /Chapela FC/ });
  expect(link).toHaveAttribute("href", "/teams/chapela");
});
