"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { categoryLabel } from "../teams/avatar-utils";
import type { TeamCategory } from "../teams/data";
import type { GroupTeamSummary } from "./data";

type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    teamId?: string;
  };
};

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
  const router = useRouter();
  const [state, setState] = useState<FormState>(initialFormState);
  const [pending, setPending] = useState(false);
  const hasTeams = teams.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/group-memberships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId,
        teamId: formData.get("teamId"),
      }),
    });
    const payload = (await response.json()) as { message?: string };
    const result: FormState = response.ok
      ? { status: "success", message: payload.message ?? "Equipo añadido." }
      : {
          status: "error",
          message: payload.message ?? "No se pudo añadir el equipo.",
          fieldErrors: { teamId: "Selecciona un equipo disponible." },
        };
    setState(result);
    setPending(false);

    if (result.status === "success") {
      toast.success(result.message);
      router.refresh();
      onSuccess?.();
    }

    if (result.status === "error" && result.message) {
      toast.error(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
