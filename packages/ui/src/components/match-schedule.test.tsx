import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import {
  MatchSchedule,
  type ScheduleDay,
  type ScheduleMatch,
} from "./match-schedule";

const base: ScheduleMatch = {
  id: "m1",
  timeLabel: "10:00",
  category: "senior",
  categoryLabel: "Senior",
  group: { name: "Grupo A", avatarLabel: "A" },
  home: { id: "chapela", name: "Chapela FC" },
  away: { id: "cesantes", name: "Cesantes Atl." },
};

afterEach(cleanup);

test("renders a score placeholder when a match has no result", () => {
  render(<MatchSchedule matches={[{ ...base, status: "scheduled" }]} />);

  expect(screen.getByText("Chapela FC")).toBeInTheDocument();
  expect(screen.getByText("Cesantes Atl.")).toBeInTheDocument();
  // A single, quiet placeholder stands in for the missing result.
  expect(screen.getByText("–")).toBeInTheDocument();
});

test("shows scores once a match is finished", () => {
  render(
    <MatchSchedule
      matches={[
        {
          ...base,
          status: "finished",
          home: { ...base.home, score: 3 },
          away: { ...base.away, score: 1 },
        },
      ]}
    />,
  );

  expect(screen.getByText("3")).toBeInTheDocument();
  expect(screen.getByText("1")).toBeInTheDocument();
  // Status renders in both the mobile and desktop slots.
  expect(screen.getAllByText("Final").length).toBeGreaterThan(0);
  expect(screen.queryByText("–")).not.toBeInTheDocument();
});

test("emphasizes the winning side of a finished match", () => {
  render(
    <MatchSchedule
      matches={[
        {
          ...base,
          status: "finished",
          home: { ...base.home, score: 3 },
          away: { ...base.away, score: 1 },
        },
      ]}
    />,
  );

  expect(screen.getByText("Chapela FC")).toHaveClass("font-semibold");
  expect(screen.getByText("Cesantes Atl.")).not.toHaveClass("font-semibold");
});

test("shows the live minute label for a live match", () => {
  render(
    <MatchSchedule
      matches={[{ ...base, status: "live", minuteLabel: "42'" }]}
    />,
  );

  expect(screen.getAllByText("42'").length).toBeGreaterThan(0);
});

test("only shows the category tag when showCategory is set", () => {
  const { rerender } = render(<MatchSchedule matches={[base]} />);
  expect(screen.queryByText("Senior")).not.toBeInTheDocument();

  rerender(<MatchSchedule matches={[base]} showCategory />);
  expect(screen.getByText("Senior")).toBeInTheDocument();
});

test("renders day headings when grouped by day", () => {
  const days: ScheduleDay[] = [
    { key: "d1", label: "sábado, 27 jun", matches: [base] },
    {
      key: "d2",
      label: "domingo, 28 jun",
      matches: [{ ...base, id: "m2" }],
    },
  ];
  render(<MatchSchedule days={days} />);

  expect(screen.getByText("sábado, 27 jun")).toBeInTheDocument();
  expect(screen.getByText("domingo, 28 jun")).toBeInTheDocument();
});

test("renders a flat list of spare games without day headings", () => {
  const { container } = render(
    <MatchSchedule matches={[base, { ...base, id: "m2" }]} />,
  );

  expect(container.querySelector("h3")).toBeNull();
  expect(within(container).getAllByText("Chapela FC")).toHaveLength(2);
});

test("links a team when an href is provided", () => {
  render(
    <MatchSchedule
      matches={[
        { ...base, home: { ...base.home, href: "/senior/teams/chapela" } },
      ]}
    />,
  );

  const link = screen.getByRole("link", { name: /Chapela FC/ });
  expect(link).toHaveAttribute("href", "/senior/teams/chapela");
});

test("renders no links when no hrefs are provided", () => {
  render(<MatchSchedule matches={[base]} showCategory showGroup />);

  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

test("renders the empty state when there are no matches", () => {
  render(<MatchSchedule days={[]} emptyState={<p>Sin partidos</p>} />);

  expect(screen.getByText("Sin partidos")).toBeInTheDocument();
});
