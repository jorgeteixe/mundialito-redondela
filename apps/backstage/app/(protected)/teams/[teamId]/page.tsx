import { notFound } from "next/navigation";
import { getTeamDetail } from "../data";
import { TeamDetailView } from "./team-detail-view";

type TeamDetailPageProps = {
  params: Promise<{
    teamId: string;
  }>;
};

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamId } = await params;
  const team = await getTeamDetail(teamId);

  if (!team) notFound();

  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <TeamDetailView team={team} />
    </main>
  );
}
