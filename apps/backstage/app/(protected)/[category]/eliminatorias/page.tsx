import { requireSession } from "@/lib/authz";
import { parseCategoryParam } from "@/lib/category.server";
import { canWriteBackstage } from "@/lib/roles";
import { categoryLabel } from "../teams/avatar-utils";
import { EliminatoriasList } from "./eliminatorias-list";
import { listEliminatoriaMatches, listEliminatoriaTeams } from "./data";

export default async function EliminatoriasPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const session = await requireSession();
  const category = parseCategoryParam((await params).category);
  const [matches, teams] = await Promise.all([
    listEliminatoriaMatches(category),
    listEliminatoriaTeams(category),
  ]);

  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="font-heading text-xl font-medium">
          Eliminatorias · {categoryLabel(category)}
        </h1>
        <p className="text-xs text-muted-foreground">
          Semifinales, terceros puestos y finales de la categoría.
        </p>
      </div>
      <EliminatoriasList
        category={category}
        matches={matches}
        teams={teams}
        canWrite={canWriteBackstage(session.user.role)}
      />
    </main>
  );
}
