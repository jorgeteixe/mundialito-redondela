"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button, Input, Label } from "@mr/ui";
import { saveMatchResult, type ResultFormState } from "./actions";
import type { CalendarMatch } from "../calendario/calendar-format";

const initialFormState: ResultFormState = { status: "idle" };

type ResultFormProps = {
  match: CalendarMatch;
  onSuccess?: () => void;
};

export function ResultForm({ match, onSuccess }: ResultFormProps) {
  const [state, formAction, pending] = useActionState(
    saveMatchResult,
    initialFormState,
  );
  const handledStateRef = useRef<ResultFormState>(initialFormState);
  const isKnockout = match.kind !== "group";

  useEffect(() => {
    if (state.status === "idle") return;
    if (handledStateRef.current === state) return;
    handledStateRef.current = state;

    if (state.status === "success") {
      toast.success(state.message);
      onSuccess?.();
    }
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [onSuccess, state]);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={match.id} />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Resultado</legend>
        <ScoreRow
          label={match.homeTeamName}
          name="homeScore"
          defaultValue={match.homeScore}
          error={state.fieldErrors?.homeScore}
        />
        <ScoreRow
          label={match.awayTeamName}
          name="awayScore"
          defaultValue={match.awayScore}
          error={state.fieldErrors?.awayScore}
        />
      </fieldset>

      {isKnockout ? (
        <fieldset className="flex flex-col gap-3 border-t pt-4">
          <legend className="text-sm font-medium">Penaltis</legend>
          <p className="text-xs text-muted-foreground">
            Solo si el partido acaba en empate. Déjalo vacío si no hubo tanda.
          </p>
          <ScoreRow
            label={match.homeTeamName}
            name="homePenalties"
            defaultValue={match.homePenalties}
            error={state.fieldErrors?.homePenalties}
          />
          <ScoreRow
            label={match.awayTeamName}
            name="awayPenalties"
            defaultValue={match.awayPenalties}
            error={state.fieldErrors?.awayPenalties}
          />
        </fieldset>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar resultado"}
      </Button>
    </form>
  );
}

function ScoreRow({
  label,
  name,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  defaultValue: number | null;
  error?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor={`result-${name}`} className="min-w-0 flex-1 truncate">
        {label}
      </Label>
      <div className="flex flex-col items-end gap-1">
        <Input
          id={`result-${name}`}
          name={name}
          type="number"
          inputMode="numeric"
          min={0}
          max={99}
          defaultValue={defaultValue ?? ""}
          className="w-20 text-center"
          aria-invalid={Boolean(error)}
          placeholder="-"
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </div>
  );
}
