import { redirect } from "next/navigation";
import { parseCategoryParam } from "@/lib/category.server";

export default async function GroupsPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const category = parseCategoryParam((await params).category);
  redirect(`/${category}/groups/f1`);
}
