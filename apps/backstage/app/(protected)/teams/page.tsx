import { listTeams } from "./data";
import { TeamsList } from "./team-list";

export default async function TeamsPage() {
  const teams = await listTeams();

  return <TeamsList teams={teams} />;
}
