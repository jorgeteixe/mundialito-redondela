import { notFound } from "next/navigation";
import { requireSession } from "@/lib/authz";
import { canWriteBackstage } from "@/lib/roles";
import { parseCategoryParam } from "@/lib/category.server";
import { getTeamDetail } from "../data";
import { TeamDetailView } from "./team-detail-view";

type TeamDetailPageProps = {
  params: Promise<{
    category: string;
    teamId: string;
  }>;
};

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const session = await requireSession();
  const { category, teamId } = await params;
  const team = await getTeamDetail(teamId);

  if (!team) notFound();

  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <TeamDetailView
        team={team}
        category={parseCategoryParam(category)}
        canWrite={canWriteBackstage(session.user.role)}
      />
    </main>
  );
}
