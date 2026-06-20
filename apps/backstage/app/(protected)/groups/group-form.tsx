"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@mr/ui";
import { createGroup, updateGroup, type FormState } from "./actions";
import type { TeamCategory } from "../teams/data";

const initialFormState: FormState = { status: "idle" };

type GroupFormAction = (
  state: FormState,
  formData: FormData,
) => Promise<FormState>;

type GroupFormProps = {
  mode: "create" | "edit";
  group?: {
    id: string;
    name: string;
    avatarLabel: string;
    category: TeamCategory;
  };
  onSuccess?: () => void;
};

export function GroupForm({ mode, group, onSuccess }: GroupFormProps) {
  const action: GroupFormAction = mode === "create" ? createGroup : updateGroup;
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
      {group && <input type="hidden" name="id" value={group.id} />}
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-group-name`}>Nombre del grupo</Label>
        <Input
          id={`${mode}-group-name`}
          name="name"
          defaultValue={group?.name}
          autoComplete="off"
          aria-invalid={Boolean(state.fieldErrors?.name)}
          required
        />
        {state.fieldErrors?.name && (
          <p className="text-xs text-destructive">{state.fieldErrors.name}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-group-avatar-label`}>Letra o número</Label>
        <Input
          id={`${mode}-group-avatar-label`}
          name="avatarLabel"
          defaultValue={group?.avatarLabel}
          autoComplete="off"
          maxLength={1}
          aria-invalid={Boolean(state.fieldErrors?.avatarLabel)}
          required
        />
        {state.fieldErrors?.avatarLabel && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.avatarLabel}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${mode}-group-category`}>Categoría</Label>
        <Select
          name="category"
          defaultValue={group?.category ?? "senior"}
          required
        >
          <SelectTrigger
            id={`${mode}-group-category`}
            className="w-full"
            aria-invalid={Boolean(state.fieldErrors?.category)}
          >
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="senior">Senior</SelectItem>
            <SelectItem value="cadet">Cadete</SelectItem>
          </SelectContent>
        </Select>
        {state.fieldErrors?.category && (
          <p className="text-xs text-destructive">
            {state.fieldErrors.category}
          </p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        {pending
          ? "Guardando..."
          : mode === "create"
            ? "Registrar grupo"
            : "Guardar cambios"}
      </Button>
    </form>
  );
}
