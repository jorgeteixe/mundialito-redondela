import { requireSession } from "@/lib/authz";
import { canWriteBackstage } from "@/lib/roles";
import { listGroups } from "./data";
import { GroupsList } from "./group-list";

export default async function GroupsPage() {
  const session = await requireSession();
  const groups = await listGroups();

  return (
    <GroupsList
      groups={groups}
      canWrite={canWriteBackstage(session.user.role)}
    />
  );
}
