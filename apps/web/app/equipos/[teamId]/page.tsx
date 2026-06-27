import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type StandingsRow } from "@mr/ui";
import {
  listPublicF1GroupStandings,
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

type TeamPageProps = {
  params: Promise<{ teamId: string }>;
};

type TeamGroup = {
  group: PublicGroupStanding;
  teamName: string;
};

export async function generateMetadata({
  params,
}: TeamPageProps): Promise<Metadata> {
  const { teamId } = await params;
  const teamGroup = findTeamGroup(await listPublicF1GroupStandings(), teamId);

  if (!teamGroup) {
    return {
      title: "Equipo no encontrado | Mundialito Redondela 2026",
    };
  }

  return {
    title: `${teamGroup.teamName} | Mundialito Redondela 2026`,
    description: `Partidos y clasificación de ${teamGroup.teamName} en el Mundialito Redondela 2026.`,
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { teamId } = await params;
  const [matches, groupStandings] = await Promise.all([
    listPublicMatches(),
    listPublicF1GroupStandings(),
  ]);
  const teamGroup = findTeamGroup(groupStandings, teamId);

  if (!teamGroup) notFound();

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
          standingsRows={toStandingsRows(teamGroup.group)}
          teamId={teamId}
          teamName={teamGroup.teamName}
          group={{
            id: teamGroup.group.id,
            name: teamGroup.group.name,
            category: teamGroup.group.category,
            categoryLabel: CATEGORY_LABELS[teamGroup.group.category],
          }}
        />
      </main>
      <Footer
        copyright="© 2026 Mundialito Redondela · Sitio no oficial"
        legalLinks={LEGAL_LINKS}
      />
    </div>
  );
}

function findTeamGroup(
  groups: PublicGroupStanding[],
  teamId: string,
): TeamGroup | undefined {
  for (const group of groups) {
    const row = group.standings.find((standing) => standing.teamId === teamId);
    if (row) return { group, teamName: row.teamName };
  }

  return undefined;
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
