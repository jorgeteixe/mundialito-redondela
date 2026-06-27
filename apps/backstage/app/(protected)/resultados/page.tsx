import { requireSession } from "@/lib/authz";
import { canWriteBackstage } from "@/lib/roles";
import { groupByDay } from "../calendario/calendar-format";
import { listScheduledMatches } from "../calendario/data";
import { ResultsView } from "./results-view";

export default async function ResultadosPage() {
  const session = await requireSession();
  const days = groupByDay(await listScheduledMatches());

  return (
    <main className="flex flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="font-heading text-xl font-medium">Resultados</h1>
        <p className="text-xs text-muted-foreground">
          Registra el resultado de cada partido. En las eliminatorias puedes
          añadir los penaltis por separado.
        </p>
      </div>
      <ResultsView
        days={days}
        canWrite={canWriteBackstage(session.user.role)}
      />
    </main>
  );
}
