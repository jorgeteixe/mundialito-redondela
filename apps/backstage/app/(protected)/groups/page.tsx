import { listGroups } from "./data";
import { GroupsList } from "./group-list";

export default async function GroupsPage() {
  const groups = await listGroups();

  return <GroupsList groups={groups} />;
}
