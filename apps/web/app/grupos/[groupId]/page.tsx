import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type StandingsRow } from "@mr/ui";
import {
  listPublicGroupStandings,
  listPublicMatches,
  qualifyingTeamIds,
  type PublicGroupStanding,
} from "@mr/db";
import { buildScheduleDays, teamAvatarUrl } from "../../calendar-format";
import { Footer } from "../../components/footer";
import { Header } from "../../components/header";
import { ModeToggle } from "../../components/mode-toggle";
import { GroupDetailSections } from "./group-detail-sections";

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

type GroupPageProps = {
  params: Promise<{ groupId: string }>;
};

type GroupLookup = {
  group: PublicGroupStanding;
  /** Every group of the same stage (both categories), for cross-group ranking. */
  stageGroups: PublicGroupStanding[];
};

async function findGroup(groupId: string): Promise<GroupLookup | undefined> {
  const [f1, f2] = await Promise.all([
    listPublicGroupStandings("f1"),
    listPublicGroupStandings("f2"),
  ]);

  for (const stageGroups of [f1, f2]) {
    const group = stageGroups.find((candidate) => candidate.id === groupId);
    if (group) return { group, stageGroups };
  }

  return undefined;
}

export async function generateMetadata({
  params,
}: GroupPageProps): Promise<Metadata> {
  const { groupId } = await params;
  const found = await findGroup(groupId);

  if (!found) {
    return {
      title: "Grupo no encontrado | Mundialito Redondela 2026",
    };
  }

  return {
    title: `${found.group.name} | Mundialito Redondela 2026`,
    description: `Partidos y clasificación del ${found.group.name} en el Mundialito Redondela 2026.`,
  };
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { groupId } = await params;
  const [matches, found] = await Promise.all([
    listPublicMatches(),
    findGroup(groupId),
  ]);

  if (!found) notFound();

  const { group, stageGroups } = found;
  const qualifyingIds = [...qualifyingTeamIds(stageGroups)];

  const matchDays = buildScheduleDays(
    matches.filter((match) => match.groupId === groupId),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        edition="XLVII"
        eventName="Mundialito da Xunqueira"
        actions={<ModeToggle />}
      />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <GroupDetailSections
          matchDays={matchDays}
          standingsRows={toStandingsRows(group)}
          group={{
            id: group.id,
            name: group.name,
            category: group.category,
            categoryLabel: CATEGORY_LABELS[group.category],
            stageLabel: STAGE_LABELS[group.stage],
            qualifyingTeamIds: qualifyingIds,
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
