import { requireSession } from "@/lib/authz";
import { canWriteBackstage } from "@/lib/roles";
import { parseCategoryParam } from "@/lib/category.server";
import { listTeams } from "./data";
import { TeamsList } from "./team-list";

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const session = await requireSession();
  const category = parseCategoryParam((await params).category);
  const teams = await listTeams(category);

  return (
    <TeamsList
      teams={teams}
      category={category}
      canWrite={canWriteBackstage(session.user.role)}
    />
  );
}
