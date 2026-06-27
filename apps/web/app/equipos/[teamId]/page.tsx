import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type StandingsRow } from "@mr/ui";
import {
  listPublicGroupStandings,
  listPublicMatches,
  type PublicGroupStanding,
} from "@mr/db";
import { buildScheduleDays, teamAvatarUrl } from "../../calendar-format";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { ModeToggle } from "../../components/mode-toggle";
import { TeamDetailSections } from "./team-detail-sections";

const LEGAL_LINKS = [
  { label: "Política de privacidad", href: "/privacidad" },
  { label: "Aviso legal", href: "/aviso-legal" },
  { label: "Política de cookies", href: "/cookies" },
];

const CATEGORY_LABELS = {
  senior: "Senior",
  cadet: "Cadete",
} as const;

const STAGE_LABELS = {
  f1: "Fase 1",
  f2: "Fase 2",
} as const;

type TeamPageProps = {
  params: Promise<{ teamId: string }>;
};

type TeamGroups = {
  /** Every group the team belongs to, ordered F1 → F2. */
  groups: PublicGroupStanding[];
  teamName: string;
};

async function findTeamGroups(teamId: string): Promise<TeamGroups | undefined> {
  const [f1, f2] = await Promise.all([
    listPublicGroupStandings("f1"),
    listPublicGroupStandings("f2"),
  ]);

  const groups: PublicGroupStanding[] = [];
  let teamName: string | undefined;

  for (const group of [...f1, ...f2]) {
    const row = group.standings.find((standing) => standing.teamId === teamId);
    if (row) {
      groups.push(group);
      teamName ??= row.teamName;
    }
  }

  if (!teamName) return undefined;

  return { groups, teamName };
}

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { teamId } = await params;
  const teamGroups = await findTeamGroups(teamId);

  if (!teamGroups) {
    return {
      title: "Equipo no encontrado | Mundialito Redondela 2026",
    };
  }

  return {
    title: `${teamGroups.teamName} | Mundialito Redondela 2026`,
    description: `Partidos y clasificación de ${teamGroups.teamName} en el Mundialito Redondela 2026.`,
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const [matches, teamGroups] = await Promise.all([
    listPublicMatches(),
    findTeamGroups(teamId),
  ]);

  if (!teamGroups) notFound();

  const matchDays = buildScheduleDays(
    matches.filter(
      (match) => match.homeTeamId === teamId || match.awayTeamId === teamId,
    ),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        edition="XLVII"
        eventName="Mundialito da Xunqueira"
        actions={<ModeToggle />}
      />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <TeamDetailSections
          matchDays={matchDays}
          teamId={teamId}
          teamName={teamGroups.teamName}
          groups={teamGroups.groups.map((group) => ({
            id: group.id,
            name: group.name,
            category: group.category,
            categoryLabel: CATEGORY_LABELS[group.category],
            stageLabel: STAGE_LABELS[group.stage],
            standingsRows: toStandingsRows(group),
          }))}
        />
      </main>
      <Footer
        copyright="© 2026 Mundialito Redondela · Sitio no oficial"
        legalLinks={LEGAL_LINKS}
      />
    </div>
  );
}

function toStandingsRows(group: PublicGroupStanding): StandingsRow[] {
  return group.standings.map((row) => ({
    team: {
      id: row.teamId,
      name: row.teamName,
      crestUrl: teamAvatarUrl(row.teamId),
      href: `/equipos/${row.teamId}`,
    },
    played: row.played,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    goalsFor: row.goalsFor,
    goalsAgainst: row.goalsAgainst,
    goalDifference: row.goalDifference,
    points: row.points,
  }));
}
