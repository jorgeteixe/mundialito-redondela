"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mr/ui";
import { addTeamToGroup, type FormState } from "./actions";
import { categoryLabel } from "../teams/avatar-utils";
import type { TeamCategory } from "../teams/data";
import type { GroupTeamSummary } from "./data";

const initialFormState: FormState = { status: "idle" };

type AddTeamFormProps = {
  groupId: string;
  groupCategory: TeamCategory;
  teams: GroupTeamSummary[];
  onSuccess?: () => void;
};

export function AddTeamForm({
  groupId,
  groupCategory,
  teams,
  onSuccess,
}: AddTeamFormProps) {
  const [state, formAction, pending] = useActionState(
    addTeamToGroup,
    initialFormState,
  );
  const handledStateRef = useRef<string | null>(null);
  const hasTeams = teams.length > 0;

  useEffect(() => {
    if (state.status === "idle") return;

    const stateKey = `${state.status}:${state.message ?? ""}`;
    if (handledStateRef.current === stateKey) return;

    handledStateRef.current = stateKey;

    if (state.status === "success") {
      toast.success(state.message);
      onSuccess?.();
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [onSuccess, state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="groupId" value={groupId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="add-group-team">Equipo</Label>
        <Select name="teamId" disabled={!hasTeams} required>
          <SelectTrigger
            id="add-group-team"
            className="w-full"
            aria-invalid={Boolean(state.fieldErrors?.teamId)}
          >
            <SelectValue placeholder="Selecciona un equipo" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name} · {categoryLabel(team.category)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.teamId ? (
          <p className="text-xs text-destructive">{state.fieldErrors.teamId}</p>
        ) : !hasTeams ? (
          <p className="text-xs text-muted-foreground">
            No hay equipos {categoryLabel(groupCategory).toLowerCase()} sin
            grupo disponibles.
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending || !hasTeams}>
        {pending ? "Guardando..." : "Añadir equipo"}
      </Button>
    </form>
  );
}
