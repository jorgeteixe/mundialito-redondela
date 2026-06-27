"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Button,
  DateTimePicker,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mr/ui";
import {
  createEliminatoriaMatch,
  updateEliminatoriaMatch,
  type FormState,
} from "./actions";
import type { Category } from "@/lib/category";
import type { EliminatoriaMatch, EliminatoriaTeam } from "./data";

const initialFormState: FormState = { status: "idle" };

type Props = {
  mode?: "create" | "edit";
  category: Category;
  teams: EliminatoriaTeam[];
  match?: EliminatoriaMatch;
  onSuccess?: () => void;
};

export function EliminatoriaForm({
  mode = "create",
  category,
  teams,
  match,
  onSuccess,
}: Props) {
  const action =
    mode === "create" ? createEliminatoriaMatch : updateEliminatoriaMatch;
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const [kind, setKind] = useState(match?.kind ?? "semifinal");
  const [status, setStatus] = useState(match?.status ?? "scheduled");
  const [homeTeamId, setHomeTeamId] = useState(match?.homeTeamId ?? "");
  const [awayTeamId, setAwayTeamId] = useState(match?.awayTeamId ?? "");
  const [homePlaceholder, setHomePlaceholder] = useState(
    match?.homePlaceholder ?? "",
  );
  const [awayPlaceholder, setAwayPlaceholder] = useState(
    match?.awayPlaceholder ?? "",
  );
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(
    match ? madridWallTimeDate(match.scheduledAt) : undefined,
  );
  const handledStateRef = useRef<FormState>(initialFormState);
  const sameTeamSelected = Boolean(homeTeamId && homeTeamId === awayTeamId);
  const canSubmit = Boolean(
    kind &&
    (homeTeamId || homePlaceholder.trim()) &&
    (awayTeamId || awayPlaceholder.trim()) &&
    scheduledAt &&
    !sameTeamSelected &&
    !pending,
  );
  const scheduledAtValue = scheduledAt ? toLocalDateTimeValue(scheduledAt) : "";

  useEffect(() => {
    if (state.status === "idle") return;
    if (handledStateRef.current === state) return;
    handledStateRef.current = state;

    if (state.status === "success") {
      toast.success(state.message);
      if (mode === "create") {
        setHomeTeamId("");
        setAwayTeamId("");
        setHomePlaceholder("");
        setAwayPlaceholder("");
        setScheduledAt(undefined);
        setStatus("scheduled");
        setKind("semifinal");
      }
      onSuccess?.();
    }

    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [mode, onSuccess, state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="scheduledAt" value={scheduledAtValue} />
      {match ? <input type="hidden" name="id" value={match.id} /> : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="eliminatoria-kind">Ronda</Label>
        <Select
          name="kind"
          value={kind}
          onValueChange={(value) => {
            if (
              value === "semifinal" ||
              value === "third_place" ||
              value === "final"
            ) {
              setKind(value);
            }
          }}
        >
          <SelectTrigger id="eliminatoria-kind" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semifinal">Semifinal</SelectItem>
            <SelectItem value="third_place">3.º-4.º puesto</SelectItem>
            <SelectItem value="final">Final</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SideFields
        label="Equipo local"
        side="home"
        teams={teams}
        teamId={homeTeamId}
        otherTeamId={awayTeamId}
        placeholder={homePlaceholder}
        setTeamId={setHomeTeamId}
        setPlaceholder={setHomePlaceholder}
        teamError={state.fieldErrors?.homeTeamId}
        placeholderError={state.fieldErrors?.homePlaceholder}
      />

      <SideFields
        label="Equipo visitante"
        side="away"
        teams={teams}
        teamId={awayTeamId}
        otherTeamId={homeTeamId}
        placeholder={awayPlaceholder}
        setTeamId={setAwayTeamId}
        setPlaceholder={setAwayPlaceholder}
        teamError={state.fieldErrors?.awayTeamId}
        placeholderError={state.fieldErrors?.awayPlaceholder}
        sameTeamSelected={sameTeamSelected}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="eliminatoria-at">Fecha y hora (Madrid)</Label>
        <DateTimePicker
          id="eliminatoria-at"
          value={scheduledAt}
          onChange={setScheduledAt}
          aria-invalid={Boolean(state.fieldErrors?.scheduledAt)}
        />
        {state.fieldErrors?.scheduledAt ? (
          <p className="text-xs text-destructive">
            {state.fieldErrors.scheduledAt}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="eliminatoria-status">Estado</Label>
          <Select
            name="status"
            value={status}
            onValueChange={(value) => {
              if (
                value === "scheduled" ||
                value === "live" ||
                value === "finished" ||
                value === "postponed"
              ) {
                setStatus(value);
              }
            }}
          >
            <SelectTrigger id="eliminatoria-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Programado</SelectItem>
              <SelectItem value="live">En directo</SelectItem>
              <SelectItem value="finished">Finalizado</SelectItem>
              <SelectItem value="postponed">Aplazado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ScoreField
          id="eliminatoria-home-score"
          label="Goles local"
          name="homeScore"
          value={match?.homeScore}
          error={state.fieldErrors?.homeScore}
        />
        <ScoreField
          id="eliminatoria-away-score"
          label="Goles visitante"
          name="awayScore"
          value={match?.awayScore}
          error={state.fieldErrors?.awayScore}
        />
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

function SideFields({
  label,
  side,
  teams,
  teamId,
  otherTeamId,
  placeholder,
  setTeamId,
  setPlaceholder,
  teamError,
  placeholderError,
  sameTeamSelected,
}: {
  label: string;
  side: "home" | "away";
  teams: EliminatoriaTeam[];
  teamId: string;
  otherTeamId: string;
  placeholder: string;
  setTeamId: (value: string) => void;
  setPlaceholder: (value: string) => void;
  teamError?: string;
  placeholderError?: string;
  sameTeamSelected?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`eliminatoria-${side}-team`}>{label}</Label>
      <Select
        name={`${side}TeamId`}
        value={teamId}
        onValueChange={setTeamId}
        disabled={teams.length === 0}
      >
        <SelectTrigger id={`eliminatoria-${side}-team`} className="w-full">
          <SelectValue placeholder="Selecciona equipo" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem
              key={team.id}
              value={team.id}
              disabled={team.id === otherTeamId}
            >
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {teamError ? (
        <p className="text-xs text-destructive">{teamError}</p>
      ) : null}
      {sameTeamSelected ? (
        <p className="text-xs text-destructive">El rival debe ser distinto.</p>
      ) : null}
      <Input
        name={`${side}Placeholder`}
        value={placeholder}
        onChange={(event) => setPlaceholder(event.target.value)}
        placeholder="Texto si aún no hay equipo"
        aria-invalid={Boolean(placeholderError)}
      />
      {placeholderError ? (
        <p className="text-xs text-destructive">{placeholderError}</p>
      ) : null}
    </div>
  );
}

function ScoreField({
  id,
  label,
  name,
  value,
  error,
}: {
  id: string;
  label: string;
  name: string;
  value?: number | null;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type="number"
        min={0}
        max={99}
        defaultValue={value ?? ""}
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
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
