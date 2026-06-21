import { requireSession } from "@/lib/authz";
import { canWriteBackstage } from "@/lib/roles";
import { listTeams } from "./data";
import { TeamsList } from "./team-list";

export default async function TeamsPage() {
  const session = await requireSession();
  const teams = await listTeams();

  return (
    <TeamsList teams={teams} canWrite={canWriteBackstage(session.user.role)} />
  );
}
