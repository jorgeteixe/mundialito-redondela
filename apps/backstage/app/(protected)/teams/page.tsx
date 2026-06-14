import { Button, DashboardPage, EmptyState } from "@mr/ui";
import { Plus, Users } from "lucide-react";

export default function TeamsPage() {
  return (
    <DashboardPage
      searchPlaceholder="Buscar equipos..."
      actions={
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Registrar equipo
        </Button>
      }
      isEmpty
      emptyState={
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="Sin equipos registrados"
          description="Añade el primer equipo para comenzar."
          action={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Registrar equipo
            </Button>
          }
        />
      }
    />
  );
}
