import { notFound } from "next/navigation";
import { requireSession } from "@/lib/authz";
import { canWriteBackstage } from "@/lib/roles";
import { parseCategoryParam } from "@/lib/category.server";
import { isGroupStage } from "@/lib/group-stage";
import { getGroupDetail, listUngroupedTeams } from "../../data";
import { GroupDetailView } from "./group-detail-view";

type GroupDetailPageProps = {
  params: Promise<{
    category: string;
    stage: string;
    groupId: string;
  }>;
};

export default async function GroupDetailPage({
  params,
}: GroupDetailPageProps) {
  const session = await requireSession();
  const { category, stage, groupId } = await params;
  if (!isGroupStage(stage)) notFound();

  const group = await getGroupDetail(groupId);

  if (!group || group.stage !== stage) notFound();

  const availableTeams = await listUngroupedTeams(group.category, group.stage);

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
