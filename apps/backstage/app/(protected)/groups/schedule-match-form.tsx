"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Button,
  DateTimePicker,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mr/ui";
import { createGroupMatch, updateGroupMatch, type FormState } from "./actions";
import type { GroupMatchSummary, GroupTeamSummary } from "./data";

const initialFormState: FormState = { status: "idle" };

type ScheduleMatchFormProps = {
  mode?: "create" | "edit";
  groupId: string;
  teams: GroupTeamSummary[];
  match?: GroupMatchSummary;
  onSuccess?: () => void;
};

export function ScheduleMatchForm({
  mode = "create",
  groupId,
  teams,
  match,
  onSuccess,
}: ScheduleMatchFormProps) {
  const action = mode === "create" ? createGroupMatch : updateGroupMatch;
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const [homeTeamId, setHomeTeamId] = useState(match?.homeTeamId ?? "");
  const [awayTeamId, setAwayTeamId] = useState(match?.awayTeamId ?? "");
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(
    match ? madridWallTimeDate(match.scheduledAt) : undefined,
  );
  const handledStateRef = useRef<string | null>(null);
  const hasEnoughTeams = teams.length >= 2;
  const sameTeamSelected = Boolean(homeTeamId && homeTeamId === awayTeamId);
  const canSubmit = Boolean(
    hasEnoughTeams &&
    homeTeamId &&
    awayTeamId &&
    scheduledAt &&
    !sameTeamSelected &&
    !pending,
  );
  const scheduledAtValue = scheduledAt ? toLocalDateTimeValue(scheduledAt) : "";

  useEffect(() => {
    if (state.status === "idle") return;

    const stateKey = `${state.status}:${state.message ?? ""}`;
    if (handledStateRef.current === stateKey) return;

    handledStateRef.current = stateKey;

    if (state.status === "success") {
      toast.success(state.message);
      if (mode === "create") {
        setHomeTeamId("");
        setAwayTeamId("");
        setScheduledAt(undefined);
      }
      onSuccess?.();
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [mode, onSuccess, state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="groupId" value={groupId} />
      {match ? <input type="hidden" name="id" value={match.id} /> : null}
      <input type="hidden" name="scheduledAt" value={scheduledAtValue} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="schedule-home-team">Equipo local</Label>
        <Select
          name="homeTeamId"
          value={homeTeamId}
          onValueChange={setHomeTeamId}
          disabled={!hasEnoughTeams}
          required
        >
          <SelectTrigger
            id="schedule-home-team"
            className="w-full"
            aria-invalid={Boolean(state.fieldErrors?.homeTeamId)}
          >
            <SelectValue placeholder="Selecciona equipo" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem
                key={team.id}
                value={team.id}
                disabled={team.id === awayTeamId}
              >
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.homeTeamId ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.homeTeamId}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="schedule-away-team">Equipo visitante</Label>
        <Select
          name="awayTeamId"
          value={awayTeamId}
          onValueChange={setAwayTeamId}
          disabled={!hasEnoughTeams}
          required
        >
          <SelectTrigger
            id="schedule-away-team"
            className="w-full"
            aria-invalid={Boolean(state.fieldErrors?.awayTeamId)}
          >
            <SelectValue placeholder="Selecciona equipo" />
          </SelectTrigger>
          <SelectContent>
            {teams.map((team) => (
              <SelectItem
                key={team.id}
                value={team.id}
                disabled={team.id === homeTeamId}
              >
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.fieldErrors?.awayTeamId ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.awayTeamId}
          </p>
        ) : sameTeamSelected ? (
          <p className="text-xs text-destructive">
            El rival debe ser distinto.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="schedule-match-at">Fecha y hora (Madrid)</Label>
        <DateTimePicker
          id="schedule-match-at"
          value={scheduledAt}
          onChange={setScheduledAt}
          disabled={!hasEnoughTeams}
          aria-invalid={Boolean(state.fieldErrors?.scheduledAt)}
        />
        {state.fieldErrors?.scheduledAt ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.scheduledAt}
          </p>
        ) : !hasEnoughTeams ? (
          <p className="text-xs text-muted-foreground">
            Añade al menos dos equipos al grupo.
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={!canSubmit}>
        {pending
          ? "Guardando..."
          : mode === "create"
            ? "Programar"
            : "Guardar cambios"}
      </Button>
    </form>
  );
}

function madridWallTimeDate(value: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      hour12: false,
    })
      .formatToParts(new Date(value))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return new Date(
    Number.parseInt(parts.year!, 10),
    Number.parseInt(parts.month!, 10) - 1,
    Number.parseInt(parts.day!, 10),
    Number.parseInt(parts.hour!, 10),
    Number.parseInt(parts.minute!, 10),
  );
}

function toLocalDateTimeValue(date: Date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}
