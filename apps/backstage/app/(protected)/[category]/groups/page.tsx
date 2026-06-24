import { requireSession } from "@/lib/authz";
import { canWriteBackstage } from "@/lib/roles";
import { parseCategoryParam } from "@/lib/category.server";
import { listGroups } from "./data";
import { GroupsList } from "./group-list";

export default async function GroupsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const session = await requireSession();
  const category = parseCategoryParam((await params).category);
  const groups = await listGroups(category);

  return (
    <GroupsList
      groups={groups}
      category={category}
      canWrite={canWriteBackstage(session.user.role)}
    />
  );
}
