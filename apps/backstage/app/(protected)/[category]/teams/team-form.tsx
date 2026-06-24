"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button, Input, Label } from "@mr/ui";
import { createTeam, updateTeam, type FormState } from "./actions";
import type { Category } from "@/lib/category";

const initialFormState: FormState = { status: "idle" };

type TeamFormAction = (
  state: FormState,
  formData: FormData,
) => Promise<FormState>;

type TeamFormProps = {
  mode: "create" | "edit";
  category: Category;
  team?: {
    id: string;
    name: string;
  };
  onSuccess?: () => void;
};

export function TeamForm({ mode, category, team, onSuccess }: TeamFormProps) {
  const action: TeamFormAction = mode === "create" ? createTeam : updateTeam;
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const handledStateRef = useRef<string | null>(null);

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
      <input type="hidden" name="category" value={category} />
      {team && <input type="hidden" name="id" value={team.id} />}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-team-name`}>Nombre del equipo</Label>
        <Input
          id={`${mode}-team-name`}
          name="name"
          defaultValue={team?.name}
          autoComplete="off"
          aria-invalid={Boolean(state.fieldErrors?.name)}
          required
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending
          ? "Guardando..."
          : mode === "create"
            ? "Registrar equipo"
            : "Guardar cambios"}
      </Button>
    </form>
  );
}
