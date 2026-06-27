import { notFound } from "next/navigation";
import { requireSession } from "@/lib/authz";
import { canWriteBackstage } from "@/lib/roles";
import { parseCategoryParam } from "@/lib/category.server";
import { isGroupStage } from "@/lib/group-stage";
import { listGroups } from "../data";
import { GroupsList } from "../group-list";

export default async function GroupsStagePage({
  params,
}: {
  params: Promise<{ category: string; stage: string }>;
}) {
  const session = await requireSession();
  const { category: categoryParam, stage: stageParam } = await params;
  const category = parseCategoryParam(categoryParam);

  if (!isGroupStage(stageParam)) notFound();

  const groups = await listGroups(category, stageParam);

  return (
    <GroupsList
      groups={groups}
      category={category}
      stage={stageParam}
      canWrite={canWriteBackstage(session.user.role)}
    />
  );
}
