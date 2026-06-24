import { notFound } from "next/navigation";
import { requireSession } from "@/lib/authz";
import { canWriteBackstage } from "@/lib/roles";
import { parseCategoryParam } from "@/lib/category.server";
import { getGroupDetail, listUngroupedTeams } from "../data";
import { GroupDetailView } from "./group-detail-view";

type GroupDetailPageProps = {
  params: Promise<{
    category: string;
    groupId: string;
  }>;
};

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const session = await requireSession();
  const { category, groupId } = await params;
  const group = await getGroupDetail(groupId);

  if (!group) notFound();

  const availableTeams = await listUngroupedTeams(group.category);

  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <GroupDetailView
        group={group}
        category={parseCategoryParam(category)}
        availableTeams={availableTeams}
        canWrite={canWriteBackstage(session.user.role)}
      />
    </main>
  );
}
