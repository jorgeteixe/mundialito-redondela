"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button, Input, Label } from "@mr/ui";
import { createPlayer, updatePlayer, type FormState } from "./actions";

const initialFormState: FormState = { status: "idle" };

type PlayerFormAction = (
  state: FormState,
  formData: FormData,
) => Promise<FormState>;

type PlayerFormProps = {
  mode: "create" | "edit";
  teamId: string;
  player?: {
    id: string;
    name: string;
  };
  onSuccess?: () => void;
};

export function PlayerForm({
  mode,
  teamId,
  player,
  onSuccess,
}: PlayerFormProps) {
  const action: PlayerFormAction =
    mode === "create" ? createPlayer : updatePlayer;
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
      <input type="hidden" name="teamId" value={teamId} />
      {player && <input type="hidden" name="id" value={player.id} />}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-player-name`}>Nombre del jugador</Label>
        <Input
          id={`${mode}-player-name`}
          name="name"
          defaultValue={player?.name}
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
            ? "Añadir jugador"
            : "Guardar cambios"}
      </Button>
    </form>
  );
}
